"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { buildAreas } from "@/data/profile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SceneCanvas } from "@/components/three/SceneCanvas";

const BuildShape = dynamic(() => import("@/components/three/BuildShape"), { ssr: false });

/**
 * Four large horizontal panels. The hovered/focused panel expands, the others
 * compress, its title scales up and the background 3D form morphs to match.
 * The 3D form lives inside the active panel's own (overflow-hidden) box, so it
 * can never bleed into a neighbouring panel.
 */
export function WhatIBuild() {
  const [activeId, setActiveId] = useState(buildAreas[0].id);
  const reduced = useReducedMotion();
  const active = buildAreas.find((a) => a.id === activeId) ?? buildAreas[0];

  return (
    <section
      id="build"
      aria-labelledby="build-heading"
      className="relative overflow-hidden px-5 py-28 md:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1400px]">
        <p className="label mb-6">
          <span className="mr-3 text-[var(--color-accent)]">03</span>WHAT I BUILD
        </p>
        <h2 id="build-heading" className="sr-only">
          What I build
        </h2>

        <ul className="relative flex h-[640px] flex-col gap-2 md:h-[600px]">
          {buildAreas.map((area) => {
            const isActive = area.id === activeId;
            return (
              <motion.li
                key={area.id}
                className="relative min-h-0 overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)]/60 backdrop-blur-[2px]"
                animate={{ flexGrow: isActive ? 3.4 : 1, borderColor: isActive ? "var(--color-accent)" : "var(--color-line)" }}
                transition={{ duration: reduced ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ flexBasis: 0 }}
              >
                {isActive ? (
                  <SceneCanvas
                    className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[340px] opacity-80 lg:block xl:w-[420px]"
                    position={[0, 0, 4.5]}
                    fov={40}
                    glow
                  >
                    <BuildShape shape={active.shape} reduced={reduced} />
                  </SceneCanvas>
                ) : null}

                <button
                  type="button"
                  onPointerEnter={() => setActiveId(area.id)}
                  onFocus={() => setActiveId(area.id)}
                  onClick={() => setActiveId(area.id)}
                  aria-expanded={isActive}
                  data-cursor="open"
                  className="relative z-10 flex size-full flex-col justify-between p-5 text-left md:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-[12px] tracking-[0.2em] text-[var(--color-accent)]">{area.index}</span>
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: isActive ? 45 : 0 }}
                      className="font-mono text-[18px] text-[var(--color-muted)]"
                    >
                      +
                    </motion.span>
                  </div>
                  <div>
                    <motion.h3
                      className="display origin-left text-[clamp(22px,4.2vw,64px)] lg:max-w-[70%]"
                      animate={{ scale: isActive ? 1 : 0.62, color: isActive ? "var(--color-fg)" : "var(--color-muted)" }}
                      transition={{ duration: reduced ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {area.title}
                    </motion.h3>
                    <AnimatePresence initial={false}>
                      {isActive ? (
                        <motion.p
                          key="blurb"
                          initial={reduced ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: reduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="mt-4 max-w-[520px] overflow-hidden text-[15px] leading-relaxed text-[var(--color-muted)] md:text-[17px]"
                        >
                          {area.blurb}
                        </motion.p>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
