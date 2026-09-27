/**
 * GitHub data access. Everything here is server-side and optional: with no
 * GITHUB_USERNAME the UI shows an honest "not connected" state and never
 * invents statistics. Swap this module to change the data source.
 */
export interface RepoSummary {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  repo: string;
  createdAt: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionCalendar {
  total: number;
  weeks: ContributionDay[][];
}

export interface LanguageShare {
  name: string;
  repos: number;
}

export interface GithubData {
  username: string;
  profileUrl: string;
  repos: RepoSummary[];
  languages: LanguageShare[];
  activity: ActivityItem[];
  /** Only available when GITHUB_TOKEN is configured. */
  contributions: ContributionCalendar | null;
}

export type GithubResult =
  | { status: "unconfigured" }
  | { status: "error" }
  | { status: "ok"; data: GithubData };

const API = "https://api.github.com";
const REVALIDATE = 3600;

interface RawRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
}

interface RawEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
}

interface RawGraphQL {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }[];
        };
      };
    };
  };
}

const LEVELS: Record<string, ContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const headers = (token: string | undefined): HeadersInit => ({
  Accept: "application/vnd.github+json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function fetchJson<T>(url: string, token: string | undefined): Promise<T> {
  const res = await fetch(url, { headers: headers(token), next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`GitHub request failed: ${res.status}`);
  return (await res.json()) as T;
}

async function fetchContributions(username: string, token: string): Promise<ContributionCalendar | null> {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel}}}}}}`;
  const res = await fetch(`${API}/graphql`, {
    method: "POST",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: username } }),
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as RawGraphQL;
  const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) return null;
  return {
    total: calendar.totalContributions,
    weeks: calendar.weeks.map((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVELS[d.contributionLevel] ?? 0,
      })),
    ),
  };
}

/** Loads repositories, language mix, recent activity and (with a token) the contribution graph. */
export async function getGithubActivity(): Promise<GithubResult> {
  const username = process.env.GITHUB_USERNAME?.trim();
  if (!username) return { status: "unconfigured" };
  const token = process.env.GITHUB_TOKEN?.trim() || undefined;

  try {
    const [repos, events, contributions] = await Promise.all([
      fetchJson<RawRepo[]>(`${API}/users/${username}/repos?per_page=100&sort=pushed`, token),
      fetchJson<RawEvent[]>(`${API}/users/${username}/events/public?per_page=10`, token),
      token ? fetchContributions(username, token) : Promise.resolve(null),
    ]);

    const own = repos.filter((r) => !r.fork);
    const tally = new Map<string, number>();
    own.forEach((r) => {
      if (r.language) tally.set(r.language, (tally.get(r.language) ?? 0) + 1);
    });

    return {
      status: "ok",
      data: {
        username,
        profileUrl: `https://github.com/${username}`,
        repos: own.slice(0, 6).map((r) => ({
          name: r.name,
          url: r.html_url,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          pushedAt: r.pushed_at,
        })),
        languages: [...tally.entries()]
          .map(([name, count]) => ({ name, repos: count }))
          .sort((a, b) => b.repos - a.repos),
        activity: events.slice(0, 6).map((e) => ({
          id: e.id,
          type: e.type,
          repo: e.repo.name,
          createdAt: e.created_at,
        })),
        contributions,
      },
    };
  } catch {
    return { status: "error" };
  }
}
