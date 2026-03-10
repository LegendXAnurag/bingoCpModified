"use client";

import { useState } from "react";
import { TTRState, Ticket } from "../app/types/match";
import { TICKETS, CITIES } from "../lib/ttrData";
import { getCompletedRoute } from "../lib/ttrLogic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket as TicketIcon, MapPin, CheckCircle2 } from "lucide-react";

interface MyTicketsProps {
    matchId: string;
    state: TTRState;
    currentTeam: string;
    onUpdate?: (newState: TTRState) => void;
    focusedTicket: Ticket | null;
    setFocusedTicket: (t: Ticket | null) => void;
}

export default function MyTickets({ matchId, state, currentTeam, onUpdate, focusedTicket, setFocusedTicket }: MyTicketsProps) {
    const player = state.players[currentTeam];
    if (!player) return null;

    const myTickets = player.destinations.map(id => {
        // Check custom tickets first
        if (state.mapData?.tickets) {
            return state.mapData.tickets.find(t => t.id === id);
        }
        return TICKETS.find(t => t.id === id);
    }).filter(Boolean) as Ticket[];

    const getCityName = (id: string) => {
        if (id === 'optimistic_draw') return '...';

        if (state.mapData) {
            return state.mapData.cities.find(c => c.id === id)?.name || id;
        }
        return CITIES.find(c => c.id === id)?.name || id;
    }

    return (
        <Card className="h-full flex flex-col bg-transparent border-0 shadow-none">
            <CardHeader className="py-3 px-4 border-b border-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <TicketIcon className="w-5 h-5" />
                    My Tickets
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                {myTickets.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 font-body">No tickets yet. Draw one!</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                        {myTickets.map(ticket => {
                            const isCompleted = getCompletedRoute(state, currentTeam, ticket.city1, ticket.city2) !== null;
                            const isFocused = focusedTicket?.id === ticket.id;

                            return (
                                <div
                                    key={ticket.id}
                                    className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-full bg-[#0a0a0a] group hover:border-[#00f0ff]/50 ${isFocused ? 'border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.15)] ring-1 ring-[#00f0ff]' : 'border-white/10'}`}
                                >
                                    {/* Ticket Perforated Edge Effect */}
                                    <div className="absolute top-0 right-4 w-12 h-4 -mt-2 bg-[#050505] rounded-full border border-white/10" />
                                    <div className="absolute bottom-0 left-4 w-12 h-4 -mb-2 bg-[#050505] rounded-full border border-white/10" />

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col justify-center relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-[10px] uppercase font-bold tracking-widest font-heading text-white/50">Destination Route</div>
                                            {isCompleted && (
                                                <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-400/20">
                                                    <CheckCircle2 className="w-3 h-3" /> Done
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 mb-6">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-[#00f0ff]" />
                                                <span className="font-bold text-white text-sm truncate" title={getCityName(ticket.city1)}>{getCityName(ticket.city1)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-1.5 border-l-2 border-white/10 pl-3 py-1">
                                                <div className="h-px w-2 bg-white/20" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-[#a87fff]" />
                                                <span className="font-bold text-white text-sm truncate" title={getCityName(ticket.city2)}>{getCityName(ticket.city2)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white/40 uppercase tracking-widest font-heading">Reward</span>
                                                <span className="text-yellow-400 font-mono font-bold align-bottom leading-none">{ticket.points} pts</span>
                                            </div>

                                            <button
                                                onClick={() => setFocusedTicket(isFocused ? null : ticket)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest font-heading transition-colors ${isFocused
                                                        ? 'bg-[#00f0ff] text-black hover:bg-[#00f0ff]/80'
                                                        : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/10'
                                                    }`}
                                            >
                                                {isFocused ? 'Unfocus' : 'Show Map'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Decorative subtle completion glow */}
                                    {isCompleted && (
                                        <div className="absolute inset-0 bg-emerald-500/[0.03] pointer-events-none rounded-xl" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
