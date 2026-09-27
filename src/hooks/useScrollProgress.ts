"use client";

import { useEffect } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

export interface ScrollProgress {
  /** Page scroll position 0 → 1. */
  progress: MotionValue<number>;
  /** Pixels scrolled. */
  y: MotionValue<number>;
  /** 1 when scrolling down, -1 when scrolling up. */
  direction: MotionValue<number>;
}

/**
 * Page scroll as motion values. Lenis drives the real window scroll, so a passive
 * scroll listener stays in sync with smooth scrolling without a second loop.
 */
export function useScrollProgress(): ScrollProgress {
  const progress = useMotionValue(0);
  const y = useMotionValue(0);
  const direction = useMotionValue(1);

  useEffect(() => {
    let last = window.scrollY;
    const update = (): void => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const now = window.scrollY;
      if (now !== last) direction.set(now > last ? 1 : -1);
      last = now;
      y.set(now);
      progress.set(max > 0 ? now / max : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [progress, y, direction]);

  return { progress, y, direction };
}
