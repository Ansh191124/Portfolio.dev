"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { publishLenis } from "@/hooks/useLenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Lenis smooth scrolling driven by the GSAP ticker — the single scroll loop.
 * ScrollTrigger is updated from Lenis' scroll event so pins and scrubs stay
 * perfectly in sync. Disabled entirely for reduced-motion users.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    // Pinned sections and the loader assume a start at the top of the page.
    history.scrollRestoration = "manual";
    if (reduced) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true });
    const tick = (time: number): void => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    publishLenis(lenis);

    return () => {
      gsap.ticker.remove(tick);
      publishLenis(null);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
