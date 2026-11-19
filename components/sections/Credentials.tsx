"use client";

import { BadgeCheck, GraduationCap } from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Credentials.module.css";

export function Credentials() {
  const { content } = useEditor();
  const copy = content.sections.credentials;

  return (
    <section
      className="section"
      id="credentials"
      aria-labelledby="credentials-title"
    >
      <div className="container">
        <SectionHeading
          index="05"
          eyebrow="Education & Certifications"
          titleId="credentials-title"
          title={copy.title}
          description={copy.description}
        />

        <div className={styles.grid}>
          <div data-reveal>
            <h3 className={styles.columnTitle}>
              <GraduationCap aria-hidden="true" />
              Education
            </h3>

            <ol className={styles.educationList}>
              {content.education.map((entry, index) => (
                <li
                  className={styles.educationItem}
                  key={`${entry.qualification}-${index}`}
                >
                  <span className={styles.period}>{entry.period}</span>
                  <h4 className={styles.qualification}>
                    {entry.qualification}
                  </h4>
                  <p className={styles.institution}>{entry.institution}</p>
                  {entry.detail ? (
                    <p className={styles.educationDetail}>{entry.detail}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal style={{ transitionDelay: "80ms" }}>
            <h3 className={styles.columnTitle}>
              <BadgeCheck aria-hidden="true" />
              Certifications
            </h3>

            <ul className={styles.certList}>
              {content.certifications.map((entry, index) => (
                <li className={styles.cert} key={`${entry.name}-${index}`}>
                  <span className={styles.certIcon} aria-hidden="true">
                    <BadgeCheck />
                  </span>
                  <div>
                    <p className={styles.certName}>{entry.name}</p>
                    <p className={styles.certIssuer}>{entry.issuer}</p>
                    {entry.note ? (
                      <p className={styles.certNote}>{entry.note}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            <p className={styles.disclaimer}>
              These are professional certificates and completed courses — not
              licenses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
