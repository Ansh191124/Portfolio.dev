/**
 * Tracks which essential assets are ready so the loading screen can leave the
 * moment the experience is usable — never on a fixed timer.
 */
export type ReadyKey = "mounted" | "fonts" | "scene";

const REQUIRED: readonly ReadyKey[] = ["mounted", "fonts", "scene"];

const done = new Set<ReadyKey>();
const listeners = new Set<() => void>();
let snapshot = 0;

const emit = (): void => {
  snapshot = done.size;
  listeners.forEach((l) => l());
};

export const markReady = (key: ReadyKey): void => {
  if (done.has(key)) return;
  done.add(key);
  emit();
};

export const subscribeReady = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getReadyCount = (): number => snapshot;
export const getReadyTotal = (): number => REQUIRED.length;
export const getServerReadyCount = (): number => 0;
