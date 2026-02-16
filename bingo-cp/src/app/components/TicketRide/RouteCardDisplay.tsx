// Route Card Display Component
'use client';

import React from 'react';
import { RouteCard } from '../../types/ticketRide';

interface RouteCardDisplayProps {
    route: RouteCard;
    onHover?: () => void;
    onLeave?: () => void;
}

export default function RouteCardDisplay({ route, onHover, onLeave }: RouteCardDisplayProps) {
    return (
        <div
            className={`p-4 rounded-lg border-2 transition-all ${route.completed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                }`}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{route.type === 'long' ? '🎫' : '🎟️'}</span>
                        <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {route.cityA}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">→</div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {route.cityB}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-2">
                        {route.type} route
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-3xl font-bold ${route.completed ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
                        {route.completed ? '+' : ''}{route.points}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
                </div>
            </div>
            {route.completed && (
                <div className="mt-2 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                    ✅ COMPLETED
                </div>
            )}
        </div>
    );
}
