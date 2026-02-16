// Game logic utilities for Ticket to Ride CP
import { Track, Station, TTRTeam, RouteCard, TRACK_LENGTH_POINTS } from '../types/ticketRide';

/**
 * Build a graph representation from tracks
 */
function buildGraph(tracks: Track[], stations: Station[], teamName: string): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    // Add edges from owned tracks
    tracks.forEach((track) => {
        if (track.claimedBy === teamName) {
            if (!graph.has(track.cityA)) graph.set(track.cityA, new Set());
            if (!graph.has(track.cityB)) graph.set(track.cityB, new Set());

            graph.get(track.cityA)!.add(track.cityB);
            graph.get(track.cityB)!.add(track.cityA);
        }
    });

    // Add edges from station-borrowed tracks
    stations.forEach((station) => {
        if (station.teamName === teamName) {
            // Find tracks connected to this city that belong to opponents
            tracks.forEach((track) => {
                if (track.claimedBy && track.claimedBy !== teamName) {
                    if (track.cityA === station.cityId || track.cityB === station.cityId) {
                        const otherCity = track.cityA === station.cityId ? track.cityB : track.cityA;

                        if (!graph.has(station.cityId)) graph.set(station.cityId, new Set());
                        if (!graph.has(otherCity)) graph.set(otherCity, new Set());

                        graph.get(station.cityId)!.add(otherCity);
                        graph.get(otherCity)!.add(station.cityId);
                    }
                }
            });
        }
    });

    return graph;
}

/**
 * Check if a path exists between two cities using BFS
 */
export function hasPath(
    graph: Map<string, Set<string>>,
    start: string,
    end: string
): boolean {
    if (start === end) return true;
    if (!graph.has(start)) return false;

    const visited = new Set<string>();
    const queue: string[] = [start];
    visited.add(start);

    while (queue.length > 0) {
        const current = queue.shift()!;

        if (current === end) return true;

        const neighbors = graph.get(current);
        if (neighbors) {
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
    }

    return false;
}

/**
 * Check if a route is completed
 */
export function isRouteComplete(
    route: RouteCard,
    tracks: Track[],
    stations: Station[],
    teamName: string
): boolean {
    const graph = buildGraph(tracks, stations, teamName);
    return hasPath(graph, route.cityA, route.cityB);
}

/**
 * Find longest continuous path using DFS
 */
function dfsLongestPath(
    graph: Map<string, Set<string>>,
    current: string,
    visited: Set<string>,
    trackLengths: Map<string, number>
): number {
    visited.add(current);

    let maxLength = 0;
    const neighbors = graph.get(current);

    if (neighbors) {
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                const edgeKey1 = `${current}-${neighbor}`;
                const edgeKey2 = `${neighbor}-${current}`;
                const edgeLength = trackLengths.get(edgeKey1) || trackLengths.get(edgeKey2) || 1;

                const pathLength = edgeLength + dfsLongestPath(graph, neighbor, new Set(visited), trackLengths);
                maxLength = Math.max(maxLength, pathLength);
            }
        }
    }

    return maxLength;
}

/**
 * Calculate longest continuous path for a team
 */
export function calculateLongestPath(tracks: Track[], teamName: string): number {
    const graph = new Map<string, Set<string>>();
    const trackLengths = new Map<string, number>();

    // Build graph and track lengths map
    tracks.forEach((track) => {
        if (track.claimedBy === teamName) {
            if (!graph.has(track.cityA)) graph.set(track.cityA, new Set());
            if (!graph.has(track.cityB)) graph.set(track.cityB, new Set());

            graph.get(track.cityA)!.add(track.cityB);
            graph.get(track.cityB)!.add(track.cityA);

            trackLengths.set(`${track.cityA}-${track.cityB}`, track.length);
            trackLengths.set(`${track.cityB}-${track.cityA}`, track.length);
        }
    });

    let maxPath = 0;

    // Try DFS from each node
    for (const city of graph.keys()) {
        const pathLength = dfsLongestPath(graph, city, new Set(), trackLengths);
        maxPath = Math.max(maxPath, pathLength);
    }

    return maxPath;
}

/**
 * Calculate team score
 */
export function calculateTeamScore(
    team: TTRTeam,
    tracks: Track[],
    allTeams: TTRTeam[]
): {
    trackPoints: number;
    completedRoutePoints: number;
    incompleteRoutePoints: number;
    longestPathPoints: number;
    stationPoints: number;
    totalScore: number;
} {
    // Track points (already calculated when claiming)
    const trackPoints = team.trackPoints;

    // Route points
    const completedRoutes = team.routes.filter((r) => r.completed);
    const incompleteRoutes = team.routes.filter((r) => !r.completed);

    const completedRoutePoints = completedRoutes.reduce((sum, r) => sum + r.points, 0);
    const incompleteRoutePoints = incompleteRoutes.reduce((sum, r) => sum + r.points, 0);

    // Longest path bonus
    const teamLongestPath = calculateLongestPath(tracks, team.name);
    const maxLongestPath = Math.max(...allTeams.map((t) => calculateLongestPath(tracks, t.name)));
    const longestPathPoints = teamLongestPath === maxLongestPath && teamLongestPath > 0 ? 10 : 0;

    // Station points
    const unusedStations = 3 - team.stationsUsed;
    const stationPoints = unusedStations * 4;

    // Total score
    const totalScore =
        trackPoints +
        completedRoutePoints -
        incompleteRoutePoints +
        longestPathPoints +
        stationPoints;

    return {
        trackPoints,
        completedRoutePoints,
        incompleteRoutePoints: -incompleteRoutePoints,
        longestPathPoints,
        stationPoints,
        totalScore,
    };
}

/**
 * Validate track claim
 */
export function validateTrackClaim(
    trackId: string,
    teamName: string,
    team: TTRTeam,
    tracks: Track[]
): { valid: boolean; error?: string } {
    const track = tracks.find((t) => t.id === trackId);

    if (!track) {
        return { valid: false, error: 'Track not found' };
    }

    if (track.claimedBy) {
        return { valid: false, error: 'Track already claimed' };
    }

    const cost = track.length;
    if (team.coins < cost) {
        return { valid: false, error: `Not enough coins (need ${cost}, have ${team.coins})` };
    }

    const newTracksUsed = team.tracksUsed + track.length;
    if (newTracksUsed > 45) {
        return { valid: false, error: `Track limit exceeded (would be ${newTracksUsed}/45)` };
    }

    return { valid: true };
}

/**
 * Process track claim
 */
export function processTrackClaim(
    trackId: string,
    teamName: string,
    team: TTRTeam,
    tracks: Track[]
): {
    updatedTeam: TTRTeam;
    updatedTracks: Track[];
} {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) throw new Error('Track not found');

    const cost = track.length;
    const points = TRACK_LENGTH_POINTS[track.length as keyof typeof TRACK_LENGTH_POINTS] || 0;

    // Update team
    const updatedTeam: TTRTeam = {
        ...team,
        coins: team.coins - cost,
        tracksUsed: team.tracksUsed + track.length,
        trackPoints: team.trackPoints + points,
    };

    // Update tracks
    const updatedTracks = tracks.map((t) =>
        t.id === trackId ? { ...t, claimedBy: teamName } : t
    );

    return { updatedTeam, updatedTracks };
}

/**
 * Validate station placement
 */
export function validateStationPlacement(
    cityId: string,
    teamName: string,
    team: TTRTeam,
    tracks: Track[],
    stations: Station[]
): { valid: boolean; error?: string; cost?: number } {
    if (team.stationsUsed >= 3) {
        return { valid: false, error: 'Maximum 3 stations allowed' };
    }

    // Check if city has opponent tracks
    const hasOpponentTracks = tracks.some(
        (track) =>
            track.claimedBy &&
            track.claimedBy !== teamName &&
            (track.cityA === cityId || track.cityB === cityId)
    );

    if (!hasOpponentTracks) {
        return { valid: false, error: 'No opponent tracks at this city' };
    }

    // Check if station already placed at this city
    const alreadyHasStation = stations.some(
        (station) => station.teamName === teamName && station.cityId === cityId
    );

    if (alreadyHasStation) {
        return { valid: false, error: 'Station already placed at this city' };
    }

    // Calculate cost (1, 2, or 3 coins based on station number)
    const cost = team.stationsUsed + 1;

    if (team.coins < cost) {
        return { valid: false, error: `Not enough coins (need ${cost}, have ${team.coins})` };
    }

    return { valid: true, cost };
}

/**
 * Process station placement
 */
export function processStationPlacement(
    cityId: string,
    teamName: string,
    team: TTRTeam,
    stations: Station[]
): {
    updatedTeam: TTRTeam;
    updatedStations: Station[];
} {
    const cost = team.stationsUsed + 1;
    const stationNumber = (team.stationsUsed + 1) as 1 | 2 | 3;

    const newStation: Station = {
        teamName,
        stationNumber,
        cityId,
    };

    const updatedTeam: TTRTeam = {
        ...team,
        coins: team.coins - cost,
        stationsUsed: team.stationsUsed + 1,
    };

    const updatedStations = [...stations, newStation];

    return { updatedTeam, updatedStations };
}

/**
 * Update route completion status for all teams
 */
export function updateRouteCompletions(
    teams: TTRTeam[],
    tracks: Track[],
    stations: Station[]
): TTRTeam[] {
    return teams.map((team) => {
        const updatedRoutes = team.routes.map((route) => ({
            ...route,
            completed: isRouteComplete(route, tracks, stations, team.name),
        }));

        return {
            ...team,
            routes: updatedRoutes,
        };
    });
}
