
import { canBuildStation, buildStation, buildTrack } from './src/lib/ttrLogic';
import { TTRState, TTRPlayerState, TTRTrackState, Track } from './src/app/types/match';

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

// Mock Tracks (normally in data, but logic might look them up)
// For test, we need to ensure findTrack works. logic imports TRACKS. 
// We can just rely on the fact that logic uses state.mapData if present.
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

console.log("--- Starting Verification ---");

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
