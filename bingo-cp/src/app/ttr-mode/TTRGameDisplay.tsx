"use client";

import { useState, useEffect } from "react";
import { Match, TTRState } from "@/app/types/match";
import TTRMap from "@/components/TTRMap";
import CoinMarketplace from "@/components/CoinMarketplace";
import MyTickets from "@/components/MyTickets";
import { AuthProvider, useTtrAuth } from "../ttr/AuthContext";
import JoinScreen from "../ttr/JoinScreen";
import { TrainFront } from "lucide-react";

interface TTRGameDisplayProps {
    match: Match;
    currentTeam: string;
    setCurrentTeam: (team: string) => void;
    hasStarted?: boolean;
}

const COLOR_HEX: Record<string, string> = {
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e',
    purple: '#a855f7', orange: '#f97316', pink: '#ec4899',
    yellow: '#eab308', teal: '#14b8a6',
};

function formatTime(ms: number): string {
    if (ms <= 0) return "00:00:00";
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
}

interface SolveEntry {
    team: string;
    handle: string;
    problemName: string;
    timestamp: string;
}

function TTRGameContent({ match, currentTeam, setCurrentTeam, hasStarted = false }: TTRGameDisplayProps) {
    const { user, isSpectator, isLoading } = useTtrAuth();
    const [ttrState, setTtrState] = useState<TTRState | null>(match.ttrState as unknown as TTRState);
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const [solveLog, setSolveLog] = useState<SolveEntry[]>([]);
    const [now, setNow] = useState(new Date());

    // Clock tick
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (user) setCurrentTeam(user.teamColor);
    }, [user, setCurrentTeam]);

    useEffect(() => {
        if (isLoading) return;
        let intervalId: NodeJS.Timeout;

        const poll = async () => {
            try {
                const body: Record<string, string> = { matchId: match.id };
                if (user?.token) body.token = user.token;

                const res = await fetch('/api/ttr/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.match?.ttrState) {
                        const state = data.match.ttrState as TTRState;
                        setTtrState(state);
                        setLastSync(new Date());

                        // Build solve log from state.solveLog if available
                        if (Array.isArray((state as any).solveLog)) {
                            setSolveLog((state as any).solveLog);
                        }
                    }
                }
            } catch (e) {
                console.error("Poll failed", e);
            }
        };

        poll();
        intervalId = setInterval(poll, 15000);
        return () => clearInterval(intervalId);
    }, [match.id, user, isLoading]);

    const handleStateUpdate = (newState: TTRState) => setTtrState(newState);

    // ── Loading state ──────────────────────────────────
    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#050505]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-[#00f0ff] animate-spin" />
                <p className="text-[#00f0ff] font-mono text-sm tracking-widest uppercase animate-pulse">Loading...</p>
            </div>
        </div>
    );

    // ── Join screen ──────────────────────────────────
    if (!user && !isSpectator) {
        const teamsData = match.teams.map((t: any) => ({
            id: t.id, name: t.name, color: t.color,
            members: t.members.map((m: any) => ({ id: m.id, handle: m.handle, claimed: m.claimed ?? false }))
        }));
        return <JoinScreen matchId={match.id} teams={teamsData} />;
    }

    // ── Pre-game lobby ──────────────────────────────
    if (!hasStarted) {
        const matchStart = new Date(match.startTime);
        const countdown = formatTime(matchStart.getTime() - now.getTime());

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] gap-8 p-6 relative overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

                <div className="relative z-10 text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 text-xs font-mono tracking-widest uppercase font-mono">Ticket to Ride</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tight text-white font-heading">Waiting for Start</h2>
                    <p className="text-[#a3a3a3] font-body">The train is boarding — get ready.</p>

                    {/* Countdown */}
                    <div className="mt-6 px-8 py-4 rounded-2xl" style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <p className="text-[9px] uppercase tracking-widest text-[#a3a3a3] font-heading mb-1">Match starts in</p>
                        <span className="text-4xl font-mono text-emerald-400 font-mono">{countdown}</span>
                    </div>
                </div>

                {user && (
                    <div className="relative z-10 rounded-2xl p-px overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${user.teamColor}50, transparent, ${user.teamColor}20)` }}>
                        <div className="bg-[#0a0a0a] rounded-2xl p-8 text-center space-y-3 min-w-[280px]">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3] font-heading">You are playing as</p>
                            <div className="text-3xl font-black font-heading" style={{ color: user.teamColor }}>{user.handle}</div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold font-heading"
                                style={{ background: `${user.teamColor}20`, color: user.teamColor, border: `1px solid ${user.teamColor}40` }}>
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: user.teamColor }} />
                                {user.teamColor} Team
                            </div>
                        </div>
                    </div>
                )}

                {isSpectator && (
                    <div className="relative z-10 rounded-xl p-4 font-semibold flex items-center gap-3 font-body"
                        style={{ background: 'rgba(112,0,255,0.1)', border: '1px solid rgba(112,0,255,0.3)', color: '#a87fff' }}>
                        <span className="text-lg">◉</span>
                        You are in Spectator Mode. Sit tight!
                    </div>
                )}
            </div>
        );
    }

    // ── Error: no state ──────────────────────────────
    if (!ttrState) return (
        <div className="flex items-center justify-center min-h-screen bg-[#050505]">
            <p className="text-red-400 font-mono">Error: TTR State not found. (Mode: {match.mode})</p>
        </div>
    );

    // ─── Compute timer ─────────────────────────────────────────────────────
    const matchStart = new Date(match.startTime);
    const matchEnd = new Date(matchStart.getTime() + match.durationMinutes * 60 * 1000);
    const msLeft = matchEnd.getTime() - now.getTime();
    const matchEnded = msLeft <= 0;
    const timerColor = matchEnded ? '#ef4444' : msLeft < 5 * 60 * 1000 ? '#ef4444' : '#00f0ff';

    // ─── Scorecard — sort by score descending ──────────────────────────────
    const players = Object.values(ttrState.players).sort((a: any, b: any) => b.score - a.score);
    const scorecardH = players.length * 52 + 8; // approx height for calc

    // ─── Navbar height = 64px, header row = 56px, scorecard depends on teams
    const mapHeight = `calc(100vh - 64px - 56px - ${scorecardH}px)`;

    return (
        <div className="flex flex-col bg-[#050505] min-h-screen w-full max-w-[1600px] mx-auto">

            {/* ╔══════════════════════════════════════════════
                    HEADER ROW — 56px
                ══════════════════════════════════════════════╗ */}
            <div
                className="flex items-center justify-between px-4 gap-3 shrink-0"
                style={{
                    height: '56px',
                    background: 'rgba(5,5,5,0.96)',
                    borderBottom: '1px solid rgba(0,240,255,0.08)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                {/* Left: Game badge */}
                <div className="flex items-center gap-2 shrink-0">
                    <TrainFront className="w-4 h-4 text-emerald-400" />
                    <span
                        className="text-xs font-bold uppercase tracking-widest font-heading"
                        style={{ color: '#10b981' }}
                    >
                        Ticket to Ride
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
                </div>

                {/* Center: Timer */}
                <div className="flex-1 flex justify-center">
                    <span
                        className="text-2xl font-mono font-bold tabular-nums tracking-widest font-mono"
                        style={{ color: timerColor, textShadow: `0 0 20px ${timerColor}60` }}
                    >
                        {matchEnded ? "ENDED" : formatTime(msLeft)}
                    </span>
                </div>

                {/* Right: Identity + sync */}
                <div className="flex items-center gap-3 shrink-0">
                    {user && (
                        <div
                            className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold font-heading"
                            style={{
                                background: `${COLOR_HEX[user.teamColor] ?? user.teamColor}18`,
                                border: `1px solid ${COLOR_HEX[user.teamColor] ?? user.teamColor}40`,
                                color: COLOR_HEX[user.teamColor] ?? user.teamColor,
                            }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: COLOR_HEX[user.teamColor] ?? user.teamColor }} />
                            {user.handle}
                            <span className="text-white/40">·</span>
                            <span className="capitalize">{user.teamColor}</span>
                        </div>
                    )}
                    {isSpectator && (
                        <div
                            className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-heading"
                            style={{ background: 'rgba(112,0,255,0.15)', border: '1px solid rgba(112,0,255,0.35)', color: '#a87fff' }}
                        >
                            Spectator
                        </div>
                    )}
                    {isSpectator && (
                        <select
                            value={currentTeam}
                            onChange={(e) => setCurrentTeam(e.target.value)}
                            className="text-xs rounded-lg px-2 py-1 cursor-pointer font-heading"
                            style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(0,240,255,0.2)', color: '#00f0ff' }}
                        >
                            {match.teams.map((t: any) => (
                                <option key={t.color} value={t.color}>{t.name}</option>
                            ))}
                        </select>
                    )}
                    <div className="hidden sm:flex flex-col items-end">
                        <p className="text-[9px] text-[#4b5563] font-mono uppercase tracking-wider font-mono">Synced</p>
                        <p className="text-[10px] font-mono text-[#00f0ff] font-mono">{lastSync.toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>

            {/* ╔══════════════════════════════════════════════
                    SCORECARD ROW — compact, one row per team
                ══════════════════════════════════════════════╗ */}
            <div
                className="shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(5,5,5,0.98)' }}
            >
                {players.map((player: any, idx: number) => {
                    const color = COLOR_HEX[player.team?.toLowerCase()] || '#6b7280';
                    const isLeader = idx === 0 && players.length > 1;
                    return (
                        <div
                            key={player.team}
                            className="flex items-center gap-3 px-4 py-2.5"
                            style={{
                                borderLeft: `3px solid ${color}`,
                                borderBottom: idx < players.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                boxShadow: isLeader ? `inset 0 0 60px ${color}06` : 'none',
                            }}
                        >
                            {/* Team dot + name */}
                            <div className="flex items-center gap-2 min-w-[100px]">
                                <div
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: color, boxShadow: isLeader ? `0 0 8px ${color}` : 'none' }}
                                />
                                <span
                                    className="text-xs font-bold uppercase tracking-wider truncate font-heading"
                                    style={{ color: isLeader ? color : '#e5e5e5' }}
                                >
                                    {player.team}
                                </span>
                                {isLeader && players.length > 1 && (
                                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded font-heading"
                                        style={{ background: `${color}20`, color }}>
                                        LEAD
                                    </span>
                                )}
                            </div>

                            {/* Points — most prominent */}
                            <div
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0"
                                style={{ background: `${color}20`, border: `1px solid ${color}50` }}
                            >
                                <span className="text-sm font-black font-mono tabular-nums font-mono" style={{ color }}>
                                    {player.score}
                                </span>
                                <span className="text-[10px] text-white/50 font-heading">pts</span>
                            </div>

                            {/* Stats chips */}
                            <div className="flex items-center gap-2 flex-1 flex-wrap">
                                <StatChip
                                    icon="🪙" value={player.coins} label="Coins"
                                    bg="rgba(250,204,21,0.08)" border="rgba(250,204,21,0.2)" textColor="#eab308"
                                />
                                <StatChip
                                    icon="🚂" value={player.trainsLeft} label="Trains Left"
                                    bg="rgba(59,130,246,0.08)" border="rgba(59,130,246,0.2)" textColor="#60a5fa"
                                />
                                <StatChip
                                    icon="🏠" value={player.stationsLeft} label="Stations"
                                    bg="rgba(239,68,68,0.08)" border="rgba(239,68,68,0.2)" textColor="#f87171"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ╔══════════════════════════════════════════════
                    MAP — fills all remaining viewport height
                ══════════════════════════════════════════════╗ */}
            <div
                className="w-full relative overflow-hidden shrink-0"
                style={{
                    height: mapHeight,
                    minHeight: '350px',
                    borderTop: '1px solid rgba(0,240,255,0.04)',
                }}
            >
                <TTRMap
                    matchId={match.id}
                    state={ttrState}
                    currentTeam={currentTeam}
                    onUpdate={handleStateUpdate}
                    readOnly={isSpectator}
                />
            </div>

            {/* ╔══════════════════════════════════════════════
                    BELOW MAP — Marketplace (3x) + Solve Log (1x)
                ══════════════════════════════════════════════╗ */}
            <div
                className="border-t border-white/5"
                style={{ display: 'grid', gridTemplateColumns: '3fr 1fr' }}
            >

                {/* LEFT: Coin Marketplace */}
                <div className="border-r border-white/5">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                        <div className="w-1 h-4 rounded-full bg-yellow-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-400 font-heading">Coin Marketplace</h3>
                    </div>
                    <CoinMarketplace state={ttrState} />
                </div>

                {/* RIGHT: Solve Log */}
                <div className="flex flex-col min-h-[200px]">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                        <div className="w-1 h-4 rounded-full bg-[#00f0ff]" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00f0ff] font-heading">Solve Log</h3>
                    </div>
                    {solveLog.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3">
                            <div className="w-px h-8 bg-white/10 rounded-full" />
                            <p className="text-xs text-[#4b5563] font-body">No solves yet</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-white/5  max-h-[320px] overflow-y-auto">
                            {solveLog.map((entry, i) => {
                                const c = COLOR_HEX[entry.team?.toLowerCase()] || '#6b7280';
                                return (
                                    <li key={i} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                                        <div className="w-0.5 shrink-0 self-stretch rounded-full opacity-80 mt-1" style={{ backgroundColor: c }} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-white font-semibold font-body truncate">{entry.problemName}</p>
                                            <p className="text-[10px] text-[#6b7280] font-body mt-0.5">
                                                <span style={{ color: c }}>{entry.team}</span>
                                                {entry.handle ? ` · ${entry.handle}` : ''}
                                                {entry.timestamp && (
                                                    <span className="ml-1 font-mono text-[9px] font-mono">{entry.timestamp}</span>
                                                )}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* ╔══════════════════════════════════════════════
                    MY DESTINATION TICKETS — full width
                ══════════════════════════════════════════════╗ */}
            {!isSpectator && (
                <div className="border-t border-white/5">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                        <div className="w-1 h-4 rounded-full bg-[#a87fff]" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#a87fff] font-heading">My Destination Tickets</h3>
                    </div>
                    <div className="p-4">
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
    );
}

// Tiny scorecard stat chip
function StatChip({ icon, value, label, bg, border, textColor }: {
    icon: string; value: number; label: string; bg: string; border: string; textColor: string;
}) {
    return (
        <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-body"
            style={{ background: bg, border: `1px solid ${border}`, color: textColor }}
        >
            <span className="text-[10px]">{icon}</span>
            <span className="font-mono font-mono tabular-nums">{value}</span>
            <span className="text-white/40">{label}</span>
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
