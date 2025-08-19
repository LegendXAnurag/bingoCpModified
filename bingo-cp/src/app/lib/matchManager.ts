// src/app/lib/matchManager.ts

import type { Match, Team, Problem } from "../lib/types";

const matches: Record<string, Match> = {};

function createMatch(id: string, grid: Problem[][], teams: Team[]) {
  matches[id] = {
    id,
    grid,
    teams,
    claimed: [],
    solveLog: [], 
  };
}

function getMatch(id: string): Match | undefined {
  return matches[id];
}

function getAll(): Match[] {
  return Object.values(matches);
}

function claimSquare(
  matchId: string,
  handle: string,
  team: string,
  problem: Problem,
  submissionId: number,
  time: number
): boolean {
  const match = matches[matchId];
  if (!match) return false;

  
  for (let i = 0; i < match.grid.length; i++) {
    for (let j = 0; j < match.grid[i].length; j++) {
      const cell = match.grid[i][j];
      if (cell.contestId === problem.contestId && cell.index === problem.index) {

        const alreadyClaimed = match.claimed.some(
          (c) => c.row === i && c.col === j
        );
        if (!alreadyClaimed) {
          match.claimed.push({
            row: i,
            col: j,
            handle,
            team,
            problem,
            submissionId,
            time,
          });
          return true;
        }
      }
    }
  }

  return false;
}

export default {
  createMatch,
  getMatch,
  getAll,
  claimSquare,
};
