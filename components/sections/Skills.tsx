"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Boxes,
  Database,
  LayoutTemplate,
  PenTool,
  Server,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { TechEcosystem } from "@/components/interaction/TechEcosystem";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  skillsUi,
  translateSkillsCopy,
  type SkillsLanguage,
} from "@/lib/i18n/skills";
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
  const [language, setLanguage] = useState<SkillsLanguage>("en");
  const ui = skillsUi[language];
  const t = (text: string) => translateSkillsCopy(text, language);

  return (
    <section
      className={`section ${styles.skillsSection}`}
      id="skills"
      aria-labelledby="skills-title"
      lang={language === "am" ? "am" : undefined}
    >
      <div className="container">
        <div className={styles.headingRow}>
          <SectionHeading
            index="04"
            eyebrow={ui.eyebrow}
            titleId="skills-title"
            title={t(copy.title)}
            description={t(copy.description)}
          />

          <div className={styles.language}>
            <span className={styles.languageLabel}>{ui.languageLabel}</span>
            <div className={styles.languageButtons} role="group" aria-label={ui.languageGroup}>
              <button
                type="button"
                aria-pressed={language === "en"}
                onClick={() => setLanguage("en")}
              >
                {ui.english}
              </button>
              <button
                type="button"
                aria-pressed={language === "am"}
                onClick={() => setLanguage("am")}
              >
                {ui.amharic}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.heritageBand} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div data-reveal>
          <TechEcosystem />
        </div>

        <div className={styles.grid}>
          {content.skills.map((category, index) => {
            const Icon = icons[category.icon];
            const evidenceHref = category.evidenceHref?.trim();
            const evidenceLabel = category.evidenceLabel?.trim();
            const externalEvidence = evidenceHref?.startsWith("https://");
            const translatedLabel = evidenceLabel ? t(evidenceLabel) : "";

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

                <h3 className={styles.title}>{t(category.title)}</h3>

                <p className={styles.description}>
                  {t(category.description)}
                </p>

                <ul className={styles.tags}>
                  {category.skills.map((skill, skillIndex) => (
                    <li key={`${skill}-${skillIndex}`}>{t(skill)}</li>
                  ))}
                </ul>

                {evidenceHref && translatedLabel ? (
                  <a
                    className={styles.evidence}
                    href={evidenceHref}
                    target={externalEvidence ? "_blank" : undefined}
                    rel={externalEvidence ? "noopener noreferrer" : undefined}
                    aria-label={`${translatedLabel}${externalEvidence ? ` ${t("(opens in a new tab)")}` : ""}`}
                  >
                    {translatedLabel}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
