import { GithubSection } from "./GithubSection";
import { Timeline } from "./Timeline";

/** The "Engineering" chapter between Projects and Stack: capability timeline + live GitHub activity. */
export function Engineering() {
  return (
    <section id="engineering" aria-labelledby="engineering-heading" className="relative px-5 py-32 md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
        <p className="label mb-6">
          <span className="mr-3 text-[var(--color-accent)]">{"//"}</span>ENGINEERING
        </p>
        <h2 id="engineering-heading" className="display text-[clamp(44px,8vw,128px)]">
          HOW IT
          <br />
          <span className="text-[var(--color-accent)]">COMES TOGETHER.</span>
        </h2>
        <Timeline />
        <GithubSection />
      </div>
    </section>
  );
}
