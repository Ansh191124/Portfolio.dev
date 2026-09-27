"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { animate } from "animejs";
import { createSurface, drawCode, type CodeDrawOptions } from "./textures";

interface CodePanelProps extends CodeDrawOptions {
  width: number;
  height: number;
  /** Start revealing when true. */
  active: boolean;
  /** Restart after finishing (terminal-style). */
  loop?: boolean;
  /** Skip the animation and show everything immediately. */
  reduced?: boolean;
}

/**
 * A floating editor / terminal window rendered to a canvas texture. Anime.js
 * drives the reveal: whole lines appear sequentially ("lines") or characters
 * are typed ("chars"). Only the texture changes; no React re-renders occur.
 */
export function CodePanel({
  width,
  height,
  title,
  lines,
  mode,
  active,
  loop = false,
  reduced = false,
}: CodePanelProps) {
  const invalidate = useThree((s) => s.invalidate);
  const surface = useMemo(() => createSurface(1024, Math.round((1024 * height) / width)), [width, height]);
  const total = mode === "lines" ? lines.length : lines.reduce((n, l) => n + l.length + 1, 0);

  useEffect(() => () => surface.texture.dispose(), [surface]);

  useEffect(() => {
    const options: CodeDrawOptions = { title, lines, mode };
    let last = -1;
    const paint = (p: number): void => {
      const q = mode === "lines" ? Math.round(p * 8) : Math.floor(p);
      if (q === last) return;
      last = q;
      drawCode(surface, options, p);
      surface.texture.needsUpdate = true;
      invalidate();
    };

    if (reduced) {
      paint(total + 1);
      return;
    }
    paint(0);
    if (!active) return;

    const state = { p: 0 };
    const animation = animate(state, {
      p: total + (mode === "lines" ? 0 : 6),
      duration: mode === "lines" ? lines.length * 420 : total * 45,
      delay: 500,
      ease: "linear",
      loop,
      loopDelay: 2600,
      onUpdate: () => paint(state.p),
    });
    return () => {
      animation.cancel();
    };
  }, [active, reduced, loop, mode, title, lines, total, surface, invalidate]);

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={surface.texture} toneMapped={false} transparent />
    </mesh>
  );
}
