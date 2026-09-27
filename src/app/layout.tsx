import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Cursor } from "@/components/cursor/Cursor";
import { RouteProgress } from "@/components/navigation/RouteProgress";
import { SmoothScroll } from "@/providers/SmoothScroll";
import { site } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.brand,
  authors: [{ name: site.name }],
  creator: site.name,
  keywords: ["Ansh Jaiswal", "full-stack developer", "Next.js", "React", "TypeScript", "AI", "Three.js"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.brand,
    title: site.title,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  description: site.description,
  url: site.url,
  sameAs: [site.githubUrl, site.linkedinUrl].filter(Boolean),
};

const NO_JS_STYLE = ".loader{display:none!important}.pre-reveal,[data-anim],[data-hero-item]{opacity:1!important}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <noscript>
          <style>{NO_JS_STYLE}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <a
          href="#main"
          className="fixed top-3 left-3 z-[110] -translate-y-20 bg-[var(--color-accent)] px-4 py-2 font-mono text-[12px] text-[var(--color-bg)] focus:translate-y-0"
        >
          Skip to content
        </a>
        <div aria-hidden="true" className="noise pointer-events-none fixed inset-0 z-[60] transform-gpu" />
        <SmoothScroll>
          <RouteProgress />
          <Cursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
