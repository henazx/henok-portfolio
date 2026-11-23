"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  Target,
  Wrench,
} from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { ArchitecturePanel } from "@/components/interaction/ArchitecturePanel";
import { ProjectLightbox } from "@/components/interaction/ProjectLightbox";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { projects as publishedProjects } from "@/data/projects";
import { bypassImageOptimization } from "@/lib/image";
import styles from "./CaseStudyView.module.css";

type Translate = (text: string) => string;

function SectionCard({
  eyebrow,
  title,
  t,
  children,
}: {
  eyebrow: string;
  title: string;
  t: Translate;
  children: ReactNode;
}) {
  return (
    <section className={styles.card}>
      <p className="mono">{t(eyebrow)}</p>
      <h2>{t(title)}</h2>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

function BulletList({ items, t }: { items: string[]; t: Translate }) {
  if (items.length === 0) return null;

  return (
    <ul className={styles.bullets}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <CheckCircle2 aria-hidden="true" />
          <span>{t(item)}</span>
        </li>
      ))}
    </ul>
  );
}

export function CaseStudyView({ slug }: { slug: string }) {
  const { content } = useEditor();
  const { t } = useLanguage();
  const project =
    content.projects.find((entry) => entry.slug === slug) ??
    publishedProjects.find((entry) => entry.slug === slug);

  if (!project || !project.caseStudy) {
    return (
      <div className={`container ${styles.notFound}`}>
        <p className="mono">{t("Case study unavailable")}</p>
        <h1>{t("This case study is not available.")}</h1>
        <p>
          {t(
            "The project may have been renamed or removed from the editable content. You can return to the project list and choose another case study.",
          )}
        </p>
        <Link href="/#projects" className="btn btn-primary">
          <ArrowLeft aria-hidden="true" />
          {t("Back to projects")}
        </Link>
      </div>
    );
  }

  const study = project.caseStudy;
  const gallery = [project.image, ...(project.images ?? [])];
  const currentIndex = publishedProjects.findIndex(
    (entry) => entry.slug === project.slug,
  );
  const previousProject =
    currentIndex > 0 ? publishedProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < publishedProjects.length - 1
      ? publishedProjects[currentIndex + 1]
      : null;
  const relatedSkills = content.skills.filter((category) => {
    const href = category.evidenceHref ?? "";
    const label = category.evidenceLabel ?? "";
    return (
      href.includes(project.slug) ||
      label.toLowerCase().includes(project.name.toLowerCase())
    );
  });

  return (
    <article className={styles.page}>
      <div className="container">
        <nav className={styles.breadcrumb} aria-label={t("Breadcrumb")}>
          <Link href="/#home">{t("Portfolio")}</Link>
          <span aria-hidden="true">/</span>
          <Link href="/#projects">{t("Projects")}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{t(project.name)}</span>
        </nav>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className="mono">
              {t(project.category)} · {t("Case study")}
            </p>
            <h1>{t(project.name)}</h1>
            <p className={styles.lede}>
              {t(study.overview ?? project.description)}
            </p>

            <dl className={styles.facts}>
              {study.role ? (
                <div>
                  <dt>{t("Role")}</dt>
                  <dd>{t(study.role)}</dd>
                </div>
              ) : null}
              <div>
                <dt>{t("Built with")}</dt>
                <dd>{project.technologies.map((item) => t(item)).join(" · ")}</dd>
              </div>
              {project.demo ? (
                <div>
                  <dt>{t("Status")}</dt>
                  <dd>
                    <span className={styles.liveDot} aria-hidden="true" />
                    {t("Live deployment available")}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className={styles.heroActions}>
              {project.demo ? (
                <a
                  className="btn btn-primary"
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t("Live demo")} — ${t(project.name)} ${t("(opens in a new tab)")}`}
                >
                  <ExternalLink aria-hidden="true" />
                  {t("Live demo")}
                </a>
              ) : null}
              {project.repository ? (
                <a
                  className="btn btn-secondary"
                  href={project.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t("Source code")} — ${t(project.name)} ${t("(opens in a new tab)")}`}
                >
                  <GitHubIcon />
                  {t("Source code")}
                </a>
              ) : null}
              <Link href="/#contact" className="btn btn-secondary">
                {t("Discuss a similar project")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>

          <figure className={styles.figure}>
            <div className={styles.imageFrame}>
              <Image
                src={project.image.src}
                alt={t(project.image.alt)}
                fill
                priority
                unoptimized={bypassImageOptimization(project.image.src)}
                sizes="(max-width: 900px) 100vw, 52vw"
              />
            </div>
            <figcaption>
              <span>{t(project.image.alt)}</span>
              <ProjectLightbox
                images={gallery}
                projectName={t(project.name)}
                className={styles.expandButton}
                label={`${t("Expand preview")} — ${t(project.name)} ${t("images")}`}
              >
                {t("Expand preview")}
              </ProjectLightbox>
            </figcaption>
          </figure>
        </header>

        <div className={styles.sectionGrid}>
          <SectionCard eyebrow="Context" title="Problem" t={t}>
            <p>{t(study.problem)}</p>
          </SectionCard>

          {study.solution ? (
            <SectionCard eyebrow="Direction" title="Solution" t={t}>
              <p>{t(study.solution)}</p>
            </SectionCard>
          ) : null}

          <SectionCard eyebrow="Process" title="Approach" t={t}>
            <p>{t(study.approach)}</p>
          </SectionCard>

          {study.features && study.features.length > 0 ? (
            <SectionCard eyebrow="Scope" title="What it does" t={t}>
              <BulletList items={study.features} t={t} />
            </SectionCard>
          ) : null}
        </div>

        {study.architecture && study.architecture.length > 0 ? (
          <section className={styles.block}>
            <div className={styles.blockHeading}>
              <span className={styles.blockIcon} aria-hidden="true">
                <Wrench />
              </span>
              <div>
                <p className="mono">{t("System design")}</p>
                <h2>{t("Architecture")}</h2>
                <p>
                  {t(
                    "Select a layer to see the parts it contains and how they support the workflow.",
                  )}
                </p>
              </div>
            </div>
            <ArchitecturePanel layers={study.architecture} />
          </section>
        ) : null}

        <div className={styles.sectionGrid}>
          {study.decisions.length > 0 ? (
            <SectionCard eyebrow="Reasoning" title="Key decisions" t={t}>
              <ol className={styles.decisions}>
                {study.decisions.map((decision, index) => (
                  <li key={`${decision}-${index}`}>
                    <span aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p>{t(decision)}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>
          ) : null}

          {study.challenges && study.challenges.length > 0 ? (
            <SectionCard eyebrow="Trade-offs" title="Challenges" t={t}>
              <ul className={styles.challenges}>
                {study.challenges.map((challenge, index) => (
                  <li key={`${challenge}-${index}`}>
                    <Target aria-hidden="true" />
                    <span>{t(challenge)}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : null}
        </div>

        <div className={styles.sectionGrid}>
          {study.outcome ? (
            <SectionCard eyebrow="Result" title="Outcome" t={t}>
              <p>{t(study.outcome)}</p>
            </SectionCard>
          ) : null}

          {study.learnings ? (
            <SectionCard eyebrow="Reflection" title="What I learned" t={t}>
              <p>{t(study.learnings)}</p>
            </SectionCard>
          ) : null}
        </div>

        {relatedSkills.length > 0 ? (
          <section className={styles.related}>
            <div>
              <p className="mono">{t("Evidence")}</p>
              <h2>{t("Skills connected to this project")}</h2>
            </div>
            <ul>
              {relatedSkills.map((category) => (
                <li key={category.title}>
                  <Link href="/#skills">
                    <Lightbulb aria-hidden="true" />
                    <span>
                      <strong>{t(category.title)}</strong>
                      <small>{t(category.description)}</small>
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <nav
          className={styles.projectNav}
          aria-label={t("Project navigation")}
        >
          {previousProject ? (
            <Link
              href={`/projects/${previousProject.slug}`}
              className={`${styles.navLink} ${styles.navPrev}`}
              rel="prev"
            >
              <ArrowLeft aria-hidden="true" />
              <span>
                <span className="mono">{t("Previous case study")}</span>
                <strong>{t(previousProject.name)}</strong>
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}

          <Link href="/#projects" className={styles.navAll}>
            {t("All projects")}
          </Link>

          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug}`}
              className={`${styles.navLink} ${styles.navNext}`}
              rel="next"
            >
              <span>
                <span className="mono">{t("Next case study")}</span>
                <strong>{t(nextProject.name)}</strong>
              </span>
              <ArrowRight aria-hidden="true" />
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>

        <footer className={styles.pageFooter}>
          <p>
            {t("Want to see more of the thinking behind the work? ")}
            <Link href="/#contact">{t("Get in touch")}</Link>.
          </p>
          <Link href="/#projects" className="mono">
            {t("← All projects")}
          </Link>
        </footer>
      </div>
    </article>
  );
}
