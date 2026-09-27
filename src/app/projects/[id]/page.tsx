import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyContent } from "@/components/projects/CaseStudyContent";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import { Footer } from "@/components/footer/Footer";
import { getProject, projects } from "@/data/projects";
import { site } from "@/data/site";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { id: string }[] {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const project = getProject((await params).id);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: { title: `${project.title} — ${site.name}`, description: project.description },
  };
}

export default async function ProjectRoute({ params }: RouteProps) {
  const project = getProject((await params).id);
  if (!project) notFound();
  const index = projects.findIndex((p) => p.id === project.id);
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <header className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-5 md:px-10">
        <Link href="/#projects" className="font-mono text-[12px] tracking-[0.2em] hover:text-[var(--color-accent)]">
          ← {site.brand}
        </Link>
        <span className="label">
          <span className="mr-3 text-[var(--color-accent)]">{project.index}</span>CASE STUDY
        </span>
      </header>
      <main id="main" className="mx-auto max-w-[1200px] px-5 pt-10 pb-24 md:px-10">
        <div className="relative h-[42vh] min-h-[260px] w-full">
          <ProjectVisual project={project} className="size-full" interactive={false} />
        </div>
        <p className="label mt-10">{project.category}</p>
        <h1 className="display mt-3 text-[clamp(40px,8vw,112px)]">{project.title}</h1>
        <p className="mt-6 max-w-[720px] text-[18px] leading-relaxed text-[var(--color-muted)]">
          {project.description}
        </p>
        <div className="mt-16">
          <CaseStudyContent project={project} />
        </div>
        <Link
          href={`/projects/${next.id}`}
          className="mt-8 flex items-center justify-between border border-[var(--color-line)] p-6 transition-colors hover:border-[var(--color-accent)]"
        >
          <span className="label">NEXT PROJECT</span>
          <span className="display text-[clamp(22px,4vw,40px)]">{next.title} →</span>
        </Link>
      </main>
      <Footer />
    </>
  );
}
