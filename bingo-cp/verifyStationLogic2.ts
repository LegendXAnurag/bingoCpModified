
// Mock Interfaces to match ttrLogic requirements
interface TTRState {
    players: Record<string, TTRPlayerState>;
    tracks: Record<string, TTRTrackState>;
    market: any[];
    allProbs: any[];
    ticketDeck: string[];
    mapData?: {
        cities: any[];
        tracks: Track[];
        imageUrl: string;
        width: number;
        height: number;
        tickets: any[];
    };
}

interface TTRPlayerState {
    team: string;
    coins: number;
    trainsLeft: number;
    score: number;
    routes: string[];
    destinations: string[];
    stationsLeft: number;
}

interface TTRTrackState {
    id: string;
    claimedBy: string | null;
    stationedBy?: string[];
}

interface Track {
    id: string;
    city1: string;
    city2: string;
    length: number;
    color?: string;
    double?: boolean;
}

// Logic from ttrLogic.ts (Modified to remove external dependencies)

function getTrackCost(track: Track): number {
    return track.length;
}

function getTrackPoints(track: Track): number {
    const lengths = [0, 1, 2, 4, 7, 10, 15, 18, 21]; // up to 8
    return lengths[track.length] || track.length;
}

function findTrack(state: TTRState, trackId: string): Track | undefined {
    if (state.mapData) {
        return state.mapData.tracks.find(t => t.id === trackId);
    }
    return undefined; // In this mock we only use mapData
}

function canBuildTrack(state: TTRState, player: TTRPlayerState, trackId: string): { possible: boolean; reason?: string } {
    if (!player) return { possible: false, reason: "Player not found" };

    const track = findTrack(state, trackId);
    if (!track) return { possible: false, reason: "Track invalid" };

    const trackState = state.tracks[trackId];
    if (trackState && trackState.claimedBy) {
        return { possible: false, reason: "Track already claimed" };
    }

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

function buildTrack(state: TTRState, teamColor: string, trackId: string): TTRState | null {
    const player = state.players[teamColor];
    if (!player) return null;

    const track = findTrack(state, trackId);
    if (!track) return null;

    const check = canBuildTrack(state, player, trackId);
    if (!check.possible) return null;

    // Deduct cost
    const cost = getTrackCost(track);
    player.coins -= cost;
    player.trainsLeft -= track.length;

    // Add points
    player.score += getTrackPoints(track);

    // Claim track
    if (!state.tracks[trackId]) {
        state.tracks[trackId] = { id: trackId, claimedBy: null, stationedBy: [] };
    }
    state.tracks[trackId].claimedBy = teamColor;

    // Add to player routes (just IDs for now)
    player.routes.push(trackId);

    return state;
}

function canBuildStation(state: TTRState, player: TTRPlayerState, trackId: string): { possible: boolean; reason?: string } {
    if (!player) return { possible: false, reason: "Player not found" };

    const track = findTrack(state, trackId);
    if (!track) return { possible: false, reason: "Track invalid" };

    const trackState = state.tracks[trackId];

    // Must be claimed by someone to build a station (allows sharing)
    if (!trackState || !trackState.claimedBy) {
        return { possible: false, reason: "Track must be claimed to build a station" };
    }

    // Cannot build station if you already claimed the track (you already use it)
    if (trackState.claimedBy === player.team) {
        return { possible: false, reason: "You already own this track" };
    }

    // Check if player already has a station here
    if (trackState.stationedBy && trackState.stationedBy.includes(player.team)) {
        return { possible: false, reason: "You already have a station on this track" };
    }

    if (player.stationsLeft <= 0) {
        return { possible: false, reason: "No stations left" };
    }

    // Cost: 4 - stationsLeft (1st costs 1, 2nd costs 2, 3rd costs 3)
    const cost = 4 - player.stationsLeft;

    if (player.coins < cost) {
        return { possible: false, reason: `Not enough coins. Need ${cost}, have ${player.coins}` };
    }

    return { possible: true };
}

function buildStation(state: TTRState, teamColor: string, trackId: string): TTRState | null {
    const player = state.players[teamColor];
    if (!player) return null;

    const check = canBuildStation(state, player, trackId);
    if (!check.possible) return null;

    const cost = 4 - player.stationsLeft;
    player.coins -= cost;
    player.stationsLeft -= 1;

    if (!state.tracks[trackId]) {
        // Should exist if claimed, but for safety
        state.tracks[trackId] = { id: trackId, claimedBy: null, stationedBy: [] };
    }

    if (!state.tracks[trackId].stationedBy) {
        state.tracks[trackId].stationedBy = [];
    }

    state.tracks[trackId].stationedBy!.push(teamColor);

    return state;
}

// --- Verification Logic ---

// Mock Data
const mockState: TTRState = {
    players: {
        'red': { team: 'red', coins: 10, trainsLeft: 10, score: 0, routes: [], destinations: [], stationsLeft: 3 },
        'blue': { team: 'blue', coins: 10, trainsLeft: 10, score: 0, routes: [], destinations: [], stationsLeft: 3 }
    },
    tracks: {},
    market: [],
    allProbs: [],
    ticketDeck: []
};

// Mock Tracks
mockState.mapData = {
    cities: [],
    tracks: [
        { id: 't1', city1: 'c1', city2: 'c2', length: 2 },
        { id: 't2', city1: 'c2', city2: 'c3', length: 3 }
    ],
    imageUrl: '',
    width: 1000,
    height: 1000,
    tickets: []
};

console.log("--- Starting Verification (Self-Contained) ---");

// 1. Test: Blue claims track t1
console.log("1. Blue claims track t1...");
buildTrack(mockState, 'blue', 't1');
const t1 = mockState.tracks['t1'];
if (t1?.claimedBy === 'blue') console.log("   PASS: T1 claimed by blue");
else console.error("   FAIL: T1 not claimed by blue");

// 2. Test: Red tries to station unowned track t2
console.log("2. Red tries to station unclaimed track t2...");
const check2 = canBuildStation(mockState, mockState.players['red'], 't2');
if (!check2.possible && check2.reason?.includes("claimed")) console.log("   PASS: Correctly rejected (must be claimed)");
else console.error(`   FAIL: Unexpected result: ${JSON.stringify(check2)}`);

// 3. Test: Red tries to station Blue's track t1
console.log("3. Red tries to station Blue's track t1...");
const check3 = canBuildStation(mockState, mockState.players['red'], 't1');
if (check3.possible) console.log("   PASS: Allowed to station on opponent track");
else console.error(`   FAIL: Rejected: ${check3.reason}`);

// 4. Test: Red builds station on t1
console.log("4. Red builds station on t1...");
buildStation(mockState, 'red', 't1');
if (mockState.tracks['t1'].stationedBy?.includes('red')) console.log("   PASS: Red station added to T1");
else console.error("   FAIL: Red station not found on T1");
if (mockState.players['red'].stationsLeft === 2) console.log("   PASS: Red stations left decremented");
else console.error("   FAIL: Red stations left not decremented");
if (mockState.players['red'].coins === 9) console.log("   PASS: Red coins decremented (cost 1)"); // 4 - 3 = 1
else console.error(`   FAIL: Red coins wrong: ${mockState.players['red'].coins}`);

// 5. Test: Red tries to build ANOTHER station on t1
console.log("5. Red tries to build another station on t1...");
const check5 = canBuildStation(mockState, mockState.players['red'], 't1');
if (!check5.possible && check5.reason?.includes("already have a station")) console.log("   PASS: Correctly rejected duplicate station");
else console.error(`   FAIL: Should be rejected: ${JSON.stringify(check5)}`);

// 6. Test: Blue tries to station their own track t1
console.log("6. Blue tries to station their own track t1...");
const check6 = canBuildStation(mockState, mockState.players['blue'], 't1');
if (!check6.possible && check6.reason?.includes("own this track")) console.log("   PASS: Correctly rejected stationing own track");
else console.error(`   FAIL: Should be rejected: ${JSON.stringify(check6)}`);

console.log("--- Verification Complete ---");
