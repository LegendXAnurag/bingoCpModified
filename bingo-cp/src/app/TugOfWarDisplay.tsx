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
    const teamA = match.teams?.[0]; // Left side (Index 0)
    const teamB = match.teams?.[1]; // Right side (Index 1)

    if (!teamA || !teamB) {
        return <div className="text-center p-4">Invalid team configuration</div>;
    }

    const threshold = match.tugThreshold ?? 2000;
    const currentCount = match.tugCount ?? 0;
    const tugType = match.tugType ?? 'grid';

    // Calculate percentage for progress bar (-threshold to +threshold)
    const totalRange = threshold * 2;
    // 0 to 100 where 50 is 0 score. 0 is -threshold (Team B wins), 100 is +threshold (Team A wins)
    const percentage = ((currentCount + threshold) / totalRange) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    // Team colors
    const teamAColorObj = teamColors[teamA.color.toLowerCase()] || 'bg-blue-500'; // Default Blue
    const teamBColorObj = teamColors[teamB.color.toLowerCase()] || 'bg-red-500';  // Default Red

    // Helper to get raw color values for shadows/effects if needed, or just map standard classes
    // We'll stick to the provided classes but add intensity

    // Determine who is leading for dynamic effects
    const isTeamALeading = currentCount > 0;
    const isTeamBLeading = currentCount < 0;
    const isTied = currentCount === 0;

    // Win condition check (same logic as before)
    const matchStart = new Date(match.startTime);
    const matchEnd = new Date(matchStart.getTime() + match.durationMinutes * 60 * 1000);
    const now = new Date();
    const matchHasEnded = now >= matchEnd;
    const allGridProblemsSolved = tugType === 'grid' &&
        problems.every(p => solved[`${p.contestId}-${p.index}`]);

    const thresholdWin = currentCount >= threshold || currentCount <= -threshold;
    const timeBasedWin = matchHasEnded && !thresholdWin;
    const gridCompletionWin = allGridProblemsSolved && !thresholdWin;

    let winner = null;
    let winReason = '';

    if (currentCount >= threshold) {
        winner = teamA;
        winReason = `KO! Reached +${threshold}`;
    } else if (currentCount <= -threshold) {
        winner = teamB;
        winReason = `KO! Reached -${threshold}`;
    } else if (timeBasedWin) {
        winner = currentCount >= 0 ? teamA : teamB;
        winReason = currentCount === 0 ? 'TIME OVER - DRAW (Default A)' : 'TIME OVER';
    } else if (gridCompletionWin) {
        winner = currentCount >= 0 ? teamA : teamB;
        winReason = 'PERFECT CLEAR';
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-2 py-6 select-none overflow-hidden">
            {/* Winner Overlay / Announcement */}
            {winner && (
                <div className="mb-8 p-6 bg-black/90 border-4 border-yellow-500 rounded-xl relative overflow-hidden text-center animate-in zoom-in duration-300">
                    <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                        {winner.name} WINS
                    </h2>
                    <p className="text-xl text-yellow-400 font-bold uppercase tracking-widest mt-2 relative z-10">{winReason}</p>
                </div>
            )}

            {/* VS HUD Header */}
            <div className="grid grid-cols-3 items-end mb-4 px-2 md:px-8 relative">
                {/* Team A (Left) Name */}
                <div className="text-left relative z-10 min-w-0">
                    <div className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-lg truncate ${isTeamALeading ? 'text-white scale-105' : 'text-gray-400 dark:text-gray-500'} transition-all duration-300 origin-left`}>
                        {teamA.name}
                    </div>
                </div>

                {/* Center Dynamic Score */}
                <div className="flex flex-col items-center justify-end z-20">
                    <div className={`text-5xl md:text-7xl font-black tabular-nums tracking-tighter leading-none transition-colors duration-300 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]
                        ${isTeamALeading ? 'text-blue-500' : isTeamBLeading ? 'text-red-500' : 'text-gray-200'}
                     `}>
                        {Math.abs(currentCount)}
                    </div>
                    <span className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">Diff</span>
                </div>

                {/* Team B (Right) Name */}
                <div className="text-right relative z-10 min-w-0">
                    <div className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-lg truncate ${isTeamBLeading ? 'text-white scale-105' : 'text-gray-400 dark:text-gray-500'} transition-all duration-300 origin-right`}>
                        {teamB.name}
                    </div>
                </div>
            </div>

            {/* The "Health Bars" Clash Visualization */}
            <div className="relative w-full h-24 md:h-32 mb-12 flex justify-center items-center">
                {/* Container for the bars */}
                <div className="relative w-full h-full max-w-5xl bg-gray-800/50 rounded-lg border-y-4 border-gray-700 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">

                    {/* Background Grid Lines (optional aesthetic) */}
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_49%,#fff_50%,transparent_51%)] bg-[length:50px_100%]"></div>
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(0deg,transparent_49%,#fff_50%,transparent_51%)] bg-[length:100%_4px]"></div>

                    {/* Team A Bar (Left Side, fills based on clampedPercentage) */}
                    <div
                        className={`absolute left-0 top-0 bottom-0 ${teamAColorObj} shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out`}
                        style={{
                            width: `${clampedPercentage}%`,
                            transform: 'skewX(-15deg) translateX(-10px)', // Skew it for style
                            transformOrigin: 'bottom left'
                        }}
                    >
                        {/* Inner sheen/shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>

                    {/* Team B Bar (Right Side, fills based on 100 - clampedPercentage) */}
                    <div
                        className={`absolute right-0 top-0 bottom-0 ${teamBColorObj} shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out`}
                        style={{
                            width: `${100 - clampedPercentage + 0.1}%`,
                            transform: 'skewX(-15deg) translateX(10px)', // Matching skew
                            transformOrigin: 'top right'
                        }}
                    >
                        {/* Inner sheen/shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>

                    {/* The Clash Point / Impact Zone */}
                    <div
                        className="absolute top-0 bottom-0 w-8 z-30 pointer-events-none mix-blend-screen transition-all duration-500 ease-out flex justify-center items-center"
                        style={{ left: `${clampedPercentage}%`, transform: `translateX(-50%)` }}
                    >
                        {/* Glowing vertical beam */}
                        <div className="h-[120%] w-2 bg-white blur-[4px] animate-pulse"></div>
                        <div className="h-[120%] w-1 bg-white"></div>

                        {/* Burst/Spark effect at center */}
                        <div className="absolute w-24 h-24 bg-white/40 blur-[20px] rounded-full animate-bounce"></div>
                        {/* VS Icon at clash point */}
                        <div className="absolute w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center font-black text-xs italic text-white shadow-lg z-50 transform rotate-12">
                            VS
                        </div>
                    </div>
                </div>

                {/* Threshold Markers outside the bar for readability */}
                <div className="absolute -bottom-6 w-full max-w-5xl flex justify-between text-xs font-mono font-bold text-gray-500 uppercase px-4">
                    <span>Target: -{threshold}</span>
                    <span>Start</span>
                    <span>Target: +{threshold}</span>
                </div>
            </div>

            {/* Problems Display (Grid or Single) */}
            <div className="mt-8">
                <div className="flex items-center justify-center mb-6">
                    <div className="h-1 w-12 bg-gray-300 dark:bg-gray-700 mx-4"></div>
                    <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-center text-gray-700 dark:text-gray-300">
                        {tugType === 'single' ? 'Current Battle' : 'Battlefield'}
                    </h3>
                    <div className="h-1 w-12 bg-gray-300 dark:bg-gray-700 mx-4"></div>
                </div>


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
                                className="w-full max-w-md p-6 flex flex-col justify-center items-center text-center rounded-xl shadow-xl cursor-pointer transition transform duration-200 bg-white dark:bg-gray-800 hover:scale-[1.02] border-4 border-gray-200 dark:border-gray-700 group hover:border-yellow-500 dark:hover:border-yellow-500"
                            >
                                {showRatings && (
                                    <div className="text-xl font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full mb-3 text-gray-600 dark:text-gray-300">
                                        Rating: {problems[0].rating}
                                    </div>
                                )}
                                <div className="text-3xl font-bold leading-tight group-hover:text-blue-500 transition-colors">
                                    {problems[0].name}
                                </div>
                                <div className="mt-2 text-sm font-mono text-gray-500">
                                    {problems[0].index}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Grid view
                    <div className={`grid gap-3 justify-items-center ${problems.length === 9 ? 'grid-cols-3' :
                        problems.length === 16 ? 'grid-cols-4' :
                            problems.length === 25 ? 'grid-cols-5' :
                                'grid-cols-6'
                        }`}>
                        {problems.map((problem, idx) => {
                            const key = `${problem.contestId}-${problem.index}`;
                            const solvedInfo = solved[key];
                            const ownerTeam = solvedInfo?.team ?? positionOwners[problem.position ?? idx];

                            // Determine cell styling based on ownership
                            const isOwned = Boolean(ownerTeam);
                            let bgClass = 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-400'; // Default Neutral

                            if (isOwned) {
                                // If owned, use team color but make it look like a captured territory
                                const baseColor = teamColors[ownerTeam] || 'bg-gray-600';
                                bgClass = `${baseColor} text-white border-2 border-white/20 shadow-lg scale-105 z-10`;
                            } else {
                                // Hover effect for unowned
                                bgClass += ' hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-200';
                            }

                            return (
                                <div
                                    key={key}
                                    onClick={() =>
                                        window.open(
                                            `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
                                            '_blank'
                                        )
                                    }
                                    className={`w-full aspect-square flex flex-col justify-center items-center text-center rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden ${bgClass}`}
                                >
                                    {/* Capture sheen */}
                                    {isOwned && <div className="absolute inset-0 bg-white/10"></div>}

                                    {showRatings && (
                                        <div className="text-[10px] sm:text-xs font-bold opacity-80 mb-1">
                                            {problem.rating}
                                        </div>
                                    )}
                                    <div className={`font-bold leading-tight px-1 ${showRatings ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
                                        {problem.name}
                                    </div>
                                    <div className="text-[10px] opacity-60 font-mono mt-0.5">{problem.index}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
