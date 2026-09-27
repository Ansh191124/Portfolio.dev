"use client";

import { useEffect, useRef, type RefObject } from "react";
import { sceneState } from "@/lib/scene-state";

export interface PointerPosition {
  /** Viewport pixels. */
  x: number;
  y: number;
  /** Normalised -1 → 1 across the viewport. */
  nx: number;
  ny: number;
}

/**
 * Shared, re-render free pointer tracking. A single window listener serves every
 * consumer; read `ref.current` inside animation frames or event handlers.
 */
const position: PointerPosition = { x: 0, y: 0, nx: 0, ny: 0 };
let consumers = 0;

const onMove = (event: PointerEvent): void => {
  position.x = event.clientX;
  position.y = event.clientY;
  position.nx = (event.clientX / window.innerWidth) * 2 - 1;
  position.ny = -((event.clientY / window.innerHeight) * 2 - 1);
  sceneState.pointerX = position.nx;
  sceneState.pointerY = position.ny;
};

export function useMousePosition(): RefObject<PointerPosition> {
  const ref = useRef<PointerPosition>(position);

  useEffect(() => {
    if (consumers === 0) {
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    consumers += 1;
    return () => {
      consumers -= 1;
      if (consumers === 0) window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return ref;
}
