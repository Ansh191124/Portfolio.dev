"use client";

import { useSyncExternalStore } from "react";

const subscribe = (): (() => void) => () => undefined;

/** False during SSR and hydration, true afterwards — safe for portals. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
