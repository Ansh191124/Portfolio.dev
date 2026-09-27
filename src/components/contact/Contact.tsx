"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { animate } from "animejs";
import { Check, Copy } from "lucide-react";
import { site } from "@/data/site";
import { usePerformance } from "@/hooks/usePerformance";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { SplitChars } from "@/components/animations/SplitChars";
import { useInView } from "@/hooks/useInView";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { SceneFallback } from "@/components/ui/SceneFallback";

const ContactNetwork = dynamic(() => import("@/components/three/ContactNetwork"), { ssr: false });

/** Cinematic closing section over an interactive node network. */
export function Contact() {
  const perf = usePerformance();
  const reduced = useReducedMotion();
  const [headingRef, seen] = useInView<HTMLHeadingElement>({ once: true, rootMargin: "-10% 0px" });
  const [copied, setCopied] = useState(false);
  const toastRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>(0);

  const copyEmail = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      return;
    }
    setCopied(true);
    const toast = toastRef.current;
    if (toast && !reduced) {
      animate(toast, {
        opacity: [0, 1],
        translateY: [12, 0],
        filter: ["blur(6px)", "blur(0px)"],
        duration: 500,
        ease: "outExpo",
      });
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (toast && !reduced) {
        animate(toast, {
          opacity: 0,
          translateY: -8,
          duration: 350,
          ease: "inQuad",
          onComplete: () => setCopied(false),
        });
      } else {
        setCopied(false);
      }
    }, 2000);
  };

  const socials = [
    { label: "GITHUB", href: site.githubUrl },
    { label: "LINKEDIN", href: site.linkedinUrl },
  ].filter((s) => s.href);

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative flex min-h-svh items-center overflow-hidden px-5 py-32 md:px-10 lg:px-16"
    >
      <SceneCanvas
        className="absolute inset-0"
        position={[0, 0, 7]}
        fov={50}
        fallback={<SceneFallback />}
        glow
      >
        <ContactNetwork count={Math.round(46 * perf.density)} reduced={reduced} />
      </SceneCanvas>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-bg)_85%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        <p className="label mb-8">
          <span className="mr-3 text-[var(--color-accent)]">07</span>CONTACT
        </p>
        <h2
          id="contact-heading"
          ref={headingRef}
          className="display text-[clamp(48px,10vw,168px)]"
          aria-label="Let's build something."
        >
          <SplitChars text="LET'S BUILD" play={seen} className="block" gap={26} />
          <SplitChars text="SOMETHING." play={seen} className="block text-[var(--color-accent)]" gap={26} delay={300} />
        </h2>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          {site.email ? (
            <div className="relative">
              <MagneticButton variant="solid" onClick={copyEmail} ariaLabel={`Copy email address ${site.email}`}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {site.email}
              </MagneticButton>
              <span
                ref={toastRef}
                role="status"
                aria-live="polite"
                className="pointer-events-none absolute top-full left-0 mt-3 font-mono text-[11px] tracking-[0.22em] text-[var(--color-accent)] opacity-0"
              >
                {copied ? "EMAIL COPIED" : ""}
              </span>
            </div>
          ) : null}
          {socials.map((s) => (
            <MagneticButton key={s.label} href={s.href} external>
              {s.label} ↗
            </MagneticButton>
          ))}
        </div>

        {!site.email && socials.length === 0 ? (
          <p className="mt-10 max-w-[420px] text-[16px] text-[var(--color-muted)]">
            Contact details will appear here once they are configured.
          </p>
        ) : null}
      </div>
    </section>
  );
}
