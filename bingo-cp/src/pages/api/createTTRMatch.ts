import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../app/lib/prisma';
import { TTRParams, TTRState, ProblemCell, TTRPlayerState, TTRTrackState } from '../../app/types/match';
import { TRACKS, TICKETS } from '../../lib/ttrData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { teams, ttrParams, startTime } = req.body;

        if (!teams || teams.length < 2) {
            return res.status(400).json({ message: 'At least 2 teams required' });
        }

        // Fetch problems from Codeforces
        const cfRes = await fetch('https://codeforces.com/api/problemset.problems');
        const cfData = await cfRes.json();
        if (cfData.status !== 'OK') {
            throw new Error('Failed to fetch problems from Codeforces');
        }

        const allProblems = cfData.result.problems as any[];

        // Filter and select problems for each level
        const levels = [ttrParams.level1, ttrParams.level2, ttrParams.level3, ttrParams.level4];
        const marketProblems: ProblemCell[] = [];
        const allProbs: ProblemCell[] = [];

        const pickProblems = (min: number, max: number, count: number, row: number) => {
            const candidates = allProblems.filter(p => p.rating >= min && p.rating <= max);

            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
            }

            return candidates.slice(0, count).map((p: any) => ({
                contestId: p.contestId,
                index: p.index,
                name: p.name,
                rating: p.rating,
                type: 'PROGRAMMING',
                points: 0,
                row: row,
                col: 0
            } as ProblemCell));
        };

        levels.forEach((level, idx) => {
            if (!level || level.count === 0) return;
            const poolSize = 30;
            const picked = pickProblems(level.min, level.max, poolSize, idx);
            allProbs.push(...picked);
            marketProblems.push(...picked.slice(0, level.count));
        });

        const players: Record<string, TTRPlayerState> = {};
        teams.forEach((t: any) => {
            players[t.color] = {
                team: t.color,
                coins: 10,
                trainsLeft: 45,
                stationsLeft: 3,
                score: 0,
                routes: [],
                destinations: []
            };
        });

        const tracks: Record<string, TTRTrackState> = {};
        TRACKS.forEach(t => {
            tracks[t.id] = {
                id: t.id,
                claimedBy: null
            };
        });

        const ticketDeck = [...TICKETS.map(t => t.id)];
        // Shuffle deck
        for (let i = ticketDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ticketDeck[i], ticketDeck[j]] = [ticketDeck[j], ticketDeck[i]];
        }

        const ttrState: TTRState = {
            players,
            tracks,
            stations: {},
            market: marketProblems,
            allProbs: allProbs,
            ticketDeck
        };

        const match = await prisma.match.create({
            data: {
                startTime: new Date(startTime),
                durationMinutes: Number(ttrParams.gameDurationMinutes),
                mode: 'ttr',
                ttrState: ttrState as any,
                ttrParams: ttrParams as any,
                teams: {
                    create: teams.map((t: any) => ({
                        name: t.name,
                        color: t.color,
                        members: {
                            create: t.members
                                .filter((m: any) => typeof m === 'string' && m.trim() !== '')
                                .map((m: any) => ({ handle: m.trim() }))
                        }
                    }))
                },
                solveLog: { create: [] },
                problems: { create: [] }
            }
        });

        res.status(200).json({ id: match.id });

    } catch (error: any) {
        console.error('Error creating TTR match:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
}
