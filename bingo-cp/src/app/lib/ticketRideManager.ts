// Ticket to Ride match management with Prisma integration
'use server';

import { prisma } from './prisma';
import type { TTRTeam, ProblemLevel, Track, Station, RouteCard, TTRProblem } from '../types/ticketRide';
import {
    validateTrackClaim,
    processTrackClaim,
    validateStationPlacement,
    processStationPlacement,
    updateRouteCompletions,
    calculateTeamScore,
} from './ticketRideLogic';

/**
 * Create a new Ticket to Ride match
 */
export async function createTicketRideMatch(data: {
    teams: { name: string; color: string; members: string[] }[];
    startTime: Date;
    durationMinutes: number;
    mapType: 'usa' | 'europe';
    problemLevels: ProblemLevel[];
    tracks: Track[];
    routeCards: { long: RouteCard[]; short: RouteCard[] };
    problems: TTRProblem[];
}) {
    try {
        // Assign route cards: 1 long + 2 short per team
        const routeAssignments: Record<string, RouteCard[]> = {};
        const shuffledLong = [...data.routeCards.long].sort(() => Math.random() - 0.5);
        const shuffledShort = [...data.routeCards.short].sort(() => Math.random() - 0.5);

        data.teams.forEach((team, idx) => {
            const longRoute = shuffledLong[idx % shuffledLong.length];
            const shortRoute1 = shuffledShort[(idx * 2) % shuffledShort.length];
            const shortRoute2 = shuffledShort[(idx * 2 + 1) % shuffledShort.length];

            routeAssignments[team.name] = [
                { ...longRoute, completed: false },
                { ...shortRoute1, completed: false },
                { ...shortRoute2, completed: false },
            ];
        });

        // Create match in database
        const match = await prisma.match.create({
            data: {
                mode: 'ticket_ride',
                startTime: data.startTime,
                durationMinutes: data.durationMinutes,
                mapType: data.mapType,
                problemLevels: data.problemLevels as any,
                tracksData: data.tracks as any,
                stationsData: [] as any,
                routeCards: routeAssignments as any,
                gridSize: 0,
                replaceIncrement: 0,
                teams: {
                    create: data.teams.map((team) => ({
                        name: team.name,
                        color: team.color,
                        coins: 0,
                        tracksUsed: 0,
                        stationsUsed: 0,
                        trackPoints: 0,
                        members: {
                            create: team.members.map((handle) => ({ handle })),
                        },
                    })),
                },
                problems: {
                    create: data.problems.map((problem, idx) => ({
                        contestId: problem.contestId,
                        index: problem.index,
                        name: problem.name,
                        rating: problem.rating,
                        position: idx,
                        active: true,
                    })),
                },
            },
            include: {
                teams: {
                    include: {
                        members: true,
                    },
                },
                problems: true,
            },
        });

        return { success: true, matchId: match.id, match };
    } catch (error) {
        console.error('Error creating Ticket to Ride match:', error);
        return { success: false, error: 'Failed to create match' };
    }
}

/**
 * Get match by ID
 */
export async function getTicketRideMatch(matchId: string) {
    try {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                teams: {
                    include: {
                        members: true,
                    },
                },
                problems: true,
                solveLog: true,
            },
        });

        if (!match || match.mode !== 'ticket_ride') {
            return { success: false, error: 'Match not found' };
        }

        return { success: true, match };
    } catch (error) {
        console.error('Error fetching match:', error);
        return { success: false, error: 'Failed to fetch match' };
    }
}

/**
 * Claim a track
 */
export async function claimTrack(data: {
    matchId: string;
    teamName: string;
    trackId: string;
}) {
    try {
        const match = await prisma.match.findUnique({
            where: { id: data.matchId },
            include: { teams: true },
        });

        if (!match) {
            return { success: false, error: 'Match not found' };
        }

        const team = match.teams.find((t) => t.name === data.teamName);
        if (!team) {
            return { success: false, error: 'Team not found' };
        }

        const tracks = (match.tracksData as Track[]) || [];
        const ttrTeam: TTRTeam = {
            name: team.name,
            color: team.color,
            members: [],
            coins: team.coins || 0,
            tracksUsed: team.tracksUsed || 0,
            stationsUsed: team.stationsUsed || 0,
            routes: [],
            trackPoints: team.trackPoints || 0,
            completedRoutePoints: 0,
            incompleteRoutePoints: 0,
            longestPathPoints: 0,
            stationPoints: 0,
            totalScore: 0,
        };

        // Validate claim
        const validation = validateTrackClaim(data.trackId, data.teamName, ttrTeam, tracks);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // Process claim
        const { updatedTeam, updatedTracks } = processTrackClaim(
            data.trackId,
            data.teamName,
            ttrTeam,
            tracks
        );

        // Update database
        await prisma.team.update({
            where: { id: team.id },
            data: {
                coins: updatedTeam.coins,
                tracksUsed: updatedTeam.tracksUsed,
                trackPoints: updatedTeam.trackPoints,
            },
        });

        await prisma.match.update({
            where: { id: data.matchId },
            data: {
                tracksData: updatedTracks as any,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Error claiming track:', error);
        return { success: false, error: 'Failed to claim track' };
    }
}

/**
 * Place a station
 */
export async function placeStation(data: {
    matchId: string;
    teamName: string;
    cityId: string;
}) {
    try {
        const match = await prisma.match.findUnique({
            where: { id: data.matchId },
            include: { teams: true },
        });

        if (!match) {
            return { success: false, error: 'Match not found' };
        }

        const team = match.teams.find((t) => t.name === data.teamName);
        if (!team) {
            return { success: false, error: 'Team not found' };
        }

        const tracks = (match.tracksData as Track[]) || [];
        const stations = (match.stationsData as Station[]) || [];

        const ttrTeam: TTRTeam = {
            name: team.name,
            color: team.color,
            members: [],
            coins: team.coins || 0,
            tracksUsed: team.tracksUsed || 0,
            stationsUsed: team.stationsUsed || 0,
            routes: [],
            trackPoints: team.trackPoints || 0,
            completedRoutePoints: 0,
            incompleteRoutePoints: 0,
            longestPathPoints: 0,
            stationPoints: 0,
            totalScore: 0,
        };

        // Validate placement
        const validation = validateStationPlacement(data.cityId, data.teamName, ttrTeam, tracks, stations);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // Process placement
        const { updatedTeam, updatedStations } = processStationPlacement(
            data.cityId,
            data.teamName,
            ttrTeam,
            stations
        );

        // Update database
        await prisma.team.update({
            where: { id: team.id },
            data: {
                coins: updatedTeam.coins,
                stationsUsed: updatedTeam.stationsUsed,
            },
        });

        await prisma.match.update({
            where: { id: data.matchId },
            data: {
                stationsData: updatedStations as any,
            },
        });

        return { success: true, cost: validation.cost };
    } catch (error) {
        console.error('Error placing station:', error);
        return { success: false, error: 'Failed to place station' };
    }
}

/**
 * Award coins to a team for solving a problem
 */
export async function awardCoins(data: {
    matchId: string;
    teamName: string;
    coinsAwarded: number;
}) {
    try {
        const match = await prisma.match.findUnique({
            where: { id: data.matchId },
            include: { teams: true },
        });

        if (!match) {
            return { success: false, error: 'Match not found' };
        }

        const team = match.teams.find((t) => t.name === data.teamName);
        if (!team) {
            return { success: false, error: 'Team not found' };
        }

        await prisma.team.update({
            where: { id: team.id },
            data: {
                coins: (team.coins || 0) + data.coinsAwarded,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Error awarding coins:', error);
        return { success: false, error: 'Failed to award coins' };
    }
}

/**
 * Update route completion statuses
 */
export async function updateRoutes(matchId: string) {
    try {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { teams: { include: { members: true } } },
        });

        if (!match || match.mode !== 'ticket_ride') {
            return { success: false, error: 'Match not found' };
        }

        const tracks = (match.tracksData as Track[]) || [];
        const stations = (match.stationsData as Station[]) || [];
        const routeCards = (match.routeCards as Record<string, RouteCard[]>) || {};

        const ttrTeams: TTRTeam[] = match.teams.map((team) => ({
            name: team.name,
            color: team.color,
            members: team.members.map((m) => m.handle),
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
        }));

        const updatedTeams = updateRouteCompletions(ttrTeams, tracks, stations);

        // Update route cards
        const updatedRouteCards: Record<string, RouteCard[]> = {};
        updatedTeams.forEach((team) => {
            updatedRouteCards[team.name] = team.routes;
        });

        await prisma.match.update({
            where: { id: matchId },
            data: {
                routeCards: updatedRouteCards as any,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating routes:', error);
        return { success: false, error: 'Failed to update routes' };
    }
}
