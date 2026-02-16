// Main SVG map container for Ticket to Ride
'use client';

import React from 'react';
import { MapData, Track as TrackType, Station } from '../../types/ticketRide';
import City from './City';
import Track from './Track';

interface TicketRideMapProps {
    mapData: MapData;
    tracks: TrackType[];
    stations: Station[];
    onTrackClick?: (trackId: string) => void;
}

export default function TicketRideMap({
    mapData,
    tracks,
    stations,
    onTrackClick,
}: TicketRideMapProps) {
    const handleTrackClaim = (trackId: string) => {
        if (onClaim) {
            onTrackClick(trackId);
        }
    };

    // Group stations by city
    const stationsByCity = stations.reduce((acc, station) => {
        if (!acc[station.cityId]) {
            acc[station.cityId] = [];
        }
        acc[station.cityId].push(station);
        return acc;
    }, {} as Record<string, Station[]>);

    return (
        <div className="w-full h-full bg-gradient-to-br from-[#F3E5D8] via-[#E8D5C4] to-[#F3E5D8] rounded-xl shadow-2xl p-4">
            <svg
                viewBox={mapData.viewBox}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-auto"
                style={{ maxHeight: '80vh' }}
            >
                {/* Background (optional decorative elements) */}
                <rect
                    x="0"
                    y="0"
                    width="1000"
                    height="600"
                    fill="url(#mapGradient)"
                    opacity="0.3"
                />
                <defs>
                    <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F3E5D8" />
                        <stop offset="50%" stopColor="#E8D5C4" />
                        <stop offset="100%" stopColor="#F3E5D8" />
                    </linearGradient>
                </defs>

                {/* Track layer (below cities) */}
                <g className="tracks-layer">
                    {tracks.map((track) => (
                        <Track
                            key={track.id}
                            track={track}
                            cities={mapData.cities}
                            onClaim={() => handleTrackClaim(track.id)}
                        />
                    ))}
                </g>

                {/* City layer (above tracks) */}
                <g className="cities-layer">
                    {mapData.cities.map((city) => (
                        <City
                            key={city.id}
                            city={city}
                            stations={stationsByCity[city.id] || []}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
}
