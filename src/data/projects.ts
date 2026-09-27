/**
 * Single source of truth for all project content.
 *
 * NOTE: `problem`, `solution`, `architecture` and `challenges` are neutral,
 * non-numeric drafts derived from each project's name and category. Replace them
 * with the real details, links and images. Empty `liveUrl`, `githubUrl` and
 * `image` values are handled gracefully by the UI (buttons are hidden and a
 * generated visual is shown). No results or metrics are claimed.
 */
export interface ArchitectureNode {
  id: string;
  label: string;
  detail: string;
}

export interface Project {
  id: string;
  index: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  image: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  /** Hue (0–360) used for the generated visual and background shift. */
  hue: number;
  problem: string;
  solution: string;
  architecture: ArchitectureNode[];
  challenges: string[];
  result: string;
}

const RESULT_PENDING =
  "Outcome details will be published here once they can be stated accurately.";

export const projects: Project[] = [
  {
    id: "digitalbot",
    index: "01",
    title: "DigitalBot.ai",
    category: "AI / SaaS",
    description:
      "An AI assistant platform that pairs a conversational agent with a web product around it.",
    technologies: ["Next.js", "TypeScript", "Node.js", "AI"],
    image: "",
    liveUrl: "",
    githubUrl: "",
    featured: true,
    hue: 92,
    problem:
      "Conversational AI is only useful when it is wrapped in a product people can operate: authentication, history and predictable behaviour.",
    solution:
      "A web application that puts an AI agent behind a clean interface and a typed API layer, with persistence for conversations.",
    architecture: [
      { id: "client", label: "CLIENT", detail: "The browser interface where conversations happen." },
      { id: "next", label: "NEXT.JS", detail: "Renders the UI and hosts server-side routes." },
      { id: "api", label: "API", detail: "Typed endpoints that validate requests and orchestrate work." },
      { id: "agent", label: "AI AGENT", detail: "Handles reasoning and tool use for each request." },
      { id: "db", label: "DATABASE", detail: "Stores users and conversation history." },
    ],
    challenges: [
      "Keeping responses streaming smoothly in the interface.",
      "Structuring agent behaviour so it stays predictable.",
      "Separating UI concerns from agent orchestration.",
    ],
    result: RESULT_PENDING,
  },
  {
    id: "medscan",
    index: "02",
    title: "MedScan",
    category: "Healthcare / AI",
    description:
      "A web tool for scanning and organising medical documents with intelligent extraction.",
    technologies: ["React", "Python", "AI", "PostgreSQL"],
    image: "",
    liveUrl: "",
    githubUrl: "",
    featured: true,
    hue: 178,
    problem:
      "Medical information is often trapped in scanned documents that are slow to read and hard to search.",
    solution:
      "A pipeline that ingests documents, extracts structured information and presents it in a searchable interface.",
    architecture: [
      { id: "upload", label: "UPLOAD", detail: "Users submit documents through the web client." },
      { id: "api", label: "API", detail: "Validates input and queues processing." },
      { id: "extract", label: "EXTRACTION", detail: "Turns document content into structured data." },
      { id: "db", label: "DATABASE", detail: "Persists structured records for search." },
    ],
    challenges: [
      "Handling inconsistent document layouts.",
      "Treating sensitive data with care end to end.",
      "Presenting extracted data so a person can verify it.",
    ],
    result: RESULT_PENDING,
  },
  {
    id: "amard-twin",
    index: "03",
    title: "Amard Twin",
    category: "Digital Twin / Web",
    description:
      "A digital-twin style interface that mirrors a real system as a live, explorable web experience.",
    technologies: ["Next.js", "Three.js", "TypeScript", "Node.js"],
    image: "",
    liveUrl: "",
    githubUrl: "",
    featured: true,
    hue: 210,
    problem:
      "Complex systems are hard to reason about from tables alone; people need a spatial, interactive view.",
    solution:
      "A web interface that represents system state visually and lets people explore it interactively.",
    architecture: [
      { id: "source", label: "DATA SOURCE", detail: "The system whose state is being mirrored." },
      { id: "api", label: "API", detail: "Normalises incoming data for the interface." },
      { id: "view", label: "3D VIEW", detail: "Renders state as an explorable visual model." },
    ],
    challenges: [
      "Keeping an interactive visual model responsive.",
      "Mapping raw state to clear visual meaning.",
    ],
    result: RESULT_PENDING,
  },
  {
    id: "logistics-erp",
    index: "04",
    title: "Logistics ERP",
    category: "Backend / Enterprise",
    description:
      "An ERP-style system for coordinating logistics operations across records, workflows and users.",
    technologies: ["React", "Node.js", "Express", "PostgreSQL"],
    image: "",
    liveUrl: "",
    githubUrl: "",
    featured: true,
    hue: 32,
    problem:
      "Logistics work spans many records and roles, and spreadsheets do not scale to shared, auditable workflows.",
    solution:
      "A role-aware application with a relational data model and an API that keeps workflows consistent.",
    architecture: [
      { id: "client", label: "CLIENT", detail: "Role-specific interfaces for operators and managers." },
      { id: "api", label: "REST API", detail: "Business rules and validation live here." },
      { id: "db", label: "POSTGRESQL", detail: "Relational storage for operational records." },
    ],
    challenges: [
      "Modelling relational data cleanly.",
      "Designing permissions for different roles.",
    ],
    result: RESULT_PENDING,
  },
  {
    id: "dark-pattern-auditor",
    index: "05",
    title: "AI Dark Pattern Auditor",
    category: "AI / Ethics",
    description:
      "An AI-assisted auditor that inspects interfaces for manipulative design patterns.",
    technologies: ["Python", "AI", "Next.js", "TypeScript"],
    image: "",
    liveUrl: "",
    githubUrl: "",
    featured: true,
    hue: 330,
    problem:
      "Manipulative interface patterns are subtle, and manual review of them does not scale.",
    solution:
      "A tool that analyses pages with an AI model and reports suspected dark patterns with explanations.",
    architecture: [
      { id: "input", label: "PAGE INPUT", detail: "A page or interface is submitted for review." },
      { id: "analysis", label: "AI ANALYSIS", detail: "A model inspects content and layout for patterns." },
      { id: "report", label: "REPORT", detail: "Findings are presented with reasoning." },
    ],
    challenges: [
      "Explaining findings, not just flagging them.",
      "Avoiding over-confident classification.",
    ],
    result: RESULT_PENDING,
  },
];

export const getProject = (id: string): Project | undefined =>
  projects.find((p) => p.id === id);
