"use client";

import { useState, useEffect } from "react";
import { Match, TTRState } from "@/app/types/match";
import TTRMap from "@/components/TTRMap";
import CoinMarketplace from "@/components/CoinMarketplace";
import PlayerStats from "@/components/PlayerStats";
import MyTickets from "@/components/MyTickets";


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

        <div className="flex flex-col min-h-screen pb-10 gap-6">
            {/* Top Bar with Stats and Team Selector */}
            <div className="bg-gray-100 dark:bg-gray-900  p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto w-full">
                    <h2 className="font-bold text-2xl">Ticket to Ride</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Playing as:</span>
                        <select
                            value={currentTeam}
                            onChange={(e) => setCurrentTeam(e.target.value)}
                            className="p-2 rounded border bg-white dark:bg-gray-800 text-sm"
                        >
                            {match.teams.map(t => (
                                <option key={t.color} value={t.color}>{t.name} ({t.color})</option>
                            ))}
                        </select>
                        <button
                            onClick={() => window.location.reload()}
                            className="p-2 px-4 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-bold"
                        >
                            Sync / Refresh
                        </button>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto w-full">
                    <PlayerStats state={ttrState} />
                </div>
            </div>

            <div className="flex flex-col gap-8 max-w-[1600px] mx-auto w-full px-4">
                {/* Map Area - Big and Prominent */}
                <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border overflow-hidden flex flex-col">
                    <div className="h-[800px] w-full relative">
                        <TTRMap
                            matchId={match.id}
                            state={ttrState}
                            currentTeam={currentTeam}
                            onUpdate={handleStateUpdate}
                        />
                    </div>
                </div>

                {/* Bottom Components - Spread Out */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Coin Market */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
                            <h3 className="font-bold text-lg">Coin Marketplace</h3>
                        </div>
                        <div className="p-4">
                            <CoinMarketplace state={ttrState} />
                        </div>
                    </div>

                    {/* My Tickets */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                            <h3 className="font-bold text-lg">My Tickets</h3>
                            <span className="text-sm text-gray-500">
                                Need more coins? Check the market.
                            </span>
                        </div>
                        <div className="p-4 h-[500px] overflow-auto">
                            <MyTickets
                                matchId={match.id}
                                state={ttrState}
                                currentTeam={currentTeam}
                                onUpdate={handleStateUpdate}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}
