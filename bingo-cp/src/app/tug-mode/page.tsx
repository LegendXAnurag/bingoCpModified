'use client';
import { useState } from 'react';
import TugMatchCreationForm from './TugMatchCreationForm';
import { Match } from '../types/match';

export default function TugModePage() {
    const [match, setMatch] = useState<Match | null>(null);

    if (match) {
        // Match created, redirect handled by the form
        return null;
    }

    return (
        <main className="min-h-screen bg-white pt-8 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 p-4">
            <div className="flex justify-center">
                <TugMatchCreationForm onMatchCreated={setMatch} />
            </div>
        </main>
    );
}
