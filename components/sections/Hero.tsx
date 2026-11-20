"use client";

import Image from "next/image";
import { ArrowRight, Download, MapPin } from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { SocialLinks } from "@/components/ui/SocialLinks";
import {
  FigmaIcon,
  NextIcon,
  ReactIcon,
  TypeScriptIcon,
} from "@/components/ui/BrandIcons";
import type { SiteContent, SocialLink } from "@/types";
import styles from "./Hero.module.css";

function socialLinksFor(profile: SiteContent["profile"]): SocialLink[] {
  return [
    { label: "GitHub", href: profile.github, icon: "github" },
    ...(profile.linkedin
      ? [{ label: "LinkedIn", href: profile.linkedin, icon: "linkedin" as const }]
      : []),
    { label: "Email", href: `mailto:${profile.email}`, icon: "mail" },
  ];
}

function statusRowsFor(profile: SiteContent["profile"]) {
  return [
    { label: "system.status", value: "Available", tone: "live" as const },
    { label: "role", value: profile.role },
    { label: "focus", value: profile.positioning[0] ?? "Software Development" },
    { label: "location", value: profile.location.split(",")[0] },
  ];
}

export function Hero() {
  const { content } = useEditor();
  const profile = content.profile;
  const socialLinks = socialLinksFor(profile);
  const statusRows = statusRowsFor(profile);

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
          <g className={styles.annotations}>
            <text x="376" y="158">BUS.A</text>
            <text x="108" y="356">NODE.01</text>
            <text x="652" y="132">REF.02</text>
            <text x="506" y="542">DATA.LINK</text>
            <text x="76" y="668">CLK.02</text>
          </g>
        </svg>
        <span className={styles.bpLeft}>REF // HN·01 — Portfolio system</span>
        <span className={styles.bpBottom}>9.0192° N / 38.7525° E</span>
      </div>

      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <p className={styles.kicker} aria-hidden="true">
            <span>01</span>
            Introduction
          </p>

          <p className={styles.availability}>
            <span className={styles.dot} aria-hidden="true" />
            {profile.availability}
          </p>

          <h1 id="hero-title" className={styles.name}>
            {profile.name}
          </h1>

          <p className={styles.role}>{profile.role}</p>

          <ul className={styles.positioning}>
            {profile.positioning.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className={styles.summary}>{profile.summary}</p>

          <div className={styles.actions}>
            <a className="btn btn-primary" href="#projects">
              Explore Projects
              <ArrowRight aria-hidden="true" />
            </a>
            <a
              className="btn btn-secondary"
              href={profile.cv.path}
              download={profile.cv.fileName}
            >
              Download CV
              <Download aria-hidden="true" />
            </a>
          </div>

          <div className={styles.footerRow}>
            <SocialLinks links={socialLinks} className="social-links" />
            <p className={styles.location}>
              <MapPin aria-hidden="true" />
              {profile.location}
            </p>
          </div>
        </div>

        <div className={styles.consoleWrap}>
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

          <div className={`glass-1 ${styles.console}`} data-glow>
            <div className={styles.consoleBar}>
              <span className={styles.dots} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className={styles.consoleTitle}>profile.console</span>
              <span className={styles.consoleState}>
                <span aria-hidden="true">●</span> online
              </span>
            </div>

            <div className={styles.consoleBody}>
              <div className={styles.portraitFrame}>
                <Image
                  src={profile.portrait.src}
                  alt={profile.portrait.alt}
                  fill
                  priority
                  sizes="(max-width: 900px) 88vw, 440px"
                  className={styles.portrait}
                />
                <span className={styles.scanline} aria-hidden="true" />
                {profile.portrait.isPlaceholder ? (
                  <span className={styles.placeholderTag}>
                    Portrait placeholder
                  </span>
                ) : null}
              </div>

              <dl className={styles.statusPanel} aria-label="Profile summary">
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
      </div>
    </section>
  );
}
