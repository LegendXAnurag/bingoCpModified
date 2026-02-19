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
    readOnly?: boolean;
}

export default function TTRMap({ matchId, state, currentTeam, onUpdate, readOnly }: TTRMapProps) {
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [confirmTrack, setConfirmTrack] = useState<Track | null>(null);
    const [confirmStationTrack, setConfirmStationTrack] = useState<Track | null>(null);

    const handleTrackClick = (track: Track) => {
        if (readOnly) return;
        const player = state.players[currentTeam];
        if (!player) return;

        // check if track is claimed
        const trackState = state.tracks[track.id];

        // If claimed by someone else, or by us but we want to put a station (wait, logic says we can't put station if we own it)
        // Logic: 
        // 1. If unclaimed -> Build Track dialog
        // 2. If claimed by OTHER -> Build Station dialog
        // 3. If claimed by US -> Do nothing (or show info)

        if (!trackState || !trackState.claimedBy) {
            const check = canBuildTrack(state, player, track.id);
            if (!check.possible) {
                alert(check.reason);
                return;
            }
            setConfirmTrack(track);
        } else {
            // Claimed. Check if we can build station.
            const check = canBuildStation(state, player, track.id);
            if (check.possible) {
                setConfirmStationTrack(track);
            } else {
                // If it's owned by opponent and we can't build station, maybe show why?
                // But if it's owned by us, canBuildStation returns "You already own this track" which is fine to alert or ignore.

                // If we already have a station, ignore
                if (trackState.stationedBy?.includes(currentTeam)) {
                    return;
                }

                // If we own it, ignore
                if (trackState.claimedBy === currentTeam) {
                    return;
                }

                alert(check.reason);
            }
        }
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

    const confirmBuildStation = async () => {
        if (!confirmStationTrack) return;

        const trackId = confirmStationTrack.id;
        setConfirmStationTrack(null);

        try {
            const res = await fetch('/api/ttr/buildStation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId, team: currentTeam, trackId })
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
                    const mapW = state.mapData ? state.mapData.width : 1200;
                    const mapH = state.mapData ? state.mapData.height : 800;

                    const scaleW = availableWidth / mapW;
                    const scaleH = availableHeight / mapH;

                    // Fit 'contain'
                    const newScale = Math.min(scaleW, scaleH, 1);
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
                    width: state.mapData ? `${state.mapData.width}px` : '1200px',
                    height: state.mapData ? `${state.mapData.height}px` : '800px',
                    transform: `scale(${scale})`
                }}
            >
                <img
                    src={state.mapData?.imageUrl || "/europe.jpeg"}
                    alt="Map Background"
                    className="absolute inset-0 w-full h-full object-fill opacity-80"
                    style={{ pointerEvents: 'none' }}
                />

                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {(state.mapData ? state.mapData.tracks : TRACKS).map(track => {
                        const cities = state.mapData ? state.mapData.cities : CITIES;
                        const c1 = cities.find(c => c.id === (state.mapData ? track.city1 : track.city1));
                        const c2 = cities.find(c => c.id === (state.mapData ? track.city2 : track.city2));

                        // For custom maps, track might use cityA/cityB if we didn't normalize it, 
                        // but logic expects city1/city2. We should ensure normalization in backend.
                        // Assuming track has city1/city2.

                        if (!c1 || !c2) return null;

                        const trackState = state.tracks[track.id];
                        const isClaimed = !!trackState?.claimedBy;
                        const ownerColor = trackState?.claimedBy || 'gray';

                        // Custom Map Rendering with Units
                        if (track.units && track.units.length > 0) {
                            return (
                                <g key={track.id} onClick={() => handleTrackClick(track)} className={`pointer-events-auto ${readOnly ? '' : 'cursor-pointer'} group`}>
                                    {track.units.map((unit: any, idx: number) => (
                                        <g key={idx}>
                                            <rect
                                                x={unit.x - (unit.width || 20) / 2}
                                                y={unit.y - (unit.height || 8) / 2}
                                                width={unit.width || 20}
                                                height={unit.height || 8}
                                                fill={isClaimed ? ownerColor : (track.color || 'gray')}
                                                stroke="black"
                                                strokeWidth="1"
                                                transform={`rotate(${unit.rotation}, ${unit.x}, ${unit.y})`}
                                                className={`transition-all ${!isClaimed ? 'hover:fill-yellow-500 hover:opacity-80' : ''}`}
                                            />
                                            {/* Station Indicators: Perpendicular Rectangles */}
                                            {trackState && trackState.stationedBy && trackState.stationedBy.length > 0 && (
                                                trackState.stationedBy.map((stationTeam, sIdx) => (
                                                    <rect
                                                        key={`station-${sIdx}`}
                                                        x={unit.x - 4} // Width 8 centered
                                                        y={unit.y - 12} // Length 24 centered (slightly longer than track width 20)
                                                        width={8}
                                                        height={24}
                                                        fill={stationTeam}
                                                        stroke="white"
                                                        strokeWidth="1"
                                                        // Rotate perpendicular to unit (unit.rotation + 90)
                                                        transform={`rotate(${unit.rotation + 90}, ${unit.x}, ${unit.y})`}
                                                        className="pointer-events-none"
                                                    />
                                                ))
                                            )}
                                        </g>
                                    ))}
                                    {/* Helper click area for units? simplified to just clicking units for now */}
                                </g>
                            );
                        }

                        // Legacy Rendering (Straight Lines)
                        const mapW = 1200; // Legacy width
                        const mapH = 800;  // Legacy height
                        const x1 = (c1.x / 100) * mapW;
                        const y1 = (c1.y / 100) * mapH;
                        const x2 = (c2.x / 100) * mapW;
                        const y2 = (c2.y / 100) * mapH;

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
                            <g key={track.id} onClick={() => handleTrackClick(track)} className={`pointer-events-auto ${readOnly ? '' : 'cursor-pointer'} group`}>
                                <line
                                    x1={x1 + offsetX}
                                    y1={y1 + offsetY}
                                    x2={x2 + offsetX}
                                    y2={y2 + offsetY}
                                    stroke="transparent"
                                    strokeWidth="20"
                                />
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
                                {trackState && trackState.stationedBy && trackState.stationedBy.length > 0 && (
                                    trackState.stationedBy.map((stationTeam, idx) => {
                                        const midX = (x1 + x2) / 2 + offsetX;
                                        const midY = (y1 + y2) / 2 + offsetY;
                                        const dx = x2 - x1;
                                        const dy = y2 - y1;
                                        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

                                        // Perpendicular rect
                                        return (
                                            <rect
                                                key={idx}
                                                x={midX - 4}
                                                y={midY - 12}
                                                width={8}
                                                height={24}
                                                fill={stationTeam}
                                                stroke="white"
                                                strokeWidth="1"
                                                transform={`rotate(${angle + 90}, ${midX}, ${midY})`}
                                            />
                                        );
                                    })
                                )}
                            </g>
                        );
                    })}
                    {(state.mapData ? state.mapData.cities : CITIES).map(city => {
                        // Removed stationOwner logic from here

                        let cx = city.x;
                        let cy = city.y;

                        if (!state.mapData) {
                            // Legacy conversion
                            cx = (city.x / 100) * 1200;
                            cy = (city.y / 100) * 800;
                        }

                        return (
                            <g
                                key={city.id}
                                transform={`translate(${cx}, ${cy})`}
                                className={`pointer-events-auto group`}
                            >
                                {/* City Marker */}
                                <circle
                                    r={6}
                                    fill={(state.mapData ? "red" : "#333")}
                                    stroke="white"
                                    strokeWidth="2"
                                />

                                {/* City Name */}
                                <text
                                    y={-15}
                                    textAnchor="middle"
                                    className="text-xs font-bold pointer-events-none select-none fill-black transition-all group-hover:font-extrabold"
                                    style={{ textShadow: "0px 0px 2px white" }} // Outline for readability
                                >
                                    {city.name}
                                </text>
                            </g>
                        );
                    })}
                </svg>

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

                <AlertDialog open={!!confirmStationTrack} onOpenChange={(o) => !o && setConfirmStationTrack(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Build Station on Track?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Build a station on the track from {confirmStationTrack && CITIES.find(c => c.id === confirmStationTrack.city1)?.name} to {confirmStationTrack && CITIES.find(c => c.id === confirmStationTrack.city2)?.name}?
                                <br />
                                This allows you to use this track for one of your routes.
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
        </div>
    );
}
