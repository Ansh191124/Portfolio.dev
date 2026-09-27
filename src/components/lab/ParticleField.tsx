"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { theme } from "@/lib/theme";
import { usePerformance } from "@/hooks/usePerformance";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Experiment 01 — a 2D-canvas particle field that swirls around the pointer.
 * Ticks on the shared GSAP ticker rather than its own requestAnimationFrame.
 */
export function ParticleField({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const perf = usePerformance();
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const pointer = { x: -999, y: -999 };
    let w = 0;
    let h = 0;
    let dpr = 1;
    const particles: Particle[] = [];

    const resize = (): void => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio, perf.dpr);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(((w * h) / 2600) * perf.density);
      particles.length = 0;
      for (let i = 0; i < count; i += 1) {
        particles.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0 });
      }
    };

    const draw = (): void => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = theme.fg;
      for (const p of particles) {
        ctx.globalAlpha = 0.55;
        ctx.fillRect(p.x, p.y, 1.6, 1.6);
      }
      ctx.globalAlpha = 1;
    };

    const step = (): void => {
      for (const p of particles) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 9000) {
          const d = Math.sqrt(d2) || 1;
          const force = (1 - d / 95) * 0.9;
          // swirl (perpendicular) plus a soft push
          p.vx += (-dy / d) * force * 0.6 + (dx / d) * force * 0.4;
          p.vy += (dx / d) * force * 0.6 + (dy / d) * force * 0.4;
        }
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx + Math.sin(p.y * 0.01) * 0.05;
        p.y += p.vy;
        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        if (p.y > h) p.y -= h;
      }
      draw();
    };

    const onMove = (event: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const onLeave = (): void => {
      pointer.x = -999;
      pointer.y = -999;
    };

    resize();
    draw();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    if (!paused && !reduced) gsap.ticker.add(step);

    return () => {
      gsap.ticker.remove(step);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [paused, reduced, perf.dpr, perf.density]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 size-full touch-none"
      role="img"
      aria-label="Particle field that flows around the pointer"
    />
  );
}
