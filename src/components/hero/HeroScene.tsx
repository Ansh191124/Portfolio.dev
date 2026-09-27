"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { markReady } from "@/lib/ready-store";
import { getPerformanceProfile, usePerformance } from "@/hooks/usePerformance";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useExperienceReady } from "@/hooks/useExperienceReady";
import { SceneFallback } from "@/components/ui/SceneFallback";
import { SceneCanvas } from "@/components/three/SceneCanvas";

/** three.js is code-split away from the initial bundle. */
const HeroWorld = dynamic(() => import("@/components/three/HeroWorld"), { ssr: false });

/** The hero's 3D developer workspace. Signals readiness on its first frame. */
export function HeroScene() {
  const perf = usePerformance();
  const reduced = useReducedMotion();
  const ready = useExperienceReady();

  useEffect(() => {
    // Without WebGL there is no scene to wait for.
    if (!getPerformanceProfile().webgl) markReady("scene");
  }, []);

  return (
    <SceneCanvas
      className="absolute inset-0 opacity-40 lg:opacity-100"
      position={[0, 0, 8]}
      fov={38}
      fallback={<SceneFallback />}
      onReady={() => markReady("scene")}
      glow
    >
      <HeroWorld density={perf.density} reduced={reduced} active={ready} />
    </SceneCanvas>
  );
}
