// City marker component for Ticket to Ride map
'use client';

import React from 'react';
import { City as CityType, Station, CITY_SIZES } from '../../types/ticketRide';

interface CityProps {
    city: CityType;
    stations?: Station[];
}

export default function City({ city, stations = [] }: CityProps) {
    const radius = CITY_SIZES[city.size];
    const fontSize = city.size === 'large' ? 14 : city.size === 'medium' ? 11 : 10;
    const fontWeight = city.size === 'large' ? 'bold' : 'normal';

    return (
        <g className="city-group" transform={`translate(${city.x}, ${city.y})`}>
            {/* City circle */}
            <circle
                r={radius}
                fill="white"
                stroke="#374151"
                strokeWidth={2}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                className="cursor-default"
            />

            {/* City name label */}
            <text
                y={radius + 16}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight={fontWeight}
                fill="#1F2937"
                className="select-none pointer-events-none"
                style={{ userSelect: 'none' }}
            >
                {city.name}
            </text>

            {/* Station indicators */}
            {stations.map((station, idx) => {
                const angle = idx * 120; // 120° apart for up to 3 stations
                const distance = 20;
                const x = Math.cos((angle * Math.PI) / 180) * distance;
                const y = Math.sin((angle * Math.PI) / 180) * distance;

                return (
                    <g key={idx} transform={`translate(${x}, ${y})`}>
                        {/* Station icon (simplified house shape) */}
                        <rect
                            x={-4}
                            y={-6}
                            width={8}
                            height={8}
                            fill={station.teamName}
                            stroke="white"
                            strokeWidth={1}
                            rx={1}
                        />
                        <path
                            d="M -5,-6 L 0,-10 L 5,-6"
                            fill={station.teamName}
                            stroke="white"
                            strokeWidth={1}
                        />
                    </g>
                );
            })}
        </g>
    );
}
