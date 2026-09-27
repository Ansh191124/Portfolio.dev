"use client";

import { motion, type Variants } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface WordRevealProps {
  /** Lines of text; each line is split into independently animated words. */
  lines: string[];
  className?: string;
  wordClassName?: string;
}

const wordVariants: Variants = {
  hidden: { y: "110%", clipPath: "inset(0 0 100% 0)" },
  visible: {
    y: "0%",
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Mask reveal: each word rises through a clip-path (Framer Motion). */
export function WordReveal({ lines, className, wordClassName }: WordRevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.span
      className={`block ${className ?? ""}`}
      initial={reduced ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ staggerChildren: 0.09 }}
      aria-label={lines.join(" ")}
    >
      {lines.map((line) => (
        <span key={line} className="block" aria-hidden="true">
          {line.split(" ").map((word, i) => (
            <span key={`${word}-${i}`} className="mr-[0.24em] inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span variants={wordVariants} className={`inline-block ${wordClassName ?? ""}`}>
                {word}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}
