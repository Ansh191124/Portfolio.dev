"use client";

import { useSyncExternalStore } from "react";
import {
  getReadyCount,
  getReadyTotal,
  getServerReadyCount,
  subscribeReady,
} from "@/lib/ready-store";

/** Number of essential assets that are ready (0 → total). */
export function useReadyCount(): number {
  return useSyncExternalStore(subscribeReady, getReadyCount, getServerReadyCount);
}

/** True once every essential asset is ready. */
export function useExperienceReady(): boolean {
  return useReadyCount() >= getReadyTotal();
}
