"use client";

import { useId, useRef, type PointerEvent } from "react";
import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import type { Project } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ProjectVisualProps {
  project: Project;
  className?: string;
  /** Disable pointer effects (e.g. inside the case study banner). */
  interactive?: boolean;
}

/**
 * Project imagery. Uses `project.image` when provided; otherwise renders a
 * generated schematic of the project's own architecture nodes. Adds mouse
 * parallax, a slight hover scale, a subtle displacement distortion and grain —
 * all with CSS transforms / an SVG filter (no WebGL).
 */
export function ProjectVisual({ project, className = "", interactive = true }: ProjectVisualProps) {
  const reduced = useReducedMotion();
  const filterId = useId().replace(/:/g, "");
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 18 });
  const sy = useSpring(py, { stiffness: 90, damping: 18 });
  const layerFar = useTransform(sx, (v) => v * -10);
  const layerNear = useTransform(sx, (v) => v * 22);
  const layerFarY = useTransform(sy, (v) => v * -10);
  const layerNearY = useTransform(sy, (v) => v * 22);
  const distort = useSpring(0, { stiffness: 80, damping: 20 });

  useMotionValueEvent(distort, "change", (v) => {
    displacement.current?.setAttribute("scale", String(v));
  });

  const hue = project.hue;
  const accent = `hsl(${hue} 85% 62%)`;
  const dim = `hsl(${hue} 40% 26%)`;
  const nodes = project.architecture;

  const onMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (!interactive || reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = (): void => {
    px.set(0);
    py.set(0);
    distort.set(0);
  };

  return (
    <motion.div
      className={`relative isolate overflow-hidden bg-[var(--color-surface)] ${className}`}
      onPointerMove={onMove}
      onPointerEnter={() => interactive && !reduced && distort.set(8)}
      onPointerLeave={reset}
      whileHover={interactive && !reduced ? { scale: 1.015 } : undefined}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {project.image ? (
        <Image
          src={project.image}
          alt={`${project.title} preview`}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          data-visual-image
        />
      ) : (
        <div data-visual-image className="absolute inset-0">
          <svg aria-hidden="true" className="absolute size-0">
            <filter id={filterId}>
              <feTurbulence type="fractalNoise" baseFrequency="0.008 0.02" numOctaves="1" result="noise" />
              <feDisplacementMap ref={displacement} in="SourceGraphic" in2="noise" scale="0" />
            </filter>
          </svg>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(80% 70% at 30% 20%, hsl(${hue} 60% 14% / 0.9), transparent 70%), var(--color-surface)`,
            }}
          />
          <motion.div className="absolute inset-0" style={{ x: layerFar, y: layerFarY }}>
            <svg viewBox="0 0 400 300" className="size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              {[70, 110, 150, 190].map((r) => (
                <circle key={r} cx="200" cy="150" r={r} fill="none" stroke={dim} strokeWidth="0.6" />
              ))}
              <path d="M0 150H400M200 0V300" stroke={dim} strokeWidth="0.4" />
            </svg>
          </motion.div>
          <motion.div className="absolute inset-0" style={{ x: layerNear, y: layerNearY, filter: `url(#${filterId})` }}>
            <svg viewBox="0 0 400 300" className="size-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              {nodes.map((node, i) => {
                const x = 60 + (i * 280) / Math.max(1, nodes.length - 1);
                const y = 150 + Math.sin(i * 1.4) * 55;
                const next = nodes[i + 1];
                const nx = 60 + ((i + 1) * 280) / Math.max(1, nodes.length - 1);
                const ny = 150 + Math.sin((i + 1) * 1.4) * 55;
                return (
                  <g key={node.id}>
                    {next ? <line x1={x} y1={y} x2={nx} y2={ny} stroke={accent} strokeOpacity="0.55" strokeWidth="1" /> : null}
                    <rect x={x - 5} y={y - 5} width="10" height="10" fill="var(--color-bg)" stroke={accent} strokeWidth="1.2" />
                    <text x={x} y={y + 22} textAnchor="middle" fontSize="8" letterSpacing="1.5" fill="var(--color-muted)" fontFamily="var(--font-mono)">
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>
        </div>
      )}
      <div aria-hidden="true" className="noise pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 ring-1 ring-[var(--color-line)] ring-inset" />
    </motion.div>
  );
}
