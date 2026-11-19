"use client";

import { useEditor } from "@/components/editor/ContentProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectGallery } from "./ProjectGallery";

export function Projects() {
  const { content } = useEditor();
  const copy = content.sections.projects;

  return (
    <section className="section" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading
          index="03"
          eyebrow="Projects"
          titleId="projects-title"
          title={copy.title}
          description={copy.description}
        />

        <ProjectGallery projects={content.projects} />
      </div>
    </section>
  );
}
