"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { animate } from "animejs";
import { getReadyTotal, markReady } from "@/lib/ready-store";
import { useReadyCount } from "@/hooks/useExperienceReady";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { site } from "@/data/site";

/** Hard ceiling so a stalled asset can never trap the visitor on this screen. */
const MAX_WAIT_MS = 6000;

/**
 * Loading screen. Progress reflects real readiness (mount, fonts, first 3D
 * frame) and the screen leaves the instant everything essential is ready —
 * there is no artificial delay.
 */
export function Loader() {
  const count = useReadyCount();
  const total = getReadyTotal();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const numberRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef({ value: 0 });
  const target = Math.round((count / total) * 100);

  useEffect(() => {
    markReady("mounted");
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) markReady("fonts");
    });
    const timeout = window.setTimeout(() => {
      markReady("fonts");
      markReady("scene");
    }, MAX_WAIT_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const number = numberRef.current;
    const bar = barRef.current;
    if (!number || !bar) return;
    const state = shownRef.current;
    const animation = animate(state, {
      value: target,
      duration: reduced ? 0 : 350,
      ease: "outQuad",
      onUpdate: () => {
        number.textContent = String(Math.round(state.value)).padStart(3, "0");
        bar.style.transform = `scaleX(${state.value / 100})`;
      },
      onComplete: () => {
        if (target >= 100) setVisible(false);
      },
    });
    return () => {
      animation.cancel();
    };
  }, [target, reduced]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="loader"
          role="status"
          aria-live="polite"
          aria-label="Loading experience"
          className="loader fixed inset-0 z-[100] flex flex-col justify-between bg-[var(--color-bg)] p-6 md:p-10"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduced ? 0 : 0.8, ease: [0.76, 0, 0.24, 1] }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
        >
          <div className="flex items-center justify-between font-mono text-[12px] tracking-[0.2em] text-[var(--color-fg)]">
            <span>{site.brand}</span>
            <span className="text-[var(--color-muted)]">FULL-STACK</span>
          </div>
          <div>
            <p className="label mb-4">INITIALIZING EXPERIENCE</p>
            <div className="flex items-end justify-between gap-6">
              <span
                ref={numberRef}
                className="display text-[clamp(64px,14vw,180px)] leading-none tabular-nums text-[var(--color-fg)]"
              >
                000
              </span>
              <span className="label pb-3">%</span>
            </div>
            <div className="mt-6 h-px w-full bg-[var(--color-line)]">
              <div
                ref={barRef}
                className="h-px origin-left bg-[var(--color-accent)]"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
