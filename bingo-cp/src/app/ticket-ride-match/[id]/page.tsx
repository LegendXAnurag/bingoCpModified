'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import TicketRideMap from '@/app/components/TicketRide/TicketRideMap';
import TeamDashboard from '@/app/components/TicketRide/TeamDashboard';
import CoinMarketplace from '@/app/components/TicketRide/CoinMarketplace';
import ClaimTrackModal from '@/app/components/TicketRide/ClaimTrackModal';
import type { MapData, Track, Station, TTRTeam, TTRProblem, ProblemLevel } from '@/app/types/ticketRide';

export default function TicketRideMatchPage() {
    const params = useParams();
    const matchId = params.id as string;
    const [match, setMatch] = useState<any>(null);
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Interactive state
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [showClaimModal, setShowClaimModal] = useState(false);

    useEffect(() => {
        loadMatch();
        // Poll for updates every 5 seconds
        const interval = setInterval(loadMatch, 5000);
        return () => clearInterval(interval);
    }, [matchId]);

    async function loadMatch() {
        try {
            const response = await fetch(`/api/getTicketRideMatch?id=${matchId}`);
            if (!response.ok) {
                throw new Error('Failed to load match');
            }
            const data = await response.json();
            setMatch(data.match);

            // Load map data if not loaded
            if (!mapData) {
                const mapResponse = await fetch(`/maps/${data.match.mapType}_map_data.json`);
                const mapJson = await mapResponse.json();
                setMapData(mapJson);

                // Auto-select first team
                if (data.match.teams?.length > 0 && !selectedTeam) {
                    setSelectedTeam(data.match.teams[0].name);
                }
            }

            setLoading(false);
        } catch (err) {
            console.error('Error loading match:', err);
            setError('Failed to load match');
            setLoading(false);
        }
    }

    const handleTrackClick = (trackId: string) => {
        if (!selectedTeam) {
            alert('Please select a team first');
            return;
        }

        const tracks = (match.tracksData || []) as Track[];
        const track = tracks.find(t => t.id === trackId);

        if (!track) return;

        if (track.claimedBy) {
            alert(`This track is already claimed by ${track.claimedBy}`);
            return;
        }

        setSelectedTrack(track);
        setShowClaimModal(true);
    };

    const handleClaimTrack = async () => {
        if (!selectedTrack || !selectedTeam) return;

        try {
            const response = await fetch('/api/claimTrack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId,
                    teamName: selectedTeam,
                    trackId: selectedTrack.id,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                alert(result.error || 'Failed to claim track');
                return;
            }

            // Reload match to see updates
            await loadMatch();
            setShowClaimModal(false);
            setSelectedTrack(null);
        } catch (error) {
            console.error('Error claiming track:', error);
            alert('Failed to claim track');
        }
    };

    const handlePlaceStation = async (cityId: string) => {
        if (!selectedTeam) {
            alert('Please select a team first');
            return;
        }

        try {
            const response = await fetch('/api/placeStation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId,
                    teamName: selectedTeam,
                    cityId,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                alert(result.error || 'Failed to place station');
                return;
            }

            alert(`Station placed! Cost: ${result.cost} coins`);
            await loadMatch();
        } catch (error) {
            console.error('Error placing station:', error);
            alert('Failed to place station');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading match...</p>
                </div>
            </div>
        );
    }

    if (error || !match || !mapData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-700 dark:text-gray-300">{error || 'Match not found'}</p>
                </div>
            </div>
        );
    }

    const tracks = (match.tracksData || []) as Track[];
    const stations = (match.stationsData || []) as Station[];
    const problemLevels = (match.problemLevels || []) as ProblemLevel[];
    const routeCards = (match.routeCards || {}) as Record<string, any[]>;

    // Convert match teams to TTRTeam format
    const ttrTeams: TTRTeam[] = match.teams?.map((team: any) => ({
        name: team.name,
        color: team.color,
        members: team.members?.map((m: any) => m.handle) || [],
        coins: team.coins || 0,
        tracksUsed: team.tracksUsed || 0,
        stationsUsed: team.stationsUsed || 0,
        routes: routeCards[team.name] || [],
        trackPoints: team.trackPoints || 0,
        completedRoutePoints: 0,
        incompleteRoutePoints: 0,
        longestPathPoints: 0,
        stationPoints: 0,
        totalScore: 0,
    })) || [];

    const currentTeam = ttrTeams.find(t => t.name === selectedTeam);

    // Convert match problems to TTRProblem format
    const ttrProblems: TTRProblem[] = match.problems?.map((p: any) => ({
        contestId: p.contestId,
        index: p.index,
        name: p.name,
        rating: p.rating,
        level: 1, // Would need to determine from rating
        solvedBy: undefined,
    })) || [];

    return (
        <main className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="container mx-auto max-w-[1800px]">
                {/* Header */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                🚂 Ticket to Ride CP
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Match ID: {matchId}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                            <div className="text-2xl font-bold text-orange-600">{match.durationMinutes} min</div>
                        </div>
                    </div>

                    {/* Team Selection - Click to select active team */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {match.teams?.map((team: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedTeam(team.name)}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${selectedTeam === team.name
                                        ? 'ring-4 ring-blue-500 scale-105'
                                        : 'hover:scale-102'
                                    }`}
                                style={{ borderColor: team.color }}
                            >
                                <div className="font-bold text-sm mb-1">{team.name}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    💰 {team.coins || 0} coins
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    🛤️ {team.tracksUsed || 0}/45 tracks
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    🏠 {team.stationsUsed || 0}/3 stations
                                </div>
                            </button>
                        ))}
                    </div>

                    {selectedTeam && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                ✓ Playing as: {selectedTeam}
                            </p>
                        </div>
                    )}
                </div>

                {/* Main Game Area */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                    {/* Map - Takes 3 columns on xl screens */}
                    <div className="xl:col-span-3">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4">
                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                                Game Map
                            </h2>
                            <TicketRideMap
                                mapData={mapData}
                                tracks={tracks}
                                stations={stations}
                                onTrackClick={handleTrackClick}
                            />
                        </div>
                    </div>

                    {/* Side Panel - 1 column */}
                    <div className="space-y-4">
                        {/* Team Dashboard */}
                        {currentTeam && (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4">
                                <TeamDashboard team={currentTeam} />
                            </div>
                        )}

                        {/* Coin Marketplace */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4">
                            <CoinMarketplace
                                problemLevels={problemLevels}
                                problems={ttrProblems}
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl shadow-xl p-4">
                            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
                                🎮 Quick Actions
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => alert('Click on a track on the map to claim it!')}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
                                >
                                    🛤️ Claim Track
                                </button>
                                <button
                                    onClick={() => alert('Right-click on a city to place a station!')}
                                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm"
                                >
                                    🏠 Place Station
                                </button>
                            </div>
                        </div>

                        {/* Game Instructions */}
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-xl p-4">
                            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
                                📋 How to Play
                            </h3>
                            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                                <li>✅ Solve problems to earn coins</li>
                                <li>🛤️ Click tracks to claim them</li>
                                <li>🏠 Build stations to use opponent tracks</li>
                                <li>🎯 Complete routes for bonus points</li>
                                <li>👑 Longest path gets +10 points</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Claim Track Modal */}
            {showClaimModal && selectedTrack && currentTeam && (
                <ClaimTrackModal
                    track={selectedTrack}
                    team={currentTeam}
                    onClose={() => {
                        setShowClaimModal(false);
                        setSelectedTrack(null);
                    }}
                    onConfirm={handleClaimTrack}
                />
            )}
        </main>
    );
}
