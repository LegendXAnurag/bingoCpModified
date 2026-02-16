// Coin Marketplace - displays problems organized by level
'use client';

import React from 'react';
import { ProblemLevel, TTRProblem } from '../../types/ticketRide';

interface CoinMarketplaceProps {
    problemLevels: ProblemLevel[];
    problems: TTRProblem[];
    onProblemClick: (problem: TTRProblem) => void;
}

export default function CoinMarketplace({
    problemLevels,
    problems,
    onProblemClick,
}: CoinMarketplaceProps) {
    // Group problems by level
    const problemsByLevel = problems.reduce((acc, problem) => {
        if (!acc[problem.level]) {
            acc[problem.level] = [];
        }
        acc[problem.level].push(problem);
        return acc;
    }, {} as Record<number, TTRProblem[]>);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                💰 Coin Marketplace
            </h2>

            <div className="space-y-6">
                {problemLevels.map((level) => {
                    const levelProblems = problemsByLevel[level.level] || [];

                    return (
                        <div key={level.level} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    Level {level.level}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>{level.ratingMin}-{level.ratingMax}</span>
                                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full font-semibold">
                                        {level.coinsAwarded} coins
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-3">
                                {levelProblems.map((problem) => {
                                    const isSolved = !!problem.solvedBy;

                                    return (
                                        <button
                                            key={`${problem.contestId}-${problem.index}`}
                                            onClick={() => !isSolved && onProblemClick(problem)}
                                            disabled={isSolved}
                                            className={`
                        p-3 rounded-lg text-center transition-all duration-200
                        ${isSolved
                                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-900 dark:text-blue-100 cursor-pointer'
                                                }
                      `}
                                        >
                                            <div className="font-mono text-sm font-bold">
                                                {problem.contestId}{problem.index}
                                            </div>
                                            <div className="text-xs mt-1">{problem.rating}</div>
                                            {isSolved && (
                                                <div className="text-xs mt-1 text-green-600 dark:text-green-400">
                                                    ✓ Solved
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
