'use client';
import { Swords, Rocket, Activity, FlagTriangleRight, Zap } from 'lucide-react';

export default function TugOfWarRules() {
    return (
        <div className="space-y-12">
            <section id="overview" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                        <Swords className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Tug of War Overview</h2>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg mb-4">
                    Tug of War is an intense 1v1 (or Team vs Team) battle where you physically pull a rope towards your side by solving algorithmic challenges. Harder problems yield a stronger pull.
                </p>
            </section>

            <section id="pulling-mechanics" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-6 h-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-white">Rope Mechanics</h2>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                    <p className="text-gray-300 leading-relaxed">
                        The match starts with the rope flag dead center (0 score context). Resolving a Codeforces problem pulls the flag towards your territory based on the problem's rating. For example, solving an 800-rated problem might give a minor pull, while a 1500-rated problem gives a massive heave.
                    </p>
                </div>
            </section>

            <section id="problem-selection" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-6 h-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-white">Problem Difficulties</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                    Unlike Bingo where you are locked to a grid, in Tug of War (Classic Mode), you can solve *any* valid problem on Codeforces within a rating range, giving you the freedom to play to your absolute strengths. You can also play the "Grid" variant, which combines Tug of War mechanics with a constrained list of problems.
                </p>
            </section>

            <section id="strategy" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Rocket className="w-6 h-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-white">Strategic Pulling</h2>
                </div>
                <ul className="space-y-4">
                    <li className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <strong className="text-white block mb-1">Quantity vs Quality:</strong> Do you solve five 800-level problems quickly to slowly drag the rope, or do you dedicate 20 minutes to a 1600-level problem to completely eclipse your opponent's progress?
                    </li>
                    <li className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <strong className="text-white block mb-1">Momentum:</strong> Don't let your opponent gain too much ground early, or you'll be forced to hit increasingly harder problems just to stay alive.
                    </li>
                </ul>
            </section>

            <section id="end-condition" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <FlagTriangleRight className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-white">Game End Condition</h2>
                </div>
                <div className="p-6 bg-gradient-to-r from-red-500/10 to-orange-600/10 border border-red-500/30 rounded-2xl relative overflow-hidden">
                    <p className="text-gray-300 leading-relaxed relative z-10">
                        The game ends instantly when a team pulls the rope past the <strong>Tug Threshold Win Line</strong>. If neither side crosses the threshold before the time limit expires, the team holding the rope on their side of the center line wins. If it's exactly in the center at time's up, it's a draw.
                    </p>
                </div>
            </section>
        </div>
    );
}
