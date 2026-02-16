import { useState, useEffect } from "react";

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
                <div key={i} className="border p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Team {i + 1}</h4>
                    </div>

                    <input
                        type="text"
                        className="w-full p-2 border rounded mb-2"
                        placeholder="Team name"
                        value={team.name}
                        onChange={(e) => updateTeam(i, "name", e.target.value)}
                    />

                    <select
                        className="w-full p-2 border rounded mb-2"
                        value={team.color}
                        onChange={(e) => updateTeam(i, "color", e.target.value)}
                    >
                        <option value="" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Select Team Color</option>
                        {COLOR_OPTIONS.filter((c) =>
                            !teams.some((t, idx) => t.color === c && idx !== i)
                        ).map((color) => (
                            <option
                                key={color}
                                value={color}
                                className={`${COLOR_CLASSES[color].bg} ${COLOR_CLASSES[color].text} hover:bg-gray-200`}
                            >
                                {color.charAt(0).toUpperCase() + color.slice(1)}
                            </option>
                        ))}
                    </select>

                    <label className="block text-sm font-medium mb-1">
                        Codeforces Handles (case-sensitive)
                    </label>

                    {team.members.map((member, j) => (
                        <div key={j} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                className="flex-1 p-2 border rounded"
                                placeholder={`Handle ${j + 1}`}
                                value={member}
                                onChange={(e) => updateMember(i, j, e.target.value)}
                            />
                            {team.members.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeMember(i, j)}
                                    className="text-red-500 text-sm"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}

                    {team.members.length < 16 && (
                        <button
                            type="button"
                            onClick={() => addMember(i)}
                            className="text-blue-600 text-sm mt-1"
                        >
                            + Add Member
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
