"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SplitCharsProps {
  text: string;
  /** Start the reveal when true. */
  play: boolean;
  as?: "span" | "div" | "p";
  className?: string;
  /** ms between characters. */
  gap?: number;
  delay?: number;
}

/**
 * Cinematic character reveal (Anime.js): opacity 0→1, translateY 40→0,
 * blur 12→0 with a 30ms stagger. Reserved for the hero heading.
 */
export function SplitChars({
  text,
  play,
  as: tag = "span",
  className,
  gap = 30,
  delay = 0,
}: SplitCharsProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const Tag = tag as "span";
  const words = text.split(" ");

  useEffect(() => {
    if (!play || reduced) return;
    const chars = rootRef.current?.querySelectorAll<HTMLElement>("[data-char]");
    if (!chars || chars.length === 0) return;
    const animation = animate(chars, {
      opacity: [0, 1],
      translateY: [40, 0],
      filter: ["blur(12px)", "blur(0px)"],
      duration: 900,
      delay: stagger(gap, { start: delay }),
      ease: "outExpo",
    });
    return () => {
      animation.revert();
    };
  }, [play, reduced, gap, delay]);

  return (
    <Tag ref={rootRef} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} aria-hidden="true" className="inline-block whitespace-nowrap">
          {Array.from(word).map((char, ci) => (
            <span
              key={`${char}-${ci}`}
              data-char
              className={`inline-block will-change-transform ${reduced ? "" : "pre-reveal"}`}
            >
              {char}
            </span>
          ))}
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
