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
    const [isDrawing, setIsDrawing] = useState(false);

    if (!player) return null;

    const myTickets = player.destinations.map(id => {
        if (id === 'optimistic_draw') return { id: 'optimistic_draw', city1: '...', city2: '...', points: 0 };
        return TICKETS.find(t => t.id === id);
    }).filter(Boolean) as Ticket[];

    const handleDrawTicket = async () => {
        setIsDrawing(true);

        // Optimistic Update
        if (onUpdate && state.ticketDeck.length > 0) {
            const newState: TTRState = JSON.parse(JSON.stringify(state));
            if (newState.players[currentTeam]) {
                newState.players[currentTeam].destinations.unshift('optimistic_draw'); // Add placeholder
                newState.ticketDeck.pop(); // Remove one from deck visually
            }
            onUpdate(newState);
        }

        try {
            const res = await fetch('/api/ttr/drawTicket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId, team: currentTeam })
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.message || "Failed to draw ticket");
            } else {
                const data = await res.json();
                if (data.newState && onUpdate) {
                    onUpdate(data.newState);
                }
            }
        } catch (e) {
            console.error(e);
            alert("Failed to draw ticket");
        }
        setIsDrawing(false);
    };

    const getCityName = (id: string) => {
        if (id === 'optimistic_draw') return '...';
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
                <Button size="sm" onClick={handleDrawTicket} disabled={isDrawing || state.ticketDeck.length === 0}>
                    {isDrawing ? "Drawing..." : (state.ticketDeck.length > 0 ? "Draw Ticket" : "Deck Empty")}
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                {myTickets.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No tickets yet. Draw one!</div>
                ) : (
                    <div className="divide-y">
                        {myTickets.map(ticket => (
                            <div key={ticket.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div className="flex justify-between font-medium">
                                    <span>{getCityName(ticket.city1)} ↔ {getCityName(ticket.city2)}</span>
                                    <span className="text-green-600 bg-green-100 px-2 rounded text-sm flex items-center">{ticket.points} pts</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Not Completed</div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
