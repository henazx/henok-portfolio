import { BadgeCheck, GraduationCap } from "lucide-react";

import { certifications, education } from "@/data/education";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Credentials.module.css";

export function Credentials() {
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
          title="Formal study, continued learning."
          description="A Computer Science foundation, supported by focused certificates in design, artificial intelligence, and cybersecurity."
        />

        <div className={styles.grid}>
          <div data-reveal>
            <h3 className={styles.columnTitle}>
              <GraduationCap aria-hidden="true" />
              Education
            </h3>

            <ol className={styles.educationList}>
              {education.map((entry) => (
                <li className={styles.educationItem} key={entry.qualification}>
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
              {certifications.map((certification) => (
                <li className={styles.cert} key={certification.name}>
                  <span className={styles.certIcon} aria-hidden="true">
                    <BadgeCheck />
                  </span>
                  <div>
                    <p className={styles.certName}>{certification.name}</p>
                    <p className={styles.certIssuer}>{certification.issuer}</p>
                    {certification.note ? (
                      <p className={styles.certNote}>{certification.note}</p>
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
