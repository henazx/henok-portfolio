"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { ProjectLightbox } from "@/components/interaction/ProjectLightbox";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { bypassImageOptimization } from "@/lib/image";
import type { Project, ProjectCategory } from "@/types";
import styles from "./ProjectGallery.module.css";

type Filter = "All" | ProjectCategory;

interface ProjectGalleryProps {
  projects: Project[];
}

export function ProjectGallery({ projects }: ProjectGalleryProps) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Filter>("All");
  const filters: Filter[] = [
    "All",
    ...Array.from(new Set(projects.map((project) => project.category))),
  ];

  const visibleProjects = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((project) => project.category === filter),
    [filter, projects],
  );

  return (
    <div>
      <div className={styles.toolbar}>
        <div
          className={styles.filters}
          role="group"
          aria-label={t("Filter projects by category")}
        >
          {filters.map((option) => {
            const count =
              option === "All"
                ? projects.length
                : projects.filter((project) => project.category === option)
                    .length;

            return (
              <button
                key={option}
                type="button"
                className={`${styles.filter} ${
                  filter === option ? styles.filterActive : ""
                }`}
                aria-pressed={filter === option}
                onClick={() => setFilter(option)}
              >
                {t(option)}
                <span className={styles.count}>{count}</span>
              </button>
            );
          })}
        </div>

        <p className={styles.resultCount} aria-live="polite">
          {visibleProjects.length}{" "}
          {t(visibleProjects.length === 1 ? "project" : "projects")}
        </p>
      </div>

      <div className={styles.grid} key={filter}>
        {visibleProjects.map((project, index) => {
          const featured = filter === "All" && Boolean(project.demo);
          const featuredCount =
            filter === "All"
              ? visibleProjects.filter((item) => item.demo).length
              : 0;
          const remaining = visibleProjects.length - featuredCount;
          const wide =
            !featured &&
            (visibleProjects.length === 1 ||
              (filter === "All" &&
                index === visibleProjects.length - 1 &&
                remaining % 2 === 1));

          return (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              featured={featured}
              wide={wide}
              t={t}
            />
          );
        })}
      </div>

      {visibleProjects.length === 0 ? (
        <p className={styles.empty}>
          {t("No projects in this category yet. Check back soon.")}
        </p>
      ) : null}
    </div>
  );
}

function ProjectCard({
  project,
  index,
  featured,
  wide,
  t,
}: {
  project: Project;
  index: number;
  featured: boolean;
  wide: boolean;
  t: (text: string) => string;
}) {
  const hasLinks = Boolean(project.repository || project.demo);
  const gallery = [project.image, ...(project.images ?? [])];
  const [activeImage, setActiveImage] = useState(0);
  const activeIndex = Math.min(activeImage, gallery.length - 1);
  const active = gallery[activeIndex] ?? project.image;
  const hasGallery = gallery.length > 1;
  const study = project.caseStudy;
  const hasCaseStudy = Boolean(
    study &&
      (study.role ||
        study.overview ||
        study.problem ||
        study.solution ||
        study.approach ||
        study.features?.length ||
        study.architecture?.length ||
        study.challenges?.length ||
        study.outcome ||
        study.learnings ||
        study.decisions.length > 0),
  );

  return (
    <article
      id={`project-${project.slug}`}
      className={`${styles.card} ${featured ? styles.featured : ""} ${
        wide ? styles.wide : ""
      }`}
      data-glow
    >
      <div
        className={`${styles.media} ${
          hasGallery ? styles.mediaWithGallery : ""
        }`}
      >
        <Image
          key={active.src}
          src={active.src}
          alt={t(active.alt)}
          fill
          unoptimized={bypassImageOptimization(active.src)}
          sizes={
            featured
              ? "(max-width: 900px) 100vw, 58vw"
              : "(max-width: 780px) 100vw, 50vw"
          }
          className={styles.image}
        />
        <span className={styles.badge}>{t(project.category)}</span>
        {project.demo ? (
          <span className={styles.live}>
            <span aria-hidden="true" />
            {t("Live")}
          </span>
        ) : null}
        {project.note ? (
          <span className={styles.note}>{t(project.note)}</span>
        ) : null}

        {hasGallery ? (
          <div
            className={styles.gallery}
            role="group"
            aria-label={`${t(project.name)} ${t("images")}`}
          >
            {gallery.map((image, imageIndex) => (
              <button
                key={`${image.src}-${imageIndex}`}
                type="button"
                className={`${styles.thumb} ${
                  imageIndex === activeIndex ? styles.thumbActive : ""
                }`}
                onClick={() => setActiveImage(imageIndex)}
                aria-label={`${t("Show")} ${t(project.name)} ${t("image")} ${imageIndex + 1}`}
                aria-pressed={imageIndex === activeIndex}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  unoptimized={bypassImageOptimization(image.src)}
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        ) : hasLinks ? (
          <span className={styles.hoverCue} aria-hidden="true">
            {t(project.demo ? "Live deployment" : "View repository")}
            <ArrowUpRight />
          </span>
        ) : null}

        <div className={styles.mediaActions}>
          <ProjectLightbox
            images={gallery}
            projectName={project.name}
            className={styles.expandButton}
          />
        </div>
      </div>

      <div className={styles.body}>
        {featured ? (
          <p className={styles.featuredLabel}>
            <span aria-hidden="true">◆</span> {t("Featured project")}
          </p>
        ) : null}

        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            <span className={styles.projectIndex} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className={styles.title}>{t(project.name)}</h3>
          </div>
          {project.demo ? (
            <a
              href={project.demo}
              className={styles.quickLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("Live demo")} — ${t(project.name)} ${t("(opens in a new tab)")}`}
            >
              <ExternalLink aria-hidden="true" />
            </a>
          ) : null}
        </div>

        <p className={styles.description}>{t(project.description)}</p>

        {hasCaseStudy ? (
          <Link
            href={`/projects/${project.slug}`}
            className={styles.caseLink}
            aria-label={`${t("Read case study")}: ${t(project.name)}`}
          >
            {t("Read case study")}
            <ArrowRight aria-hidden="true" />
          </Link>
        ) : null}

        {study && hasCaseStudy ? (
          <details className={styles.caseStudy}>
            <summary>{t("Case study")}</summary>
            <dl className={styles.caseStudyList}>
              {study.role ? (
                <div>
                  <dt>{t("Your role")}</dt>
                  <dd>{t(study.role)}</dd>
                </div>
              ) : null}
              {study.problem ? (
                <div>
                  <dt>{t("Problem")}</dt>
                  <dd>{t(study.problem)}</dd>
                </div>
              ) : null}
              {study.approach ? (
                <div>
                  <dt>{t("Approach")}</dt>
                  <dd>{t(study.approach)}</dd>
                </div>
              ) : null}
              {study.decisions.length > 0 ? (
                <div>
                  <dt>{t("Stack decisions")}</dt>
                  <dd>
                    <ul>
                      {study.decisions.map((decision) => (
                        <li key={decision}>{t(decision)}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
              {study.outcome ? (
                <div>
                  <dt>{t("Outcome")}</dt>
                  <dd>{t(study.outcome)}</dd>
                </div>
              ) : null}
              {study.learnings ? (
                <div>
                  <dt>{t("What I learned")}</dt>
                  <dd>{t(study.learnings)}</dd>
                </div>
              ) : null}
            </dl>
          </details>
        ) : null}

        <ul className={styles.tech} aria-label={t("Technologies used")}>
          {project.technologies.map((technology) => (
            <li key={technology}>{t(technology)}</li>
          ))}
        </ul>

        {hasLinks ? (
          <div className={styles.links}>
            {project.repository ? (
              <a
                href={project.repository}
                className={`btn btn-secondary ${styles.linkButton}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("Source code")} — ${t(project.name)} ${t("(opens in a new tab)")}`}
              >
                <GitHubIcon aria-hidden="true" />
                {t("Source code")}
                <span className="sr-only">
                  {" "}
                  {t("for")} {t(project.name)}
                </span>
              </a>
            ) : null}
            {project.demo ? (
              <a
                href={project.demo}
                className={`btn btn-primary ${styles.linkButton}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("Live demo")} — ${t(project.name)} ${t("(opens in a new tab)")}`}
              >
                <ExternalLink aria-hidden="true" />
                {t("Live demo")}
                <span className="sr-only">
                  {" "}
                  {t("for")} {t(project.name)}
                </span>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
