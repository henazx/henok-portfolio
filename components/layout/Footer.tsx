"use client";

import { ArrowUp } from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { BrandMark } from "@/components/ui/BrandMark";
import { SocialLinks } from "@/components/ui/SocialLinks";
import type { SiteContent, SocialLink } from "@/types";
import { LanguageToggle } from "./LanguageToggle";
import styles from "./Footer.module.css";

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

export function Footer() {
  const { content } = useEditor();
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.panel} data-reveal>
          <div className={styles.top}>
            <div>
              <a href="#home" className={styles.brand}>
                <span className={styles.mark} aria-hidden="true">
                  <BrandMark />
                </span>
                <span>{t(content.profile.name)}</span>
              </a>
              <p className={styles.tagline}>
                {t(content.profile.role)} · {t(content.profile.location)}
              </p>
            </div>

            <nav className={styles.nav} aria-label={t("Footer")}>
              <ul>
                {content.site.navigation.map((item) => (
                  <li key={item.href}>
                    <a href={item.href}>{t(item.label)}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="mono">{t("Elsewhere")}</p>
              <SocialLinks
                links={socialLinksFor(content.profile, t)}
                className={`social-links ${styles.socialLinks}`}
              />
              <LanguageToggle inline className={styles.language} />
            </div>
          </div>

          <div className={styles.bottom}>
            <p>
              © {year} {t(content.profile.name)}
              {t(". All rights reserved.")}
            </p>
            <p className={styles.status}>
              <span aria-hidden="true" />
              {t(content.profile.availability)}
            </p>
            <a href="#home" className={styles.topLink}>
              {t("Back to top")}
              <ArrowUp aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
