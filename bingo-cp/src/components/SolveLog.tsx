import React from 'react';

type LogEntry = {
    message: string;
    team: string; // Used for color coding
};

type SolveLogProps = {
    log: LogEntry[];
    showLog: boolean;
    setShowLog: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SolveLog({ log, showLog, setShowLog }: SolveLogProps) {
    return (
        <>
            {showLog && (
                <div className="fixed bottom-4 left-3 w-72 max-h-[70vh] overflow-y-auto rounded-2xl z-30 flex flex-col glass border border-primary/10">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                        <div className="w-1 h-4 rounded-full bg-primary" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-heading">Solve Log</h2>
                    </div>
                    {log.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6 font-body">No solves yet</p>
                    ) : (
                        <ul className="text-xs space-y-0 divide-y divide-white/5 overflow-y-auto">
                            {log.map((entry, idx) => {
                                const colorMap: Record<string, string> = {
                                    red: '#ef4444', blue: '#3b82f6', green: '#22c55e',
                                    purple: '#a855f7', orange: '#f97316', pink: '#ec4899',
                                    yellow: '#eab308', teal: '#14b8a6',
                                };
                                const c = colorMap[entry.team.toLowerCase()] || '#6b7280';
                                return (
                                    <li key={idx} className="flex items-start gap-2 px-3 py-2.5 hover:bg-white/[0.03] transition-colors">
                                        <div className="w-0.5 shrink-0 self-stretch rounded-full mt-0.5 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: c, color: c }} />
                                        <span className="text-gray-300 leading-relaxed font-body">{entry.message}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
            <button
                onClick={() => setShowLog(prev => !prev)}
                className="cursor-pointer fixed bottom-4 left-[calc(1.5rem+288px+0.5rem)] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all z-40 font-heading bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 focus:outline-none"
            >
                {showLog ? 'Hide Log' : 'Show Log'}
            </button>
        </>
    );
}
