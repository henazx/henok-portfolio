import {
  Boxes,
  Code2,
  Database,
  LayoutTemplate,
  PenTool,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { skillCategories } from "@/data/skills";
import type { SkillIcon } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Skills.module.css";

const icons: Record<SkillIcon, LucideIcon> = {
  code: Code2,
  frontend: LayoutTemplate,
  backend: Database,
  support: Wrench,
  design: PenTool,
  tools: Boxes,
};

export function Skills() {
  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading
          index="04"
          eyebrow="Skills"
          titleId="skills-title"
          title="A practical, maintained toolkit."
          description="The technologies and methods I use day to day — grouped by discipline rather than scored with arbitrary percentages."
        />

        <div className={styles.grid}>
          {skillCategories.map((category, index) => {
            const Icon = icons[category.icon];

            return (
              <article
                className={styles.card}
                key={category.title}
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
                  {category.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
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
