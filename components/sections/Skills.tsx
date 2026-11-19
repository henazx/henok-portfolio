"use client";

import {
  Boxes,
  Database,
  LayoutTemplate,
  PenTool,
  Server,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechEcosystem } from "@/components/interaction/TechEcosystem";
import type { SkillIcon } from "@/types";
import styles from "./Skills.module.css";

const icons: Record<SkillIcon, LucideIcon> = {
  frontend: LayoutTemplate,
  backend: Server,
  database: Database,
  support: Wrench,
  design: PenTool,
  tools: Boxes,
};

export function Skills() {
  const { content } = useEditor();
  const copy = content.sections.skills;

  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading
          index="04"
          eyebrow="Skills"
          titleId="skills-title"
          title={copy.title}
          description={copy.description}
        />

        <div data-reveal>
          <TechEcosystem />
        </div>

        <div className={styles.grid}>
          {content.skills.map((category, index) => {
            const Icon = icons[category.icon];

            return (
              <article
                className={styles.card}
                key={`${category.title}-${index}`}
                data-glow
                data-reveal
              >
                <div className={styles.cardTop}>
                  <span className={styles.icon} aria-hidden="true">
                    <Icon />
                  </span>
                  <span className={styles.index}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className={styles.title}>{category.title}</h3>

                <p className={styles.description}>{category.description}</p>

                <ul className={styles.tags}>
                  {category.skills.map((skill, skillIndex) => (
                    <li key={`${skill}-${skillIndex}`}>{skill}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
