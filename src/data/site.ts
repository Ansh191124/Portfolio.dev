/**
 * Central site configuration. Everything personal or environment-specific lives
 * here or in environment variables so the UI never hardcodes it.
 */
const env = (value: string | undefined): string => (value ?? "").trim();

export const site = {
  name: "Ansh Jaiswal",
  brand: "ANSH.DEV",
  role: "Full-Stack Web Developer",
  title: "Ansh Jaiswal — Full-Stack Web Developer",
  description:
    "Ansh Jaiswal is a full-stack web developer building modern web applications, AI systems and interactive digital experiences.",
  url: env(process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000",
  email: env(process.env.NEXT_PUBLIC_EMAIL),
  githubUrl: env(process.env.NEXT_PUBLIC_GITHUB_URL),
  linkedinUrl: env(process.env.NEXT_PUBLIC_LINKEDIN_URL),
  resumeUrl: env(process.env.NEXT_PUBLIC_RESUME_URL),
  available: env(process.env.NEXT_PUBLIC_AVAILABLE) === "true",
} as const;

export type SectionId =
  | "home"
  | "about"
  | "build"
  | "projects"
  | "stack"
  | "lab"
  | "contact";

export interface SectionMeta {
  id: SectionId;
  label: string;
}

/** Ordered story sections. Drives the scroll indicator (01 / 07). */
export const sections: readonly SectionMeta[] = [
  { id: "home", label: "HOME" },
  { id: "about", label: "ABOUT" },
  { id: "build", label: "BUILD" },
  { id: "projects", label: "PROJECTS" },
  { id: "stack", label: "STACK" },
  { id: "lab", label: "LAB" },
  { id: "contact", label: "CONTACT" },
];

/** Primary navigation (NN LABEL). Build is reached through About. */
export const navItems: readonly SectionMeta[] = [
  { id: "home", label: "HOME" },
  { id: "about", label: "ABOUT" },
  { id: "projects", label: "PROJECTS" },
  { id: "stack", label: "STACK" },
  { id: "lab", label: "LAB" },
  { id: "contact", label: "CONTACT" },
];

export const externalNav = [
  { label: "GITHUB", href: site.githubUrl },
  { label: "RESUME", href: site.resumeUrl },
].filter((l) => l.href.length > 0);
