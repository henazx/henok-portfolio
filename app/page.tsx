import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Credentials } from "@/components/sections/Credentials";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <ExperienceSection />
      <Projects />
      <Skills />
      <Credentials />
      <Contact />
    </>
  );
}
