"use client";

import { TTRState } from "../app/types/match";
import { Card, CardContent } from "@/components/ui/card";
import { Train, Coins, Home, Trophy } from "lucide-react";

interface PlayerStatsProps {
    state: TTRState;
}

export default function PlayerStats({ state }: PlayerStatsProps) {
    const players = Object.values(state.players);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
            {players.map(player => (
                <Card key={player.team} className={`border-l-4 border-l-${player.team}-500 shadow-sm relative overflow-hidden`}>
                    {/* Light background tint for the team */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-${player.team}-500 opacity-50`} style={{ backgroundColor: player.team }}></div>

                    <CardContent className="p-3">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg capitalize flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: player.team }}></span>
                                {player.team}
                            </h3>
                            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                Score: <span className="font-bold text-base">{player.score}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex flex-col items-center bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-100 dark:border-yellow-900/30">
                                <Coins className="w-5 h-5 text-yellow-600 mb-1" />
                                <span className="font-bold text-gray-700 dark:text-gray-300">{player.coins}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-semibold">Coins</span>
                            </div>

                            <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-900/30">
                                <Train className="w-5 h-5 text-blue-600 mb-1" />
                                <span className="font-bold text-gray-700 dark:text-gray-300">{player.trainsLeft}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-semibold">Trains</span>
                            </div>

                            <div className="flex flex-col items-center bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">
                                <Home className="w-5 h-5 text-red-600 mb-1" />
                                <span className="font-bold text-gray-700 dark:text-gray-300">{player.stationsLeft}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-semibold">Stations</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
