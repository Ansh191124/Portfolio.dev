export type StackCategory =
  | "FRONTEND"
  | "BACKEND"
  | "DATABASE"
  | "AI"
  | "DEVOPS"
  | "TOOLS";

export interface Tech {
  id: string;
  label: string;
  category: StackCategory;
  info: string;
  /** Ids of related technologies (drawn as connections). */
  related: string[];
}

export const stackCategories: readonly StackCategory[] = [
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "AI",
  "DEVOPS",
  "TOOLS",
];

export const technologies: Tech[] = [
  { id: "react", label: "React", category: "FRONTEND", info: "Component-based UI library.", related: ["nextjs", "typescript", "framer", "threejs"] },
  { id: "nextjs", label: "Next.js", category: "FRONTEND", info: "React framework for routing, rendering and server code.", related: ["react", "typescript", "node", "supabase"] },
  { id: "typescript", label: "TypeScript", category: "FRONTEND", info: "Typed JavaScript for safer large codebases.", related: ["javascript", "react", "node"] },
  { id: "javascript", label: "JavaScript", category: "FRONTEND", info: "The language of the web.", related: ["typescript", "node"] },
  { id: "tailwind", label: "Tailwind", category: "FRONTEND", info: "Utility-first CSS for consistent styling.", related: ["react", "nextjs"] },
  { id: "framer", label: "Framer Motion", category: "FRONTEND", info: "Declarative animation for React interfaces.", related: ["react"] },
  { id: "threejs", label: "Three.js", category: "FRONTEND", info: "WebGL library for 3D on the web.", related: ["react", "javascript"] },
  { id: "node", label: "Node.js", category: "BACKEND", info: "JavaScript runtime for servers and tooling.", related: ["express", "javascript", "postgres", "mongodb"] },
  { id: "express", label: "Express", category: "BACKEND", info: "Minimal HTTP framework for Node.js APIs.", related: ["node", "postgres", "mongodb"] },
  { id: "python", label: "Python", category: "BACKEND", info: "General-purpose language for services and AI work.", related: ["django", "ai", "postgres"] },
  { id: "django", label: "Django", category: "BACKEND", info: "Batteries-included Python web framework.", related: ["python", "postgres"] },
  { id: "postgres", label: "PostgreSQL", category: "DATABASE", info: "Relational database with strong guarantees.", related: ["supabase", "node", "django"] },
  { id: "mongodb", label: "MongoDB", category: "DATABASE", info: "Document database for flexible schemas.", related: ["node", "express"] },
  { id: "supabase", label: "Supabase", category: "DATABASE", info: "Postgres-backed platform with auth and APIs.", related: ["postgres", "nextjs"] },
  { id: "ai", label: "AI", category: "AI", info: "Applying models and agents inside real products.", related: ["python", "node", "nextjs"] },
  { id: "docker", label: "Docker", category: "DEVOPS", info: "Containers for reproducible environments.", related: ["node", "python", "github"] },
  { id: "git", label: "Git", category: "TOOLS", info: "Version control for every project.", related: ["github"] },
  { id: "github", label: "GitHub", category: "TOOLS", info: "Hosting, review and collaboration.", related: ["git", "docker"] },
];

export const getTech = (id: string): Tech | undefined =>
  technologies.find((t) => t.id === id);

/** Subset shown in the 3D developer constellation. */
export const constellationIds: readonly string[] = [
  "react",
  "nextjs",
  "node",
  "python",
  "postgres",
  "supabase",
  "docker",
  "threejs",
  "ai",
];
