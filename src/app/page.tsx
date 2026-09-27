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

/** Regenerate hourly so GitHub activity and the footer year stay current. */
export const revalidate = 3600;

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
