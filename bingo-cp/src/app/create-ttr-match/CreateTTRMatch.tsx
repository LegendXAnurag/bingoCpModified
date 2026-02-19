"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TTRTeamsForm from "./TTRTeamsForm";

export default function CreateTTRMatch() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [date, setDate] = useState(() => {
        const now = new Date();
        const future = new Date(now.getTime() + 2 * 60000);
        return future.getFullYear() + '-' + String(future.getMonth() + 1).padStart(2, '0') + '-' + String(future.getDate()).padStart(2, '0');
    });
    const [time, setTime] = useState(() => {
        const now = new Date();
        const future = new Date(now.getTime() + 2 * 60000);
        return String(future.getHours()).padStart(2, '0') + ':' + String(future.getMinutes()).padStart(2, '0');
    });
    const [gameDuration, setGameDuration] = useState("120");
    const [problemsPerLevel, setProblemsPerLevel] = useState(5);

    const [level1, setLevel1] = useState({ min: 800, max: 900, count: 5, coins: 2 });
    const [level2, setLevel2] = useState({ min: 1000, max: 1100, count: 5, coins: 3 });
    const [level3, setLevel3] = useState({ min: 1200, max: 1400, count: 5, coins: 4 });
    const [level4, setLevel4] = useState({ min: 1500, max: 3500, count: 5, coins: 5 });

    const [teams, setTeams] = useState<any[]>([]);
    const [maps, setMaps] = useState<any[]>([]);
    const [selectedMapId, setSelectedMapId] = useState<string>("");

    useEffect(() => {
        console.log("Fetching maps in CreateTTRMatch...");
        fetch('/api/ttr/maps')
            .then(res => res.json())
            .then(data => {
                console.log("Maps fetched:", data);
                if (Array.isArray(data)) {
                    setMaps(data);
                } else if (data && Array.isArray(data.data)) {
                    // Handle case where API returns { data: [...] }
                    setMaps(data.data);
                } else {
                    console.error("Maps data is not an array:", data);
                    setMaps([]); // Fallback to empty
                }
            })
            .catch(err => console.error("Error fetching maps:", err));
    }, []);

    const handleSubmit = async () => {
        if (!date || !time) {
            setError("Please switch to 'Game Settings' and select Date and Time");
            return;
        }

        if (teams.length < 2) {
            setError("At least 2 teams are required");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const startTime = new Date(`${date}T${time}`).toISOString();

            const payload = {
                startTime,
                ttrParams: {
                    gameDurationMinutes: parseInt(gameDuration),
                    level1: { ...level1, count: problemsPerLevel },
                    level2: { ...level2, count: problemsPerLevel },
                    level3: { ...level3, count: problemsPerLevel },
                    level4: { ...level4, count: problemsPerLevel },
                    mapId: selectedMapId || undefined
                },
                teams
            };
            const res = await fetch('/api/createTTRMatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create match');
            }

            const data = await res.json();
            router.push(`/match/${data.id}`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Create Ticket to Ride Math</h1>
                    <p className="text-muted-foreground">
                        Configure game settings, problem levels, and teams.
                    </p>
                </div>
                <Button className="w-auto" size="lg" onClick={handleSubmit} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Match
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="settings">Game Settings</TabsTrigger>
                    <TabsTrigger value="levels">Problem Levels</TabsTrigger>
                    <TabsTrigger value="teams">Teams</TabsTrigger>
                </TabsList>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule & Duration</CardTitle>
                            <CardDescription>When should the game start?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Map</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={selectedMapId}
                                    onChange={(e) => setSelectedMapId(e.target.value)}
                                >
                                    <option value="">Default (Europe)</option>
                                    {maps.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (Minutes)</Label>
                                <Input
                                    type="number"
                                    value={gameDuration}
                                    onChange={(e) => setGameDuration(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="levels">
                    <Card>
                        <CardHeader>
                            <CardTitle>Problem Levels</CardTitle>
                            <CardDescription>Configure difficulty ranges for each color level.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2 pb-4 border-b">
                                <Label className="text-base font-semibold">Questions per Level</Label>
                                <p className="text-sm text-muted-foreground pb-2">
                                    Number of problems available in the market for each level.
                                </p>
                                <Input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={problemsPerLevel}
                                    onChange={(e) => setProblemsPerLevel(parseInt(e.target.value) || 1)}
                                    className="max-w-xs"
                                />
                            </div>

                            {[1, 2, 3, 4].map(l => {
                                const level = l === 1 ? level1 : l === 2 ? level2 : l === 3 ? level3 : level4;
                                const setLevel = l === 1 ? setLevel1 : l === 2 ? setLevel2 : l === 3 ? setLevel3 : setLevel4;

                                return (
                                    <div key={l} className="space-y-2">
                                        <h4 className="font-semibold text-primary">Level {l} Configuration</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label>Min Rating</Label>
                                                <Input
                                                    type="number"
                                                    value={level.min}
                                                    onChange={(e) => setLevel({ ...level, min: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <Label>Max Rating</Label>
                                                <Input
                                                    type="number"
                                                    value={level.max}
                                                    onChange={(e) => setLevel({ ...level, max: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <Label>Coins Reward</Label>
                                                <Input
                                                    type="number"
                                                    value={level.coins}
                                                    onChange={(e) => setLevel({ ...level, coins: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="teams">
                    <Card>
                        <CardHeader>
                            <CardTitle>Teams</CardTitle>
                            <CardDescription>Add teams and members (Max 6 teams).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TTRTeamsForm onTeamsChange={setTeams} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
}
