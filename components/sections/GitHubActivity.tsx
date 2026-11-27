"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Loader2, Star } from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./GitHubActivity.module.css";

interface PublicRepository {
  id: number;
  name: string;
  description: string | null;
  href: string;
  language: string | null;
  updatedAt: string;
  stars: number;
  fork: boolean;
}

type Status = "loading" | "ready" | "error";

export function GitHubActivity() {
  const { content } = useEditor();
  const { language, t } = useLanguage();
  const [status, setStatus] = useState<Status>("loading");
  const [repositories, setRepositories] = useState<PublicRepository[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/api/github", {
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          ok?: boolean;
          repositories?: PublicRepository[];
        };

        if (!response.ok || !payload.ok) {
          setStatus("error");
          return;
        }

        setRepositories(Array.isArray(payload.repositories) ? payload.repositories : []);
        setStatus("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(language === "am" ? "am-ET" : "en-US", {
      dateStyle: "medium",
    }).format(date);
  }

  return (
    <section className="section" id="github" aria-labelledby="github-title">
      <div className="container">
        <SectionHeading
          index="05"
          eyebrow={t("GitHub activity")}
          titleId="github-title"
          title={t("Public repositories")}
          description={t("Public repositories from GitHub")}
        />

        <div className={styles.panel} data-reveal>
          <div className={styles.header}>
            <p className={styles.account}>
              <GitHubIcon />
              <span>{t("henazx")}</span>
            </p>
            <a
              className={styles.profileLink}
              href={content.profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("View all repositories")} ${t(" (opens in a new tab)")}`}
            >
              {t("View all repositories")}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>

          {status === "loading" ? (
            <p className={styles.state} role="status">
              <Loader2 className={styles.spinner} aria-hidden="true" />
              {t("Loading repositories…")}
            </p>
          ) : null}

          {status === "error" ? (
            <p className={styles.state} role="status">
              {t("Could not load GitHub repositories.")}
            </p>
          ) : null}

          {status === "ready" && repositories.length === 0 ? (
            <p className={styles.state} role="status">
              {t("No public repositories available.")}
            </p>
          ) : null}

          {repositories.length > 0 ? (
            <ul className={styles.list} aria-label={t("Public repositories from GitHub")}>
              {repositories.map((repository) => (
                <li key={repository.id}>
                  <article className={styles.repo}>
                    <div className={styles.repoTop}>
                      <a
                        href={repository.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t("Open repository")}: ${repository.name} ${t(" (opens in a new tab)")}`}
                      >
                        <h3>{repository.name}</h3>
                        <ArrowUpRight aria-hidden="true" />
                      </a>
                      {repository.fork ? (
                        <span className={styles.fork}>{t("Fork")}</span>
                      ) : null}
                    </div>

                    <p className={styles.description}>
                      {repository.description ?? t("No description provided.")}
                    </p>

                    <dl className={styles.meta}>
                      {repository.language ? (
                        <div>
                          <dt>{t("Repository language")}</dt>
                          <dd>{repository.language}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt>{t("Stars")}</dt>
                        <dd className={styles.stars}>
                          <Star aria-hidden="true" />
                          {repository.stars}
                        </dd>
                      </div>
                      <div>
                        <dt>{t("Updated")}</dt>
                        <dd>
                          <time dateTime={repository.updatedAt}>
                            {formatDate(repository.updatedAt)}
                          </time>
                        </dd>
                      </div>
                    </dl>
                  </article>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
