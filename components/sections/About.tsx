"use client";

import {
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  PenTool,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./About.module.css";

const capabilityIcons: LucideIcon[] = [Wrench, Code2, PenTool];

export function About() {
  const { content } = useEditor();
  const { t } = useLanguage();
  const { profile, education, experience, sections } = content;
  const currentRole = experience.find((entry) => entry.current) ?? experience[0];
  const primaryDegree = education[0];
  const copy = sections.about;

  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeading
          index="01"
          eyebrow={t("About")}
          titleId="about-title"
          title={t(copy.title)}
          description={t(copy.description)}
        />

        <div className={styles.grid} data-reveal>
          <div className={styles.leadColumn} data-glow>
            <p className={styles.lead}>{t(profile.about.lead)}</p>

            <ul className={styles.capabilities} aria-label={t("Focus areas")}>
              {profile.about.focus.map((item, index) => {
                const Icon = capabilityIcons[index % capabilityIcons.length];
                return (
                  <li key={`${item}-${index}`}>
                    <span className={styles.capabilityIcon} aria-hidden="true">
                      <Icon />
                    </span>
                    <span>{t(item)}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.bodyColumn}>
            {profile.summary ? (
              <p className={styles.intro}>{t(profile.summary)}</p>
            ) : null}
            {profile.about.paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{t(paragraph)}</p>
            ))}
          </div>
        </div>

        <dl
          className={styles.facts}
          data-glow
          data-reveal
          style={{ transitionDelay: "80ms" }}
        >
          <div className={styles.fact}>
            <dt>{t("Based in")}</dt>
            <dd>{t(profile.location)}</dd>
          </div>
          <div className={styles.fact}>
            <dt>{t("Education")}</dt>
            <dd>
              {t(primaryDegree?.qualification ?? "")}
              <span className={styles.factDetail}>
                {t(primaryDegree?.institution ?? "")}
              </span>
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>{t("Current role")}</dt>
            <dd>
              {t(currentRole?.role ?? "")}
              <span className={styles.factDetail}>
                {t(currentRole?.organization ?? "")}
              </span>
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>{t("Focus")}</dt>
            <dd>
              {t(profile.currentFocus ?? profile.about.focus[0])}
              {profile.currentFocus && profile.about.focus[1] ? (
                <span className={styles.factDetail}>
                  {profile.about.focus.slice(1).map((item) => t(item)).join(" · ")}
                </span>
              ) : null}
            </dd>
          </div>
        </dl>

        <section className={styles.timeline} aria-labelledby="background-title">
          <h3 id="background-title" className="mono">
            {t("Background")}
          </h3>
          <ol>
            {currentRole ? (
              <li key={`${currentRole.role}-current`}>
                <span className={styles.timelineIcon} aria-hidden="true">
                  <BriefcaseBusiness />
                </span>
                <div>
                  <span className={styles.timelinePeriod}>
                    {t(currentRole.period)}
                  </span>
                  <strong>{t(currentRole.role)}</strong>
                  <span className={styles.timelineDetail}>
                    {t(currentRole.organization)}
                  </span>
                </div>
              </li>
            ) : null}

            {education.map((entry, index) => (
              <li key={`${entry.institution}-${index}`}>
                <span className={styles.timelineIcon} aria-hidden="true">
                  <GraduationCap />
                </span>
                <div>
                  <span className={styles.timelinePeriod}>{entry.period}</span>
                  <strong>{t(entry.qualification)}</strong>
                  <span className={styles.timelineDetail}>
                    {t(entry.institution)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </section>
  );
}
