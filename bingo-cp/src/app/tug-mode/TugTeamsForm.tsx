
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface TeamInput {
    name: string;
    color: string;
    members: string[];
}

interface TugTeamsFormProps {
    onTeamsChange: (teams: TeamInput[]) => void;
}

export default function TugTeamsForm({ onTeamsChange }: TugTeamsFormProps) {
    type ColorOption = "red" | "blue" | "green" | "purple" | "orange" | "pink" | "yellow" | "teal";

    const COLOR_OPTIONS: ColorOption[] = [
        "red", "blue", "green", "purple", "orange", "pink", "yellow", "teal"
    ];

    const COLOR_CLASSES: Record<ColorOption, { bg: string; text: string }> = {
        red: { bg: "bg-red-200", text: "text-red-800" },
        blue: { bg: "bg-blue-200", text: "text-blue-800" },
        green: { bg: "bg-green-200", text: "text-green-800" },
        purple: { bg: "bg-purple-200", text: "text-purple-800" },
        orange: { bg: "bg-orange-200", text: "text-orange-800" },
        pink: { bg: "bg-pink-200", text: "text-pink-800" },
        yellow: { bg: "bg-yellow-200", text: "text-yellow-800" },
        teal: { bg: "bg-teal-200", text: "text-teal-800" },
    };

    // Start with 2 teams by default
    const [teams, setTeams] = useState<TeamInput[]>([
        { name: "", color: "", members: [""] },
        { name: "", color: "", members: [""] },
    ]);

    // Notify parent component of initial teams on mount
    useEffect(() => {
        onTeamsChange(teams);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const updateTeam = <K extends keyof TeamInput>(
        index: number,
        key: K,
        value: TeamInput[K]
    ) => {
        const newTeams = [...teams];
        newTeams[index][key] = value;
        updateTeams(newTeams);
    };

    const removeMember = (teamIndex: number, memberIndex: number) => {
        const newTeams = [...teams];
        newTeams[teamIndex].members.splice(memberIndex, 1);
        updateTeams(newTeams);
    };

    const updateTeams = (updated: TeamInput[]) => {
        setTeams(updated);
        onTeamsChange(updated);
    };

    const updateMember = (teamIndex: number, memberIndex: number, value: string) => {
        const newTeams = [...teams];
        newTeams[teamIndex].members[memberIndex] = value;
        updateTeams(newTeams);
    };

    const addMember = (teamIndex: number) => {
        const newTeams = [...teams];
        if (newTeams[teamIndex].members.length < 16) {
            newTeams[teamIndex].members.push("");
            updateTeams(newTeams);
        }
    };

    return (
        <div className="space-y-4">
            {teams.map((team, i) => (
                <div key={i} className="bg-muted/50 p-4 rounded-lg mb-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">Team {i + 1}</h4>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`team-name-${i}`}>Team Name</Label>
                        <Input
                            id={`team-name-${i}`}
                            type="text"
                            placeholder="Enter team name"
                            value={team.name}
                            onChange={(e) => updateTeam(i, "name", e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`team-color-${i}`}>Team Color</Label>
                        <select
                            id={`team-color-${i}`}
                            className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${team.color && COLOR_CLASSES[team.color as ColorOption] ? COLOR_CLASSES[team.color as ColorOption].bg + " " + COLOR_CLASSES[team.color as ColorOption].text : "bg-background"}`}
                            value={team.color}
                            onChange={(e) => updateTeam(i, "color", e.target.value)}
                        >
                            <option value="" className="bg-background text-foreground">Select Team Color</option>
                            {COLOR_OPTIONS.filter((c) =>
                                !teams.some((t, idx) => t.color === c && idx !== i)
                            ).map((color) => (
                                <option
                                    key={color}
                                    value={color}
                                    className={`${COLOR_CLASSES[color].bg} ${COLOR_CLASSES[color].text}`}
                                >
                                    {color.charAt(0).toUpperCase() + color.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Codeforces Handles (case-sensitive)</Label>
                        {team.members.map((member, j) => (
                            <div key={j} className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder={`Handle ${j + 1}`}
                                    value={member}
                                    onChange={(e) => updateMember(i, j, e.target.value)}
                                />
                                {team.members.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeMember(i, j)}
                                        className="shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        {team.members.length < 16 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addMember(i)}
                                className="w-full mt-2"
                            >
                                + Add Member
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
