"use client";

import { TTRState } from "../app/types/match";
import { Train, Coins, Home } from "lucide-react";

interface PlayerStatsProps {
    state: TTRState;
}

const COLOR_HEX: Record<string, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#a855f7',
    orange: '#f97316',
    pink: '#ec4899',
    yellow: '#eab308',
    teal: '#14b8a6',
};

export default function PlayerStats({ state }: PlayerStatsProps) {
    const players = Object.values(state.players);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
            {players.map(player => {
                const color = COLOR_HEX[player.team?.toLowerCase()] || '#6b7280';
                return (
                    <div
                        key={player.team}
                        className="relative overflow-hidden rounded-xl p-4"
                        style={{
                            background: 'rgba(10,10,10,0.85)',
                            border: `1px solid ${color}30`,
                            borderLeft: `3px solid ${color}`,
                            boxShadow: `0 0 20px ${color}08`,
                        }}
                    >
                        {/* Subtle background tint */}
                        <div
                            className="absolute inset-0 opacity-5 pointer-events-none"
                            style={{ background: `radial-gradient(ellipse at top left, ${color} 0%, transparent 60%)` }}
                        />

                        {/* Team header */}
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                                />
                                <span className="font-black uppercase tracking-wider text-sm" style={{ color }}>
                                    {player.team}
                                </span>
                            </div>
                            <div
                                className="text-xs font-mono font-bold px-2.5 py-1 rounded-full"
                                style={{
                                    background: `${color}18`,
                                    color,
                                    border: `1px solid ${color}30`,
                                }}
                            >
                                {player.score} pts
                            </div>
                        </div>

                        {/* Stat chips */}
                        <div className="grid grid-cols-3 gap-2 relative z-10">
                            <div
                                className="flex flex-col items-center py-2.5 rounded-lg"
                                style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.12)' }}
                            >
                                <Coins className="w-4 h-4 text-yellow-400 mb-1.5" />
                                <span className="font-black text-base text-white leading-none">{player.coins}</span>
                                <span className="text-[9px] uppercase tracking-widest text-[#6b7280] mt-1 font-bold">Coins</span>
                            </div>

                            <div
                                className="flex flex-col items-center py-2.5 rounded-lg"
                                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}
                            >
                                <Train className="w-4 h-4 text-blue-400 mb-1.5" />
                                <span className="font-black text-base text-white leading-none">{player.trainsLeft}</span>
                                <span className="text-[9px] uppercase tracking-widest text-[#6b7280] mt-1 font-bold">Trains Left</span>
                            </div>

                            <div
                                className="flex flex-col items-center py-2.5 rounded-lg"
                                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}
                            >
                                <Home className="w-4 h-4 text-red-400 mb-1.5" />
                                <span className="font-black text-base text-white leading-none">{player.stationsLeft}</span>
                                <span className="text-[9px] uppercase tracking-widest text-[#6b7280] mt-1 font-bold">Stations</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
