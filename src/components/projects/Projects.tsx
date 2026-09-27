"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { projects } from "@/data/projects";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SplitChars } from "@/components/animations/SplitChars";
import { useInView } from "@/hooks/useInView";
import { CaseStudyOverlay } from "./CaseStudyOverlay";
import { ProjectPanel } from "./ProjectPanel";
import { playProjectText } from "./playProjectText";

/**
 * "Selected Work". On desktop the section pins and the track travels
 * horizontally with vertical scroll (GSAP ScrollTrigger: pin + scrub 1). Each
 * project's image and text animate as it crosses the viewport. On mobile and
 * under reduced motion the projects are a plain vertical list.
 */
export function Projects() {
  const wide = useMediaQuery("(min-width: 1024px)");
  const reduced = useReducedMotion();
  const horizontal = wide && !reduced;

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [headingRef, headingSeen] = useInView<HTMLDivElement>({ once: true, rootMargin: "-10% 0px" });

  const close = useCallback(() => setOpenId(null), []);
  const open = useCallback((id: string) => setOpenId(id), []);

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!track || !pin || reduced) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-project]", track);

      if (!horizontal) {
        panels.forEach((panel) => {
          ScrollTrigger.create({
            trigger: panel,
            start: "top 80%",
            once: true,
            onEnter: () => playProjectText(panel),
          });
        });
        return;
      }

      const distance = (): number => track.scrollWidth - window.innerWidth;
      const scrollTrigger = {
        trigger: pin,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      };

      const travel = gsap.to(track, { x: () => -distance(), ease: "none", scrollTrigger });
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { ...scrollTrigger, pin: false, scrub: true } },
      );

      panels.forEach((panel) => {
        const image = panel.querySelector("[data-visual-image]");
        if (image) {
          gsap.fromTo(
            image,
            { scale: 1.15, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: travel,
                start: "left 95%",
                end: "left 50%",
                scrub: true,
              },
            },
          );
        }
        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: travel,
          start: "left 80%",
          once: true,
          onEnter: () => playProjectText(panel),
        });
        // Background quietly shifts toward the active project's hue.
        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: travel,
          start: "left 55%",
          end: "right 55%",
          onToggle: (self) => {
            if (!self.isActive || !bgRef.current) return;
            gsap.to(bgRef.current, {
              backgroundColor: `hsl(${panel.dataset.hue}, 40%, 4%)`,
              duration: 0.9,
              ease: "power2.out",
              overwrite: true,
            });
          },
        });
      });
    }, pin);

    return () => ctx.revert();
  }, [horizontal, reduced]);

  const openProject = projects.find((p) => p.id === openId) ?? null;

  return (
    <section
      id="projects"
      ref={sectionRef}
      data-motion={reduced ? "off" : "on"}
      aria-labelledby="projects-heading"
      className="relative"
    >
      <div ref={pinRef} className={horizontal ? "relative isolate h-screen overflow-hidden" : "relative isolate py-24"}>
        <div
          ref={bgRef}
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[var(--color-bg)]"
        />
        <div
          ref={trackRef}
          className={
            horizontal
              ? "flex h-full w-max items-center gap-[6vw] px-[8vw]"
              : "flex flex-col gap-24 px-5 md:px-10"
          }
        >
          <div
            ref={headingRef}
            className={horizontal ? "w-[46vw] shrink-0" : "w-full"}
          >
            <p className="label mb-6">
              <span className="mr-3 text-[var(--color-accent)]">04</span>PROJECTS
            </p>
            <h2 id="projects-heading" className="display text-[clamp(52px,9vw,150px)]" aria-label="Selected work.">
              <SplitChars text="SELECTED" play={headingSeen} className="block" gap={24} />
              <SplitChars text="WORK." play={headingSeen} className="block text-[var(--color-accent)]" gap={24} delay={200} />
            </h2>
            <p className="mt-8 max-w-[420px] text-[16px] leading-relaxed text-[var(--color-muted)]">
              {horizontal
                ? "Keep scrolling — the work moves sideways. Select any project for the full case study."
                : "Select any project for the full case study."}
            </p>
          </div>

          {projects.map((project) => (
            <ProjectPanel key={project.id} project={project} onOpen={open} />
          ))}
          {horizontal ? <div className="w-[4vw] shrink-0" aria-hidden="true" /> : null}
        </div>

        {horizontal ? (
          <div className="absolute inset-x-[8vw] bottom-8 h-px bg-[var(--color-line)]" aria-hidden="true">
            <div ref={progressRef} className="h-px origin-left bg-[var(--color-accent)]" />
          </div>
        ) : null}
      </div>

      <CaseStudyOverlay project={openProject} onClose={close} />
    </section>
  );
}
