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
        <main className="min-h-screen pt-24 p-4 transition-colors duration-300">
            <div className="flex justify-center">
                <TugMatchCreationForm onMatchCreated={setMatch} />
            </div>
        </main>
    );
}
