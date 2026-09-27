"use client";

import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import { experiments, type Experiment } from "@/data/profile";
import { useModalA11y } from "@/hooks/useModalA11y";
import { useMounted } from "@/hooks/useMounted";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ScrambleText } from "@/components/animations/ScrambleText";
import { ExperimentView } from "./ExperimentView";

function ExperimentModal({ experiment, onClose }: { experiment: Experiment | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mounted = useMounted();
  useModalA11y(ref, experiment !== null, onClose);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {experiment ? (
        <motion.div
          key="lab-backdrop"
          className="fixed inset-0 z-[70] grid place-items-center bg-[rgb(5_5_5/0.9)] p-3 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={ref}
            layoutId={`lab-${experiment.id}`}
            role="dialog"
            aria-modal="true"
            aria-label={`Experiment ${experiment.index}: ${experiment.title}`}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[85vh] w-full max-w-[1200px] flex-col overflow-hidden border border-[var(--color-line)] bg-[var(--color-bg)]"
            transition={{ duration: reduced ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
              <div>
                <p className="label">
                  <span className="mr-3 text-[var(--color-accent)]">EXPERIMENT {experiment.index}</span>
                </p>
                <p className="display mt-1 text-[22px] md:text-[28px]">{experiment.title}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close experiment"
                className="grid size-11 place-items-center border border-[var(--color-line)] hover:border-[var(--color-accent)]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative flex-1" data-cursor="drag">
              <ExperimentView id={experiment.id} />
            </div>
            <p className="border-t border-[var(--color-line)] px-5 py-3 text-[14px] text-[var(--color-muted)]">
              {experiment.blurb} <span className="label ml-2">ESC TO CLOSE</span>
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/** "The Lab": five expandable experiments. Cards run live; expanding pauses the card's twin. */
export function Lab() {
  const [openId, setOpenId] = useState<string | null>(null);
  const close = useCallback(() => setOpenId(null), []);
  const open = experiments.find((e) => e.id === openId) ?? null;

  return (
    <section id="lab" aria-labelledby="lab-heading" className="relative px-5 py-32 md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
        <p className="label mb-6">
          <span className="mr-3 text-[var(--color-accent)]">06</span>LAB
        </p>
        <h2 id="lab-heading" className="display text-[clamp(44px,8vw,128px)]">
          <ScrambleText text="THE LAB" />
        </h2>
        <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-[var(--color-muted)]">
          Small experiments in motion, WebGL and interaction. Move over them, then expand any one.
        </p>

        <ul className="mt-14 grid gap-3 md:grid-cols-6">
          {experiments.map((exp, i) => (
            <li key={exp.id} className={i < 2 ? "md:col-span-3" : "md:col-span-2"}>
              <motion.div
                layoutId={`lab-${exp.id}`}
                className="group relative h-[340px] overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)]"
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="absolute inset-0" data-cursor="drag">
                  <ExperimentView id={exp.id} paused={openId === exp.id} />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent p-5 pt-16">
                  <p className="label">
                    <span className="mr-3 text-[var(--color-accent)]">{exp.index}</span>
                  </p>
                  <p className="mt-1 font-mono text-[13px] tracking-[0.14em]">{exp.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(exp.id)}
                  aria-label={`Expand experiment ${exp.index}: ${exp.title}`}
                  data-cursor="open"
                  className="absolute top-3 right-3 grid size-11 place-items-center border border-[var(--color-line)] bg-[var(--color-bg)]/80 backdrop-blur transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Maximize2 size={16} />
                </button>
              </motion.div>
            </li>
          ))}
        </ul>
      </div>
      <ExperimentModal experiment={open} onClose={close} />
    </section>
  );
}
