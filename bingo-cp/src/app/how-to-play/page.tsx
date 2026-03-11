'use client';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Grid3x3, Swords, TrainFront, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

import Sidebar from '@/components/how-to-play/Sidebar';
import BingoRules from '@/components/how-to-play/modes/BingoRules';
import TugOfWarRules from '@/components/how-to-play/modes/TugOfWarRules';
import TicketToRideRules from '@/components/how-to-play/modes/TicketToRideRules';

const BINGO_SECTIONS = [
    { id: 'overview', title: 'Overview' },
    { id: 'claiming-tiles', title: 'Claiming Tiles' },
    { id: 'strategy', title: 'Strategy' },
    { id: 'end-condition', title: 'Game End Condition' },
];

const TUG_SECTIONS = [
    { id: 'overview', title: 'Overview' },
    { id: 'pulling-mechanics', title: 'Rope Mechanics' },
    { id: 'problem-selection', title: 'Problem Difficulties' },
    { id: 'strategy', title: 'Strategy' },
    { id: 'end-condition', title: 'Game End Condition' },
];

const TTR_SECTIONS = [
    { id: 'overview', title: 'Overview' },
    { id: 'economy', title: 'Economy & Coins' },
    { id: 'claiming-routes', title: 'Claiming Routes' },
    { id: 'tickets', title: 'Tickets & Objectives' },
    { id: 'end-condition', title: 'Game End Condition' },
];

export default function HowToPlayPage() {
    const [activeTab, setActiveTab] = useState('bingo');

    const getSidebarSections = () => {
        switch (activeTab) {
            case 'bingo': return BINGO_SECTIONS;
            case 'tug': return TUG_SECTIONS;
            case 'ttr': return TTR_SECTIONS;
            default: return BINGO_SECTIONS;
        }
    };

    return (
        <div className="relative min-h-screen pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white font-heading tracking-tight mb-4"
                    >
                        How to Play
                    </motion.h1>
                </div>

                {/* Main Content Area */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* Tabs Navigation */}
                    <div className="flex justify-center mb-12">
                        <TabsList className="bg-white/5 border border-white/10 p-1">
                            <TabsTrigger value="bingo" className="flex items-center gap-2 px-6 py-2">
                                <Grid3x3 className="w-4 h-4" />
                                <span>Bingo</span>
                            </TabsTrigger>
                            <TabsTrigger value="tug" className="flex items-center gap-2 px-6 py-2">
                                <Swords className="w-4 h-4" />
                                <span>Tug of War</span>
                            </TabsTrigger>
                            <TabsTrigger value="ttr" className="flex items-center gap-2 px-6 py-2">
                                <TrainFront className="w-4 h-4" />
                                <span>Ticket to Ride</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 relative animate-in fade-in duration-500 items-start">
                        {/* Sidebar (sticky) */}
                        <Sidebar sections={getSidebarSections()} />

                        {/* Content Area */}
                        <div className="flex-1 max-w-3xl pb-32">
                            <TabsContent value="bingo" className="mt-0">
                                <BingoRules />
                            </TabsContent>
                            <TabsContent value="tug" className="mt-0">
                                <TugOfWarRules />
                            </TabsContent>
                            <TabsContent value="ttr" className="mt-0">
                                <TicketToRideRules />
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>

            </div>
        </div>
    );
}
