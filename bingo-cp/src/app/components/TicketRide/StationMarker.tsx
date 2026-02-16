// Station marker component
'use client';

import React from 'react';
import { TEAM_COLORS } from '../../types/ticketRide';

interface StationMarkerProps {
    teamColor: string;
    offset: number; // 0, 1, or 2 for positioning
}

export default function StationMarker({ teamColor, offset }: StationMarkerProps) {
    const angle = offset * 120; // 120° apart for up to 3 stations
    const distance = 20;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;

    // Get team color from TEAM_COLORS or use the provided color directly
    const fillColor = TEAM_COLORS[teamColor as keyof typeof TEAM_COLORS] || teamColor;

    return (
        <g transform={`translate(${x}, ${y})`}>
            {/* Station icon (simplified house shape) */}
            <rect
                x={-4}
                y={-6}
                width={8}
                height={8}
                fill={fillColor}
                stroke="white"
                strokeWidth={1}
                rx={1}
            />
            <path d="M -5,-6 L 0,-10 L 5,-6" fill={fillColor} stroke="white" strokeWidth={1} />
        </g>
    );
}
