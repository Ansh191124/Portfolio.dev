import { Counter } from "@/components/animations/Counter";
import { Reveal } from "@/components/animations/Reveal";
import { WordReveal } from "@/components/animations/WordReveal";
import { projects } from "@/data/projects";
import { experiments } from "@/data/profile";
import { technologies } from "@/data/stack";
import { site } from "@/data/site";
import { ProfileViz } from "./ProfileViz";

const facts = [
  { label: "SELECTED PROJECTS", value: projects.length },
  { label: "TECHNOLOGIES", value: technologies.length },
  { label: "LAB EXPERIMENTS", value: experiments.length },
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="relative px-5 py-32 md:px-10 lg:px-16 lg:py-44">
      <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
        <div>
          <p className="label mb-8">
            <span className="mr-3 text-[var(--color-accent)]">02</span>ABOUT
          </p>
          <h2 id="about-heading" className="display text-[clamp(44px,8vw,132px)]">
            <WordReveal lines={["ENGINEERING", "WITH"]} />
            <WordReveal lines={["CURIOSITY."]} wordClassName="text-[var(--color-accent)]" />
          </h2>

          <Reveal className="mt-12 max-w-[560px]" delay={0.1}>
            <p className="text-[18px] leading-relaxed text-[var(--color-fg)]">
              {site.name} is a full-stack web developer building modern web applications, AI systems and interactive
              digital experiences.
            </p>
            <p className="mt-5 text-[16px] leading-relaxed text-[var(--color-muted)]">
              The work spans the whole stack — interfaces, APIs, data and intelligent features — with a preference for
              typed code, clear boundaries and interfaces that feel considered.
            </p>
          </Reveal>

          <dl className="mt-14 grid max-w-[560px] grid-cols-3 gap-6 border-t border-[var(--color-line)] pt-8">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col-reverse justify-end">
                <dt className="label mt-2 text-[10px]">{fact.label}</dt>
                <dd className="display text-[clamp(32px,4vw,56px)] text-[var(--color-accent)]">
                  <Counter value={fact.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Reveal delay={0.15}>
          <ProfileViz />
        </Reveal>
      </div>
    </section>
  );
}
