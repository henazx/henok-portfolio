"use client";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectGallery } from "./ProjectGallery";

export function Projects() {
  const { content } = useEditor();
  const { t } = useLanguage();
  const copy = content.sections.projects;

  return (
    <section className="section" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading
          index="03"
          eyebrow={t("Projects")}
          titleId="projects-title"
          title={t(copy.title)}
          description={t(copy.description)}
        />

        <ProjectGallery projects={content.projects} />
      </div>
    </section>
  );
}
