import { TTRState, TTRPlayerState, Track, City } from '@/app/types/match';
import { TRACKS } from './ttrData';

export function getTrackCost(track: Track): number {
    // 1 coin per length segment?
    // User said: "to build a track, you need to spend coins... length of track = cost"
    return track.length;
}

export function getTrackPoints(track: Track): number {
    // Standard TTR points:
    // 1: 1, 2: 2, 3: 4, 4: 7, 5: 10, 6: 15
    const lengths = [0, 1, 2, 4, 7, 10, 15, 18, 21]; // up to 8
    return lengths[track.length] || track.length;
}

export function canBuildTrack(state: TTRState, player: TTRPlayerState, trackId: string, track: Track): { possible: boolean; reason?: string } {
    if (!player) return { possible: false, reason: "Player not found" };

    const trackState = state.tracks[trackId];
    if (trackState && trackState.claimedBy) {
        return { possible: false, reason: "Track already claimed" };
    }

    // Check double route rules (if less than 4-5 players in standard, double routes might be single only, but we ignore for now)

    // Check cost
    const cost = getTrackCost(track);
    if (player.coins < cost) {
        return { possible: false, reason: `Not enough coins. Need ${cost}, have ${player.coins}` };
    }

    if (player.trainsLeft < track.length) {
        return { possible: false, reason: "Not enough trains left" };
    }

    return { possible: true };
}

export function buildTrack(state: TTRState, teamColor: string, trackId: string): TTRState | null {
    const player = state.players[teamColor];
    if (!player) return null;

    const track = TRACKS.find(t => t.id === trackId);
    if (!track) return null;

    const check = canBuildTrack(state, player, trackId, track);
    if (!check.possible) return null;

    // Deduct cost
    const cost = getTrackCost(track);
    player.coins -= cost;
    player.trainsLeft -= track.length;

    // Add points
    player.score += getTrackPoints(track);

    // Claim track
    if (!state.tracks[trackId]) {
        state.tracks[trackId] = { id: trackId, claimedBy: null };
    }
    state.tracks[trackId].claimedBy = teamColor;

    // Add to player routes (just IDs for now)
    player.routes.push(trackId);

    return state;
}

export function canBuildStation(state: TTRState, player: TTRPlayerState, cityId: string): { possible: boolean; reason?: string } {
    if (!player) return { possible: false, reason: "Player not found" };

    if (state.stations[cityId]) {
        return { possible: false, reason: "Station already exists in this city" };
    }

    if (player.stationsLeft <= 0) {
        return { possible: false, reason: "No stations left" };
    }

    // Cost: 4 - stationsLeft (1st costs 1, 2nd costs 2, 3rd costs 3)
    // Standard rules: 1st is 1, 2nd is 2, 3rd is 3.
    // If stationsLeft is 3, valid. Cost 1.
    // If stationsLeft is 2, valid. Cost 2.
    // If stationsLeft is 1, valid. Cost 3.
    const cost = 4 - player.stationsLeft;

    if (player.coins < cost) {
        return { possible: false, reason: `Not enough coins. Need ${cost}, have ${player.coins}` };
    }

    return { possible: true };
}

export function buildStation(state: TTRState, teamColor: string, cityId: string): TTRState | null {
    const player = state.players[teamColor];
    if (!player) return null;

    const check = canBuildStation(state, player, cityId);
    if (!check.possible) return null;

    const cost = 4 - player.stationsLeft;
    player.coins -= cost;
    player.stationsLeft -= 1;

    state.stations[cityId] = teamColor;

    return state;
}

// Longest path DFS logic can be added later if needed for scoring
