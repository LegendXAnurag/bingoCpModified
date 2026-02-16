import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../src/app/lib/prisma';
import usaMapData from '../../public/maps/usa_map_data.json';
import type { ProblemLevel, Track, RouteCard } from '../../src/app/types/ticketRide';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

    const {
        startTime,
        durationMinutes,
        mapType = 'usa',
        problemLevels,
        teams,
    } = req.body as {
        startTime: string;
        durationMinutes: number;
        mapType: 'usa' | 'europe';
        problemLevels: ProblemLevel[];
        teams: Array<{
            name: string;
            color: string;
            members: string[];
        }>;
    };

    if (teams.length < 2) {
        return res.status(400).json({ error: 'At least 2 teams required' });
    }

    if (!problemLevels || problemLevels.length < 2) {
        return res.status(400).json({ error: 'At least 2 problem levels required' });
    }

    const allHandles = teams.flatMap((team) => team.members);

    try {
        // Get map data
        const mapData = usaMapData; // For now, only USA; can add Europe later

        //Fetch problems for each level
        const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
        const allProblems: any[] = [];

        for (const level of problemLevels) {
            const problemRes = await fetch(`${baseUrl}/api/getProblems`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userHandles: allHandles,
                    minRating: level.ratingMin,
                    maxRating: level.ratingMax,
                    count: level.questionsCount,
                }),
            });

            if (!problemRes.ok) {
                return res.status(500).json({ error: `Failed to fetch problems for level ${level.level}` });
            }

            const problemData = await problemRes.json();
            const levelProblems = problemData.problems.map((p: any) => ({
                ...p,
                level: level.level,
            }));

            allProblems.push(...levelProblems);
        }

        // Assign route cards: 1 long + 2 short per team
        const routeAssignments: Record<string, RouteCard[]> = {};
        const shuffledLong = [...mapData.routeCards.long].sort(() => Math.random() - 0.5);
        const shuffledShort = [...mapData.routeCards.short].sort(() => Math.random() - 0.5);

        teams.forEach((team, idx) => {
            const longRoute = shuffledLong[idx % shuffledLong.length];
            const shortRoute1 = shuffledShort[(idx * 2) % shuffledShort.length];
            const shortRoute2 = shuffledShort[(idx * 2 + 1) % shuffledShort.length];

            routeAssignments[team.name] = [
                { ...longRoute, completed: false },
                { ...shortRoute1, completed: false },
                { ...shortRoute2, completed: false },
            ];
        });

        // Create match
        const match = await prisma.match.create({
            data: {
                mode: 'ticket_ride',
                startTime: new Date(startTime),
                durationMinutes,
                gridSize: 0, // Not used for Ticket to Ride
                replaceIncrement: 0, // Not used
                mapType,
                problemLevels: problemLevels as any,
                tracksData: mapData.tracks as any,
                stationsData: [] as any,
                routeCards: routeAssignments as any,
            },
        });

        // Create problems
        await prisma.problem.createMany({
            data: allProblems.map((p, idx) => ({
                contestId: p.contestId,
                index: p.index,
                matchId: match.id,
                rating: p.rating,
                name: p.name,
                position: idx,
                active: true,
            })),
        });

        // Create teams
        for (const team of teams) {
            const createdTeam = await prisma.team.create({
                data: {
                    name: team.name,
                    color: team.color,
                    matchId: match.id,
                    coins: 0,
                    tracksUsed: 0,
                    stationsUsed: 0,
                    trackPoints: 0,
                },
            });

            await prisma.member.createMany({
                data: team.members.map((handle) => ({
                    handle,
                    teamId: createdTeam.id,
                })),
            });
        }

        return res.status(200).json({ id: match.id });
    } catch (error) {
        console.error('Ticket to Ride match creation failed', error);
        return res.status(500).json({ error: 'Match creation failed' });
    }
}
