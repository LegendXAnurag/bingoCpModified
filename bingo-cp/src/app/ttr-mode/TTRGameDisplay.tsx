"use client";

import { useState, useEffect } from "react";
import { Match, TTRState } from "@/app/types/match";
import TTRMap from "@/components/TTRMap";
import CoinMarketplace from "@/components/CoinMarketplace";
import PlayerStats from "@/components/PlayerStats";
import MyTickets from "@/components/MyTickets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TTRGameDisplayProps {
    match: Match;
    currentTeam: string;
    setCurrentTeam: (team: string) => void;
}

export default function TTRGameDisplay({ match, currentTeam, setCurrentTeam }: TTRGameDisplayProps) {
    const [ttrState, setTtrState] = useState<TTRState | null>(match.ttrState as unknown as TTRState);

    // Sync with parent poll
    useEffect(() => {
        if (match.ttrState) {
            // Optional: careful not to overwrite local optimistic updates if poll is stale?
            // Actually, poll is the source of truth, so we should sync.
            // But if we just did an action, the poll might be old?
            // Usually poll is newer or same. Let's sync.
            setTtrState(match.ttrState as unknown as TTRState);
        }
    }, [match.ttrState]);

    const handleStateUpdate = (newState: TTRState) => {
        setTtrState(newState);
    };

    if (!ttrState) return <div className="p-4 text-red-500">Error: TTR State not found in match data. (Mode: {match.mode})</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {/* Top Bar with Stats and Team Selector */}
            <div className="bg-gray-100 dark:bg-gray-900 border-b p-2 flex flex-col gap-2">
                <div className="flex justify-between items-center px-2">
                    <h2 className="font-bold text-xl">Ticket to Ride</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Playing as:</span>
                        <select
                            value={currentTeam}
                            onChange={(e) => setCurrentTeam(e.target.value)}
                            className="p-1 rounded border bg-white dark:bg-gray-800 text-sm"
                        >
                            {match.teams.map(t => (
                                <option key={t.color} value={t.color}>{t.name} ({t.color})</option>
                            ))}
                        </select>
                        <button
                            onClick={() => {
                                // Trigger a re-fetch if possible, or just reload for now if we can't access parent refetch.
                                // Since we don't have a refetch prop, let's keep it simple for now or adding a prop would be better.
                                // Actually, let's just make it do a router.refresh() or keep window.location.reload() but maybe less aggressive?
                                // User asked to remove polling dependence... manual refresh is the backup.
                                // Let's leave it as reload for now to be safe, or if we want to be fancy we can add a onRefresh prop.
                                window.location.reload();
                            }}
                            className="p-1 px-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                            Refresh (Sync)
                        </button>
                    </div>
                </div>
                <div className="h-24 overflow-y-auto">
                    <PlayerStats state={ttrState} />
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="map" className="h-full flex flex-col">
                    <div className="bg-white dark:bg-gray-800 border-b px-4">
                        <TabsList>
                            <TabsTrigger value="map">Map</TabsTrigger>
                            <TabsTrigger value="market">Coin Market</TabsTrigger>
                            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="map" className="flex-1 relative overflow-hidden m-0 p-0">
                        <TTRMap
                            matchId={match.id}
                            state={ttrState}
                            currentTeam={currentTeam}
                            onUpdate={handleStateUpdate}
                        />
                    </TabsContent>

                    <TabsContent value="market" className="flex-1 overflow-auto m-0 p-0">
                        <CoinMarketplace state={ttrState} />
                    </TabsContent>

                    <TabsContent value="tickets" className="flex-1 overflow-auto m-0 p-0">
                        <MyTickets
                            matchId={match.id}
                            state={ttrState}
                            currentTeam={currentTeam}
                            onUpdate={handleStateUpdate}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
