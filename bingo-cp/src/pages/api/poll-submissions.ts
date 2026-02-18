import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "@/app/lib/prisma"
import { checkSolvesLogic, Problem, Player, Claim } from '@/lib/checkSolvesLogic'
import { fetchAndFilterProblems } from '@/app/lib/problems';
import { TTRParams, TTRState } from '@/app/types/match';

async function fetchReplacementProblem(exclude: string[], minRating?: number, maxRating?: number, handles?: string[]) {
  try {
    const problems = await fetchAndFilterProblems({
      minRating: minRating ?? 800,
      maxRating: maxRating ?? 3500,
      userHandles: handles,
      count: 1,
      exclude: exclude
    });
    return problems[0] ?? null;
  } catch (err) {
    console.error('fetchReplacementProblem error', err);
    return null;
  }
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  try {
    const { matchId } = req.body
    if (!matchId) return res.status(400).json({ error: 'matchId required' })
    // const match = await prisma.match.findUnique({ where: { id: matchId } });

    const old = await prisma.match.findUnique({ where: { id: matchId }, select: { id: true } });
    if (!old) {
      return res.status(404).json({ error: 'Match not found' })
    }
    const now = new Date();
    const cutoff = new Date(now.getTime() - 60 * 1000);
    const updateResult = await prisma.match.updateMany({
      where: {
        id: matchId,
        lastPolledAt: { lt: cutoff },
      },
      data: {
        lastPolledAt: now,
      },
    });

    if (updateResult.count === 0) {
      const cachedMatch = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          problems: { where: { active: true }, orderBy: { position: 'asc' } },
          teams: { include: { members: true } },
          solveLog: { include: { problem: true }, orderBy: { timestamp: 'asc' } },
        },
      });
      return res.json({ message: "Using cached state", match: cachedMatch });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        problems: true,
        teams: {
          include: { members: true },
        },
        solveLog: { include: { problem: true }, orderBy: { timestamp: 'asc' } },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    const problems = match.problems
      .filter(p => p.active === true)
      .map(p => ({
        contestId: p.contestId,
        index: p.index,
      }));
    const players = match.teams.flatMap(team =>
      team.members.map(member => ({
        handle: member.handle,
        team: team.color,
      }))
    )
    const claims = await checkSolvesLogic(problems, players)
    const newSolves: Array<{
      handle: string;
      team: string;
      contestId: number;
      index: string;
      timestamp: Date;
      matchId: string;
      score?: number | null;
    }> = []
    const changed: Array<{
      handle: string;
      team: string;
      contestId: number;
      index: string;
      timestamp: Date;
      matchId: string;
      score?: number | null;
    }> = []

    for (const [key, claim] of Object.entries(claims)) {
      const [contestIdStr, index] = key.split('-')
      const contestId = Number(contestIdStr)

      if (!match.solveLog.some(log => log.contestId === contestId && log.index === index)) {
        newSolves.push({
          handle: '',
          team: claim.team,
          contestId,
          index,
          timestamp: new Date(claim.time * 1000),
          matchId: match.id,
        })
      }
      else {
        for (const Solve of match.solveLog) {
          const newTime = new Date(claim.time * 1000);
          if (Solve.contestId === contestId && Solve.index === index && Solve.team != claim.team) {
            if (Solve.timestamp.getTime() > newTime.getTime()) {
              changed.push({
                handle: '',
                team: claim.team,
                contestId,
                index,
                timestamp: newTime,
                matchId: match.id
              });
            }
          }
        }
      }
    }
    if (changed.length > 0) {
      for (const c of changed) {
        try {
          await prisma.$transaction(async (tx) => {
            const existing = await tx.solveLog.findFirst({
              where: { matchId: c.matchId, contestId: c.contestId, index: c.index },
            });
            if (!existing) return;
            const existingTs = new Date(existing.timestamp).getTime();
            // Only update if our discovered claim is earlier
            if (isNaN(existingTs) || c.timestamp.getTime() < existingTs) {
              await tx.solveLog.update({
                where: { id: existing.id },
                data: { handle: c.handle, team: c.team, timestamp: c.timestamp },
              });
            }
          });
        } catch (err) {
          console.error('Failed to apply changed update for', c, err);
        }
      }
    }
    if (newSolves.length === 0) {
      const updatedMatch = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          problems: { where: { active: true }, orderBy: { position: 'asc' } },
          teams: { include: { members: true } },
          solveLog: { include: { problem: true }, orderBy: { timestamp: 'asc' } },
        },
      });
      return res.status(200).json({ updated: false, match: updatedMatch });
    }
    for (const s of newSolves) {
      const { contestId, index, team } = s;
      let replacementCandidate = null;
      let newRatingTarget: number | null = null;
      if (match.mode === 'replace') {
        const maybeOld = await prisma.problem.findFirst({
          where: { contestId, index, matchId },
        });
        if (maybeOld) {
          const increment = match.replaceIncrement ?? 100;
          newRatingTarget = Math.min(3500, (maybeOld.rating ?? 0) + increment);
          const allHandles = match.teams.flatMap(t => t.members).map(m => m.handle);
          try {
            const problemKeys = match.problems.filter(p => p.active).map(p => `${p.contestId}-${p.index}`);
            replacementCandidate = await fetchReplacementProblem(
              problemKeys,
              newRatingTarget,
              newRatingTarget,
              allHandles
            );
          } catch (err) {
            console.error('fetchReplacementProblem failed', err);
            replacementCandidate = null;
          }
        }
      }
      await prisma.$transaction(async (tx) => {
        const existing = await tx.solveLog.findFirst({
          where: { matchId, contestId, index },
        });
        if (existing) {
          return;
        }
        await tx.solveLog.create({
          data: {
            handle: '',
            team,
            contestId,
            index,
            timestamp: s.timestamp,
            matchId,
          },
        });
        const solvedRow = await tx.problem.findFirst({
          where: { contestId, index, matchId, active: true },
        });

        const oldProblem = solvedRow ?? await tx.problem.findUnique({
          where: { contestId_index_matchId: { contestId, index, matchId } },
        });


        if (match.mode === 'replace' && oldProblem) {
          const increment = match.replaceIncrement ?? 100;
          const newRatingTarget = Math.min(3500, (oldProblem.rating ?? 0) + increment);
          const allHandles = match.teams.flatMap((team) => team.members).map((p) => p.handle);
          // const replacementCandidate = await fetchReplacementProblem(
          //   problems.map(p => `${p.contestId}-${p.index}`), 
          //   newRatingTarget,
          //   newRatingTarget,
          //   allHandles,
          // );

          const oldP = await tx.problem.findFirst({
            where: { contestId: oldProblem.contestId, index: oldProblem.index, matchId, active: true },
          });
          if (!oldP) return;
          await tx.problem.update({
            where: { contestId_index_matchId: { contestId: oldP.contestId, index: oldP.index, matchId } },
            data: { active: false },
          });

          if (replacementCandidate) {
            const dup = await tx.problem.findFirst({
              where: { contestId: replacementCandidate.contestId ?? 0, index: replacementCandidate.index ?? '', matchId }
            });
            if (!dup) {
              await tx.problem.create({
                data: {
                  contestId: replacementCandidate.contestId ?? 0,
                  index: replacementCandidate.index ?? String(Date.now()),
                  matchId,
                  rating: replacementCandidate?.rating ?? newRatingTarget,
                  name: replacementCandidate.name ?? `Problem ${replacementCandidate.index}`,
                  position: oldP.position,
                  active: true,
                },
              });
            }
          } else {
            await tx.problem.create({
              data: {
                contestId: 0,
                index: String(Date.now()),
                matchId,
                rating: newRatingTarget,
                name: `Replacement (${newRatingTarget})`,
                position: oldP.position,
                active: true,
              },
            });
          }
        }
      });
    }

    // TUG MODE: Update tugCount based on solves
    if (match.mode === 'tug' && newSolves.length > 0) {
      const teamA = match.teams[0]?.color; // First team
      const teamB = match.teams[1]?.color; // Second team

      for (const solve of newSolves) {
        const problem = match.problems.find(
          p => p.contestId === solve.contestId && p.index === solve.index
        );
        const rating = problem?.rating ?? 0;

        // Update tugCount based on which team solved
        const currentCount = match.tugCount ?? 0;
        let newCount = currentCount;

        if (solve.team.toLowerCase() === teamA?.toLowerCase()) {
          newCount = currentCount + rating; // Team A increases count
        } else if (solve.team.toLowerCase() === teamB?.toLowerCase()) {
          newCount = currentCount - rating; // Team B decreases count
        }

        await prisma.match.update({
          where: { id: matchId },
          data: { tugCount: newCount },
        });

        // Update local match object for subsequent iterations
        match.tugCount = newCount;

        // For Type B (single), replace the problem
        if (match.tugType === 'single' && problem) {
          const allHandles = match.teams.flatMap(t => t.members).map(m => m.handle);
          const problemKeys = match.problems.filter(p => p.active).map(p => `${p.contestId}-${p.index}`);

          try {
            const replacementCandidate = await fetchReplacementProblem(
              problemKeys,
              match.minRating ?? 800,
              match.maxRating ?? 3500,
              allHandles
            );

            await prisma.$transaction(async (tx) => {
              // Deactivate old problem
              await tx.problem.update({
                where: { contestId_index_matchId: { contestId: problem.contestId, index: problem.index, matchId } },
                data: { active: false },
              });

              // Create new problem
              if (replacementCandidate) {
                const dup = await tx.problem.findFirst({
                  where: { contestId: replacementCandidate.contestId ?? 0, index: replacementCandidate.index ?? '', matchId }
                });
                if (!dup) {
                  await tx.problem.create({
                    data: {
                      contestId: replacementCandidate.contestId ?? 0,
                      index: replacementCandidate.index ?? String(Date.now()),
                      matchId,
                      rating: replacementCandidate?.rating ?? 800,
                      name: replacementCandidate.name ?? `Problem ${replacementCandidate.index}`,
                      position: problem.position,
                      active: true,
                    },
                  });
                }
              }
            });
          } catch (err) {
            console.error('Error fetching replacement problem in tug mode:', err);
          }
        }
      }

      // TUG MODE: Check additional win conditions
      const threshold = match.tugThreshold ?? 2000;
      const currentCount = match.tugCount ?? 0;
      const matchStart = new Date(match.startTime);
      const matchEnd = new Date(matchStart.getTime() + match.durationMinutes * 60 * 1000);
      const now = new Date();
      const matchHasEnded = now >= matchEnd;

      // Check if all grid problems are solved (for grid mode)
      const allGridProblemsSolved = match.tugType === 'grid' &&
        match.problems.every(p => {
          return match.solveLog.some(s => s.contestId === p.contestId && s.index === p.index);
        });

      // Win condition: time ends OR all grid problems solved
      // Team with positive count wins, or Team A if count is exactly 0
      // The TugOfWarDisplay will show this state
    }

    // TTR MODE: Award coins and replenish market
    if (match.mode === 'ttr' && newSolves.length > 0) {
      await prisma.$transaction(async (tx) => {
        const currentMatch = await tx.match.findUnique({
          where: { id: matchId },
          select: { ttrState: true, ttrParams: true }
        });

        if (!currentMatch?.ttrState) return;

        const state = currentMatch.ttrState as unknown as TTRState;
        const params = currentMatch.ttrParams as unknown as TTRParams;
        let stateChanged = false;

        for (const solve of newSolves) {
          // Find which problem was solved in the market
          const marketIdx = state.market.findIndex(p => p.contestId === solve.contestId && p.index === solve.index);

          if (marketIdx !== -1) {
            const problem = state.market[marketIdx];
            const playerTeam = solve.team;

            // Award coins
            const row = problem.row; // 0, 1, 2, 3
            const coins = row === 0 ? 2 : row === 1 ? 3 : row === 2 ? 4 : 5;

            if (state.players[playerTeam]) {
              state.players[playerTeam].coins += coins;
              state.players[playerTeam].score += 10;
            }

            // Remove from market
            state.market.splice(marketIdx, 1);

            // Replenish
            const levelMin = row === 0 ? params.level1.min : row === 1 ? params.level2.min : row === 2 ? params.level3.min : params.level4?.min ?? 1500;
            const levelMax = row === 0 ? params.level1.max : row === 1 ? params.level2.max : row === 2 ? params.level3.max : params.level4?.max ?? 3500;

            const allHandles = match.teams.flatMap(t => t.members).map(m => m.handle);
            try {
              const replacement = await fetchReplacementProblem(
                state.market.map(p => `${p.contestId}-${p.index}`),
                levelMin,
                levelMax,
                allHandles
              );

              if (replacement) {
                state.market.push({
                  ...replacement,
                  row: row,
                  col: 0,
                  points: 0,
                  type: 'PROGRAMMING'
                });
              }
            } catch (e) {
              console.error("Failed to replenish TTR market", e);
            }

            stateChanged = true;
          }
        }

        if (stateChanged) {
          await tx.match.update({
            where: { id: matchId },
            data: { ttrState: state as any }
          });
        }
      });
    }

    const updatedMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        problems: { where: { active: true }, orderBy: { position: 'asc' } },
        teams: { include: { members: true } },
        solveLog: { include: { problem: true }, orderBy: { timestamp: 'asc' } },
      },
    });
    return res.status(200).json({ updated: true, match: updatedMatch });
  } catch (err) {
    console.error('Error in poll-submissions:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
