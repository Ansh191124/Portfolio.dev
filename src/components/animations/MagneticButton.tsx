"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import { useState, type PointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLenis } from "@/hooks/useLenis";
import { scrollToSection } from "@/lib/scroll";

const MAX_PULL = 12;
const SPRING = { stiffness: 220, damping: 16, mass: 0.4 };

interface BaseProps {
  children: ReactNode;
  variant?: "solid" | "outline";
  className?: string;
  /** Scroll to an on-page section instead of following an href. */
  section?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  cursor?: "open" | "view";
}

/**
 * Reusable magnetic button. Pulls up to 12px toward the pointer with spring
 * physics, nudges its label, and expands its background on hover.
 */
export function MagneticButton({
  children,
  variant = "outline",
  className = "",
  section,
  href,
  external,
  onClick,
  ariaLabel,
  cursor = "open",
}: BaseProps) {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const [hovered, setHovered] = useState(false);
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);
  const labelX = useSpring(useMotionValue(0), SPRING);
  const labelY = useSpring(useMotionValue(0), SPRING);

  const handleMove = (event: PointerEvent<HTMLElement>): void => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    x.set(Math.max(-1, Math.min(1, dx)) * MAX_PULL);
    y.set(Math.max(-1, Math.min(1, dy)) * MAX_PULL * 0.7);
    labelX.set(dx * 4);
    labelY.set(dy * 3);
  };

  const reset = (): void => {
    setHovered(false);
    x.set(0);
    y.set(0);
    labelX.set(0);
    labelY.set(0);
  };

  const base =
    "group relative inline-flex min-h-12 items-center justify-center overflow-hidden px-6 py-3 font-mono text-[12px] tracking-[0.18em] uppercase select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]";
  const border =
    variant === "solid"
      ? "border border-[var(--color-accent)] text-[var(--color-bg)]"
      : "border border-[var(--color-line)] text-[var(--color-fg)] hover:border-[var(--color-fg)]";

  const content = (
    <>
      <motion.span
        aria-hidden="true"
        className={`absolute inset-0 origin-bottom ${
          variant === "solid" ? "bg-[var(--color-accent)]" : "bg-[var(--color-fg)]"
        }`}
        initial={false}
        animate={{ scaleY: variant === "solid" ? (hovered ? 0 : 1) : hovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className={`relative z-10 flex items-center gap-2 transition-colors duration-300 ${
          variant === "solid"
            ? hovered
              ? "text-[var(--color-accent)]"
              : ""
            : hovered
              ? "text-[var(--color-bg)]"
              : ""
        }`}
        style={{ x: labelX, y: labelY }}
      >
        {children}
      </motion.span>
    </>
  );

  const common = {
    className: `${base} ${border} ${className}`,
    style: { x, y },
    onPointerMove: handleMove,
    onPointerEnter: () => setHovered(true),
    onPointerLeave: reset,
    onFocus: () => setHovered(true),
    onBlur: reset,
    "data-cursor": cursor,
    "data-magnetic": "",
    "aria-label": ariaLabel,
  } as const;

  if (href && !section) {
    const anchorProps: HTMLMotionProps<"a"> = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};
    return (
      <motion.a href={href} {...anchorProps} {...common}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      {...common}
      onClick={() => {
        if (section) scrollToSection(lenis, section, reduced);
        onClick?.();
      }}
    >
      {content}
    </motion.button>
  );
}
