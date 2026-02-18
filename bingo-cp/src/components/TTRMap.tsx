"use client";

import { useEffect, useState, useRef } from "react";
import { TTRState, City, Track } from "../app/types/match";
import { CITIES, TRACKS } from "../lib/ttrData";
import { canBuildTrack, canBuildStation, getTrackCost } from "../lib/ttrLogic";
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

interface TTRMapProps {
    matchId: string;
    state: TTRState;
    currentTeam: string;
    onUpdate?: (newState: TTRState) => void;
}

export default function TTRMap({ matchId, state, currentTeam, onUpdate }: TTRMapProps) {
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [confirmTrack, setConfirmTrack] = useState<Track | null>(null);
    const [confirmCity, setConfirmCity] = useState<City | null>(null);

    const handleTrackClick = (track: Track) => {
        const player = state.players[currentTeam];
        if (!player) return;

        const check = canBuildTrack(state, player, track.id, track);
        if (!check.possible) {
            alert(check.reason); // Could ideally replace this with toast
            return;
        }

        setConfirmTrack(track);
    };

    const confirmBuildTrack = async () => {
        if (!confirmTrack) return;

        const originalTrack = confirmTrack;
        setConfirmTrack(null); // Close dialog immediately

        try {
            const res = await fetch('/api/ttr/buildTrack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId, team: currentTeam, trackId: originalTrack.id })
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.message || "Failed to build track");
            } else {
                const data = await res.json();
                if (data.newState && onUpdate) {
                    onUpdate(data.newState);
                }
            }
        } catch (e) {
            console.error(e);
            alert("Failed to build track");
        }
    };

    const handleCityClick = (city: City) => {
        const player = state.players[currentTeam];
        const check = canBuildStation(state, player, city.id);
        if (!check.possible) {
            alert(check.reason);
            return;
        }
        setConfirmCity(city);
    };

    const confirmBuildStation = async () => {
        if (!confirmCity) return;

        const cityId = confirmCity.id;
        setConfirmCity(null);

        try {
            const res = await fetch('/api/ttr/buildStation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId, team: currentTeam, cityId })
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.message || "Failed to build station");
            } else {
                const data = await res.json();
                if (data.newState && onUpdate) {
                    onUpdate(data.newState);
                }
            }
        } catch (e) {
            console.error(e);
            alert("Failed to build station");
        }
    };

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const parent = containerRef.current.parentElement;
                if (parent) {
                    const availableWidth = parent.clientWidth;
                    const availableHeight = parent.clientHeight;

                    // Map generic size
                    const mapW = 1200;
                    const mapH = 800;

                    const scaleW = availableWidth / mapW;
                    const scaleH = availableHeight / mapH;

                    // Fit 'contain'
                    const newScale = Math.min(scaleW, scaleH, 1); // limiting max scale to 1 for crispness? or allow zoom? let's limit to 1.5 maybe
                    setScale(Math.min(scaleW, scaleH) * 0.95); // 95% to leave some margin
                }
            }
        };

        window.addEventListener('resize', updateScale);
        updateScale(); // initial

        // Also observe parent resize if possible, but window resize is usually enough for global layout changes
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    // ... (handlers)

    return (
        <div className="relative w-full h-full overflow-hidden bg-blue-100 flex justify-center items-center">
            <div
                ref={containerRef}
                className="relative bg-white shadow-xl origin-center transition-transform duration-200"
                style={{
                    width: '1200px',
                    height: '800px',
                    minWidth: '1200px',
                    minHeight: '800px',
                    transform: `scale(${scale})`
                }}
            >
                <img
                    src="/europe.jpeg"
                    alt="Europe Map"
                    className="absolute inset-0 w-full h-full object-fill opacity-80"
                    style={{ pointerEvents: 'none' }}
                />

                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {TRACKS.map(track => {
                        const c1 = CITIES.find(c => c.id === track.city1);
                        const c2 = CITIES.find(c => c.id === track.city2);
                        if (!c1 || !c2) return null;

                        const trackState = state.tracks[track.id];
                        const isClaimed = !!trackState?.claimedBy;
                        const ownerColor = trackState?.claimedBy || 'gray';

                        const x1 = (c1.x / 100) * 1200;
                        const y1 = (c1.y / 100) * 800;
                        const x2 = (c2.x / 100) * 1200;
                        const y2 = (c2.y / 100) * 800;

                        let offsetX = 0;
                        let offsetY = 0;
                        if (track.double) {
                            const dx = x2 - x1;
                            const dy = y2 - y1;
                            const len = Math.sqrt(dx * dx + dy * dy);
                            const perpX = -dy / len;
                            const perpY = dx / len;

                            if (track.id.endsWith('2')) {
                                offsetX = perpX * 6;
                                offsetY = perpY * 6;
                            } else {
                                offsetX = -perpX * 6;
                                offsetY = -perpY * 6;
                            }
                        }

                        return (
                            <g key={track.id} onClick={() => handleTrackClick(track)} className={`pointer-events-auto cursor-pointer group`}>
                                {/* Invisible wide stroke for easier clicking */}
                                <line
                                    x1={x1 + offsetX}
                                    y1={y1 + offsetY}
                                    x2={x2 + offsetX}
                                    y2={y2 + offsetY}
                                    stroke="transparent"
                                    strokeWidth="20"
                                />
                                {/* Visible track line */}
                                <line
                                    x1={x1 + offsetX}
                                    y1={y1 + offsetY}
                                    x2={x2 + offsetX}
                                    y2={y2 + offsetY}
                                    stroke={isClaimed ? ownerColor : 'rgba(0,0,0,0.5)'}
                                    strokeWidth="8"
                                    strokeDasharray={isClaimed ? "none" : "12, 4"}
                                    className={`transition-all group-hover:stroke-[10px] ${!isClaimed ? 'group-hover:stroke-white group-hover:opacity-80' : ''}`}
                                />
                            </g>
                        );
                    })}
                </svg>

                {CITIES.map(city => {
                    const stationOwner = state.stations[city.id];

                    return (
                        <div
                            key={city.id}
                            className={`absolute w-6 h-6 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform`}
                            style={{
                                left: `${city.x}%`,
                                top: `${city.y}%`,
                                backgroundColor: stationOwner ? stationOwner : '#333'
                            }}
                            title={city.name}
                            onClick={() => handleCityClick(city)}
                        >
                            {stationOwner && (
                                <div className="w-3 h-3 rounded-full bg-white border border-gray-500" />
                            )}
                        </div>
                    );
                })}
            </div>

            <AlertDialog open={!!confirmTrack} onOpenChange={(o) => !o && setConfirmTrack(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Claim Track?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to claim the track from {confirmTrack && CITIES.find(c => c.id === confirmTrack.city1)?.name} to {confirmTrack && CITIES.find(c => c.id === confirmTrack.city2)?.name}?
                            <br />
                            Cost: <strong>{confirmTrack ? getTrackCost(confirmTrack) : 0} coins</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmBuildTrack}>Build Track</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!confirmCity} onOpenChange={(o) => !o && setConfirmCity(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Build Station?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Build a station in {confirmCity?.name}?
                            <br />
                            Cost: <strong>{state.players[currentTeam] ? 4 - state.players[currentTeam].stationsLeft : 0} coins</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmBuildStation}>Build Station</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
