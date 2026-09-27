"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getTech, stackCategories, technologies, type StackCategory, type Tech } from "@/data/stack";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const W = 1000;
const H = 620;

interface PlacedTech extends Tech {
  x: number;
  y: number;
}

/** Deterministic cluster layout: categories around an ellipse, techs on a small ring. */
const layout = (): { placed: PlacedTech[]; centers: Record<StackCategory, { x: number; y: number }> } => {
  const centers = {} as Record<StackCategory, { x: number; y: number }>;
  const placed: PlacedTech[] = [];
  stackCategories.forEach((category, i) => {
    const angle = (-90 + i * 60) * (Math.PI / 180);
    const cx = W / 2 + Math.cos(angle) * 330;
    const cy = H / 2 + Math.sin(angle) * 215;
    centers[category] = { x: cx, y: cy };
    const members = technologies.filter((t) => t.category === category);
    const radius = members.length === 1 ? 0 : members.length <= 3 ? 62 : 96;
    members.forEach((tech, j) => {
      const a = (j / members.length) * Math.PI * 2 - Math.PI / 2 + i;
      placed.push({ ...tech, x: cx + Math.cos(a) * radius * 1.25, y: cy + Math.sin(a) * radius });
    });
  });
  return { placed, centers };
};

export function StackConstellation() {
  const desktop = useMediaQuery("(min-width: 768px)");
  const reduced = useReducedMotion();
  const { placed, centers } = useMemo(() => layout(), []);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const focus = hovered ?? selected;
  const related = new Set<string>(focus ? [focus, ...(getTech(focus)?.related ?? [])] : []);
  const selectedTech = selected ? getTech(selected) : undefined;

  const edges = useMemo(() => {
    const seen = new Set<string>();
    const list: { a: PlacedTech; b: PlacedTech }[] = [];
    placed.forEach((a) => {
      a.related.forEach((rid) => {
        const key = [a.id, rid].sort().join("|");
        const b = placed.find((p) => p.id === rid);
        if (!b || seen.has(key)) return;
        seen.add(key);
        list.push({ a, b });
      });
    });
    return list;
  }, [placed]);

  const info = (
    <AnimatePresence mode="wait">
      {selectedTech ? (
        <motion.div
          key={selectedTech.id}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
          role="region"
          aria-live="polite"
          aria-label={`${selectedTech.label} details`}
        >
          <p className="label text-[var(--color-accent)]">{selectedTech.category}</p>
          <p className="display mt-2 text-[28px]">{selectedTech.label}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-muted)]">{selectedTech.info}</p>
          <p className="label mt-4">
            RELATED:{" "}
            <span className="text-[var(--color-fg)]">
              {selectedTech.related.map((id) => getTech(id)?.label).filter(Boolean).join(" · ")}
            </span>
          </p>
        </motion.div>
      ) : (
        <p className="label border border-dashed border-[var(--color-line)] p-5">
          SELECT A TECHNOLOGY TO SEE HOW IT CONNECTS
        </p>
      )}
    </AnimatePresence>
  );

  if (!desktop) {
    return (
      <div>
        <div className="space-y-6">
          {stackCategories.map((category) => (
            <div key={category}>
              <p className="label mb-3">{category}</p>
              <ul className="flex flex-wrap gap-2">
                {technologies
                  .filter((t) => t.category === category)
                  .map((tech) => (
                    <li key={tech.id}>
                      <button
                        type="button"
                        aria-pressed={selected === tech.id}
                        onClick={() => setSelected(selected === tech.id ? null : tech.id)}
                        className={`min-h-11 border px-4 font-mono text-[12px] tracking-[0.08em] transition-colors ${
                          selected === tech.id
                            ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                            : "border-[var(--color-line)]"
                        }`}
                      >
                        {tech.label}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6">{info}</div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative w-full border border-[var(--color-line)] bg-[var(--color-surface)]/40"
        style={{ aspectRatio: `${W} / ${H}` }}
        role="group"
        aria-label="Technology constellation"
        data-cursor="drag"
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
          {edges.map(({ a, b }) => {
            const active = focus !== null && related.has(a.id) && related.has(b.id) && (a.id === focus || b.id === focus);
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                vectorEffect="non-scaling-stroke"
                stroke={active ? "var(--color-accent)" : "var(--color-muted)"}
                strokeWidth={active ? 1.5 : 1}
                strokeOpacity={active ? 0.9 : focus ? 0.05 : 0.14}
                style={{ transition: "stroke-opacity 0.3s, stroke 0.3s" }}
              />
            );
          })}
        </svg>

        {stackCategories.map((category) => (
          <span
            key={category}
            className="label absolute -translate-x-1/2 -translate-y-1/2 text-[10px] opacity-60"
            style={{ left: `${(centers[category].x / W) * 100}%`, top: `${(centers[category].y / H) * 100}%` }}
            aria-hidden="true"
          >
            {category}
          </span>
        ))}

        {placed.map((tech) => {
          const isFocus = focus === tech.id;
          const isRelated = related.has(tech.id);
          const dim = focus !== null && !isRelated;
          return (
            <motion.button
              key={tech.id}
              type="button"
              aria-label={`${tech.label}, ${tech.category.toLowerCase()}`}
              aria-pressed={selected === tech.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 p-2"
              style={{ left: `${(tech.x / W) * 100}%`, top: `${(tech.y / H) * 100}%` }}
              animate={{ scale: isFocus ? 1.35 : 1, opacity: dim ? 0.3 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onPointerEnter={() => setHovered(tech.id)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(tech.id)}
              onBlur={() => setHovered(null)}
              onClick={() => setSelected(selected === tech.id ? null : tech.id)}
              data-cursor="open"
            >
              <span
                className={`block size-2.5 rounded-full border transition-colors ${
                  isFocus || selected === tech.id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                    : "border-[var(--color-fg)] bg-[var(--color-bg)]"
                }`}
              />
              <span
                className={`font-mono text-[11px] tracking-[0.08em] whitespace-nowrap ${
                  isFocus || selected === tech.id ? "text-[var(--color-accent)]" : "text-[var(--color-fg)]"
                }`}
              >
                {tech.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-4">{info}</div>
    </div>
  );
}
