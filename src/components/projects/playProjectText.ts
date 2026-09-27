import { animate, stagger } from "animejs";

/**
 * Anime.js entrance for a project panel's text: number and copy rise, the title
 * slides in from the right (x: 100 → 0) and technologies stagger up from the
 * bottom. Idempotent per panel.
 */
export const playProjectText = (panel: HTMLElement): void => {
  if (panel.dataset.played === "true") return;
  panel.dataset.played = "true";
  const pick = (selector: string): NodeListOf<HTMLElement> =>
    panel.querySelectorAll<HTMLElement>(selector);

  animate(pick('[data-anim="index"]'), {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 700,
    ease: "outExpo",
  });
  animate(pick('[data-anim="title"]'), {
    opacity: [0, 1],
    translateX: [100, 0],
    duration: 1100,
    ease: "outExpo",
  });
  animate(pick('[data-anim="copy"]'), {
    opacity: [0, 1],
    translateY: [16, 0],
    duration: 800,
    delay: stagger(120, { start: 250 }),
    ease: "outExpo",
  });
  animate(pick('[data-anim="tech"]'), {
    opacity: [0, 1],
    translateY: [32, 0],
    duration: 700,
    delay: stagger(70, { start: 450, from: "last" }),
    ease: "outExpo",
  });
};
