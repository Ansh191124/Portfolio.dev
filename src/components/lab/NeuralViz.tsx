"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const LAYERS = [4, 6, 6, 3];
const W = 400;
const H = 260;

const nodePosition = (layer: number, index: number): { x: number; y: number } => {
  const count = LAYERS[layer];
  return {
    x: 50 + (layer * (W - 100)) / (LAYERS.length - 1),
    y: (H / (count + 1)) * (index + 1),
  };
};

/** Experiment 05 — a forward pass drawn as activation travelling layer by layer (Anime.js). */
export function NeuralViz({ paused }: { paused: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const svg = ref.current;
    if (!svg || paused || reduced) return;
    const runs: { cancel: () => void }[] = [];
    LAYERS.forEach((_, layer) => {
      const nodes = svg.querySelectorAll<SVGElement>(`[data-node="${layer}"]`);
      runs.push(
        animate(nodes, {
          opacity: [0.25, 1, 0.25],
          duration: 1400,
          delay: stagger(60, { start: layer * 550 }),
          loop: true,
          loopDelay: 800,
          ease: "inOutSine",
        }),
      );
    });
    runs.push(
      animate(svg.querySelectorAll<SVGElement>("[data-edge]"), {
        strokeOpacity: [0.08, 0.55, 0.08],
        duration: 1400,
        delay: stagger(6),
        loop: true,
        loopDelay: 1500,
        ease: "inOutSine",
      }),
    );
    return () => runs.forEach((r) => r.cancel());
  }, [paused, reduced]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="absolute inset-0 size-full p-6"
      role="img"
      aria-label="Neural network activation passing through four layers"
    >
      {LAYERS.slice(0, -1).flatMap((count, layer) =>
        Array.from({ length: count }, (_, i) =>
          Array.from({ length: LAYERS[layer + 1] }, (_, j) => {
            const a = nodePosition(layer, i);
            const b = nodePosition(layer + 1, j);
            return (
              <line
                key={`${layer}-${i}-${j}`}
                data-edge
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--color-accent)"
                strokeOpacity={0.12}
                strokeWidth="0.8"
              />
            );
          }),
        ),
      )}
      {LAYERS.map((count, layer) =>
        Array.from({ length: count }, (_, i) => {
          const p = nodePosition(layer, i);
          return (
            <circle
              key={`${layer}-${i}`}
              data-node={layer}
              cx={p.x}
              cy={p.y}
              r="6"
              fill="var(--color-bg)"
              stroke="var(--color-accent)"
              strokeWidth="1.2"
              opacity={reduced ? 1 : 0.25}
            />
          );
        }),
      )}
    </svg>
  );
}
