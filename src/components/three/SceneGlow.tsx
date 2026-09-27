"use client";

import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

/**
 * Shared post-processing pass: a tight bloom on the accent-lit edges (monitor
 * glow, node highlights, database rings) plus a faint vignette for depth.
 * Only mounted on higher-tier devices — SceneCanvas skips it otherwise.
 */
export function SceneGlow() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        kernelSize={KernelSize.SMALL}
        luminanceThreshold={0.18}
        luminanceSmoothing={0.3}
        intensity={0.55}
        radius={0.55}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.6} />
    </EffectComposer>
  );
}
