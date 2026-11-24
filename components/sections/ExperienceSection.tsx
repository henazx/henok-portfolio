"use client";

import Image from "next/image";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { bypassImageOptimization } from "@/lib/image";
import styles from "./ExperienceSection.module.css";

export function ExperienceSection() {
  const { content } = useEditor();
  const { t } = useLanguage();
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
          eyebrow={t("Experience")}
          titleId="experience-title"
          title={t(copy.title)}
          description={t(copy.description)}
        />

        <ol className={styles.timeline} data-reveal>
          {content.experience.map((entry, index) => (
            <li
              className={styles.item}
              key={`${entry.role}-${entry.organization}-${index}`}
            >
              <div className={styles.content}>
                <div className={styles.headline}>
                  {entry.logo ? (
                    <span className={styles.logoFrame}>
                      <Image
                        src={entry.logo.src}
                        alt={t(entry.logo.alt)}
                        width={56}
                        height={56}
                        unoptimized={bypassImageOptimization(entry.logo.src)}
                        className={styles.logo}
                      />
                    </span>
                  ) : null}
                  <div className={styles.headingText}>
                    <h3 className={styles.role}>{t(entry.role)}</h3>
                    <p className={styles.organization}>
                      <span>{t(entry.organization)}</span>
                      <span className={styles.separator} aria-hidden="true">
                        ·
                      </span>
                      <span>{t(entry.location)}</span>
                    </p>
                  </div>
                </div>

                {entry.summary ? (
                  <p className={styles.summary}>{t(entry.summary)}</p>
                ) : null}

                <div className={styles.detailGroup}>
                  <h4 className={styles.detailTitle}>
                    {t("Key responsibilities")}
                  </h4>
                  <ul className={styles.highlights}>
                    {entry.highlights.map((highlight, itemIndex) => (
                      <li key={`${itemIndex}-${highlight}`}>{t(highlight)}</li>
                    ))}
                  </ul>
                </div>

              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
