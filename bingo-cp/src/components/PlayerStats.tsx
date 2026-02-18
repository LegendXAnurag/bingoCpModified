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
        <div className="p-2 grid grid-cols-2 lg:grid-cols-4 gap-4 min-w-max">
            {players.map(player => (
                <Card key={player.team} className={`border-l-4 border-l-${player.team}-500 overflow-hidden`}>
                    <div className={`h-2 bg-${player.team}-500 w-full mb-2`} style={{ backgroundColor: player.team }} />
                    <CardContent className="p-4 pt-0">
                        <h3 className="font-bold text-lg capitalize mb-2">{player.team}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2" title="Coins">
                                <Coins className="w-4 h-4 text-yellow-500" />
                                <span>{player.coins}</span>
                            </div>
                            <div className="flex items-center gap-2" title="Score">
                                <Trophy className="w-4 h-4 text-purple-500" />
                                <span>{player.score}</span>
                            </div>
                            <div className="flex items-center gap-2" title="Trains Left">
                                <Train className="w-4 h-4 text-blue-500" />
                                <span>{player.trainsLeft}</span>
                            </div>
                            <div className="flex items-center gap-2" title="Stations Left">
                                <Home className="w-4 h-4 text-red-500" />
                                <span>{player.stationsLeft}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
