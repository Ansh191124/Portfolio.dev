"use client";

import { useSyncExternalStore } from "react";
import type Lenis from "lenis";

let instance: Lenis | null = null;
const listeners = new Set<() => void>();

/** Called by the SmoothScroll provider only. */
export const publishLenis = (next: Lenis | null): void => {
  instance = next;
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** The active Lenis instance, or null (reduced motion / before mount). */
export function useLenis(): Lenis | null {
  return useSyncExternalStore(
    subscribe,
    () => instance,
    () => null,
  );
}
