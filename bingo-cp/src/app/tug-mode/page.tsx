'use client';
import { useState } from 'react';
import TugMatchCreationForm from '../TugMatchCreationForm';
import { Match } from '../types/match';
import NavBar from '../components/NavBar';

export default function TugModePage() {
    const [match, setMatch] = useState<Match | null>(null);

    if (match) {
        // Match created, redirect handled by the form
        return null;
    }

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
            <NavBar />

            {/* Title */}
            <div className="text-center mt-8">
                <h2 className="text-3xl font-bold mb-6">Create Tug of War Match</h2>
            </div>

            {/* Match creation UI */}
            <div className="flex justify-center mt-8">
                <TugMatchCreationForm onMatchCreated={setMatch} />
            </div>
        </main>
    );
}
