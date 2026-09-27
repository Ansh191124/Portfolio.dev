"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { animate } from "animejs";

/** Thin top loading line that sweeps across on every route change. */
export function RouteProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    const bar = barRef.current;
    if (!bar) return;
    const sweep = animate(bar, {
      scaleX: [0, 1],
      opacity: [1, 1],
      duration: 700,
      ease: "outExpo",
      onComplete: () => {
        animate(bar, { opacity: 0, duration: 300, ease: "linear" });
      },
    });
    return () => {
      sweep.cancel();
    };
  }, [pathname]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-0.5">
      <div
        ref={barRef}
        className="h-full origin-left bg-[var(--color-accent)] opacity-0"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
