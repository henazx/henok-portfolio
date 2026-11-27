"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowRight, Download } from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SocialLinks } from "@/components/ui/SocialLinks";
import {
  FigmaIcon,
  NextIcon,
  ReactIcon,
  TypeScriptIcon,
} from "@/components/ui/BrandIcons";
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

function TypedName({ name }: { name: string }) {
  const words = name.split(" ").filter(Boolean);
  const lengths = words.map((word) => Array.from(word).length);
  const starts = lengths.map((_, index) =>
    lengths.slice(0, index).reduce((total, length) => total + length + 1, 0),
  );
  const lastDelay = starts[starts.length - 1] + lengths[lengths.length - 1];

  return (
    <h1 id="hero-title" className={styles.name} aria-label={name}>
      {words.map((word, wordIndex) => (
        <span
          className={styles.typedWord}
          key={`${word}-${wordIndex}`}
          aria-hidden="true"
        >
          {Array.from(word).map((character, index) => (
            <span
              key={`${word}-${wordIndex}-${index}`}
              className={styles.typedChar}
              style={
                {
                  "--char-delay": `${(starts[wordIndex] + index) * 55}ms`,
                } as CSSProperties
              }
            >
              {character}
            </span>
          ))}
          {wordIndex < words.length - 1 ? (
            <span className={styles.typedSpace}> </span>
          ) : null}
          {wordIndex === words.length - 1 ? (
            <span
              className={styles.caret}
              style={
                {
                  "--caret-delay": `${lastDelay * 55 + 220}ms`,
                } as CSSProperties
              }
            />
          ) : null}
        </span>
      ))}
    </h1>
  );
}

export function Hero() {
  const { content } = useEditor();
  const { t } = useLanguage();
  const profile = content.profile;
  const socialLinks = socialLinksFor(profile, t);
  const statusRows = statusRowsFor(profile, t);

  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.blueprint} aria-hidden="true">
        <span className={styles.dotField} />
        <svg
          className={styles.schematic}
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMinYMin slice"
          focusable="false"
        >
          <g className={styles.traces}>
            <path d="M-30 176h150v-74h134" />
            <path d="M120 176v78h58" strokeDasharray="3 6" />
            <path d="M268 102h96v48" />
            <path d="M-30 664h92v76h-58" />
            <path d="M296 806h74v-58h108" />
            <path d="M456 96v50h88" />
            <path d="M356 452l52 40h84l38 46" />
            <path d="M612 196l46-46" strokeDasharray="2 7" />
            <path d="M-40 528a140 140 0 0 1 140-140" strokeDasharray="2 8" />
            <path d="M-10 570a180 180 0 0 1 180-180" strokeDasharray="2 8" />
          </g>
          <g className={styles.nodes}>
            <circle cx="268" cy="102" r="4" />
            <circle cx="184" cy="254" r="3" />
            <circle cx="364" cy="154" r="3" />
            <circle cx="62" cy="664" r="3" />
            <circle cx="476" cy="748" r="4" />
            <circle cx="544" cy="96" r="3" />
            <circle cx="492" cy="538" r="3" />
          </g>
          <g className={styles.crosshairs}>
            <circle cx="88" cy="352" r="8" />
            <path d="M88 338v-8M88 366v8M74 352h-8M102 352h8" />
            <circle cx="638" cy="128" r="6" />
            <path d="M638 118v-6M638 138v6M628 128h-6M648 128h6" />
            <circle cx="412" cy="856" r="6" />
            <path d="M412 846v-6M412 866v6M402 856h-6M422 856h6" />
          </g>
        </svg>
      </div>

      <div className={`container ${styles.shell}`}>
        <div className={styles.content}>
          <p className={styles.kicker}>{t("Introduction")}</p>

          <TypedName name={t(profile.name)} />

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

        <div className={styles.cardWrap}>
          <div className={styles.signal} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className={styles.floaters} aria-hidden="true">
            <span className={`${styles.floater} ${styles.floaterReact}`}>
              <ReactIcon />
            </span>
            <span className={`${styles.floater} ${styles.floaterNext}`}>
              <NextIcon />
            </span>
            <span className={`${styles.floater} ${styles.floaterType}`}>
              <TypeScriptIcon />
            </span>
            <span className={`${styles.floater} ${styles.floaterFigma}`}>
              <FigmaIcon />
            </span>
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
      </div>
    </section>
  );
}
