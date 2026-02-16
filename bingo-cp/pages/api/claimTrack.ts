import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../src/app/lib/prisma';
import type { Track, TTRTeam } from '../../src/app/types/ticketRide';
import { validateTrackClaim, processTrackClaim } from '../../src/app/lib/ticketRideLogic';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

    const { matchId, teamName, trackId } = req.body;

    if (!matchId || !teamName || !trackId) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { teams: true },
        });

        if (!match || match.mode !== 'ticket_ride') {
            return res.status(404).json({ success: false, error: 'Match not found' });
        }

        const team = match.teams.find((t) => t.name === teamName);
        if (!team) {
            return res.status(404).json({ success: false, error: 'Team not found' });
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
        const validation = validateTrackClaim(trackId, teamName, ttrTeam, tracks);
        if (!validation.valid) {
            return res.status(400).json({ success: false, error: validation.error });
        }

        // Process claim
        const { updatedTeam, updatedTracks } = processTrackClaim(
            trackId,
            teamName,
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
            where: { id: matchId },
            data: {
                tracksData: updatedTracks as any,
            },
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error claiming track:', error);
        return res.status(500).json({ success: false, error: 'Failed to claim track' });
    }
}
