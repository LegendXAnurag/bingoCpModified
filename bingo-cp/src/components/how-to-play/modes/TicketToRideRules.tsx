'use client';
import { TrainFront, Coins, Map, Ticket, Hourglass, BookOpen, Calculator } from 'lucide-react';

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
                    Welcome to the grand rail network of Europe! Ticket to Ride blends competitive programming with long-term strategy. The game is all about scoring points by claiming train routes, connecting cities, and fulfilling secret route objectives. The team with the highest points at the end of the game wins.
                </p>
            </section>

            <section id="terminology" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white">Key Terminology</h2>
                </div>
                <div className="grid gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <Map className="w-4 h-4 text-emerald-400" /> Cities & Tracks
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                            <strong>Cities</strong> are the endpoints on the map you want to connect. <br/>
                            <strong>Tracks</strong> are the paths connecting two cities. Each track has a specific length. You can occupy a track by spending coins equal to its length. Once occupied, no one else can claim that exact track. Note: If there are double tracks between the same two cities, you can only occupy one of them.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-emerald-400" /> Route Cards
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                            These are specific tasks that tell you to connect two given cities on the map. If you successfully connect them by the end of the game, you gain the points listed on the card. If you fail, that exact amount is deducted from your score.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <TrainFront className="w-4 h-4 text-emerald-400" /> Stations
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                            Locked out of a crucial track because someone else took it? You can build a <strong>Station</strong> over their occupied track to share it! <br/>
                            • Max 1 station can be built on any single track.<br/>
                            • You can build at most 3 stations in the entire game.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <Coins className="w-4 h-4 text-emerald-400" /> Coins & Marketplace
                        </h3>
                        <p className="text-gray-300 text-sm">
                            <strong>Coins</strong> are the universal currency used to build tracks and stations. You earn coins by solving Codeforces programming questions from the <strong>Marketplace</strong>.
                        </p>
                    </div>
                </div>
            </section>

            <section id="scoring" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Calculator className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white">Scoring Points</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                    The ultimate goal is to amass the most points. Here is how your final score is calculated:
                </p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                    <ul className="space-y-4 text-gray-300">
                        <li>
                            <strong className="text-white">1. Route Cards:</strong> Gain points for each completed Route Card. Lose points for each uncompleted Route Card.
                        </li>
                        <li>
                            <strong className="text-white">2. Claimed Tracks:</strong> You earn immediate points for each track you build, scaling based on its length:
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
                                <div className="bg-black/20 p-2 rounded text-center"><span className="text-xs text-gray-400 block">Length 1</span><strong className="text-white">1 pt</strong></div>
                                <div className="bg-black/20 p-2 rounded text-center"><span className="text-xs text-gray-400 block">Length 2</span><strong className="text-white">2 pts</strong></div>
                                <div className="bg-black/20 p-2 rounded text-center"><span className="text-xs text-gray-400 block">Length 3</span><strong className="text-white">4 pts</strong></div>
                                <div className="bg-black/20 p-2 rounded text-center"><span className="text-xs text-gray-400 block">Length 4</span><strong className="text-white">7 pts</strong></div>
                                <div className="bg-black/20 p-2 rounded text-center"><span className="text-xs text-gray-400 block">Length 6</span><strong className="text-white">15 pts</strong></div>
                                <div className="bg-black/20 p-2 rounded text-center"><span className="text-xs text-gray-400 block">Length 8</span><strong className="text-white">21 pts</strong></div>
                            </div>
                        </li>
                        <li>
                            <strong className="text-white">3. Unused Stations:</strong> You receive 4 bonus points for every Station you don't use. For example, if you build 1 station, you have 2 remaining, giving you 8 extra points.
                        </li>
                    </ul>
                </div>
            </section>

            <section id="end-condition" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <Hourglass className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-white">Game End Condition</h2>
                </div>
                <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-600/10 border border-emerald-500/30 rounded-2xl relative overflow-hidden">
                    <p className="text-gray-300 leading-relaxed relative z-10 mb-4">
                        Each player can claim a maximum of <strong>45 total track length</strong> throughout the entire game. For example, claiming a track of length 4 and a track of length 6 uses 10 track length so far.
                    </p>
                    <p className="text-gray-300 leading-relaxed relative z-10">
                        The game ends immediately when <strong>anyone's remaining track capacity drops to 2 or less</strong>. Alternatively, the game also concludes when the overall match timer runs out. 
                    </p>
                </div>
            </section>
        </div>
    );
}
