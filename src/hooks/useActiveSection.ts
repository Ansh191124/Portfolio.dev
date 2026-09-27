"use client";

import { useEffect, useState } from "react";
import { sections } from "@/data/site";

/** Index (0-based) of the section currently crossing the viewport centre. */
export function useActiveSection(): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = sections.findIndex((s) => s.id === entry.target.id);
          if (idx >= 0) setActive(idx);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return active;
}
