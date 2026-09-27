"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { ProjectVisual } from "./ProjectVisual";

interface ProjectPanelProps {
  project: Project;
  onOpen: (id: string) => void;
}

/** One project in the showcase: copy on the left, expandable visual on the right. */
export function ProjectPanel({ project, onOpen }: ProjectPanelProps) {
  const links = [
    { label: "LIVE", href: project.liveUrl },
    { label: "GITHUB", href: project.githubUrl },
  ].filter((l) => l.href);

  return (
    <article
      data-project={project.id}
      data-hue={project.hue}
      className="flex shrink-0 flex-col gap-8 lg:h-[74vh] lg:w-[86vw] lg:flex-row lg:items-stretch lg:gap-14"
      aria-labelledby={`project-${project.id}`}
    >
      <div className="flex flex-col justify-between gap-8 lg:w-[38%]">
        <div>
          <span
            data-anim="index"
            className="display block text-[clamp(64px,9vw,140px)] leading-none text-transparent [-webkit-text-stroke:1px_var(--color-muted)]"
            aria-hidden="true"
          >
            {project.index}
          </span>
          <p data-anim="copy" className="label mt-6">
            {project.category}
          </p>
          <h3
            id={`project-${project.id}`}
            data-anim="title"
            className="display mt-3 text-[clamp(34px,4.6vw,72px)] break-words"
          >
            {project.title}
          </h3>
          <p data-anim="copy" className="mt-5 max-w-[440px] text-[16px] leading-relaxed text-[var(--color-muted)]">
            {project.description}
          </p>
        </div>

        <div>
          <ul className="flex flex-wrap gap-2" aria-label="Technologies">
            {project.technologies.map((tech) => (
              <li
                key={tech}
                data-anim="tech"
                className="border border-[var(--color-line)] px-3 py-1.5 font-mono text-[11px] tracking-[0.12em]"
              >
                {tech}
              </li>
            ))}
          </ul>
          <div data-anim="copy" className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpen(project.id)}
              data-cursor="open"
              className="inline-flex min-h-12 items-center gap-2 border border-[var(--color-accent)] px-5 font-mono text-[12px] tracking-[0.18em] text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
            >
              CASE STUDY
              <ArrowUpRight size={14} />
            </button>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-1 px-2 font-mono text-[12px] tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpen(project.id)}
        data-cursor="view"
        aria-label={`Open ${project.title} case study`}
        className="relative block h-[52vw] min-h-[240px] w-full overflow-hidden text-left lg:h-auto lg:flex-1"
      >
        <motion.div layoutId={`visual-${project.id}`} className="absolute inset-0">
          <ProjectVisual project={project} className="size-full" />
        </motion.div>
      </button>
    </article>
  );
}
