"use client";

import { useState } from "react";
import { TTRState, Ticket } from "../app/types/match";
import { TICKETS, CITIES } from "../lib/ttrData";
import { getCompletedRoute } from "../lib/ttrLogic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                {myTickets.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 font-body">No tickets yet. Draw one!</div>
                ) : (
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col gap-3 py-2 px-3 pr-4">
                            {myTickets.map(ticket => {
                                const isCompleted = getCompletedRoute(state, currentTeam, ticket.city1, ticket.city2) !== null;
                                const isFocused = focusedTicket?.id === ticket.id;

                                return (
                                    <div
                                        key={ticket.id}
                                        className={`relative overflow-hidden p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between bg-[#0a0a0a] group hover:border-[#00f0ff]/50 cursor-pointer ${isFocused ? 'border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.15)] ring-1 ring-[#00f0ff]' : 'border-white/10'}`}
                                        onClick={() => setFocusedTicket && setFocusedTicket(isFocused ? null : ticket)}
                                    >
                                        {/* Ticket Perforated Edge Effect */}
                                        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-3 h-8 -mr-1.5 bg-[#050505] rounded-full border border-white/10" />
                                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-3 h-8 -ml-1.5 bg-[#050505] rounded-full border border-white/10" />

                                        {/* Content */}
                                        <div className="flex-1 flex flex-col justify-center relative z-10 pl-2 pr-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-[9px] uppercase font-bold tracking-widest font-heading text-white/50">Route</div>
                                                {isCompleted && (
                                                    <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-emerald-400/20">
                                                        <CheckCircle2 className="w-2.5 h-2.5" /> Done
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1.5 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-[#00f0ff] shrink-0" />
                                                    <span className="font-bold text-white text-xs truncate" title={getCityName(ticket.city1)}>{getCityName(ticket.city1)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 ml-1.5 border-l-2 border-white/10 pl-2.5 py-0.5" />
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-[#a87fff] shrink-0" />
                                                    <span className="font-bold text-white text-xs truncate" title={getCityName(ticket.city2)}>{getCityName(ticket.city2)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-[#888] font-bold tracking-widest uppercase font-heading">Reward</span>
                                                    <span className="text-yellow-400 font-bold font-mono text-sm">{ticket.points} <span className="text-[10px] text-white/40">pts</span></span>
                                                </div>
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
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
