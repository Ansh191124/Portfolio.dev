"use client";

import { useEffect, useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { animate } from "animejs";
import { sections } from "@/data/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollProgress } from "@/hooks/useScrollProgress";

const pad = (n: number): string => String(n).padStart(2, "0");

/** Top-right "01 / 07" section counter; the number rolls with Anime.js. */
export function ScrollIndicator() {
  const active = useActiveSection();
  const reduced = useReducedMotion();
  const { progress } = useScrollProgress();
  const scaleY = useTransform(progress, [0, 1], [0, 1]);
  const numberRef = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = numberRef.current;
    if (!el) return;
    el.textContent = pad(active + 1);
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    const animation = animate(el, {
      translateY: ["60%", "0%"],
      opacity: [0, 1],
      duration: 520,
      ease: "outExpo",
    });
    return () => {
      animation.cancel();
    };
  }, [active, reduced]);

  return (
    <div
      className="pointer-events-none fixed top-24 right-4 z-40 hidden flex-col items-end gap-3 font-mono text-[11px] tracking-[0.2em] md:flex"
      role="status"
      aria-label={`Section ${active + 1} of ${sections.length}: ${sections[active]?.label ?? ""}`}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span ref={numberRef} className="inline-block text-[var(--color-accent)]" aria-hidden="true">
          {pad(1)}
        </span>
        <span className="text-[var(--color-muted)]" aria-hidden="true">
          / {pad(sections.length)}
        </span>
      </div>
      <div className="h-24 w-px bg-[var(--color-line)]" aria-hidden="true">
        <motion.div className="h-full w-px origin-top bg-[var(--color-accent)]" style={{ scaleY }} />
      </div>
    </div>
  );
}
