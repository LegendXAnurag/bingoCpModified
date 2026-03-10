import React from 'react';

type TeamInfo = {
    name: string;
    color: string;
};

type StatusHUDProps = {
    gameMode: string;
    teams: TeamInfo[];
    matchStart: Date;
    matchEnd: Date;
    now: Date;
    matchHasStarted: boolean;
    matchHasEnded: boolean;
    matchOngoing: boolean;
};

export function formatDuration(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

export function formatCountdown(ms: number): string {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

export default function StatusHUD({
    gameMode,
    teams,
    matchStart,
    matchEnd,
    now,
    matchHasStarted,
    matchHasEnded,
    matchOngoing
}: StatusHUDProps) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-heading bg-primary/10 border border-primary/25 text-primary"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {gameMode}
            </span>

            {/* Team legend */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
                {teams.map((t) => (
                    <span key={t.name} className="inline-flex items-center gap-1.5 text-xs font-semibold font-body text-gray-400">
                        <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: t.color, color: t.color }} />
                        <span className="text-gray-200">{t.name}</span>
                    </span>
                ))}
            </div>

            {/* Status */}
            {!matchHasStarted && (
                <span className="text-xs font-mono text-yellow-400 font-medium">
                    Starts in {formatCountdown(matchStart.getTime() - now.getTime())}
                </span>
            )}
            {matchHasEnded && (
                <span className="text-xs font-mono text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">MATCH ENDED</span>
            )}
            {matchOngoing && (
                <span className="text-xs font-mono text-emerald-400 font-medium tracking-wide">
                    {formatDuration(matchEnd.getTime() - now.getTime())} left
                </span>
            )}
        </div>
    );
}
