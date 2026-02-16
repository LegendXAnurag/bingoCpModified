// Track component for Ticket to Ride map
'use client';

import React, { useState } from 'react';
import { Track as TrackType, City, Point, TRACK_STYLES, ANIMATION_DURATION, TEAM_COLORS } from '../../types/ticketRide';

interface TrackProps {
    track: TrackType;
    cities: City[];
    onClaim?: () => void;
}

// Helper function to create curved path using Bezier curves
function createCurvedPath(
    cityA: City,
    cityB: City,
    controlPoints: Point[]
): string {
    if (controlPoints.length === 0) {
        // Straight line
        return `M ${cityA.x},${cityA.y} L ${cityB.x},${cityB.y}`;
    } else if (controlPoints.length === 1) {
        // Quadratic curve
        const cp = controlPoints[0];
        return `M ${cityA.x},${cityA.y} Q ${cp.x},${cp.y} ${cityB.x},${cityB.y}`;
    } else {
        // Cubic curve
        const cp1 = controlPoints[0];
        const cp2 = controlPoints[1];
        return `M ${cityA.x},${cityA.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${cityB.x},${cityB.y}`;
    }
}

export default function Track({ track, cities, onClaim }: TrackProps) {
    const [hovered, setHovered] = useState(false);

    // Find the cities by ID
    const cityA = cities.find((c) => c.id === track.cityA);
    const cityB = cities.find((c) => c.id === track.cityB);

    if (!cityA || !cityB) {
        return null;
    }

    const pathString = createCurvedPath(cityA, cityB, track.controlPoints);
    const isClaimed = !!track.claimedBy;

    const trackColor = isClaimed
        ? TEAM_COLORS[track.claimedBy as keyof typeof TEAM_COLORS] || '#9CA3AF'
        : TRACK_STYLES.unclaimed.stroke;

    const strokeWidth = isClaimed
        ? TRACK_STYLES.claimed.strokeWidth
        : TRACK_STYLES.unclaimed.strokeWidth;

    const strokeDasharray = isClaimed
        ? TRACK_STYLES.claimed.strokeDasharray
        : TRACK_STYLES.unclaimed.strokeDasharray;

    const opacity = isClaimed
        ? TRACK_STYLES.claimed.opacity
        : TRACK_STYLES.unclaimed.opacity;

    const handleClick = () => {
        if (!isClaimed && onClaim) {
            onClaim();
        }
    };

    return (
        <g className="track-group">
            {/* Main track path */}
            <path
                d={pathString}
                stroke={trackColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                opacity={opacity}
                fill="none"
                onMouseEnter={() => !isClaimed && setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={handleClick}
                className={`transition-all ${!isClaimed ? 'cursor-pointer' : 'cursor-default'}`}
                style={{
                    transitionDuration: `${ANIMATION_DURATION}ms`,
                    filter: hovered ? TRACK_STYLES.unclaimed.stroke && 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' : 'none',
                }}
            />

            {/* Hover tooltip */}
            {hovered && !isClaimed && (
                <g>
                    <rect
                        x={(cityA.x + cityB.x) / 2 - 60}
                        y={(cityA.y + cityB.y) / 2 - 30}
                        width={120}
                        height={24}
                        fill="rgba(0, 0, 0, 0.8)"
                        rx={4}
                    />
                    <text
                        x={(cityA.x + cityB.x) / 2}
                        y={(cityA.y + cityB.y) / 2 - 12}
                        textAnchor="middle"
                        fontSize={12}
                        fill="white"
                        className="select-none pointer-events-none"
                    >
                        {cityA.name} → {cityB.name} ({track.length})
                    </text>
                </g>
            )}
        </g>
    );
}
