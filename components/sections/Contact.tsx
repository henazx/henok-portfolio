"use client";

import { ArrowUpRight, MapPin } from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SiteContent, SocialLink } from "@/types";
import { ContactForm } from "./ContactForm";
import styles from "./Contact.module.css";

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

export function Contact() {
  const { content } = useEditor();
  const { t } = useLanguage();
  const { profile, sections } = content;
  const copy = sections.contact;

  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionHeading
          index="07"
          eyebrow={t("Contact")}
          titleId="contact-title"
          title={t(copy.title)}
          description={t(copy.description)}
        />

        <div className={styles.grid}>
          <div className={styles.info} data-reveal>
            <div>
              <p className="mono">{t("Email")}</p>
              <a className={styles.email} href={`mailto:${profile.email}`}>
                {profile.email}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>

            <dl className={styles.details}>
              <div className={styles.detail}>
                <dt>{t("Location")}</dt>
                <dd>
                  <span className={styles.inlineIcon} aria-hidden="true">
                    <MapPin />
                  </span>
                  {t(profile.location)}
                </dd>
              </div>
              <div className={styles.detail}>
                <dt>{t("Availability")}</dt>
                <dd>
                  <span className={styles.statusDot} aria-hidden="true" />
                  {t(profile.availability)}
                </dd>
              </div>
              <div className={styles.detail}>
                <dt>{t("Work style")}</dt>
                <dd>{t(profile.workPreference)}</dd>
              </div>
            </dl>

            <div>
              <p className="mono" style={{ marginBottom: 12 }}>
                {t("Elsewhere")}
              </p>
              <SocialLinks
                links={socialLinksFor(profile, t)}
                className="social-links"
              />
            </div>
          </div>

          <div data-reveal style={{ transitionDelay: "80ms" }}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
