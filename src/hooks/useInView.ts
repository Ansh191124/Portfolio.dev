"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface Options {
  /** Stay `true` after first intersection. */
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/** IntersectionObserver-based visibility flag. */
export function useInView<T extends Element>({
  once = false,
  rootMargin = "0px",
  threshold = 0,
}: Options = {}): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return [ref, inView];
}
