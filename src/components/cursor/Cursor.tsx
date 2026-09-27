"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { animate } from "animejs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type CursorMode = "default" | "hover" | "view" | "open" | "drag";

const LABELS: Partial<Record<CursorMode, string>> = {
  view: "VIEW",
  open: "OPEN",
  drag: "DRAG",
};

const SIZE: Record<CursorMode, number> = {
  default: 0,
  hover: 44,
  view: 84,
  open: 72,
  drag: 72,
};

const INTERACTIVE = "a, button, [role='button'], summary, input, textarea, select";

/**
 * Desktop-only custom cursor. Position uses Framer Motion springs; the ring's
 * size and label use Anime.js. Elements opt in with data-cursor="view|open|drag"
 * and data-magnetic to attract the ring toward their centre.
 */
export function Cursor() {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<CursorMode>("default");

  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(useMotionValue(-100), { stiffness: 260, damping: 26, mass: 0.5 });
  const ringY = useSpring(useMotionValue(-100), { stiffness: 260, damping: 26, mass: 0.5 });

  useEffect(() => {
    if (!finePointer) return;
    document.documentElement.classList.add("has-cursor");
    let magnet: HTMLElement | null = null;

    const onMove = (event: PointerEvent): void => {
      dotX.set(event.clientX);
      dotY.set(event.clientY);
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        ringX.set(event.clientX * 0.55 + (rect.left + rect.width / 2) * 0.45);
        ringY.set(event.clientY * 0.55 + (rect.top + rect.height / 2) * 0.45);
      } else {
        ringX.set(event.clientX);
        ringY.set(event.clientY);
      }
    };

    const onOver = (event: PointerEvent): void => {
      const target = event.target as Element | null;
      const tagged = target?.closest<HTMLElement>("[data-cursor]");
      magnet = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      const declared = tagged?.dataset.cursor as CursorMode | undefined;
      if (declared && declared in SIZE) setMode(declared);
      else setMode(target?.closest(INTERACTIVE) ? "hover" : "default");
    };

    const onLeave = (): void => {
      dotX.set(-100);
      ringX.set(-100);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [finePointer, dotX, dotY, ringX, ringY]);

  // Small-scale animation: ring diameter, dot shrink and label swap.
  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!ring || !dot || !label) return;
    const size = SIZE[mode];
    const duration = reduced ? 0 : 420;
    const a = animate(ring, {
      width: size,
      height: size,
      opacity: size === 0 ? 0 : 1,
      duration,
      ease: "outExpo",
    });
    const b = animate(dot, {
      scale: size > 60 ? 0 : 1,
      duration: duration / 2,
      ease: "outQuad",
    });
    const c = animate(label, {
      opacity: LABELS[mode] ? 1 : 0,
      scale: LABELS[mode] ? [0.6, 1] : 0.6,
      duration,
      ease: "outExpo",
    });
    return () => {
      a.cancel();
      b.cancel();
      c.cancel();
    };
  }, [mode, reduced]);

  if (!finePointer) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      <motion.div
        ref={ringRef}
        className="absolute top-0 left-0 flex items-center justify-center rounded-full border border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)]"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%", width: 0, height: 0, opacity: 0 }}
      >
        <span ref={labelRef} className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-accent)] opacity-0">
          {LABELS[mode] ?? ""}
        </span>
      </motion.div>
      <motion.div
        className="absolute top-0 left-0"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
      >
        <div ref={dotRef} className="size-1.5 rounded-full bg-[var(--color-fg)]" />
      </motion.div>
    </div>
  );
}
