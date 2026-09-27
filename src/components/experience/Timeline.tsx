"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { milestones } from "@/data/profile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ScrambleText } from "@/components/animations/ScrambleText";

/**
 * Vertical timeline: a large line draws as the visitor scrolls (Framer Motion
 * scroll progress) and each milestone resolves from scale 0.8 / blur 10px.
 */
export function Timeline() {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <ol ref={ref} className="relative mt-16 space-y-20 pl-10 md:pl-24">
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-[7px] w-px bg-[var(--color-line)] md:left-[23px]" />
      <motion.span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-[var(--color-accent)] md:left-[23px]"
        style={{ scaleY: reduced ? 1 : scaleY }}
      />
      {milestones.map((m) => (
        <motion.li
          key={m.id}
          className="relative"
          initial={reduced ? false : { opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "left center" }}
        >
          <span
            aria-hidden="true"
            className="absolute top-3 -left-10 size-[15px] border border-[var(--color-accent)] bg-[var(--color-bg)] md:-left-24 md:ml-4"
          />
          <p className="label">
            <span className="mr-3 text-[var(--color-accent)]">{m.index}</span>
          </p>
          <h4 className="display mt-2 text-[clamp(28px,5vw,64px)]">
            <ScrambleText text={m.title.toUpperCase()} />
          </h4>
          <p className="mt-3 max-w-[520px] text-[16px] leading-relaxed text-[var(--color-muted)]">{m.text}</p>
        </motion.li>
      ))}
    </ol>
  );
}
