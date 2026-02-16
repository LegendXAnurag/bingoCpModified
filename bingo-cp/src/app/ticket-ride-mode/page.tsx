'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProblemLevel } from '../types/ticketRide';

export default function TicketRideModePage() {
    const router = useRouter();
    const [teams, setTeams] = useState([
        { name: 'Team Red', color: 'red', members: [''] },
        { name: 'Team Blue', color: 'blue', members: [''] },
    ]);
    const [durationMinutes, setDurationMinutes] = useState(120);
    const [mapType, setMapType] = useState<'usa' | 'europe'>('usa');

    // Default problem levels
    const [problemLevels, setProblemLevels] = useState<ProblemLevel[]>([
        { level: 1, ratingMin: 800, ratingMax: 900, coinsAwarded: 2, questionsCount: 5 },
        { level: 2, ratingMin: 1000, ratingMax: 1100, coinsAwarded: 3, questionsCount: 5 },
        { level: 3, ratingMin: 1200, ratingMax: 1400, coinsAwarded: 4, questionsCount: 5 },
        { level: 4, ratingMin: 1500, ratingMax: 2000, coinsAwarded: 5, questionsCount: 5 },
    ]);

    const [loading, setLoading] = useState(false);

    const handleAddTeam = () => {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const usedColors = teams.map(t => t.color);
        const availableColor = colors.find(c => !usedColors.includes(c)) || 'gray';

        setTeams([...teams, { name: `Team ${teams.length + 1}`, color: availableColor, members: [''] }]);
    };

    const handleRemoveTeam = (index: number) => {
        if (teams.length > 2) {
            setTeams(teams.filter((_, i) => i !== index));
        }
    };

    const handleUpdateTeam = (index: number, field: 'name' | 'color', value: string) => {
        const updated = [...teams];
        updated[index][field] = value;
        setTeams(updated);
    };

    const handleUpdateMember = (teamIndex: number, memberIndex: number, value: string) => {
        const updated = [...teams];
        updated[teamIndex].members[memberIndex] = value;
        setTeams(updated);
    };

    const handleAddMember = (teamIndex: number) => {
        const updated = [...teams];
        updated[teamIndex].members.push('');
        setTeams(updated);
    };

    const handleRemoveMember = (teamIndex: number, memberIndex: number) => {
        const updated = [...teams];
        if (updated[teamIndex].members.length > 1) {
            updated[teamIndex].members.splice(memberIndex, 1);
            setTeams(updated);
        }
    };

    const handleUpdateLevel = (index: number, field: keyof ProblemLevel, value: number) => {
        const updated = [...problemLevels];
        updated[index] = { ...updated[index], [field]: value };
        setProblemLevels(updated);
    };

    const handleAddLevel = () => {
        setProblemLevels([
            ...problemLevels,
            { level: problemLevels.length + 1, ratingMin: 1600, ratingMax: 2000, coinsAwarded: 6, questionsCount: 5 },
        ]);
    };

    const handleRemoveLevel = (index: number) => {
        if (problemLevels.length > 2) {
            setProblemLevels(problemLevels.filter((_, i) => i !== index));
        }
    };

    const handleCreateMatch = async () => {
        setLoading(true);
        try {
            // Validate teams have members
            const validTeams = teams.filter(t => t.members.some(m => m.trim() !== ''));
            if (validTeams.length < 2) {
                alert('At least 2 teams with members are required');
                setLoading(false);
                return;
            }

            // Clean up empty member handles
            const cleanedTeams = validTeams.map(team => ({
                ...team,
                members: team.members.filter(m => m.trim() !== ''),
            }));

            // Validate Codeforces handles
            for (const team of cleanedTeams) {
                for (const member of team.members) {
                    const res = await fetch(`https://codeforces.com/api/user.info?handles=${member}`);
                    const data = await res.json();

                    if (data.status !== 'OK') {
                        alert(`Invalid Codeforces handle: ${member}`);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Create start time (immediate start for now)
            const startTime = new Date();

            // Call API to create match
            const response = await fetch('/api/createTicketRideMatch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teams: cleanedTeams,
                    startTime: startTime.toISOString(),
                    durationMinutes,
                    mapType,
                    problemLevels,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('Match creation failed:', error);
                alert(`Failed to create match: ${error}`);
                setLoading(false);
                return;
            }

            const result = await response.json();
            const matchId = result.id;

            // Redirect to match page
            router.push(`/ticket-ride-match/${matchId}`);
        } catch (error) {
            console.error('Error creating match:', error);
            alert('Failed to create match. Please check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 pt-8 pb-16">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        🚂 Ticket to Ride CP
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Solve problems to earn coins, claim tracks, and complete routes!
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
                    {/* Match Settings */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Match Settings</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    min={30}
                                    max={300}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    Map
                                </label>
                                <select
                                    value={mapType}
                                    onChange={(e) => setMapType(e.target.value as 'usa' | 'europe')}
                                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="usa">USA</option>
                                    <option value="europe" disabled>Europe (Coming Soon)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Teams */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Teams</h2>
                            <button
                                onClick={handleAddTeam}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                                disabled={teams.length >= 6}
                            >
                                + Add Team
                            </button>
                        </div>

                        <div className="space-y-4">
                            {teams.map((team, teamIdx) => (
                                <div key={teamIdx} className="p-4 border-2 rounded-lg dark:border-gray-700" style={{ borderColor: team.color }}>
                                    <div className="flex items-center gap-4 mb-3">
                                        <input
                                            type="text"
                                            value={team.name}
                                            onChange={(e) => handleUpdateTeam(teamIdx, 'name', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            placeholder="Team name"
                                        />
                                        <select
                                            value={team.color}
                                            onChange={(e) => handleUpdateTeam(teamIdx, 'color', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="red">Red</option>
                                            <option value="blue">Blue</option>
                                            <option value="green">Green</option>
                                            <option value="yellow">Yellow</option>
                                            <option value="purple">Purple</option>
                                            <option value="orange">Orange</option>
                                        </select>
                                        {teams.length > 2 && (
                                            <button
                                                onClick={() => handleRemoveTeam(teamIdx)}
                                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Members (Codeforces handles):</label>
                                        {team.members.map((member, memberIdx) => (
                                            <div key={memberIdx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={member}
                                                    onChange={(e) => handleUpdateMember(teamIdx, memberIdx, e.target.value)}
                                                    className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                    placeholder="Codeforces handle"
                                                />
                                                {team.members.length > 1 && (
                                                    <button
                                                        onClick={() => handleRemoveMember(teamIdx, memberIdx)}
                                                        className="px-2 py-1 text-red-600 hover:text-red-800"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => handleAddMember(teamIdx)}
                                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                        >
                                            + Add member
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Problem Levels */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Problem Levels</h2>
                            <button
                                onClick={handleAddLevel}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold"
                                disabled={problemLevels.length >= 6}
                            >
                                + Add Level
                            </button>
                        </div>

                        <div className="space-y-3">
                            {problemLevels.map((level, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg w-20">Level {level.level}</span>
                                        <input
                                            type="number"
                                            value={level.ratingMin}
                                            onChange={(e) => handleUpdateLevel(idx, 'ratingMin', Number(e.target.value))}
                                            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                            placeholder="Min"
                                        />
                                        <span>-</span>
                                        <input
                                            type="number"
                                            value={level.ratingMax}
                                            onChange={(e) => handleUpdateLevel(idx, 'ratingMax', Number(e.target.value))}
                                            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                            placeholder="Max"
                                        />
                                        <span className="mx-2">→</span>
                                        <input
                                            type="number"
                                            value={level.coinsAwarded}
                                            onChange={(e) => handleUpdateLevel(idx, 'coinsAwarded', Number(e.target.value))}
                                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        />
                                        <span className="text-yellow-600">💰 coins</span>
                                        <span className="mx-2">|</span>
                                        <input
                                            type="number"
                                            value={level.questionsCount}
                                            onChange={(e) => handleUpdateLevel(idx, 'questionsCount', Number(e.target.value))}
                                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        />
                                        <span>problems</span>
                                        {problemLevels.length > 2 && (
                                            <button
                                                onClick={() => handleRemoveLevel(idx)}
                                                className="ml-auto px-2 py-1 text-red-600 hover:text-red-800"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Create Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleCreateMatch}
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xl font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Match...' : '🚂 Create Match'}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
