"use client";

import dynamic from "next/dynamic";
import { usePerformance } from "@/hooks/usePerformance";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { SceneFallback } from "@/components/ui/SceneFallback";

const ConstellationWorld = dynamic(() => import("@/components/three/ConstellationWorld"), { ssr: false });

/** 3D network of related technologies; hovering a node lights up its connections. */
export function DevConstellation() {
  const perf = usePerformance();
  const reduced = useReducedMotion();

  return (
    <SceneCanvas
      className="relative h-[380px] w-full border border-[var(--color-line)] md:h-[480px]"
      position={[0, 0, 7.5]}
      fov={42}
      fallback={<SceneFallback />}
      label="Interactive 3D network of related technologies"
      glow
    >
      <ConstellationWorld density={perf.density} reduced={reduced} />
    </SceneCanvas>
  );
}
