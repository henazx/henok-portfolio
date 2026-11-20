"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ExternalLink } from "lucide-react";

import { GitHubIcon } from "@/components/ui/BrandIcons";
import type { Project, ProjectCategory } from "@/types";
import styles from "./ProjectGallery.module.css";

type Filter = "All" | ProjectCategory;

interface ProjectGalleryProps {
  projects: Project[];
}

export function ProjectGallery({ projects }: ProjectGalleryProps) {
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
          aria-label="Filter projects by category"
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
                {option}
                <span className={styles.count}>{count}</span>
              </button>
            );
          })}
        </div>

        <p className={styles.resultCount} aria-live="polite">
          {visibleProjects.length}{" "}
          {visibleProjects.length === 1 ? "project" : "projects"}
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
            />
          );
        })}
      </div>

      {visibleProjects.length === 0 ? (
        <p className={styles.empty}>
          No projects in this category yet. Check back soon.
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
}: {
  project: Project;
  index: number;
  featured: boolean;
  wide: boolean;
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
        study.problem ||
        study.approach ||
        study.outcome ||
        study.learnings ||
        study.decisions.length > 0),
  );

  return (
    <article
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
          alt={active.alt}
          fill
          unoptimized
          sizes={
            featured
              ? "(max-width: 900px) 100vw, 58vw"
              : "(max-width: 780px) 100vw, 50vw"
          }
          className={styles.image}
        />
        <span className={styles.badge}>{project.category}</span>
        {project.demo ? (
          <span className={styles.live}>
            <span aria-hidden="true" />
            Live
          </span>
        ) : null}
        {project.note ? (
          <span className={styles.note}>{project.note}</span>
        ) : null}

        {hasGallery ? (
          <div
            className={styles.gallery}
            role="group"
            aria-label={`${project.name} images`}
          >
            {gallery.map((image, imageIndex) => (
              <button
                key={`${image.src}-${imageIndex}`}
                type="button"
                className={`${styles.thumb} ${
                  imageIndex === activeIndex ? styles.thumbActive : ""
                }`}
                onClick={() => setActiveImage(imageIndex)}
                aria-label={`Show ${project.name} image ${imageIndex + 1}`}
                aria-pressed={imageIndex === activeIndex}
              >
                <Image src={image.src} alt="" fill unoptimized sizes="64px" />
              </button>
            ))}
          </div>
        ) : (
          <span className={styles.hoverCue} aria-hidden="true">
            {project.demo ? "Live deployment" : "View repository"}
            <ArrowUpRight />
          </span>
        )}
      </div>

      <div className={styles.body}>
        {featured ? (
          <p className={styles.featuredLabel}>
            <span aria-hidden="true">◆</span> Featured project
          </p>
        ) : null}

        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            <span className={styles.projectIndex} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className={styles.title}>{project.name}</h3>
          </div>
          {project.demo ? (
            <a
              href={project.demo}
              className={styles.quickLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open the ${project.name} live site (opens in a new tab)`}
            >
              <ExternalLink aria-hidden="true" />
            </a>
          ) : null}
        </div>

        <p className={styles.description}>{project.description}</p>

        {study && hasCaseStudy ? (
          <details className={styles.caseStudy}>
            <summary>Case study</summary>
            <dl className={styles.caseStudyList}>
              {study.role ? (
                <div>
                  <dt>Your role</dt>
                  <dd>{study.role}</dd>
                </div>
              ) : null}
              {study.problem ? (
                <div>
                  <dt>Problem</dt>
                  <dd>{study.problem}</dd>
                </div>
              ) : null}
              {study.approach ? (
                <div>
                  <dt>Approach</dt>
                  <dd>{study.approach}</dd>
                </div>
              ) : null}
              {study.decisions.length > 0 ? (
                <div>
                  <dt>Technical decisions</dt>
                  <dd>
                    <ul>
                      {study.decisions.map((decision) => (
                        <li key={decision}>{decision}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
              {study.outcome ? (
                <div>
                  <dt>Outcome</dt>
                  <dd>{study.outcome}</dd>
                </div>
              ) : null}
              {study.learnings ? (
                <div>
                  <dt>What I learned</dt>
                  <dd>{study.learnings}</dd>
                </div>
              ) : null}
            </dl>
          </details>
        ) : null}

        <ul className={styles.tech} aria-label="Technologies used">
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
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
              >
                <GitHubIcon />
                Source code
                <span className="sr-only"> for {project.name}</span>
              </a>
            ) : null}
            {project.demo ? (
              <a
                href={project.demo}
                className={`btn btn-primary ${styles.linkButton}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink aria-hidden="true" />
                Live demo
                <span className="sr-only"> for {project.name}</span>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
