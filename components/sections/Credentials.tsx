"use client";

import { BadgeCheck, ExternalLink, GraduationCap } from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Credentials.module.css";

export function Credentials() {
  const { content } = useEditor();
  const { t } = useLanguage();
  const copy = content.sections.credentials;

  return (
    <section
      className="section"
      id="credentials"
      aria-labelledby="credentials-title"
    >
      <div className="container">
        <SectionHeading
          index="06"
          eyebrow={t("Education & Certifications")}
          titleId="credentials-title"
          title={t(copy.title)}
          description={t(copy.description)}
        />

        <div className={styles.grid}>
          <div data-reveal>
            <h3 className={styles.columnTitle}>
              <GraduationCap aria-hidden="true" />
              {t("Education")}
            </h3>

            <ol className={styles.educationList}>
              {content.education.map((entry, index) => (
                <li
                  className={styles.educationItem}
                  key={`${entry.qualification}-${index}`}
                >
                  <span className={styles.period}>{t(entry.period)}</span>
                  <h4 className={styles.qualification}>
                    {t(entry.qualification)}
                  </h4>
                  <p className={styles.institution}>{t(entry.institution)}</p>
                  {entry.detail ? (
                    <p className={styles.educationDetail}>{t(entry.detail)}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal style={{ transitionDelay: "80ms" }}>
            <h3 className={styles.columnTitle}>
              <BadgeCheck aria-hidden="true" />
              {t("Certifications")}
            </h3>

            <ul className={styles.certList} aria-label={t("Certifications")}>
              {content.certifications.map((entry, index) => (
                <li className={styles.cert} key={`${entry.name}-${index}`}>
                  <span className={styles.certIcon} aria-hidden="true">
                    <BadgeCheck />
                  </span>
                  <div>
                    <h4 className={styles.certName}>{t(entry.name)}</h4>
                    <p className={styles.certIssuer}>
                      <span>{t("Issuer")}:</span> {t(entry.issuer)}
                    </p>
                    {entry.note ? (
                      <p className={styles.certNote}>{t(entry.note)}</p>
                    ) : null}
                    {entry.link ? (
                      <a
                        className={styles.certLink}
                        href={entry.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t("Verify certificate")}: ${t(entry.name)} ${t(" (opens in a new tab)")}`}
                      >
                        {t("Verify certificate")}
                        <ExternalLink aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            <p className={styles.disclaimer}>
              {t(
                "These are professional certificates and completed courses — not licenses.",
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
