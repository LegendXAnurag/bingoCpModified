export interface Match {
  id: string;
  startTime: string;
  durationMinutes: number;
  mode: "classic" | "replace" | "tug" | "ticket_ride";
  replaceIncrement: number;
  gridSize: number;
  teams: Team[];
  problems: ProblemCell[];
  solveLog: SolveEntry[];
  timeoutMinutes?: number | null;
  showRatings?: boolean;
  tugThreshold?: number;
  tugType?: string;
  tugCount?: number;

  // Ticket to Ride specific fields
  mapType?: string; // "usa" | "europe"
  problemLevels?: any; // ProblemLevel[] (JSON)
  tracksData?: any; // Track[] (JSON)
  stationsData?: any; // Station[] (JSON)
  routeCards?: any; // RouteCard assignments per team (JSON)
}

export interface Team {
  name: string;
  color: string;
  members: string[];

  // Ticket to Ride specific fields
  coins?: number;
  tracksUsed?: number;
  stationsUsed?: number;
  trackPoints?: number;
}

export interface ProblemCell {
  row: number;
  col: number;
  contestId: number;
  index: string;
  name: string;
  rating: number;
  link: string;
  claimedBy?: string;
  solvedBy?: string;
  active?: boolean;
  position: number;
}

export interface SolveEntry {
  handle: string;
  problem: {
    contestId: number;
    index: string;
  };
  team: string;
  timestamp: string;
}
