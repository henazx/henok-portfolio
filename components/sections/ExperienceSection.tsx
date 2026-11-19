import { experience } from "@/data/experience";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./ExperienceSection.module.css";

export function ExperienceSection() {
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
          title="Where I've put technology to work."
          description="Hands-on experience supporting the people and systems that keep an organization running."
        />

        <ol className={styles.timeline} data-reveal>
          {experience.map((entry) => (
            <li
              className={styles.item}
              key={`${entry.role}-${entry.organization}`}
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
                  {entry.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
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
