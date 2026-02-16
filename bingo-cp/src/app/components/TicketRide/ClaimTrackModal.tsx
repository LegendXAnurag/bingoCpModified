// Claim Track Modal
'use client';

import React from 'react';
import { Track, City, TRACK_LENGTH_POINTS } from '../../types/ticketRide';

interface ClaimTrackModalProps {
    track: Track | null;
    cityA: City | null;
    cityB: City | null;
    userCoins: number;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ClaimTrackModal({
    track,
    cityA,
    cityB,
    userCoins,
    onConfirm,
    onCancel,
}: ClaimTrackModalProps) {
    if (!track || !cityA || !cityB) return null;

    const cost = track.length;
    const points = TRACK_LENGTH_POINTS[track.length as keyof typeof TRACK_LENGTH_POINTS] || 0;
    const canAfford = userCoins >= cost;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Claim Track?</h2>

                {/* Track details */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {cityA.name} → {cityB.name}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Length</div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{track.length}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Cost</div>
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{cost} coins</div>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Points Earned</div>
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">+{points} pts</div>
                    </div>
                </div>

                {/* User coins */}
                <div className="flex items-center justify-between mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Your coins:</span>
                    <span className={`text-xl font-bold ${canAfford ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {userCoins} coins
                    </span>
                </div>

                {/* Warning if can't afford */}
                {!canAfford && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            ⚠️ Not enough coins! You need {cost - userCoins} more coins.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!canAfford}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${canAfford
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Claim Track
                    </button>
                </div>
            </div>
        </div>
    );
}
