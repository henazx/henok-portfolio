"use client";

import { useEditor } from "@/components/editor/ContentProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./ExperienceSection.module.css";

export function ExperienceSection() {
  const { content } = useEditor();
  const copy = content.sections.experience;

  return (
    <section
      className="section"
      id="experience"
      aria-labelledby="experience-title"
    >
      <div className="container">
        <SectionHeading
          index="02"
          eyebrow="Experience"
          titleId="experience-title"
          title={copy.title}
          description={copy.description}
        />

        <ol className={styles.timeline} data-reveal>
          {content.experience.map((entry, index) => (
            <li
              className={styles.item}
              key={`${entry.role}-${entry.organization}-${index}`}
            >
              <div className={styles.meta}>
                <span className={styles.period}>{entry.period}</span>
                {entry.current ? (
                  <span className={styles.current}>Current</span>
                ) : null}
              </div>

              <div className={styles.content}>
                <h3 className={styles.role}>{entry.role}</h3>
                <p className={styles.organization}>
                  {entry.organization}
                  <span className={styles.separator} aria-hidden="true">
                    ·
                  </span>
                  {entry.location}
                </p>

                {entry.summary ? (
                  <p className={styles.summary}>{entry.summary}</p>
                ) : null}

                <ul className={styles.highlights}>
                  {entry.highlights.map((highlight, itemIndex) => (
                    <li key={`${itemIndex}-${highlight}`}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
