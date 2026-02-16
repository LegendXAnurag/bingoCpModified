"use client";
import React from 'react';
import { Match, ProblemCell } from './types/match';

type TugOfWarDisplayProps = {
    match: Match;
    problems: ProblemCell[];
    solved: Record<string, { team: string }>;
    positionOwners: Record<number, string>;
    showRatings: boolean;
    teamColors: Record<string, string>;
};

export default function TugOfWarDisplay({
    match,
    problems,
    solved,
    positionOwners,
    showRatings,
    teamColors,
}: TugOfWarDisplayProps) {
    const teamA = match.teams?.[0];
    const teamB = match.teams?.[1];

    if (!teamA || !teamB) {
        return <div className="text-center p-4">Invalid team configuration</div>;
    }

    const threshold = match.tugThreshold ?? 2000;
    const currentCount = match.tugCount ?? 0;
    const tugType = match.tugType ?? 'grid';

    // Calculate percentage for progress bar (-threshold to +threshold)
    const totalRange = threshold * 2;
    const percentage = ((currentCount + threshold) / totalRange) * 100;

    // Clamp percentage between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    // Team colors
    const teamAColor = teamColors[teamA.color.toLowerCase()] || 'bg-blue-500';
    const teamBColor = teamColors[teamB.color.toLowerCase()] || 'bg-red-500';

    // Extract base color for the rope visualization
    const getColorClass = (bgClass: string) => {
        const colorMap: Record<string, string> = {
            'bg-red-500': 'from-red-600 to-red-400',
            'bg-blue-500': 'from-blue-600 to-blue-400',
            'bg-green-500': 'from-green-600 to-green-400',
            'bg-purple-500': 'from-purple-600 to-purple-400',
            'bg-orange-500': 'from-orange-600 to-orange-400',
            'bg-pink-500': 'from-pink-600 to-pink-400',
            'bg-yellow-500': 'from-yellow-600 to-yellow-400',
            'bg-teal-500': 'from-teal-600 to-teal-400',
        };
        return colorMap[bgClass] || 'from-gray-600 to-gray-400';
    };

    const teamAGradient = getColorClass(teamAColor);
    const teamBGradient = getColorClass(teamBColor);

    // Check time and grid completion status
    const matchStart = new Date(match.startTime);
    const matchEnd = new Date(matchStart.getTime() + match.durationMinutes * 60 * 1000);
    const now = new Date();
    const matchHasEnded = now >= matchEnd;

    const allGridProblemsSolved = tugType === 'grid' &&
        problems.every(p => {
            const key = `${p.contestId}-${p.index}`;
            return solved[key];
        });

    // Win condition check - three ways to win:
    // 1. Threshold reached
    const thresholdWin = currentCount >= threshold || currentCount <= -threshold;
    // 2. Time ends - whoever has positive count (or Team A if tied at 0)
    const timeBasedWin = matchHasEnded && !thresholdWin;
    // 3. All grid problems solved - whoever has positive count (or Team A if tied at 0)
    const gridCompletionWin = allGridProblemsSolved && !thresholdWin;

    let winner = null;
    let winReason = '';

    if (currentCount >= threshold) {
        winner = teamA;
        winReason = `Reached +${threshold}!`;
    } else if (currentCount <= -threshold) {
        winner = teamB;
        winReason = `Reached -${threshold}!`;
    } else if (timeBasedWin) {
        winner = currentCount >= 0 ? teamA : teamB;
        winReason = currentCount === 0 ? 'Time ended - tied at 0!' : 'Time ended - rope on their side!';
    } else if (gridCompletionWin) {
        winner = currentCount >= 0 ? teamA : teamB;
        winReason = currentCount === 0 ? 'All problems solved - tied at 0!' : 'All problems solved - rope on their side!';
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            {/* Winner announcement */}
            {winner && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-white">
                        🎉 {winner.name} WINS! 🎉
                    </h2>
                    <p className="text-white mt-1">{winReason}</p>
                </div>
            )}

            {/* Score Display */}
            <div className="mb-8 text-center">
                <div className="text-5xl font-bold mb-2">
                    {currentCount > 0 && '+'}
                    {currentCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Current Count
                </div>
            </div>

            {/* Team Names and Thresholds */}
            <div className="flex justify-between mb-4 px-4">
                <div className="text-center">
                    <div className={`inline-block px-4 py-2 rounded-lg text-white font-bold ${teamBColor}`}>
                        {teamB.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Win at: -{threshold}
                    </div>
                </div>
                <div className="text-center">
                    <div className={`inline-block px-4 py-2 rounded-lg text-white font-bold ${teamAColor}`}>
                        {teamA.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Win at: +{threshold}
                    </div>
                </div>
            </div>

            {/* Tug of War Rope Visualization */}
            <div className="relative w-full h-24 mb-8">
                {/* Rope background */}
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-16 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full shadow-inner">
                        {/* Team sections of the rope */}
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                            {/* Team B side (left) */}
                            <div
                                className={`absolute left-0 top-0 h-full bg-gradient-to-r ${teamBGradient} transition-all duration-500`}
                                style={{ width: `${100 - clampedPercentage}%` }}
                            />
                            {/* Team A side (right) */}
                            <div
                                className={`absolute right-0 top-0 h-full bg-gradient-to-l ${teamAGradient} transition-all duration-500`}
                                style={{ width: `${clampedPercentage}%` }}
                            />
                        </div>

                        {/* Center marker (knot) */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-200 border-4 border-gray-800 dark:border-gray-900 rounded-full shadow-lg transition-all duration-500 z-10"
                            style={{ left: `${clampedPercentage}%`, transform: `translate(-50%, -50%)` }}
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 opacity-75 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Threshold markers */}
                <div className="absolute left-0 top-full mt-2 text-xs text-gray-600 dark:text-gray-400">
                    -{threshold}
                </div>
                <div className="absolute right-0 top-full mt-2 text-xs text-gray-600 dark:text-gray-400">
                    +{threshold}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 text-xs text-gray-600 dark:text-gray-400">
                    0
                </div>
            </div>

            {/* Problems Display */}
            <div className="mt-12">
                <h3 className="text-xl font-bold mb-4 text-center">
                    {tugType === 'single' ? 'Current Problem' : 'Problem Grid'}
                </h3>

                {tugType === 'single' ? (
                    // Single problem view
                    <div className="flex justify-center">
                        {problems.length > 0 && (
                            <div
                                onClick={() =>
                                    window.open(
                                        `https://codeforces.com/contest/${problems[0].contestId}/problem/${problems[0].index}`,
                                        '_blank'
                                    )
                                }
                                className="w-64 h-32 p-4 flex flex-col justify-center items-center text-center rounded-lg shadow-lg cursor-pointer transition duration-200 bg-white dark:bg-gray-800 hover:shadow-xl hover:scale-105 border-2 border-gray-300 dark:border-gray-600"
                            >
                                {showRatings && (
                                    <div className="text-lg font-bold">
                                        {problems[0].rating} - {problems[0].index}
                                    </div>
                                )}
                                <div className={`${showRatings ? 'text-sm' : 'text-lg'} mt-2 font-semibold`}>
                                    {problems[0].name}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Grid view
                    <div className={`grid gap-4 justify-items-center ${problems.length === 9 ? 'grid-cols-3' :
                        problems.length === 16 ? 'grid-cols-4' :
                            problems.length === 25 ? 'grid-cols-5' :
                                'grid-cols-6'
                        }`}>
                        {problems.map((problem, idx) => {
                            const key = `${problem.contestId}-${problem.index}`;
                            const solvedInfo = solved[key];
                            const ownerTeam = solvedInfo?.team ?? positionOwners[problem.position ?? idx];
                            const teamColor = ownerTeam
                                ? (teamColors[ownerTeam] || 'bg-gray-500 text-white')
                                : 'bg-white hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-blue-900 text-gray-800 dark:text-gray-200';

                            return (
                                <div
                                    key={key}
                                    onClick={() =>
                                        window.open(
                                            `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
                                            '_blank'
                                        )
                                    }
                                    className={`w-36 h-24 p-2 flex flex-col justify-center items-center text-center rounded shadow cursor-pointer transition duration-200 ${teamColor} ${ownerTeam ? 'text-white' : ''}`}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.classList.add('scale-105', 'shadow-lg');
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.classList.remove('scale-105', 'shadow-lg');
                                    }}
                                >
                                    {showRatings && (
                                        <div className="text-sm font-semibold">
                                            {problem.rating} - {problem.index}
                                        </div>
                                    )}
                                    <div className={`${showRatings ? 'text-xs' : 'text-sm'} mt-1`}>
                                        {problem.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
