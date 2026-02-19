// app/page.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from 'next/link';
import { ArrowRight, Grid3x3, Swords, TrainFront } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="text-center max-w-4xl mx-auto z-10"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          Competitive Programming <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-glow">Evolved</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Turn your practice sessions into high-stakes battles.
          Real-time multiplayer games powered by Codeforces problems.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto"
        >
          {/* Bingo Card */}
          <Link href="/create-match" className="group">
            <motion.div
              variants={fadeInUp}
              className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 relative overflow-hidden group-hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Grid3x3 className="w-6 h-6 text-cyan-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Bingo Mode</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Classic 5x5 grid. Solve problems to claim tiles. First to get a line wins. Fast-paced and chaotic.
              </p>

              <div className="flex items-center text-cyan-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Create Match <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </motion.div>
          </Link>

          {/* Tug of War Card */}
          <Link href="/tug-mode" className="group">
            <motion.div
              variants={fadeInUp}
              className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all duration-300 relative overflow-hidden group-hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Swords className="w-6 h-6 text-red-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">Tug of War</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                1v1 or Team vs Team. Solve harder problems to pull the rope. Push the opponent off the edge.
              </p>

              <div className="flex items-center text-red-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Enter Arena <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </motion.div>
          </Link>

          {/* TTR Card */}
          <Link href="/create-ttr-match" className="group">
            <motion.div
              variants={fadeInUp}
              className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-300 relative overflow-hidden group-hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrainFront className="w-6 h-6 text-emerald-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Ticket to Ride</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Build routes across Europe by solving problems. Strategy meets algorithms in this board game adaptation.
              </p>

              <div className="flex items-center text-emerald-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Start Journey <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-16 text-gray-500 text-sm">
          <p>More modes coming soon • Codeforces account required to play</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
