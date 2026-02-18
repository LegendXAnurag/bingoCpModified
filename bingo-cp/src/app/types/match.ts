export interface Match {
  id: string;
  startTime: string;
  durationMinutes: number;
  mode: "classic" | "replace" | "tug" | "ttr";
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
  ttrState?: TTRState;
  ttrParams?: TTRParams;
}

export interface Team {
  name: string;
  color: string;
  members: string[];
}

export interface ProblemCell {
  row: number;
  col: number;
  contestId: number;
  index: string;
  name: string;
  rating: number;
  link?: string;
  claimedBy?: string;
  solvedBy?: string;
  active?: boolean;
  position?: number;
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

export interface TTRParams {
  level1: { min: number; max: number; count: number };
  level2: { min: number; max: number; count: number };
  level3: { min: number; max: number; count: number };
  level4?: { min: number; max: number; count: number };
  gameDurationMinutes: number;
}

export interface TTRState {
  players: Record<string, TTRPlayerState>;
  tracks: Record<string, TTRTrackState>;
  stations: Record<string, string>;
  market: ProblemCell[];
  allProbs: ProblemCell[];
  ticketDeck: string[]; // IDs of tickets remaining in deck
  mapData?: {
    cities: City[];
    tracks: Track[];
    imageUrl: string;
    width: number;
    height: number;
    tickets: Ticket[];
  };
}

export interface TTRPlayerState {
  team: string;
  coins: number;
  trainsLeft: number;
  score: number;
  routes: string[];
  destinations: string[]; // IDs of owned tickets
  stationsLeft: number;
}

export interface TTRTrackState {
  id: string;
  claimedBy: string | null;
}

export interface City {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface Track {
  id: string;
  city1: string;
  city2: string;
  length: number;
  color?: string;
  double?: boolean;
  units?: any[]; // For custom map track segments
}

export interface Ticket {
  id: string;
  city1: string;
  city2: string;
  points: number;
  type?: 'long' | 'short';
}
