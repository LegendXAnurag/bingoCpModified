// Team Dashboard - displays private team information
'use client';

import React from 'react';
import { TTRTeam, RouteCard } from '../../types/ticketRide';

interface TeamDashboardProps {
    team: TTRTeam;
}

export default function TeamDashboard({ team }: TeamDashboardProps) {
    const completedRoutes = team.routes.filter((r) => r.completed);
    const incompleteRoutes = team.routes.filter((r) => !r.completed);
    const unusedStations = 3 - team.stationsUsed;

    // Calculate projected score
    const projectedScore =
        team.trackPoints +
        completedRoutes.reduce((sum, r) => sum + r.points, 0) -
        incompleteRoutes.reduce((sum, r) => sum + r.points, 0) +
        team.longestPathPoints +
        unusedStations * 4;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border-4" style={{ borderColor: team.color }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: team.color }}>
                    {team.name}
                </h2>
                <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Projected Score</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{projectedScore}</div>
                </div>
            </div>

            {/* Resources */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{team.coins}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Coins</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {team.tracksUsed}/45
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Tracks Used</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {unusedStations}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Stations Left</div>
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">📊 Score Breakdown</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Track Points:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{team.trackPoints}</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Completed Routes:</span>
                        <span className="font-semibold">
                            +{completedRoutes.reduce((sum, r) => sum + r.points, 0)} ({completedRoutes.length})
                        </span>
                    </div>
                    <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span>Incomplete Routes:</span>
                        <span className="font-semibold">
                            -{incompleteRoutes.reduce((sum, r) => sum + r.points, 0)} ({incompleteRoutes.length})
                        </span>
                    </div>
                    {team.longestPathPoints > 0 && (
                        <div className="flex justify-between text-yellow-600 dark:text-yellow-400">
                            <span>Longest Path:</span>
                            <span className="font-semibold">+{team.longestPathPoints} ⭐</span>
                        </div>
                    )}
                    <div className="flex justify-between text-purple-600 dark:text-purple-400">
                        <span>Unused Stations:</span>
                        <span className="font-semibold">+{unusedStations * 4}</span>
                    </div>
                </div>
            </div>

            {/* Route Cards */}
            <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">🎫 Your Routes</h3>
                <div className="space-y-2">
                    {team.routes.map((route) => (
                        <div
                            key={route.id}
                            className={`p-3 rounded-lg flex items-center justify-between ${route.completed
                                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                                    : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{route.completed ? '✅' : '❌'}</span>
                                <div>
                                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                        {route.cityA} → {route.cityB}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {route.type === 'long' ? 'Long Route' : 'Short Route'}
                                    </div>
                                </div>
                            </div>
                            <div className="text-lg font-bold" style={{ color: route.completed ? '#10B981' : '#EF4444' }}>
                                {route.completed ? '+' : '-'}{route.points}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Station Info */}
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                {team.stationsUsed === 0 && 'No stations placed yet'}
                {team.stationsUsed > 0 && `${team.stationsUsed} ${team.stationsUsed === 1 ? 'station' : 'stations'} placed`}
            </div>
        </div>
    );
}
