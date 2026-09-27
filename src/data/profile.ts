import type { StackCategory } from "./stack";

export interface Discipline {
  id: string;
  label: string;
  summary: string;
  category: StackCategory;
}

/** Areas shown in the interactive developer profile (About). */
export const disciplines: Discipline[] = [
  { id: "frontend", label: "Frontend", category: "FRONTEND", summary: "Interfaces, motion and 3D in React and Next.js." },
  { id: "backend", label: "Backend", category: "BACKEND", summary: "APIs and services with Node.js, Express, Python and Django." },
  { id: "ai", label: "AI", category: "AI", summary: "Intelligent features and agents built into products." },
  { id: "database", label: "Database", category: "DATABASE", summary: "Relational and document data with PostgreSQL, MongoDB and Supabase." },
  { id: "devops", label: "DevOps", category: "DEVOPS", summary: "Containers and workflows with Docker, Git and GitHub." },
];

export type BuildShape = "box" | "icosa" | "torus" | "octa";

export interface BuildArea {
  id: string;
  index: string;
  title: string;
  blurb: string;
  shape: BuildShape;
}

export const buildAreas: BuildArea[] = [
  { id: "web", index: "01", title: "WEB APPLICATIONS", blurb: "Fast, accessible products in Next.js and React with typed code from UI to API.", shape: "box" },
  { id: "ai", index: "02", title: "AI SYSTEMS", blurb: "Agents and model-backed features designed as dependable parts of a product.", shape: "icosa" },
  { id: "api", index: "03", title: "BACKEND & APIs", blurb: "Clean service boundaries, data models and APIs that are simple to evolve.", shape: "torus" },
  { id: "interactive", index: "04", title: "INTERACTIVE EXPERIENCES", blurb: "Motion, WebGL and scroll storytelling that respects performance and accessibility.", shape: "octa" },
];

export interface Milestone {
  id: string;
  index: string;
  title: string;
  text: string;
}

/**
 * Capability layers rather than a dated career history. Add real roles and
 * dates here when you want them shown — the timeline renders whatever is listed.
 */
export const milestones: Milestone[] = [
  { id: "m1", index: "01", title: "Interfaces", text: "Component-driven frontends in React and Next.js with TypeScript." },
  { id: "m2", index: "02", title: "Services", text: "Backends and APIs with Node.js, Express, Python and Django." },
  { id: "m3", index: "03", title: "Data", text: "Relational and document persistence with PostgreSQL, MongoDB and Supabase." },
  { id: "m4", index: "04", title: "Intelligence", text: "AI-assisted features and agents wired into real products." },
  { id: "m5", index: "05", title: "Experience", text: "Motion, WebGL and interaction design with GSAP, Anime.js and Three.js." },
];

export interface Experiment {
  id: string;
  index: string;
  title: string;
  blurb: string;
}

export const experiments: Experiment[] = [
  { id: "particles", index: "01", title: "PARTICLE FIELD", blurb: "A canvas particle field that flows around your pointer." },
  { id: "physics", index: "02", title: "3D PHYSICS OBJECT", blurb: "A tumbling body with gravity and bounce. Click to throw it." },
  { id: "shader", index: "03", title: "INTERACTIVE SHADER", blurb: "A fragment shader that ripples where you move." },
  { id: "geometry", index: "04", title: "MOUSE-FOLLOWING GEOMETRY", blurb: "Instanced shapes that orient toward the cursor." },
  { id: "neural", index: "05", title: "AI VISUALIZATION", blurb: "A network forward-pass drawn as light travelling through layers." },
];
