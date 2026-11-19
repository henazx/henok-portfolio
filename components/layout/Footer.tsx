"use client";

import { ArrowUp } from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { SocialLinks } from "@/components/ui/SocialLinks";
import type { SiteContent, SocialLink } from "@/types";
import styles from "./Footer.module.css";

function socialLinksFor(profile: SiteContent["profile"]): SocialLink[] {
  return [
    { label: "GitHub", href: profile.github, icon: "github" },
    ...(profile.linkedin
      ? [{ label: "LinkedIn", href: profile.linkedin, icon: "linkedin" as const }]
      : []),
    { label: "Email", href: `mailto:${profile.email}`, icon: "mail" },
  ];
}

export function Footer() {
  const { content } = useEditor();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.panel} data-reveal>
          <div className={styles.top}>
            <div>
              <a href="#home" className={styles.brand}>
                <span className={styles.monogram} aria-hidden="true">
                  {content.profile.monogram}
                </span>
                <span>{content.profile.name}</span>
              </a>
              <p className={styles.tagline}>
                {content.profile.role} · {content.profile.location}
              </p>
            </div>

            <nav className={styles.nav} aria-label="Footer">
              <ul>
                {content.site.navigation.map((item) => (
                  <li key={item.href}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="mono">Elsewhere</p>
              <SocialLinks
                links={socialLinksFor(content.profile)}
                className={`social-links ${styles.socialLinks}`}
              />
            </div>
          </div>

          <div className={styles.bottom}>
            <p>
              © {year} {content.profile.name}. All rights reserved.
            </p>
            <p className={styles.status}>
              <span aria-hidden="true" />
              {content.profile.availability}
            </p>
            <a href="#home" className={styles.topLink}>
              Back to top
              <ArrowUp aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
