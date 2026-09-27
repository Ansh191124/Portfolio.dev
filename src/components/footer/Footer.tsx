import { site } from "@/data/site";

/** Server component — the year is generated at render/revalidation time. */
export function Footer() {
  const year = new Date().getFullYear();
  const socials = [
    { label: "GitHub", href: site.githubUrl },
    { label: "LinkedIn", href: site.linkedinUrl },
  ].filter((s) => s.href);

  return (
    <footer className="relative border-t border-[var(--color-line)] px-5 py-12 md:px-10 lg:px-16">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display text-[clamp(32px,5vw,64px)]">{site.brand}</p>
          <p className="mt-3 text-[15px] text-[var(--color-muted)]">Designed &amp; engineered with curiosity.</p>
          {site.available ? (
            <p className="mt-6 inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-[var(--color-accent)]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-[var(--color-accent)]" />
              </span>
              AVAILABLE FOR SELECTED PROJECTS
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          {socials.length > 0 ? (
            <ul className="flex gap-6">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center font-mono text-[12px] tracking-[0.18em] text-[var(--color-muted)] uppercase transition-colors hover:text-[var(--color-accent)]"
                  >
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="font-mono text-[11px] tracking-[0.18em] text-[var(--color-muted)]">
            © {year} {site.name.toUpperCase()}
          </p>
        </div>
      </div>
    </footer>
  );
}
