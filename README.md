# ANSH.DEV — Interactive 3D Developer Portfolio

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 4 · Framer Motion · Anime.js · GSAP + ScrollTrigger · Three.js / React Three Fiber / drei · Lenis · React Flow · Lucide

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm start
```

## Configure (all optional — the UI hides anything not set)

Copy `.env.example` to `.env.local`:

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, sitemap, Open Graph |
| `NEXT_PUBLIC_EMAIL` | Enables the copy-email button in Contact |
| `NEXT_PUBLIC_GITHUB_URL` / `NEXT_PUBLIC_LINKEDIN_URL` | Contact, nav and footer links |
| `NEXT_PUBLIC_RESUME_URL` | Shows the RESUME nav link |
| `NEXT_PUBLIC_AVAILABLE=true` | Shows "Available for selected projects" in the footer |
| `GITHUB_USERNAME` | Enables repositories, language mix and recent activity |
| `GITHUB_TOKEN` | Additionally enables the real contribution graph (GraphQL) |

Nothing is faked: without GitHub configuration the section shows an honest "not connected" state.

## Content lives in `src/data`

- `projects.ts` — every project (title, links, image, tech, problem, solution, architecture, challenges). **The problem / solution / architecture / challenges text is neutral draft copy derived from project names — replace it with real details.** Empty `liveUrl`, `githubUrl`, `image` are handled (buttons hidden, generated visual shown). No results or metrics are claimed.
- `profile.ts` — disciplines, "What I build" panels, capability timeline, lab experiments
- `stack.ts` — technologies and their relationships (feeds both constellations)
- `site.ts` — identity, navigation, section order

## Animation architecture (one tool per job, one loop per concern)

| Concern | Tool |
| --- | --- |
| React component / presence / layout / hover / modals / nav | Framer Motion |
| Text, counters, SVG draws, stagger micro-interactions, cursor sizing | Anime.js |
| Pinned scroll storytelling, horizontal projects, scroll-linked 3D | GSAP + ScrollTrigger |
| Smooth scroll | Lenis, driven by the GSAP ticker (`SmoothScroll`), so there is a single scroll loop |
| 3D | React Three Fiber; scenes read scroll/pointer from a mutable `sceneState`, never React state |

## Performance & accessibility

- three.js is code-split (`next/dynamic`, no SSR) and each canvas mounts only near the viewport; DPR capped by device tier; particle/node counts scale with `usePerformance()`; instanced meshes for shards and lab geometry.
- No WebGL → static fallbacks. `prefers-reduced-motion` disables Lenis, the pinned horizontal scroll, camera/particle motion and continuous loops.
- Semantic landmarks, skip link, focus-visible styles, accessible dialogs (focus trap, ESC, focus restore).
