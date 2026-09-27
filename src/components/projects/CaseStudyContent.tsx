"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/animations/Reveal";

const ArchitectureFlow = dynamic(() => import("./ArchitectureFlow"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[260px] place-items-center border border-[var(--color-line)] label">LOADING DIAGRAM</div>
  ),
});

function Block({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal className="grid gap-4 border-t border-[var(--color-line)] py-10 md:grid-cols-[220px_1fr] md:gap-10">
      <h3 className="label">
        <span className="mr-3 text-[var(--color-accent)]">{index}</span>
        {title}
      </h3>
      <div className="max-w-[820px]">{children}</div>
    </Reveal>
  );
}

/** The full case study body, shared by the fullscreen overlay and the /projects/[id] page. */
export function CaseStudyContent({ project }: { project: Project }) {
  const links = [
    { label: "LIVE DEMO", href: project.liveUrl },
    { label: "GITHUB", href: project.githubUrl },
  ].filter((l) => l.href);

  return (
    <div>
      <Block index="01" title="PROBLEM">
        <p className="text-[20px] leading-relaxed md:text-[24px]">{project.problem}</p>
      </Block>
      <Block index="02" title="SOLUTION">
        <p className="text-[20px] leading-relaxed md:text-[24px]">{project.solution}</p>
      </Block>
      <Block index="03" title="ARCHITECTURE">
        <ArchitectureFlow nodes={project.architecture} />
      </Block>
      <Block index="04" title="TECHNOLOGY">
        <ul className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <li key={tech} className="border border-[var(--color-line)] px-3 py-1.5 font-mono text-[12px] tracking-[0.1em]">
              {tech}
            </li>
          ))}
        </ul>
      </Block>
      <Block index="05" title="ENGINEERING CHALLENGES">
        <ul className="space-y-4">
          {project.challenges.map((challenge) => (
            <li key={challenge} className="flex gap-4 text-[17px] leading-relaxed text-[var(--color-muted)]">
              <span className="mt-2.5 size-1.5 shrink-0 bg-[var(--color-accent)]" aria-hidden="true" />
              {challenge}
            </li>
          ))}
        </ul>
      </Block>
      <Block index="06" title="RESULT">
        <p className="text-[17px] leading-relaxed text-[var(--color-muted)]">{project.result}</p>
      </Block>
      <Block index="07" title="LINKS">
        {links.length > 0 ? (
          <ul className="flex flex-wrap gap-3">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="open"
                  className="inline-flex min-h-12 items-center gap-2 border border-[var(--color-line)] px-5 font-mono text-[12px] tracking-[0.18em] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  {link.label}
                  <ArrowUpRight size={14} />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[17px] text-[var(--color-muted)]">Links will be added when this project is public.</p>
        )}
      </Block>
    </div>
  );
}
