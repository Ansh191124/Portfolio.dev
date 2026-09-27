import { Reveal } from "@/components/animations/Reveal";
import { ScrambleText } from "@/components/animations/ScrambleText";
import { DevConstellation } from "./DevConstellation";
import { StackConstellation } from "./StackConstellation";

export function Stack() {
  return (
    <section id="stack" aria-labelledby="stack-heading" className="relative px-5 py-32 md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
        <p className="label mb-6">
          <span className="mr-3 text-[var(--color-accent)]">05</span>STACK
        </p>
        <h2 id="stack-heading" className="display text-[clamp(44px,8vw,128px)]">
          <ScrambleText text="THE STACK." as="span" />
        </h2>
        <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-[var(--color-muted)]">
          Not a list of bars — a map. Technologies are nodes; lines show what they are used alongside.
        </p>

        <Reveal className="mt-14">
          <StackConstellation />
        </Reveal>

        <Reveal className="mt-24">
          <p className="label mb-4">DEVELOPER CONSTELLATION</p>
          <DevConstellation />
        </Reveal>
      </div>
    </section>
  );
}
