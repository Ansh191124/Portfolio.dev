"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Project } from "@/data/projects";
import { useModalA11y } from "@/hooks/useModalA11y";
import { useMounted } from "@/hooks/useMounted";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CaseStudyContent } from "./CaseStudyContent";
import { ProjectVisual } from "./ProjectVisual";

interface CaseStudyOverlayProps {
  project: Project | null;
  onClose: () => void;
}

/**
 * Fullscreen case study. The visual shares a `layoutId` with the project panel
 * so it expands from the card into the banner (Framer Motion). ESC closes.
 */
export function CaseStudyOverlay({ project, onClose }: CaseStudyOverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mounted = useMounted();
  useModalA11y(ref, project !== null, onClose);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {project ? (
        <motion.div
          key={project.id}
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-title"
          tabIndex={-1}
          data-lenis-prevent
          className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-[var(--color-bg)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.35 }}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-line)] bg-[rgb(5_5_5/0.8)] px-5 py-4 backdrop-blur-md md:px-10">
            <span className="label">
              <span className="mr-3 text-[var(--color-accent)]">{project.index}</span>
              CASE STUDY
            </span>
            <div className="flex items-center gap-3">
              <Link
                href={`/projects/${project.id}`}
                className="hidden font-mono text-[11px] tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-accent)] sm:inline"
              >
                OPEN AS PAGE ↗
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                data-cursor="open"
                className="grid size-11 place-items-center border border-[var(--color-line)] hover:border-[var(--color-accent)]"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="mx-auto max-w-[1200px] px-5 pt-8 pb-24 md:px-10">
            <motion.div layoutId={`visual-${project.id}`} className="relative h-[42vh] min-h-[260px] w-full">
              <ProjectVisual project={project} className="size-full" interactive={false} />
            </motion.div>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="label mt-10">{project.category}</p>
              <h2 id="case-title" className="display mt-3 text-[clamp(40px,8vw,112px)]">
                {project.title}
              </h2>
              <p className="mt-6 max-w-[720px] text-[18px] leading-relaxed text-[var(--color-muted)]">
                {project.description}
              </p>
            </motion.div>

            <div className="mt-16">
              <CaseStudyContent project={project} />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
