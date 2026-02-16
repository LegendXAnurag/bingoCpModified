// Type definitions for Ticket to Ride CP mode

export interface Point {
    x: number;
    y: number;
}

export interface City {
    id: string;
    name: string;
    x: number;
    y: number;
    size: "small" | "medium" | "large";
}

export interface Track {
    id: string;
    cityA: string;
    cityB: string;
    length: number; // 1-6
    controlPoints: Point[]; // Bezier curve control points
    claimedBy?: string; // Team name
}

export interface RouteCard {
    id: string;
    cityA: string;
    cityB: string;
    points: number;
    type: "long" | "short";
    completed?: boolean; // Track route completion status
}

export interface MapData {
    mapId: string;
    name: string;
    viewBox: string;
    cities: City[];
    tracks: Track[];
    routeCards: {
        long: RouteCard[];
        short: RouteCard[];
    };
}

export interface ProblemLevel {
    level: number;
    ratingMin: number;
    ratingMax: number;
    coinsAwarded: number;
    questionsCount: number;
}

export interface TTRProblem {
    contestId: number;
    index: string;
    name: string;
    rating: number;
    level: number;
    solvedBy?: string; // Team name
}

export interface Station {
    teamName: string;
    stationNumber: 1 | 2 | 3;
    cityId: string;
}

export interface TTRTeam {
    name: string;
    color: string;
    members: string[];

    // Resources
    coins: number;
    tracksUsed: number;
    stationsUsed: number;

    // Objectives
    routes: RouteCard[];

    // Scoring
    trackPoints: number;
    completedRoutePoints: number;
    incompleteRoutePoints: number;
    longestPathPoints: number;
    stationPoints: number;
    totalScore: number;
}

export interface TicketRideMatch {
    id: string;
    mode: "ticket_ride";
    startTime: string;
    durationMinutes: number;
    mapType: "usa" | "europe";

    // Problem configuration
    problemLevels: ProblemLevel[];

    // Teams
    teams: TTRTeam[];

    // Map state
    tracks: Track[];
    stations: Station[];

    // Problems
    problems: TTRProblem[];

    // Game state
    status: "pending" | "active" | "ended";
    winner?: string;
}

// Track length to points mapping (standard Ticket to Ride scoring)
export const TRACK_LENGTH_POINTS: Record<number, number> = {
    1: 1,
    2: 2,
    3: 4,
    4: 7,
    5: 10,
    6: 15,
};

// Team color options
export const TEAM_COLORS = {
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    orange: '#F97316',
} as const;

// Track styling constants
export const TRACK_STYLES = {
    unclaimed: {
        stroke: '#9CA3AF',
        strokeWidth: 6,
        strokeDasharray: '10,5',
        opacity: 0.6,
    },
    claimed: {
        strokeWidth: 8,
        strokeDasharray: '0',
        opacity: 1.0,
    },
} as const;

// City size radius mapping
export const CITY_SIZES = {
    small: 7,
    medium: 9,
    large: 12,
} as const;

// Animation duration (quick snaps)
export const ANIMATION_DURATION = 200; // ms
