"use client";

import { useState } from "react";
import { TTRState, Ticket } from "../app/types/match";
import { TICKETS, CITIES } from "../lib/ttrData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket as TicketIcon } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MyTicketsProps {
    matchId: string;
    state: TTRState;
    currentTeam: string;
    onUpdate?: (newState: TTRState) => void;
}

export default function MyTickets({ matchId, state, currentTeam, onUpdate }: MyTicketsProps) {
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

    // TODO: Calculate if ticket is completed (requires graph logic)
    // For now just list them

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                    <TicketIcon className="w-5 h-5" />
                    My Tickets
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                {myTickets.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No tickets yet. Draw one!</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {myTickets.map(ticket => (
                            <div key={ticket.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-all flex flex-col justify-between h-full">
                                <div className="font-bold text-center mb-2">{getCityName(ticket.city1)} <br />↓<br /> {getCityName(ticket.city2)}</div>
                                <div className="text-center">
                                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-sm font-bold inline-block">{ticket.points} pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
