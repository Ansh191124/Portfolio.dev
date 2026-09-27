"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { animate, stagger } from "animejs";
import { X } from "lucide-react";
import { externalNav, navItems, site } from "@/data/site";
import { useLenis } from "@/hooks/useLenis";
import { useModalA11y } from "@/hooks/useModalA11y";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scrollToSection } from "@/lib/scroll";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  activeId?: string;
}

/** Fullscreen menu; items enter with an Anime.js stagger. */
export function MobileMenu({ open, onClose, activeId }: MobileMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const close = useCallback(() => onClose(), [onClose]);

  useModalA11y(ref, open, close);

  useEffect(() => {
    if (!open || reduced) return;
    const items = ref.current?.querySelectorAll<HTMLElement>("[data-menu-item]");
    if (!items || items.length === 0) return;
    const animation = animate(items, {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 700,
      delay: stagger(70, { start: 250 }),
      ease: "outExpo",
    });
    return () => {
      animation.cancel();
    };
  }, [open, reduced]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={ref}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabIndex={-1}
          className="fixed inset-0 z-[80] flex flex-col bg-[var(--color-bg)] px-6 pt-5 pb-10 lg:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduced ? 0 : 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[13px] tracking-[0.2em]">{site.brand}</span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="grid size-11 place-items-center border border-[var(--color-line)]"
            >
              <X size={18} />
            </button>
          </div>

          <ul className="mt-14 flex flex-1 flex-col gap-1">
            {navItems.map((item, i) => (
              <li key={item.id} data-menu-item className={reduced ? "" : "opacity-0"}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    window.setTimeout(() => scrollToSection(lenis, item.id, reduced), 50);
                  }}
                  className={`flex min-h-16 items-baseline gap-4 border-b border-[var(--color-line)] py-3 ${
                    activeId === item.id ? "text-[var(--color-accent)]" : "text-[var(--color-fg)]"
                  }`}
                >
                  <span className="font-mono text-[12px] text-[var(--color-muted)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="display text-[clamp(32px,10vw,56px)]">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex gap-6">
            {externalNav.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="label flex min-h-11 items-center"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
