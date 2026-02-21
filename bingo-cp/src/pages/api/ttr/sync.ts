import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/app/lib/prisma";
import { fetchUserSubmissions } from '@/app/lib/codeforces';

// Define the TTR state structure we expect to manipulate
interface TtrState {
    market: any[];
    players: Record<string, { coins: number; score: number; routes: any[]; hand: any[]; trainCount: number; color: string; tickets?: any[] }>; // Added tickets optional
    deck: any[];
    // ... other fields
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { matchId, token } = req.body;

    if (!matchId) {
        return res.status(400).json({ error: 'Missing matchId' });
    }

    try {
        // 1. Authenticate (Optional)
        let authenticatedMember = null;
        if (token) {
            // Find member with this secret and matchId
            const member = await prisma.member.findFirst({
                where: {
                    secret: token,
                    team: { matchId: matchId },
                    claimed: true
                },
                include: { team: true }
            });
            if (member) {
                authenticatedMember = member;
            }
        }

        // 2. Poll Codeforces (Only if authenticated and cooldown passed)
        if (authenticatedMember) {
            const now = new Date();
            const cooldownSeconds = Number(process.env.POLLING_COOLDOWN_SECONDS) || 60;
            const lastPolled = new Date(authenticatedMember.lastPolledAt);

            // Check if enough time has passed since this specific user last polled
            if (now.getTime() - lastPolled.getTime() > cooldownSeconds * 1000) {

                // Update lastPolledAt immediately to prevent race conditions/double polling
                await prisma.member.update({
                    where: { id: authenticatedMember.id },
                    data: { lastPolledAt: now }
                });

                try {
                    // Fetch submissions for this user only
                    // const limit = 50; // Unused
                    const submissions = await fetchUserSubmissions(authenticatedMember.handle); // Implementation needs to support single handle effectively or use existing array wrapper

                    // Filter for active match problems
                    const match = await prisma.match.findUnique({
                        where: { id: matchId },
                        include: { problems: { where: { active: true } }, solveLog: true }
                    });

                    if (match && submissions && Array.isArray(submissions)) {
                        const newSolves: any[] = []; // Explicit any for quick fix, better to type properly

                        // Check against match problems
                        for (const sub of submissions) {
                            if (sub.verdict !== 'OK') continue;

                            const problem = match.problems.find(p => p.contestId === sub.problem.contestId && p.index === sub.problem.index);
                            if (!problem) continue;

                            // Check if already solved by THIS team (or anyone, depending on rules - usually duplicate solves allowed but only first counts for points? TTR might differ)
                            // For TTR, we usually just want to know if *this* user solved it to award coins. 
                            // However, our current logic is centralized in `poll-submissions.ts`. 
                            // We should probably reuse a simplified version of `checkSolvesLogic` or just insert into SolveLog if new.

                            const alreadySolved = match.solveLog.some(log =>
                                log.contestId === problem.contestId &&
                                log.index === problem.index &&
                                log.team === authenticatedMember?.team.color // Check if MY team solved it
                            );

                            if (!alreadySolved) {
                                newSolves.push({
                                    contestId: problem.contestId,
                                    index: problem.index,
                                    timestamp: new Date(sub.creationTimeSeconds * 1000),
                                    team: authenticatedMember.team.color,
                                    handle: authenticatedMember.handle
                                });
                            }
                        }

                        if (newSolves.length > 0) {
                            // Insert new solves
                            // This mirrors `poll-submissions.ts` logic but scoped to this user
                            // Note: we might need to handle TTR coin logic here or trigger a separate update.
                            // Ideally, we insert into SolveLog, and then a separate function (or this one) updates game state.

                            // Transactions for safety
                            await prisma.$transaction(async (tx) => {
                                for (const solve of newSolves) {
                                    // Double check inside transaction
                                    const existing = await tx.solveLog.findFirst({
                                        where: {
                                            matchId,
                                            contestId: solve.contestId,
                                            index: solve.index,
                                            team: solve.team
                                        }
                                    });

                                    if (!existing) {
                                        await tx.solveLog.create({
                                            data: {
                                                matchId,
                                                contestId: solve.contestId,
                                                index: solve.index,
                                                handle: solve.handle,
                                                team: solve.team,
                                                timestamp: solve.timestamp
                                            }
                                        });

                                        // Update TTR State (Coins)
                                        // This is duplicated logic from poll-submissions.ts - careful!
                                        // Ideally extracting TTR logic to a library function is better.
                                        // For now, let's just insert SolveLog. 
                                        // The CLIENT might need to trigger a "re-calculate state" or the server does it here.
                                        // Let's do a lightweight state update here.

                                        const currentMatchWithState = await tx.match.findUnique({
                                            where: { id: matchId },
                                            select: { ttrState: true }
                                        });

                                        if (currentMatchWithState?.ttrState) {
                                            const state = currentMatchWithState.ttrState as unknown as TtrState;

                                            if (state.market && Array.isArray(state.market)) {
                                                const marketIdx = state.market.findIndex((p: any) => p.contestId === solve.contestId && p.index === solve.index);

                                                if (marketIdx !== -1) {
                                                    // Award coins
                                                    const problem = state.market[marketIdx];
                                                    const row = problem.row ?? 0;
                                                    const coins = row === 0 ? 2 : row === 1 ? 3 : row === 2 ? 4 : 5; // Simplified

                                                    if (state.players && state.players[solve.team]) {
                                                        state.players[solve.team].coins += coins;
                                                        state.players[solve.team].score += 10;
                                                    }

                                                    // Remove from market
                                                    state.market.splice(marketIdx, 1);

                                                    await tx.match.update({
                                                        where: { id: matchId },
                                                        data: { ttrState: state as any }
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.error("Error polling for member", authenticatedMember.handle, e);
                }
            }
        }

        // 3. Fetch Match State & Mask Data
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                teams: {
                    include: { members: { select: { id: true, handle: true, claimed: true, teamId: true } } }
                },
                solveLog: true, // we might want to filter this
                problems: { where: { active: true } }
            }
        });

        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // Mask sensitive TTR state
        let safeTtrState: any = match.ttrState; // explicit any to manipulate
        if (safeTtrState) {
            // const state = JSON.parse(JSON.stringify(safeTtrState)); // Deep copy - Unused if we modify safeTtrState directly or reassign
            // Actually safeTtrState is from DB (Json value), usually object

            // We need to be careful not to mutate the original object if it comes from cache, but here it's fresh from DB
            const state = JSON.parse(JSON.stringify(safeTtrState));

            const myTeamColor = authenticatedMember?.team.color;

            // Hide hands and detailed routes of other teams
            if (state.players) {
                Object.keys(state.players).forEach(teamColor => {
                    if (teamColor !== myTeamColor) {
                        // It's another team or I am a spectator
                        if (state.players[teamColor].hand) {
                            // Replace hand with count
                            state.players[teamColor].handCount = state.players[teamColor].hand.length;
                            delete state.players[teamColor].hand;
                        }
                        if (state.players[teamColor].tickets) {
                            // Maybe show count or just completed routes on map?
                            // Usually tickets are secret until end.
                            state.players[teamColor].ticketsCount = state.players[teamColor].tickets.length;
                            delete state.players[teamColor].tickets;
                        }
                    }
                });
            }

            // Deck should be hidden (just count)
            if (state.deck) {
                state.deckCount = state.deck.length;
                delete state.deck;
            }

            safeTtrState = state;
        }

        return res.status(200).json({
            match: {
                ...match,
                ttrState: safeTtrState
            }
        });

    } catch (error: any) {
        console.error("Sync error:", error);
        return res.status(500).json({ error: error.message || 'Internal Error' });
    }
}
