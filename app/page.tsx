import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Credentials } from "@/components/sections/Credentials";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  // Contact.tsx is a client component, so the server decides whether email
  // delivery is configured and passes the result down as a prop.
  const contactConfigured = Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.CONTACT_TO_EMAIL?.trim() &&
      process.env.CONTACT_FROM_EMAIL?.trim(),
  );

  return (
    <>
      <Hero />
      <About />
      <ExperienceSection />
      <Projects />
      <Skills />
      <Credentials />
      <Contact configured={contactConfigured} />
    </>
  );
}
