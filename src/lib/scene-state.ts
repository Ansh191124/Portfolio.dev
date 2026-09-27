/**
 * Mutable state shared between the DOM (GSAP ScrollTrigger, pointer listeners)
 * and the render loops of the 3D scenes. It is deliberately not React state:
 * writing to it never triggers a re-render, and scenes read it every frame.
 */
export const sceneState = {
  /** 0 → 1 while the hero section scrolls out of view. */
  heroScroll: 0,
  /** Normalised pointer position, -1 → 1. */
  pointerX: 0,
  pointerY: 0,
};
