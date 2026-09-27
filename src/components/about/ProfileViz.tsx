"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { disciplines } from "@/data/profile";
import { technologies } from "@/data/stack";

const SIZE = 420;
const C = SIZE / 2;
const R = 148;

const point = (i: number, radius: number): { x: number; y: number } => {
  const angle = (-90 + (360 / disciplines.length) * i) * (Math.PI / 180);
  return { x: C + Math.cos(angle) * radius, y: C + Math.sin(angle) * radius };
};

/** Interactive developer profile: hover or focus a discipline to light it up. */
export function ProfileViz() {
  const [active, setActive] = useState<string | null>(null);
  const current = disciplines.find((d) => d.id === active);
  const techs = current ? technologies.filter((t) => t.category === current.category) : [];

  return (
    <div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto w-full max-w-[460px]"
        role="group"
        aria-label="Developer profile: frontend, backend, AI, database and DevOps"
      >
        {[R * 0.4, R * 0.7, R].map((r) => (
          <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="var(--color-line)" strokeWidth="1" />
        ))}
        {disciplines.map((d, i) => {
          const p = point(i, R);
          const on = active === d.id;
          return (
            <motion.line
              key={d.id}
              x1={C}
              y1={C}
              x2={p.x}
              y2={p.y}
              stroke={on ? "var(--color-accent)" : "var(--color-muted)"}
              initial={{ strokeOpacity: 0.35, strokeWidth: 1 }}
              animate={{ strokeOpacity: active === null ? 0.35 : on ? 1 : 0.1, strokeWidth: on ? 2 : 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
        <circle cx={C} cy={C} r="34" fill="var(--color-bg)" stroke="var(--color-fg)" strokeWidth="1" />
        <text x={C} y={C + 4} textAnchor="middle" fontSize="11" letterSpacing="2" fill="var(--color-fg)" fontFamily="var(--font-mono)">
          ANSH
        </text>
        {disciplines.map((d, i) => {
          const p = point(i, R);
          const on = active === d.id;
          return (
            <g
              key={d.id}
              role="button"
              tabIndex={0}
              aria-label={`${d.label}: ${d.summary}`}
              aria-pressed={on}
              onPointerEnter={() => setActive(d.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(d.id)}
              onBlur={() => setActive(null)}
              data-cursor="open"
              style={{ outline: "none" }}
              className="cursor-pointer focus-visible:[&>circle:last-of-type]:stroke-[var(--color-accent)]"
            >
              <motion.circle
                cx={p.x}
                cy={p.y}
                fill="var(--color-bg)"
                stroke={on ? "var(--color-accent)" : "var(--color-fg)"}
                strokeWidth="1.2"
                initial={{ r: 18, opacity: 1 }}
                animate={{ r: on ? 26 : 18, opacity: active === null || on ? 1 : 0.35 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
              <motion.text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize="9"
                letterSpacing="1.2"
                fontFamily="var(--font-mono)"
                fill={on ? "var(--color-accent)" : "var(--color-fg)"}
                initial={{ opacity: 1 }}
                animate={{ opacity: active === null || on ? 1 : 0.35 }}
                pointerEvents="none"
              >
                {d.label.toUpperCase()}
              </motion.text>
              <circle cx={p.x} cy={p.y} r="32" fill="transparent" stroke="transparent" strokeWidth="1" />
            </g>
          );
        })}
      </svg>

      <div className="mt-2 min-h-24 border-t border-[var(--color-line)] pt-5" aria-live="polite">
        {current ? (
          <>
            <p className="label text-[var(--color-accent)]">{current.label.toUpperCase()}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-muted)]">{current.summary}</p>
            <p className="mt-2 font-mono text-[12px] tracking-[0.08em]">{techs.map((t) => t.label).join(" · ")}</p>
          </>
        ) : (
          <p className="label">HOVER A NODE TO EXPLORE</p>
        )}
      </div>
    </div>
  );
}
