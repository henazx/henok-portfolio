"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { TechEcosystem } from "@/components/interaction/TechEcosystem";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { findProjectsForSkill } from "@/lib/skills";
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
  const { language, t } = useLanguage();
  const [category, setCategory] = useState<string>("All skills");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const categories = useMemo(
    () => ["All skills", ...content.skills.map((item) => item.title)],
    [content.skills],
  );

  const visibleCategories = useMemo(
    () =>
      category === "All skills"
        ? content.skills
        : content.skills.filter((item) => item.title === category),
    [category, content.skills],
  );

  const linkedProjects = useMemo(
    () =>
      selectedSkill
        ? findProjectsForSkill(content.projects, selectedSkill)
        : [],
    [content.projects, selectedSkill],
  );

  function selectCategory(next: string) {
    setCategory(next);
    setSelectedSkill(null);
  }

  return (
    <section
      className={`section ${styles.skillsSection}`}
      id="skills"
      aria-labelledby="skills-title"
      lang={language}
    >
      <div className="container">
        <SectionHeading
          index="04"
          eyebrow={t("Skills")}
          titleId="skills-title"
          title={t(copy.title)}
          description={t(copy.description)}
        />

        <div className={styles.heritageBand} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div data-reveal>
          <TechEcosystem />
        </div>

        <div
          className={styles.explorer}
          role="group"
          aria-label={t("Filter by skill category")}
          data-reveal
        >
          {categories.map((item) => {
            const count =
              item === "All skills"
                ? content.skills.length
                : content.skills.find((entry) => entry.title === item)?.skills
                    .length ?? 0;

            return (
              <button
                key={item}
                type="button"
                className={`${styles.filter} ${
                  category === item ? styles.filterActive : ""
                }`}
                aria-pressed={category === item}
                onClick={() => selectCategory(item)}
              >
                {t(item)}
                <span className={styles.filterCount}>{count}</span>
              </button>
            );
          })}
        </div>

        <p className={styles.explorerHint} data-reveal>
          {t("Select a skill to see where it was used.")}
        </p>

        <div className={styles.grid} key={category}>
          {visibleCategories.map((categoryItem, index) => {
            const Icon = icons[categoryItem.icon];
            const evidenceHref = categoryItem.evidenceHref?.trim();
            const evidenceLabel = categoryItem.evidenceLabel?.trim();
            const externalEvidence = evidenceHref?.startsWith("https://");
            const translatedLabel = evidenceLabel ? t(evidenceLabel) : "";

            return (
              <article
                className={`${styles.card} ${
                  linkedProjects.length > 0 &&
                  categoryItem.skills.includes(selectedSkill ?? "")
                    ? styles.cardLinked
                    : ""
                }`}
                key={`${categoryItem.title}-${index}`}
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

                <h3 className={styles.title}>{t(categoryItem.title)}</h3>

                <p className={styles.description}>
                  {t(categoryItem.description)}
                </p>

                <ul className={styles.tags} aria-label={t("Skill categories")}>
                  {categoryItem.skills.map((skill, skillIndex) => {
                    const hasEvidence =
                      findProjectsForSkill(content.projects, skill).length > 0;
                    const isSelected = selectedSkill === skill;

                    return (
                      <li key={`${skill}-${skillIndex}`}>
                        {hasEvidence ? (
                          <button
                            type="button"
                            className={`${styles.skillButton} ${
                              isSelected ? styles.tagActive : ""
                            }`}
                            aria-pressed={isSelected}
                            aria-label={`${t("Projects demonstrating")} ${t(skill)}`}
                            onClick={() =>
                              setSelectedSkill(isSelected ? null : skill)
                            }
                          >
                            {t(skill)}
                          </button>
                        ) : (
                          <span className={styles.tagStatic}>{t(skill)}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {evidenceHref && translatedLabel ? (
                  <a
                    className={styles.evidence}
                    href={evidenceHref}
                    target={externalEvidence ? "_blank" : undefined}
                    rel={externalEvidence ? "noopener noreferrer" : undefined}
                    aria-label={`${translatedLabel}${externalEvidence ? ` ${t(" (opens in a new tab)")}` : ""}`}
                  >
                    {translatedLabel}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>

        {selectedSkill ? (
          <div className={styles.results} data-reveal aria-live="polite">
            <div className={styles.resultHead}>
              <div>
                <p className="mono">
                  {t("Projects demonstrating")} <strong>{t(selectedSkill)}</strong>
                </p>
                <p className={styles.verifiedNote}>
                  {t("Verified project links only")}
                </p>
              </div>
              <button
                type="button"
                className={styles.clear}
                onClick={() => setSelectedSkill(null)}
              >
                {t("Clear skill filter")}
              </button>
            </div>

            {linkedProjects.length > 0 ? (
              <ul className={styles.resultList}>
                {linkedProjects.map((project) => (
                  <li key={project.slug}>
                    <Link href={`/projects/${project.slug}`}>
                      <span>
                        <strong>{t(project.name)}</strong>
                        <small>{t(project.category)}</small>
                      </span>
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>
                {t("No linked projects for this skill.")}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
