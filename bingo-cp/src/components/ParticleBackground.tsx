'use client';

import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alpha: number;
    color: string;
}

const COLORS = ['rgba(0,240,255,', 'rgba(168,127,255,', 'rgba(255,255,255,'];

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let particles: Particle[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', onMouseMove);

        // Spawn particles
        const COUNT = window.innerWidth < 768 ? 45 : 80;
        for (let i = 0; i < COUNT; i++) {
            const colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                radius: Math.random() * 1.8 + 0.4,
                alpha: Math.random() * 0.5 + 0.15,
                color: colorBase,
            });
        }

        const CONNECT_DIST = window.innerWidth < 768 ? 0 : 120; // no lines on mobile

        const draw = () => {
            const W = canvas.width;
            const H = canvas.height;
            ctx.clearRect(0, 0, W, H);

            // ── Grid ─────────────────────────────────────────────────
            ctx.strokeStyle = 'rgba(16,185,129,0.025)';
            ctx.lineWidth = 1;
            const GRID = 60;
            for (let gx = 0; gx <= W; gx += GRID) {
                ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
            }
            for (let gy = 0; gy <= H; gy += GRID) {
                ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
            }

            // ── Mouse glow ───────────────────────────────────────────
            const { x: mx, y: my } = mouseRef.current;
            if (mx > 0) {
                const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 280);
                grad.addColorStop(0, 'rgba(0,240,255,0.05)');
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, W, H);
            }

            // ── Particles + connections ───────────────────────────────
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // move
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = W;
                if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H;
                if (p.y > H) p.y = 0;

                // dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `${p.color}${p.alpha})`;
                ctx.fill();

                // connections
                if (CONNECT_DIST > 0) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const q = particles[j];
                        const dx = p.x - q.x;
                        const dy = p.y - q.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < CONNECT_DIST) {
                            const lineAlpha = (1 - dist / CONNECT_DIST) * 0.12;
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(q.x, q.y);
                            ctx.strokeStyle = `rgba(0,240,255,${lineAlpha})`;
                            ctx.lineWidth = 0.6;
                            ctx.stroke();
                        }
                    }
                }
            }

            animId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
