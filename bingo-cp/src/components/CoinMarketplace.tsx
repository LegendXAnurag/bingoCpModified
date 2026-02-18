"use client";

import { TTRState, ProblemCell } from "../app/types/match";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CoinMarketplaceProps {
    state: TTRState;
}

export default function CoinMarketplace({ state }: CoinMarketplaceProps) {
    const { market } = state;

    // Group by level
    const byLevel = [0, 1, 2, 3].map(level => ({
        level,
        problems: market.filter(p => p.row === level)
    }));

    // Coins per level:
    // 0 -> 2 coins
    // 1 -> 3 coins
    // 2 -> 4 coins
    // 3 -> 5 coins
    const coinsReward = [2, 3, 4, 5];

    const levelColors = [
        "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700", // Level 1 (2 coins)
        "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700",     // Level 2 (3 coins)
        "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700", // Level 3 (4 coins)
        "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700"        // Level 4 (5 coins)
    ];

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {byLevel.map(({ level, problems }) => (
                <Card key={level} className={`backdrop-blur border-2 ${levelColors[level]}`}>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Level {level + 1}</h3>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                {coinsReward[level]} Coins
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            {problems.length === 0 && <div className="text-gray-500 text-sm italic">No problems available</div>}
                            {problems.map(p => (
                                <a
                                    key={p.contestId + p.index}
                                    href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition border hover:border-blue-400"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-sm">{p.index}</span>
                                        <span className="text-xs text-gray-500">{p.rating}</span>
                                    </div>
                                    <div className="font-medium mt-1 leading-tight" title={p.name}>{p.name}</div>
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
