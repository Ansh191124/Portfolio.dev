"use client";

import { useCallback, useEffect, useRef } from "react";
import { animate } from "animejs";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const GLYPHS = "01<>/\\[]{}—=+*#";

interface ScrambleTextProps {
  text: string;
  className?: string;
  as?: "span" | "div" | "p";
  /** Scramble again whenever the pointer enters. */
  onHover?: boolean;
}

/** Scramble-to-reveal text (Anime.js timing). Used for labels and titles. */
export function ScrambleText({ text, className, as: tag = "span", onHover = false }: ScrambleTextProps) {
  const Tag = tag as "span";
  const [viewRef, inView] = useInView<HTMLSpanElement>({ once: true });
  const reduced = useReducedMotion();
  const displayRef = useRef<HTMLSpanElement | null>(null);
  const runningRef = useRef<{ cancel: () => void } | null>(null);

  const run = useCallback((): void => {
    const el = displayRef.current;
    if (!el || reduced) return;
    runningRef.current?.cancel();
    const state = { p: 0 };
    runningRef.current = animate(state, {
      p: 1,
      duration: 700,
      ease: "linear",
      onUpdate: () => {
        const fixed = Math.floor(state.p * text.length);
        let out = "";
        for (let i = 0; i < text.length; i += 1) {
          const ch = text[i];
          out +=
            i < fixed || ch === " "
              ? ch
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        el.textContent = out;
      },
      onComplete: () => {
        el.textContent = text;
      },
    });
  }, [reduced, text]);

  useEffect(() => {
    if (inView) run();
    return () => runningRef.current?.cancel();
  }, [inView, run]);

  return (
    <Tag
      ref={viewRef}
      className={className}
      aria-label={text}
      onPointerEnter={onHover ? run : undefined}
    >
      <span ref={displayRef} aria-hidden="true">
        {text}
      </span>
    </Tag>
  );
}
