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
import { ArchitecturePanel } from "@/components/interaction/ArchitecturePanel";
import { ProjectLightbox } from "@/components/interaction/ProjectLightbox";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { projects as publishedProjects } from "@/data/projects";
import { bypassImageOptimization } from "@/lib/image";
import styles from "./CaseStudyView.module.css";

function SectionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.card}>
      <p className="mono">{eyebrow}</p>
      <h2>{title}</h2>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className={styles.bullets}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <CheckCircle2 aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CaseStudyView({ slug }: { slug: string }) {
  const { content } = useEditor();
  const project =
    content.projects.find((entry) => entry.slug === slug) ??
    publishedProjects.find((entry) => entry.slug === slug);

  if (!project || !project.caseStudy) {
    return (
      <div className={`container ${styles.notFound}`}>
        <p className="mono">Case study unavailable</p>
        <h1>This case study is not available.</h1>
        <p>
          The project may have been renamed or removed from the editable
          content. You can return to the project list and choose another case
          study.
        </p>
        <Link href="/#projects" className="btn btn-primary">
          <ArrowLeft aria-hidden="true" />
          Back to projects
        </Link>
      </div>
    );
  }

  const study = project.caseStudy;
  const gallery = [project.image, ...(project.images ?? [])];
  const currentIndex = publishedProjects.findIndex(
    (entry) => entry.slug === project.slug,
  );
  const nextProject =
    publishedProjects[(currentIndex + 1) % publishedProjects.length];
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
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/#home">Portfolio</Link>
          <span aria-hidden="true">/</span>
          <Link href="/#projects">Projects</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{project.name}</span>
        </nav>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className="mono">{project.category} · Case study</p>
            <h1>{project.name}</h1>
            <p className={styles.lede}>
              {study.overview ?? project.description}
            </p>

            <dl className={styles.facts}>
              {study.role ? (
                <div>
                  <dt>Role</dt>
                  <dd>{study.role}</dd>
                </div>
              ) : null}
              <div>
                <dt>Built with</dt>
                <dd>{project.technologies.join(" · ")}</dd>
              </div>
              {project.demo ? (
                <div>
                  <dt>Status</dt>
                  <dd>
                    <span className={styles.liveDot} aria-hidden="true" />
                    Live deployment available
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
                  aria-label={`Live demo — ${project.name} (opens in a new tab)`}
                >
                  <ExternalLink aria-hidden="true" />
                  Live demo
                </a>
              ) : null}
              {project.repository ? (
                <a
                  className="btn btn-secondary"
                  href={project.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Source code — ${project.name} (opens in a new tab)`}
                >
                  <GitHubIcon />
                  Source code
                </a>
              ) : null}
              <Link href="/#contact" className="btn btn-secondary">
                Discuss a similar project
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>

          <figure className={styles.figure}>
            <div className={styles.imageFrame}>
              <Image
                src={project.image.src}
                alt={project.image.alt}
                fill
                priority
                unoptimized={bypassImageOptimization(project.image.src)}
                sizes="(max-width: 900px) 100vw, 52vw"
              />
            </div>
            <figcaption>
              <span>{project.image.alt}</span>
              <ProjectLightbox
                images={gallery}
                projectName={project.name}
                className={styles.expandButton}
                label={`Expand preview — ${project.name} images`}
              >
                Expand preview
              </ProjectLightbox>
            </figcaption>
          </figure>
        </header>

        <div className={styles.sectionGrid}>
          <SectionCard eyebrow="Context" title="Problem">
            <p>{study.problem}</p>
          </SectionCard>

          {study.solution ? (
            <SectionCard eyebrow="Direction" title="Solution">
              <p>{study.solution}</p>
            </SectionCard>
          ) : null}

          <SectionCard eyebrow="Process" title="Approach">
            <p>{study.approach}</p>
          </SectionCard>

          {study.features && study.features.length > 0 ? (
            <SectionCard eyebrow="Scope" title="What it does">
              <BulletList items={study.features} />
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
                <p className="mono">System design</p>
                <h2>Architecture</h2>
                <p>
                  Select a layer to see the parts it contains and how they
                  support the workflow.
                </p>
              </div>
            </div>
            <ArchitecturePanel layers={study.architecture} />
          </section>
        ) : null}

        <div className={styles.sectionGrid}>
          {study.decisions.length > 0 ? (
            <SectionCard eyebrow="Reasoning" title="Key decisions">
              <ol className={styles.decisions}>
                {study.decisions.map((decision, index) => (
                  <li key={`${decision}-${index}`}>
                    <span aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p>{decision}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>
          ) : null}

          {study.challenges && study.challenges.length > 0 ? (
            <SectionCard eyebrow="Trade-offs" title="Challenges">
              <ul className={styles.challenges}>
                {study.challenges.map((challenge, index) => (
                  <li key={`${challenge}-${index}`}>
                    <Target aria-hidden="true" />
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : null}
        </div>

        <div className={styles.sectionGrid}>
          {study.outcome ? (
            <SectionCard eyebrow="Result" title="Outcome">
              <p>{study.outcome}</p>
            </SectionCard>
          ) : null}

          {study.learnings ? (
            <SectionCard eyebrow="Reflection" title="What I learned">
              <p>{study.learnings}</p>
            </SectionCard>
          ) : null}
        </div>

        {relatedSkills.length > 0 ? (
          <section className={styles.related}>
            <div>
              <p className="mono">Evidence</p>
              <h2>Skills connected to this project</h2>
            </div>
            <ul>
              {relatedSkills.map((category) => (
                <li key={category.title}>
                  <Link href="/#skills">
                    <Lightbulb aria-hidden="true" />
                    <span>
                      <strong>{category.title}</strong>
                      <small>{category.description}</small>
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {nextProject && nextProject.slug !== project.slug ? (
          <Link href={`/projects/${nextProject.slug}`} className={styles.next}>
            <span className="mono">Next case study</span>
            <span className={styles.nextTitle}>
              {nextProject.name}
              <ArrowRight aria-hidden="true" />
            </span>
          </Link>
        ) : null}

        <footer className={styles.pageFooter}>
          <p>
            Want to see more of the thinking behind the work?{" "}
            <Link href="/#contact">Get in touch</Link>.
          </p>
          <Link href="/#projects" className="mono">
            ← All projects
          </Link>
        </footer>
      </div>
    </article>
  );
}
