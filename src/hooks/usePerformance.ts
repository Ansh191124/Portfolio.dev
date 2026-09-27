"use client";

import { useSyncExternalStore } from "react";

export type PerformanceTier = "high" | "low" | "mobile";

export interface PerformanceProfile {
  tier: PerformanceTier;
  webgl: boolean;
  /** Upper bound for the renderer pixel ratio. */
  dpr: number;
  /** Multiplier applied to particle / node counts. */
  density: number;
}

interface NavigatorHints {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

const SERVER_PROFILE: PerformanceProfile = { tier: "low", webgl: false, dpr: 1, density: 0.4 };

let cached: PerformanceProfile | null = null;

const hasWebGL = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

export const getPerformanceProfile = (): PerformanceProfile => {
  if (cached) return cached;
  const hints = navigator as Navigator & NavigatorHints;
  const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
  const weak =
    (hints.deviceMemory !== undefined && hints.deviceMemory <= 4) ||
    navigator.hardwareConcurrency <= 4 ||
    hints.connection?.saveData === true;

  const tier: PerformanceTier = mobile ? "mobile" : weak ? "low" : "high";
  cached = {
    tier,
    webgl: hasWebGL(),
    dpr: tier === "high" ? Math.min(window.devicePixelRatio, 1.5) : 1,
    density: tier === "high" ? 1 : tier === "low" ? 0.5 : 0.35,
  };
  return cached;
};

const subscribe = (): (() => void) => () => undefined;

/** Capability profile used to scale particles, lights and DPR. Static per device. */
export function usePerformance(): PerformanceProfile {
  return useSyncExternalStore(subscribe, getPerformanceProfile, () => SERVER_PROFILE);
}
