"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { usePerformance } from "@/hooks/usePerformance";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SceneGlow } from "./SceneGlow";

interface SceneCanvasProps {
  children: ReactNode;
  className?: string;
  position?: [number, number, number];
  fov?: number;
  /** Rendered when WebGL is unavailable or before the canvas mounts. */
  fallback?: ReactNode;
  onReady?: () => void;
  /** Pause rendering without unmounting (e.g. while a modal covers it). */
  paused?: boolean;
  label?: string;
  /** Adds a soft bloom + vignette pass. Skipped on lower-tier devices regardless. */
  glow?: boolean;
}

/**
 * Shared R3F canvas. Mounts only near the viewport (IntersectionObserver),
 * caps DPR by device tier, drops antialiasing on weaker devices, switches to
 * on-demand rendering under reduced motion, and degrades to a fallback
 * without WebGL.
 */
export function SceneCanvas({
  children,
  className,
  position = [0, 0, 8],
  fov = 40,
  fallback,
  onReady,
  paused = false,
  label,
  glow = false,
}: SceneCanvasProps) {
  const perf = usePerformance();
  const reduced = useReducedMotion();
  const [ref, near] = useInView<HTMLDivElement>({ rootMargin: "200px" });

  return (
    <div
      ref={ref}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {perf.webgl && near ? null : fallback}
      {perf.webgl && near ? (
        <Canvas
          className="!absolute inset-0"
          dpr={[1, perf.dpr]}
          camera={{ position, fov, near: 0.1, far: 60 }}
          gl={{
            antialias: perf.tier === "high",
            alpha: true,
            powerPreference: perf.tier === "high" ? "high-performance" : "default",
          }}
          frameloop={paused ? "never" : reduced ? "demand" : "always"}
          onCreated={() => onReady?.()}
        >
          {children}
          {glow && perf.tier === "high" && !reduced ? (
            <Suspense fallback={null}>
              <SceneGlow />
            </Suspense>
          ) : null}
        </Canvas>
      ) : null}
    </div>
  );
}
