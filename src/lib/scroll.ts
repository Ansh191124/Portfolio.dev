import type Lenis from "lenis";

/** Smooth-scroll to a section id, falling back to native scrolling. */
export const scrollToSection = (
  lenis: Lenis | null,
  id: string,
  reducedMotion = false,
): void => {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { duration: reducedMotion ? 0 : 1.6, immediate: reducedMotion });
  } else {
    el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }
  history.replaceState(null, "", `#${id}`);
};
