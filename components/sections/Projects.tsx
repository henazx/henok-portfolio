import { projects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectGallery } from "./ProjectGallery";

export function Projects() {
  return (
    <section className="section" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading
          index="03"
          eyebrow="Projects"
          titleId="projects-title"
          title="Selected work, built to be used."
          description="A mix of product development, internal systems, and design-led academic work — each shown with the stack it actually uses."
        />

        <ProjectGallery projects={projects} />
      </div>
    </section>
  );
}
