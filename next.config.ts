import path from "node:path";
import type { NextConfig } from "next";

/**
 * Set GITHUB_PAGES=true (the deploy workflow does this) to produce a static
 * export under /<repo-name>/, suitable for GitHub Pages. Left unset, this
 * builds a normal Next.js server (Vercel, Node, Docker, ...) with working ISR
 * — GitHub Pages can only serve static files, so a plain `next build` output
 * will never run there.
 */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_PAGES_BASE_PATH ?? "/Portfolio.dev";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["three"],
  turbopack: { root: path.resolve(process.cwd()) },
  ...(isGithubPages
    ? {
        output: "export",
        basePath: repoName,
        assetPrefix: repoName,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
