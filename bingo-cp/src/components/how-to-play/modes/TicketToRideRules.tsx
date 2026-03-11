'use client';
import { TrainFront, Coins, Map, Ticket, Hourglass } from 'lucide-react';

export default function TicketToRideRules() {
    return (
        <div className="space-y-12">
            <section id="overview" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <TrainFront className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Ticket to Ride Overview</h2>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg mb-4">
                    Welcome to the grand rail network of Europe! Ticket to Ride blends CP with long-term strategy. You don't just solve problems to win; you solve problems to earn <strong className="text-emerald-400">Coins</strong>, which you then spend to claim train routes connecting major cities across the continent.
                </p>
            </section>

            <section id="economy" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Coins className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white">Economy & Coins</h2>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Everything revolves around Coins. At any given time, there are 4 active CF problems available in a designated problem pool. Solving these problems rewards your team with coins based on their difficulty.
                    </p>
                    <p className="text-gray-300 leading-relaxed text-sm text-gray-400">
                        <em className="text-white">Note: Problems periodically refresh, so if you're stuck, you can wait for the marketplace to cycle in new ones.</em>
                    </p>
                </div>
            </section>

            <section id="claiming-routes" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Map className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white">Claiming Routes</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                    The map is composed of edges (routes) connecting nodes (cities). Each route has a specific length, and its cost is equal to that length in coins.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                    Once you accumulate enough coins, you can spend them to claim an unclaimed route. Claiming a route locks it for your underlying team, barring opponents from traversing it. <span className="text-emerald-400">Claiming longer routes generally awards more baseline points.</span>
                </p>
            </section>

            <section id="tickets" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Ticket className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white">Tickets & Objectives</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                    At the start of the match, every team gets a starting hand of Tickets (e.g., 1 Long Route and 3 Short Routes). A Ticket represents a secret objective to connect two specific cities (e.g., London to Berlin).
                </p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                    <ul className="space-y-2 text-gray-300">
                        <li>• <strong className="text-white">Success:</strong> Connecting the two cities on a ticket awards you massive bonus points at the end of the game based on the ticket's value.</li>
                        <li>• <strong className="text-white">Failure:</strong> Failing to connect the two cities deducts the ticket's exact value from your final score!</li>
                    </ul>
                </div>
            </section>

            <section id="end-condition" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Hourglass className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-white">Game End Condition</h2>
                </div>
                <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-600/10 border border-emerald-500/30 rounded-2xl relative overflow-hidden">
                    <p className="text-gray-300 leading-relaxed relative z-10">
                        The game is strictly time-bound. It runs for a predetermined duration set during match creation. When the timer hits zero, the match ends immediately.
                    </p>
                    <p className="text-gray-300 leading-relaxed relative z-10 mt-4">
                        <strong>Scoring Phase:</strong> Final scores are calculated by summing up the points from claimed base routes, adding the values of completely connected Tickets, and subtracting the values of failed Tickets. The team with the highest final score wins!
                    </p>
                </div>
            </section>
        </div>
    );
}
