"use client";

import { useState, useEffect, useRef } from "react";
import { Match, TTRState } from "@/app/types/match";
import TTRMap from "@/components/TTRMap";
import CoinMarketplace from "@/components/CoinMarketplace";
import PlayerStats from "@/components/PlayerStats";
import MyTickets from "@/components/MyTickets";
import { AuthProvider, useTtrAuth } from "../ttr/AuthContext";
import JoinScreen from "../ttr/JoinScreen";

interface TTRGameDisplayProps {
    match: Match;
    currentTeam: string;
    setCurrentTeam: (team: string) => void;
    hasStarted?: boolean;
}

function TTRGameContent({ match, currentTeam, setCurrentTeam, hasStarted = false }: TTRGameDisplayProps) {
    const { user, isSpectator, isLoading } = useTtrAuth();
    const [ttrState, setTtrState] = useState<TTRState | null>(match.ttrState as unknown as TTRState);
    const [lastSync, setLastSync] = useState<Date>(new Date());

    // Sync state from manual poll or websocket (if added)
    // Also update currentTeam based on User
    useEffect(() => {
        if (user) {
            setCurrentTeam(user.teamColor);
        }
    }, [user, setCurrentTeam]);

    // Polling Logic
    useEffect(() => {
        if (isLoading) return;

        let intervalId: NodeJS.Timeout;

        const poll = async () => {
            try {
                const body: any = { matchId: match.id };
                if (user?.token) {
                    body.token = user.token;
                }

                const res = await fetch('/api/ttr/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.match && data.match.ttrState) {
                        setTtrState(data.match.ttrState as TTRState);
                        setLastSync(new Date());
                    }
                }
            } catch (e) {
                console.error("Poll failed", e);
            }
        };

        // Initial Poll on mount/auth change
        poll();

        // Regular Poll
        const intervalMs = 15000; // 15s default
        intervalId = setInterval(poll, intervalMs);

        return () => clearInterval(intervalId);

    }, [match.id, user, isLoading]);

    const handleStateUpdate = (newState: TTRState) => {
        setTtrState(newState); // Optimistic local update
    };

    if (isLoading) return <div className="p-10 text-center">Loading Auth...</div>;

    // Show Join Screen if not authenticated and not spectator
    if (!user && !isSpectator) {
        // Prepare teams data for JoinScreen
        // We need 'claimed' status which comes from match.teams.members
        // We might need to fetch a fresh match object or rely on props if they are fresh enough.
        // For 'claimed', we should probably rely on the initial match prop for the first render,
        // but ideally JoinScreen handles fetching fresh status or we poll for it.
        // Let's pass the props match.teams which has members.
        // IMPORTANT: The member object in match.teams needs 'claimed' field which we added to schema.
        // We might need to cast or ensure parent fetches it.

        const teamsData = match.teams.map((t: any) => ({
            id: t.id,
            name: t.name,
            color: t.color,
            members: t.members.map((m: any) => ({
                id: m.id,
                handle: m.handle,
                claimed: m.claimed ?? false // Handle potential missing field if old data
            }))
        }));

        return <JoinScreen matchId={match.id} teams={teamsData} />;
    }

    // PRE-GAME LOBBY: If match hasn't started, show waiting screen instead of game
    if (!hasStarted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-4">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold">Waiting for Match Start</h2>
                    <p className="text-xl text-muted-foreground">The train is boarding...</p>
                </div>

                {user && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-2" style={{ borderColor: user.teamColor }}>
                        <div className="text-center space-y-2">
                            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">You are ready as</span>
                            <div className="text-3xl font-black" style={{ color: user.teamColor }}>
                                {user.handle}
                            </div>
                            <div className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-900 rounded-full text-sm font-semibold mt-2">
                                {user.teamColor} Team
                            </div>
                        </div>
                    </div>
                )}

                {isSpectator && (
                    <div className="bg-blue-50 text-blue-800 p-6 rounded-lg font-medium">
                        You are in Spectator Mode. Sit tight!
                    </div>
                )}
            </div>
        );
    }

    if (!ttrState) return <div className="p-4 text-red-500">Error: TTR State not found in match data. (Mode: {match.mode})</div>;

    return (
        <div className="flex flex-col min-h-screen pb-10 gap-6">
            {/* Top Bar with Stats and Team Selector */}
            <div className="bg-white dark:bg-gray-900 border-b shadow-sm sticky top-0 z-50">
                <div className="max-w-[1920px] mx-auto w-full p-4 flex flex-col gap-4">

                    {/* Header Row: Identity & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="font-bold text-2xl tracking-tight">Ticket to Ride</h2>

                            {user && (
                                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2`}
                                    style={{ borderColor: user.teamColor, backgroundColor: `${user.teamColor}10` }}>
                                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: user.teamColor }}></div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-xs uppercase font-bold text-gray-500">Playing as</span>
                                        <span className="text-lg font-bold">{user.handle}</span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-gray-300 mx-2"></div>
                                    <span className="font-bold opacity-80 capitalize">{user.teamColor} Team</span>
                                </div>
                            )}

                            {isSpectator && (
                                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 font-bold flex items-center gap-2">
                                    <span>👀 Spectator Mode</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Only show team selector if spectator, otherwise fixed to user team */}
                            {isSpectator && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500">View team:</span>
                                    <select
                                        value={currentTeam}
                                        onChange={(e) => setCurrentTeam(e.target.value)}
                                        className="p-2 pr-8 rounded border bg-gray-50 hover:bg-white transition-colors cursor-pointer text-sm font-semibold"
                                    >
                                        {match.teams.map(t => (
                                            <option key={t.color} value={t.color}>{t.name} ({t.color})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-mono">LAST SYNC</p>
                                <p className="text-sm font-mono text-gray-600">{lastSync.toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="w-full">
                        <PlayerStats state={ttrState} />
                    </div>
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
                            readOnly={isSpectator}
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

                    {/* My Tickets - Only show if playing */}
                    {!isSpectator && (
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
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TTRGameDisplay(props: TTRGameDisplayProps) {
    return (
        <AuthProvider matchId={props.match.id}>
            <TTRGameContent {...props} />
        </AuthProvider>
    );
}
