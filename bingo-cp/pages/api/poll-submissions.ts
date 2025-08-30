import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "../../src/app/lib/prisma"
import { checkSolvesLogic } from './checkSolvesLogic'
async function fetchReplacementProblem(exclude: string[], minRating?: number, maxRating?: number, handles?: string[] ) {
  try {
    const baseUrl = 'https://bingo-cp.vercel.app'; // UPDATE IT LATER
    const res = await fetch(`${baseUrl}/api/getProblems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        minRating: minRating ?? 800,
        maxRating: maxRating ?? 3500,
        userHandles: handles,
        count: 1,
        exclude: exclude
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.problems && data.problems[0]) ?? null;
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

     const old = await prisma.match.findUnique({ where: { id: matchId }, select: { id: true }});
    if (!old) {
      return res.status(404).json({ error: 'Match not found' })
    }
    const now = new Date();
    const cutoff = new Date(now.getTime() - 20 * 1000);
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
          solveLog: { include: { problem: true } },
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
        solveLog: { include: { problem: true }, orderBy: { timestamp: 'desc' } },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }
    // await fetch(`https://bingo-cp.vercel.app/api/poll-debug?matchId=${matchId}`);
    // await fetch("https://bingo-cp.vercel.app/api/poll-debug");
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
        for(const Solve of match.solveLog) {
          const newTime = new Date(claim.time * 1000);  
          if(Solve.contestId === contestId && Solve.index === index && Solve.team != claim.team) {
            if(Solve.timestamp.getTime() > newTime.getTime()) {
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
    if(changed.length > 0) {
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
          solveLog: {include: {problem: true}, orderBy: { timestamp: 'desc' }},
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
              if(!dup) {
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
    const updatedMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        problems: {where: {active: true}, orderBy: {position: 'asc'}},
        teams: { include: { members: true } },
        solveLog: {include: {problem: true}, orderBy: { timestamp: 'desc' } },
      },
    });
    return res.status(200).json({ updated: true, match: updatedMatch });
  } catch (err) {
    console.error('Error in poll-submissions:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
