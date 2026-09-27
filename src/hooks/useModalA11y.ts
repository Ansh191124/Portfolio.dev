"use client";

import { useEffect, type RefObject } from "react";
import { useLenis } from "./useLenis";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal behaviour: ESC to close, focus trap, focus restoration and
 * pausing of smooth scrolling while the dialog is open.
 */
export function useModalA11y(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
): void {
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, onClose, ref, lenis]);
}
