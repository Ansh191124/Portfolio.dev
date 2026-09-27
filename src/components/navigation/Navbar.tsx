"use client";

import { useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { Menu } from "lucide-react";
import { externalNav, navItems, sections, site } from "@/data/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useLenis } from "@/hooks/useLenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { scrollToSection } from "@/lib/scroll";
import { MobileMenu } from "./MobileMenu";

/**
 * Floating navigation. Transparent at the top; blurred with a border after
 * scrolling; compresses while scrolling down and expands while scrolling up.
 */
export function Navbar() {
  const { y, direction } = useScrollProgress();
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const active = useActiveSection();
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(y, "change", (latest) => {
    const isScrolled = latest > 24;
    setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
    const isCompact = latest > 240 && direction.get() > 0;
    setCompact((prev) => (prev === isCompact ? prev : isCompact));
  });
  useMotionValueEvent(direction, "change", (dir) => {
    if (dir < 0) setCompact(false);
  });

  const activeId = sections[active]?.id;

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 md:px-6"
        initial={reduced ? false : { y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.nav
          aria-label="Primary"
          layout
          animate={{ paddingTop: compact ? 8 : 16, paddingBottom: compact ? 8 : 16 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`mt-3 flex w-full max-w-[1400px] items-center justify-between gap-6 border px-4 transition-[background-color,border-color,backdrop-filter] duration-500 md:px-6 ${
            scrolled
              ? "border-[var(--color-line)] bg-[rgb(5_5_5/0.72)] backdrop-blur-md"
              : "border-transparent bg-transparent"
          }`}
        >
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(lenis, "home", reduced);
            }}
            className="-my-3 flex min-h-11 items-center font-mono text-[13px] font-medium tracking-[0.2em] text-[var(--color-fg)]"
            data-cursor="open"
          >
            {site.brand}
          </a>

          <ul className="hidden items-center gap-7 lg:flex">
            {navItems.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(lenis, item.id, reduced);
                  }}
                  aria-current={activeId === item.id ? "true" : undefined}
                  className={`group relative font-mono text-[11px] tracking-[0.18em] transition-colors ${
                    activeId === item.id
                      ? "text-[var(--color-fg)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-fg)]"
                  }`}
                >
                  <span className="mr-1.5 text-[var(--color-accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-[var(--color-accent)] transition-all duration-300 ${
                      activeId === item.id ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-5 lg:flex">
              {externalNav.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
            <button
              type="button"
              className="grid size-11 place-items-center border border-[var(--color-line)] text-[var(--color-fg)] lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </motion.nav>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} activeId={activeId} />
    </>
  );
}
