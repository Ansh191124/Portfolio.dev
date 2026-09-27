"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { ChevronDown } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneState } from "@/lib/scene-state";
import { useExperienceReady } from "@/hooks/useExperienceReady";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMousePosition } from "@/hooks/useMousePosition";
import { SplitChars } from "@/components/animations/SplitChars";
import { ScrambleText } from "@/components/animations/ScrambleText";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { site } from "@/data/site";
import { HeroScene } from "./HeroScene";

const HEADING = ["BUILDING", "DIGITAL", "SYSTEMS."] as const;

/**
 * Full-viewport hero. The heading is revealed by Anime.js; scrolling out is a
 * GSAP ScrollTrigger scrub that lifts the text and feeds `sceneState.heroScroll`
 * to the 3D world (camera push, monitor rotation, particle spread).
 */
export function Hero() {
  const ready = useExperienceReady();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  useMousePosition();

  // Supporting copy follows the heading once the experience is ready.
  useEffect(() => {
    if (!ready || reduced) return;
    const items = subRef.current?.querySelectorAll<HTMLElement>("[data-hero-item]");
    if (!items) return;
    const animation = animate(items, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 900,
      delay: stagger(120, { start: 900 }),
      ease: "outExpo",
    });
    return () => {
      animation.cancel();
    };
  }, [ready, reduced]);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          sceneState.heroScroll = self.progress;
        },
      });
      if (!reduced) {
        gsap.to(content, {
          yPercent: -18,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: "70% top", scrub: true },
        });
      }
      return () => trigger.kill();
    }, section);

    return () => {
      ctx.revert();
      sceneState.heroScroll = 0;
    };
  }, [reduced]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-svh overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div aria-hidden="true" className="grid-bg absolute inset-0" />
      <HeroScene />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-full bg-gradient-to-r from-[var(--color-bg)]/80 via-[var(--color-bg)]/45 to-transparent lg:w-[62%]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />

      <div
        ref={contentRef}
        className="pointer-events-none relative z-10 flex min-h-svh flex-col justify-center px-5 pt-28 pb-24 md:px-10 lg:px-16"
      >
        <div className="max-w-[820px]">
          <p className="label mb-6 text-[var(--color-accent)]">
            <ScrambleText text={site.role.toUpperCase()} />
          </p>

          <h1 id="hero-heading" className="display text-[clamp(52px,11vw,168px)]" aria-label="Building digital systems.">
            {HEADING.map((word, i) => (
              <SplitChars
                key={word}
                as="span"
                text={word}
                play={ready}
                delay={i * 260}
                className={`block ${i === 2 ? "text-[var(--color-accent)]" : ""}`}
              />
            ))}
          </h1>

          <div ref={subRef} className="mt-8 max-w-[520px]">
            <p
              data-hero-item
              className={`font-mono text-[12px] tracking-[0.14em] text-[var(--color-fg)] uppercase md:text-[13px] ${reduced ? "" : "opacity-0"}`}
            >
              Web <span className="text-[var(--color-accent)]">•</span> AI{" "}
              <span className="text-[var(--color-accent)]">•</span> Backend{" "}
              <span className="text-[var(--color-accent)]">•</span> Interactive Experiences
            </p>
            <p
              data-hero-item
              className={`mt-4 text-[16px] leading-relaxed text-[var(--color-muted)] md:text-[18px] ${reduced ? "" : "opacity-0"}`}
            >
              I build modern web applications, intelligent systems and interactive digital experiences.
            </p>
            <div
              data-hero-item
              className={`pointer-events-auto mt-9 flex flex-wrap gap-3 ${reduced ? "" : "opacity-0"}`}
            >
              <MagneticButton variant="solid" section="projects">
                View Projects
              </MagneticButton>
              <MagneticButton section="contact">Contact Me</MagneticButton>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-5 z-10 flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-[var(--color-muted)] md:left-10 lg:left-16"
      >
        <ChevronDown size={14} className="text-[var(--color-accent)]" />
        SCROLL
      </div>
    </section>
  );
}
