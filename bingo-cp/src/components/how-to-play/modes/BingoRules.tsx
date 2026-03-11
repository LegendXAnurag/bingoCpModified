'use client';
import { Grid3x3, CheckCircle2, Trophy, Crosshair, Users } from 'lucide-react';

export default function BingoRules() {
    return (
        <div className="space-y-12">
            <section id="overview" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                        <Grid3x3 className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Bingo Overview</h2>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg mb-4">
                    Bingo is a classic multiplayer game transformed into a competitive programming arena. The battlefield is a 5×5 grid of carefully curated Codeforces problems. Your goal is simple: solve problems to claim tiles, and complete lines to win.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-3">Key Mechanics</h3>
                    <ul className="space-y-3">
                        <li className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                            <span className="text-gray-300">Each cell represents a unique Codeforces problem with a specific difficulty rating.</span>
                        </li>
                        <li className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                            <span className="text-gray-300">Multiple teams can participate in the same match room concurrently.</span>
                        </li>
                    </ul>
                </div>
            </section>

            <section id="claiming-tiles" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Crosshair className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-2xl font-bold text-white">Claiming Tiles</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                    When you solve a problem on Codeforces, our system automatically verifies your submission in real-time. If the submission is accepted ("AC"), your team instantly claims that tile.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                    <strong className="text-white">The twist:</strong> Only the first team to solve a problem gets the tile! Once a tile is claimed, it is locked out for everyone else. Speed and strategic problem selection are crucial.
                </p>
            </section>

            <section id="strategy" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-2xl font-bold text-white">Team Strategy</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
                        <h4 className="font-semibold text-white text-lg mb-2">Divide & Conquer</h4>
                        <p className="text-gray-400 text-sm">Assign different lines or intersections to team members so you cover more ground simultaneously.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
                        <h4 className="font-semibold text-white text-lg mb-2">Block Opponents</h4>
                        <p className="text-gray-400 text-sm">Keep an eye on the grid. If an opposing team is one tile away from a line, solve that problem to deny them the win.</p>
                    </div>
                </div>
            </section>

            <section id="end-condition" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-white">Game End Condition</h2>
                </div>
                <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-24 h-24" />
                    </div>
                    <p className="text-gray-300 leading-relaxed relative z-10">
                        The match concludes immediately when a single team claims <strong>5 consecutive tiles</strong> (horizontal, vertical, or diagonal). That team is declared the absolute winner of the Bingo match.
                    </p>
                </div>
            </section>
        </div>
    );
}
