// app/page.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Grid3x3, Swords, TrainFront,
  Zap, ShieldCheck, BarChart3,
} from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';

/* ─── Animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

/* ─── Game mode card data ─────────────────────────────────── */
const MODES = [
  {
    href: '/create-match',
    label: 'Bingo',
    tag: 'MULTIPLAYER',
    icon: Grid3x3,
    accent: '#06b6d4',
    accentBg: 'rgba(6,182,212,0.06)',
    tagBg: 'rgba(6,182,212,0.12)',
    cta: 'Create Match',
    desc: 'Classic 5×5 grid. Solve CF problems to claim tiles. First to complete a line wins.',
    bullets: ['5×5 Problem Grid', 'Auto CF Verification', 'Multi-team Support'],
  },
  {
    href: '/tug-mode',
    label: 'Tug of War',
    tag: '1v1 · TEAM',
    icon: Swords,
    accent: '#ef4444',
    accentBg: 'rgba(239,68,68,0.06)',
    tagBg: 'rgba(239,68,68,0.12)',
    cta: 'Enter Arena',
    desc: 'Two sides, one rope. Solve harder problems to pull it your way. Push them off the edge.',
    bullets: ['Classic & Grid Modes', 'Rating-based Difficulty', 'Tug Threshold Win'],
  },
  {
    href: '/create-ttr-match',
    label: 'Ticket to Ride',
    tag: 'STRATEGY',
    icon: TrainFront,
    accent: '#10b981',
    accentBg: 'rgba(16,185,129,0.06)',
    tagBg: 'rgba(16,185,129,0.12)',
    cta: 'Start Journey',
    desc: 'Earn coins by solving problems. Spend them to claim train routes across the map.',
    bullets: ['Europe Map', 'Coin Economy', 'Route Strategy'],
  },
];

/* ─── Feature strip data ─────────────────────────────────── */
const FEATURES = [
  {
    icon: Zap,
    accent: '#06b6d4',
    title: 'Real-time Sync',
    body: 'Solve submissions verified against the Codeforces API within seconds.',
  },
  {
    icon: ShieldCheck,
    accent: '#a87fff',
    title: 'Secure Auth',
    body: 'Handle-based team identity. No passwords, no accounts — just your CF handle.',
  },
  {
    icon: BarChart3,
    accent: '#10b981',
    title: 'Live Scoreboards',
    body: 'Watch leaderboards shift in real-time as your team solves and claims territory.',
  },
];

export default function HomePage(): React.JSX.Element {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#050505' }}>

      {/* ── Particle canvas background ─────────────────── */}
      <ParticleBackground />

      {/* ── Deep ambient orbs ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-[-10%] left-[15%] w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(112,0,255,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-5%] right-[10%] w-[600px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-[40%] left-[-5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* ── Page content ──────────────────────────────── */}
      <div className="relative z-10">

        {/* ═══════════════════════════════════════════
                        HERO
                    ═══════════════════════════════════════════ */}
        <section className="flex flex-col items-center justify-center pt-24 pb-12 px-6 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="max-w-5xl mx-auto"
          >
            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-serif italic leading-[1.05] mb-4"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#fff' }}
            >
              Competitive Programming<br />
              <span
                className="font-serif italic"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #00f0ff 0%, #a87fff 40%, #10b981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 4s ease infinite',
                }}
              >
                Evolved
              </span>
            </motion.h1>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════
                        GAME MODE CARDS
                    ═══════════════════════════════════════════ */}
        <section className="px-6 pb-28 max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <motion.div key={mode.href} variants={fadeUp}>
                  <Link href={mode.href} className="block group h-full">
                    <div
                      className="relative h-full rounded-2xl p-7 flex flex-col overflow-hidden transition-all duration-300 group-hover:-translate-y-2"
                      style={{
                        background: mode.accentBg,
                        border: `1px solid ${mode.accent}30`,
                        borderTop: `2px solid ${mode.accent}60`,
                        boxShadow: 'none',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${mode.accent}20, 0 20px 60px rgba(0,0,0,0.4)`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                      }}
                    >
                      {/* Mode tag — top right */}
                      <div className="absolute top-4 right-4">
                        <span
                          className="text-[9px] font-black uppercase tracking-[0.18em] px-2 py-1 rounded-full font-heading"
                          style={{ background: mode.tagBg, color: mode.accent }}
                        >
                          {mode.tag}
                        </span>
                      </div>

                      {/* Icon */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 shrink-0"
                        style={{
                          background: `${mode.accent}15`,
                          border: `1px solid ${mode.accent}30`,
                          boxShadow: `0 0 20px ${mode.accent}10`,
                        }}
                      >
                        <Icon style={{ color: mode.accent }} className="w-7 h-7" />
                      </div>

                      {/* Title */}
                      <h3
                        className="text-2xl font-black mb-2 font-heading transition-colors duration-200"
                        style={{ color: '#fff' }}
                      >
                        {mode.label}
                      </h3>

                      {/* Desc */}
                      <p className="text-sm leading-relaxed mb-5 font-body flex-1" style={{ color: '#9ca3af' }}>
                        {mode.desc}
                      </p>

                      {/* Feature bullets */}
                      <ul className="space-y-1.5 mb-6">
                        {mode.bullets.map(b => (
                          <li key={b} className="flex items-center gap-2 text-xs font-body" style={{ color: '#6b7280' }}>
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: mode.accent }} />
                            {b}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <div
                        className="flex items-center gap-2 text-sm font-bold font-heading transition-all duration-200 group-hover:gap-3"
                        style={{ color: mode.accent }}
                      >
                        {mode.cta} <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════
                        FEATURES STRIP
                    ═══════════════════════════════════════════ */}
        <section className="px-6 pb-28 max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {FEATURES.map(f => {
              const FIcon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="rounded-2xl p-6 flex gap-4"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderLeft: `3px solid ${f.accent}70`,
                  }}
                >
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                    style={{ background: `${f.accent}15`, border: `1px solid ${f.accent}25` }}
                  >
                    <FIcon className="w-5 h-5" style={{ color: f.accent }} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm mb-1.5 text-white font-heading">{f.title}</h4>
                    <p className="text-xs leading-relaxed font-body" style={{ color: '#6b7280' }}>{f.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════
                        FOOTER CTA BANNER
                    ═══════════════════════════════════════════ */}
        <section className="px-6 pb-24 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{
              background: 'rgba(0,240,255,0.03)',
              border: '1px solid rgba(0,240,255,0.1)',
              boxShadow: '0 0 60px rgba(0,240,255,0.04)',
              borderTop: '1px solid rgba(0,240,255,0.18)',
            }}
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white font-heading mb-2">
                Ready to compete?
              </h2>
              <p className="text-sm font-body" style={{ color: '#6b7280' }}>
                Pick a mode, assemble your team, and crush those problems.
              </p>
            </div>
            <Link href="/create-match" className="shrink-0">
              <button
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:scale-105 transition-transform duration-200 font-heading"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #7000ff)',
                  boxShadow: '0 0 24px rgba(0,240,255,0.18)',
                  color: '#fff',
                }}
              >
                Create a Match <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>

          {/* Fine print */}
          <p className="text-center text-xs mt-8 font-body" style={{ color: '#374151' }}>
            More modes coming soon · Codeforces account required to play
          </p>
        </section>

      </div>
    </div>
  );
}
