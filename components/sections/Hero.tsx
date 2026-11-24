"use client";

import Image from "next/image";
import { ArrowRight, Download } from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SocialLinks } from "@/components/ui/SocialLinks";
import type { SiteContent, SocialLink } from "@/types";
import styles from "./Hero.module.css";

function socialLinksFor(
  profile: SiteContent["profile"],
  t: (text: string) => string,
): SocialLink[] {
  return [
    { label: t("GitHub"), href: profile.github, icon: "github" },
    ...(profile.linkedin
      ? [
          {
            label: t("LinkedIn"),
            href: profile.linkedin,
            icon: "linkedin" as const,
          },
        ]
      : []),
    { label: t("Email"), href: `mailto:${profile.email}`, icon: "mail" },
  ];
}

function statusRowsFor(
  profile: SiteContent["profile"],
  t: (text: string) => string,
) {
  return [
    {
      label: t("Availability"),
      value: t(profile.availability || "Open to opportunities"),
      tone: "live" as const,
    },
    { label: t("Role"), value: t(profile.role) },
    {
      label: t("Focus"),
      value: t(
        profile.currentFocus ??
          profile.positioning[0] ??
          "Software development",
      ),
    },
    { label: t("Location"), value: t(profile.location) },
  ];
}

export function Hero() {
  const { content } = useEditor();
  const { t } = useLanguage();
  const profile = content.profile;
  const socialLinks = socialLinksFor(profile, t);
  const statusRows = statusRowsFor(profile, t);

  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.shell}`}>
        <div className={styles.content}>
          <p className={styles.kicker}>{t("Introduction")}</p>

          <h1 id="hero-title" className={styles.name}>
            {profile.name}
          </h1>

          <p className={styles.headline}>
            {t(profile.headline ?? profile.role)}
          </p>

          <p className={styles.summary}>{t(profile.summary)}</p>

          <div className={styles.actions}>
            <a className="btn btn-primary" href="#projects">
              {t("Explore Projects")}
              <ArrowRight aria-hidden="true" />
            </a>
            <a className="btn btn-secondary" href="#contact">
              {t("Contact me")}
              <ArrowRight aria-hidden="true" />
            </a>
            <a
              className="btn btn-secondary"
              href={profile.cv.path}
              download={profile.cv.fileName}
            >
              {t("Download CV")}
              <Download aria-hidden="true" />
            </a>
          </div>

          <SocialLinks links={socialLinks} className="social-links" />
        </div>

        <div className={`glass-1 ${styles.profileCard}`} data-glow>
          <div className={styles.portraitFrame}>
            <Image
              src={profile.portrait.src}
              alt={t(profile.portrait.alt)}
              fill
              priority
              sizes="(max-width: 900px) 88vw, 420px"
              className={styles.portrait}
            />
            {profile.portrait.isPlaceholder ? (
              <span className={styles.placeholderTag}>
                {t("Portrait placeholder")}
              </span>
            ) : null}
          </div>

          <dl className={styles.statusPanel} aria-label={t("Profile summary")}>
            {statusRows.map((row) => (
              <div className={styles.statusRow} key={row.label}>
                <dt>{row.label}</dt>
                <dd
                  className={
                    row.tone === "live" ? styles.statusLive : undefined
                  }
                >
                  {row.tone === "live" ? (
                    <span className={styles.statusDot} aria-hidden="true" />
                  ) : null}
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
