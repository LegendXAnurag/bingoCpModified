"use client";

import { useEffect, useState, useRef } from "react";
import { TTRState, City, Track, Ticket } from "../app/types/match";
import { CITIES, TRACKS } from "../lib/ttrData";
import { canBuildTrack, canBuildStation, getTrackCost, getCompletedRoute } from "../lib/ttrLogic";
import { X, TrainFront, MapPin, GripHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface TTRMapProps {
    matchId: string;
    state: TTRState;
    currentTeam: string;
    onUpdate?: (newState: TTRState) => void;
    readOnly?: boolean;
    focusedTicket?: Ticket | null;
    setFocusedTicket?: (t: Ticket | null) => void;
}

export default function TTRMap({ matchId, state, currentTeam, onUpdate, readOnly, focusedTicket, setFocusedTicket }: TTRMapProps) {
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
            setConfirmTrack(track);
        } else {
            // Claimed. Check if we can build station.
            // If we already have a station, ignore
            if (trackState.stationedBy?.includes(currentTeam)) {
                return;
            }

            // If we own it, ignore
            if (trackState.claimedBy === currentTeam) {
                return;
            }

            setConfirmStationTrack(track);
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
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    alert(data.message || "Failed to build track");
                } catch (e) {
                    console.error("Non-JSON error:", text);
                    alert("Server error: " + (res.statusText || "Unknown error"));
                }
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
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    alert(data.message || "Failed to build station");
                } catch (e) {
                    console.error("Non-JSON error:", text);
                    alert("Server error: " + (res.statusText || "Unknown error"));
                }
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
    const player = state.players[currentTeam];
    const trackCheck = confirmTrack && player ? canBuildTrack(state, player, confirmTrack.id) : { possible: true, reason: "" };
    const stationCheck = confirmStationTrack && player ? canBuildStation(state, player, confirmStationTrack.id) : { possible: true, reason: "" };

    const completedRoute = focusedTicket ? getCompletedRoute(state, currentTeam, focusedTicket.city1, focusedTicket.city2) : null;
    const completedTrackIds = new Set(completedRoute?.map(t => t.id) || []);

    return (
        <div className="relative w-full h-full overflow-hidden bg-transparent flex justify-center items-center">
            <div
                ref={containerRef}
                className="relative bg-black/20 shadow-xl origin-center transition-transform duration-200"
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
                                                stroke={completedTrackIds.has(track.id) ? "white" : confirmTrack?.id === track.id || confirmStationTrack?.id === track.id ? "yellow" : "black"}
                                                strokeWidth={completedTrackIds.has(track.id) ? "3" : confirmTrack?.id === track.id || confirmStationTrack?.id === track.id ? "3" : "1"}
                                                transform={`rotate(${unit.rotation}, ${unit.x}, ${unit.y})`}
                                                className={`transition-all ${!isClaimed ? 'hover:fill-yellow-500 hover:opacity-80' : ''} ${completedTrackIds.has(track.id) || confirmTrack?.id === track.id || confirmStationTrack?.id === track.id ? "animate-pulse" : ""}`}
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
                                    strokeWidth="24"
                                />
                                {/* Glowing claimed route */}
                                {isClaimed && (
                                    <line
                                        x1={x1 + offsetX}
                                        y1={y1 + offsetY}
                                        x2={x2 + offsetX}
                                        y2={y2 + offsetY}
                                        stroke={ownerColor}
                                        strokeWidth="16"
                                        strokeOpacity="0.4"
                                        style={{ filter: "blur(4px)" }}
                                    />
                                )}
                                <line
                                    x1={x1 + offsetX}
                                    y1={y1 + offsetY}
                                    x2={x2 + offsetX}
                                    y2={y2 + offsetY}
                                    stroke={completedTrackIds.has(track.id) ? "white" : confirmTrack?.id === track.id || confirmStationTrack?.id === track.id ? "yellow" : isClaimed ? ownerColor : 'rgba(0,0,0,0.5)'}
                                    strokeWidth={completedTrackIds.has(track.id) ? "10" : "8"}
                                    strokeDasharray={isClaimed ? "none" : "12, 6"}
                                    className={`transition-all duration-300 group-hover:stroke-[12px] ${!isClaimed ? 'group-hover:stroke-white group-hover:opacity-80' : ''} ${completedTrackIds.has(track.id) || confirmTrack?.id === track.id || confirmStationTrack?.id === track.id ? "animate-pulse" : ""}`}
                                />
                                {trackState && trackState.stationedBy && trackState.stationedBy.length > 0 && (
                                    trackState.stationedBy.map((stationTeam, idx) => {
                                        const midX = (x1 + x2) / 2 + offsetX;
                                        const midY = (y1 + y2) / 2 + offsetY;

                                        return (
                                            <g key={idx} transform={`translate(${midX},${midY})`}>
                                                <circle r="14" fill={stationTeam} opacity="0.4" style={{ filter: "blur(4px)" }} />
                                                <circle r="10" fill="#222" stroke="white" strokeWidth="2" />
                                                <circle r="6" fill={stationTeam} />
                                                <path d="M-4,1 L0,-3 L4,1 L4,4 L-4,4 Z" fill="white" />
                                            </g>
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

                        const isFocusedCity = focusedTicket && (focusedTicket.city1 === city.id || focusedTicket.city2 === city.id);

                        return (
                            <g
                                key={city.id}
                                transform={`translate(${cx}, ${cy})`}
                                className={`pointer-events-auto group cursor-pointer`}
                            >
                                {/* Active focused ring */}
                                {isFocusedCity && (
                                    <circle r="20" fill="none" stroke="#00f0ff" strokeWidth="2" strokeOpacity="0.8" className="animate-ping" />
                                )}

                                <circle r="12" fill={state.mapData ? "red" : "#111"} opacity="0.4" style={{ filter: "blur(3px)" }} />
                                {/* City Marker */}
                                <circle
                                    r={isFocusedCity ? 12 : 7}
                                    fill={state.mapData ? "red" : "#222"}
                                    stroke={isFocusedCity ? "#00f0ff" : "white"}
                                    strokeWidth={isFocusedCity ? "3" : "2"}
                                    className={`transition-all duration-300 ${isFocusedCity ? "animate-pulse" : "group-hover:stroke-[#00f0ff] group-hover:r-8"}`}
                                />
                                <circle r="3" fill="red" opacity={state.mapData ? 0 : 0.8} />

                                {/* City Name */}
                                <text
                                    y={-16}
                                    textAnchor="middle"
                                    className="text-[13px] font-extrabold focus:outline-none select-none transition-all group-hover:fill-white"
                                    style={{
                                        fill: "#000",
                                        textShadow: "1.5px 1.5px 0 #fff, -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 0px 3px 6px rgba(0,0,0,0.6)",
                                        fontFamily: "'Courier New', Courier, monospace"
                                    }}
                                >
                                    {city.name}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Clear Focus Button */}
                {focusedTicket && setFocusedTicket && (
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={() => setFocusedTicket(null)}
                            className="bg-black/80 backdrop-blur border border-[#00f0ff]/50 text-[#00f0ff] px-4 py-2 rounded-full font-bold text-xs font-heading tracking-widest uppercase hover:bg-[#00f0ff]/20 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Clear Focus
                        </button>
                    </div>
                )}

                {/* Draggable Action Panel */}
                {(confirmTrack || confirmStationTrack) && (
                    <motion.div
                        drag
                        dragConstraints={containerRef}
                        dragMomentum={false}
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className="absolute bottom-8 left-1/2 w-full max-w-sm bg-black/90 border border-white/20 shadow-2xl rounded-2xl p-4 backdrop-blur-xl z-50 flex flex-col gap-4 cursor-grab active:cursor-grabbing"
                    >
                        {/* Drag Handle & Close */}
                        <div className="flex items-center justify-between w-full border-b border-white/10 pb-2 mb-1">
                            <div className="flex items-center gap-2 text-white/50">
                                <GripHorizontal className="w-4 h-4" />
                                <span className="text-[10px] uppercase font-bold tracking-widest font-heading">Drag to move</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setConfirmTrack(null); setConfirmStationTrack(null); }}
                                className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 min-w-0 pointer-events-none">
                            {confirmTrack ? (
                                <>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#00f0ff] mb-2 font-heading flex items-center gap-1.5">
                                        <TrainFront className="w-3.5 h-3.5" />
                                        Claim Route
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm font-bold text-white mb-2 truncate">
                                        <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> <span className="truncate max-w-[120px]">{(state.mapData?.cities || CITIES).find(c => c.id === confirmTrack.city1)?.name}</span></div>
                                        <span className="text-white/40 font-light">&rarr;</span>
                                        <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> <span className="truncate max-w-[120px]">{(state.mapData?.cities || CITIES).find(c => c.id === confirmTrack.city2)?.name}</span></div>
                                    </div>
                                    <div className="text-xs text-[#a3a3a3] font-body bg-white/5 p-2 rounded-lg border border-white/5">
                                        <p className="flex justify-between items-center mb-1">
                                            <span>Route Cost:</span> <strong className="text-yellow-400">{getTrackCost(confirmTrack)} coins</strong>
                                        </p>
                                        <p className="flex justify-between items-center">
                                            <span>Your Coins:</span> <strong className="text-white">{state.players[currentTeam]?.coins || 0} coins</strong>
                                        </p>
                                        {!trackCheck.possible && (
                                            <p className="mt-2 text-red-400 font-bold border-t border-red-500/20 pt-2">{trackCheck.reason}</p>
                                        )}
                                    </div>
                                </>
                            ) : confirmStationTrack ? (
                                <>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2 font-heading flex items-center gap-1.5">
                                        <TrainFront className="w-3.5 h-3.5" />
                                        Build Station
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm font-bold text-white mb-2 truncate">
                                        <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-purple-400" /> <span className="truncate max-w-[120px]">{(state.mapData?.cities || CITIES).find(c => c.id === confirmStationTrack.city1)?.name}</span></div>
                                        <span className="text-white/40 font-light">&rarr;</span>
                                        <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-purple-400" /> <span className="truncate max-w-[120px]">{(state.mapData?.cities || CITIES).find(c => c.id === confirmStationTrack.city2)?.name}</span></div>
                                    </div>
                                    <div className="text-xs text-[#a3a3a3] font-body bg-white/5 p-2 rounded-lg border border-white/5">
                                        <p className="mb-1 text-[10px] leading-tight flex flex-col">
                                            <span>Owned by <strong className="text-white capitalize">{state.tracks[confirmStationTrack.id]?.claimedBy}</strong>.</span>
                                            <span className="text-white/50">Stations let you bypass their track.</span>
                                        </p>
                                        <p className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                                            <span>Station Cost:</span> <strong className="text-yellow-400">{4 - (state.players[currentTeam]?.stationsLeft || 0)} coins</strong>
                                        </p>
                                        {!stationCheck.possible && (
                                            <p className="mt-2 text-red-400 font-bold border-t border-red-500/20 pt-2">{stationCheck.reason}</p>
                                        )}
                                    </div>
                                </>
                            ) : null}
                        </div>

                        <div className="shrink-0 flex items-center gap-2 w-full mt-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); setConfirmTrack(null); setConfirmStationTrack(null); }}
                                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border border-white/20 hover:bg-white/5 transition-colors font-body text-white"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={confirmTrack ? !trackCheck.possible : !stationCheck.possible}
                                onClick={(e) => { e.stopPropagation(); confirmTrack ? confirmBuildTrack() : confirmBuildStation(); }}
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all font-heading ${(confirmTrack ? !trackCheck.possible : !stationCheck.possible) ? "bg-white/10 text-white/40 cursor-not-allowed border border-white/5" : "bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"}`}
                            >
                                {confirmTrack ? "Claim" : "Build"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
