"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Re-mounts on every navigation, giving each page an entrance transition:
 * opacity 0 → 1 with a slight 0.98 → 1 scale. (The App Router unmounts the old
 * page immediately, so the exit half is carried by the top loading line.)
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: "50% 0" }}
    >
      {children}
    </motion.div>
  );
}
