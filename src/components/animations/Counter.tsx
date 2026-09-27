"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CounterProps {
  value: number;
  className?: string;
  pad?: number;
}

/** Number counter (Anime.js) that runs once when scrolled into view. */
export function Counter({ value, className, pad = 2 }: CounterProps) {
  const [ref, inView] = useInView<HTMLSpanElement>({ once: true });
  const reduced = useReducedMotion();
  const textRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const format = (n: number): string => String(Math.round(n)).padStart(pad, "0");
    if (reduced || !inView) {
      el.textContent = format(reduced ? value : 0);
      return;
    }
    const state = { n: 0 };
    const animation = animate(state, {
      n: value,
      duration: 1400,
      ease: "outExpo",
      onUpdate: () => {
        el.textContent = format(state.n);
      },
    });
    return () => {
      animation.cancel();
    };
  }, [inView, reduced, value, pad]);

  return (
    <span ref={ref} className={className}>
      <span ref={textRef} aria-label={String(value)}>
        {String(0).padStart(pad, "0")}
      </span>
    </span>
  );
}
