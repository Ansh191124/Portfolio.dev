import { About } from "@/components/about/About";
import { WhatIBuild } from "@/components/about/WhatIBuild";
import { Contact } from "@/components/contact/Contact";
import { Engineering } from "@/components/experience/Engineering";
import { Footer } from "@/components/footer/Footer";
import { Hero } from "@/components/hero/Hero";
import { Lab } from "@/components/lab/Lab";
import { Loader } from "@/components/navigation/Loader";
import { Navbar } from "@/components/navigation/Navbar";
import { ScrollIndicator } from "@/components/navigation/ScrollIndicator";
import { Projects } from "@/components/projects/Projects";
import { Stack } from "@/components/stack/Stack";

/**
 * No page-level `revalidate` export here on purpose: it must be a literal
 * Next can statically analyze, so it can't be conditioned on the GitHub Pages
 * build (which uses `output: "export"` and rejects ISR entirely). Hourly
 * refresh of GitHub activity instead comes from the per-request `revalidate`
 * on the fetch calls in `lib/github.ts`, which works the same way on a real
 * Next server and is simply ignored (fetched once, at build time) under
 * static export.
 */

export default function Home() {
  return (
    <>
      <Loader />
      <Navbar />
      <ScrollIndicator />
      <main id="main">
        <Hero />
        <About />
        <WhatIBuild />
        <Projects />
        <Engineering />
        <Stack />
        <Lab />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
