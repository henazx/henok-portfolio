import Image from "next/image";
import { ArrowUpRight, Download, MapPin } from "lucide-react";

import { profile, socialLinks } from "@/data/profile";
import { SocialLinks } from "@/components/ui/SocialLinks";
import styles from "./Hero.module.css";

const statusRows = [
  { label: "system.status", value: "Available", tone: "live" as const },
  { label: "role", value: "IT Specialist" },
  { label: "focus", value: "Software Development" },
  {
    label: "location",
    value: profile.location.split(",")[0],
  },
];

export function Hero() {
  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
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
              View my projects
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a
              className="btn btn-secondary"
              href={profile.cv.path}
              download={profile.cv.fileName}
            >
              <Download aria-hidden="true" />
              Download CV
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

          <div className={`glass-1 ${styles.console}`}>
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
