import { getGithubActivity, type ContributionDay } from "@/lib/github";

const LEVEL_CLASS: Record<ContributionDay["level"], string> = {
  0: "bg-[var(--color-surface-2)]",
  1: "bg-[color-mix(in_srgb,var(--color-accent)_25%,var(--color-surface-2))]",
  2: "bg-[color-mix(in_srgb,var(--color-accent)_50%,var(--color-surface-2))]",
  3: "bg-[color-mix(in_srgb,var(--color-accent)_75%,var(--color-surface-2))]",
  4: "bg-[var(--color-accent)]",
};

const EVENT_LABEL: Record<string, string> = {
  PushEvent: "Pushed to",
  PullRequestEvent: "Pull request in",
  CreateEvent: "Created in",
  IssuesEvent: "Issue in",
  IssueCommentEvent: "Commented in",
  WatchEvent: "Starred",
  ForkEvent: "Forked",
  ReleaseEvent: "Released in",
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Server component: real GitHub data only. Renders an honest empty state when not configured. */
export async function GithubSection() {
  const result = await getGithubActivity();

  return (
    <div aria-labelledby="github-heading" role="region" className="mt-32 border-t border-[var(--color-line)] pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h3 id="github-heading" className="display text-[clamp(30px,5vw,64px)]">
          ENGINEERING ACTIVITY
        </h3>
        {result.status === "ok" ? (
          <a
            href={result.data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label hover:text-[var(--color-accent)]"
          >
            @{result.data.username} ↗
          </a>
        ) : null}
      </div>

      {result.status !== "ok" ? (
        <p className="mt-8 max-w-[520px] border border-dashed border-[var(--color-line)] p-6 text-[15px] leading-relaxed text-[var(--color-muted)]">
          {result.status === "unconfigured"
            ? "Live GitHub activity isn’t connected yet. Nothing is shown here until real data is available."
            : "GitHub activity is temporarily unavailable."}
        </p>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-12">
            {result.data.contributions ? (
              <div>
                <p className="label mb-4">
                  {result.data.contributions.total} CONTRIBUTIONS IN THE LAST YEAR
                </p>
                <div
                  className="grid auto-cols-fr grid-flow-col gap-[3px] overflow-x-auto pb-2"
                  role="img"
                  aria-label={`Contribution graph: ${result.data.contributions.total} contributions in the last year`}
                >
                  {result.data.contributions.weeks.map((week, wi) => (
                    <div key={wi} className="grid min-w-[10px] grid-rows-7 gap-[3px]">
                      {week.map((day) => (
                        <span
                          key={day.date}
                          title={`${day.count} on ${day.date}`}
                          className={`aspect-square ${LEVEL_CLASS[day.level]}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p className="label mb-4">REPOSITORIES</p>
              <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
                {result.data.repos.map((repo) => (
                  <li key={repo.name}>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="open"
                      className="flex items-baseline justify-between gap-4 py-4 transition-colors hover:text-[var(--color-accent)]"
                    >
                      <span>
                        <span className="block font-mono text-[14px]">{repo.name}</span>
                        {repo.description ? (
                          <span className="mt-1 block text-[14px] text-[var(--color-muted)]">{repo.description}</span>
                        ) : null}
                      </span>
                      <span className="label shrink-0">{repo.language ?? "—"}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-12">
            {result.data.languages.length > 0 ? (
              <div>
                <p className="label mb-4">LANGUAGES · BY REPOSITORY COUNT</p>
                <div className="flex h-2 overflow-hidden" aria-hidden="true">
                  {result.data.languages.map((lang, i) => (
                    <span
                      key={lang.name}
                      style={{ flexGrow: lang.repos, opacity: 1 - i * 0.12 }}
                      className="bg-[var(--color-accent)] not-first:ml-px"
                    />
                  ))}
                </div>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12px]">
                  {result.data.languages.map((lang) => (
                    <li key={lang.name}>
                      {lang.name} <span className="text-[var(--color-muted)]">{lang.repos}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.data.activity.length > 0 ? (
              <div>
                <p className="label mb-4">RECENT ACTIVITY</p>
                <ul className="space-y-3">
                  {result.data.activity.map((event) => (
                    <li key={event.id} className="text-[14px] text-[var(--color-muted)]">
                      <span className="text-[var(--color-fg)]">
                        {EVENT_LABEL[event.type] ?? "Activity on"} {event.repo}
                      </span>
                      <span className="ml-2 font-mono text-[11px]">{formatDate(event.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
