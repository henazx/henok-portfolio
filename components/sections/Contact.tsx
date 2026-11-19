import { ArrowUpRight, MapPin } from "lucide-react";

import { profile, socialLinks } from "@/data/profile";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "./ContactForm";
import styles from "./Contact.module.css";

export function Contact() {
  const emailConfigured = Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.CONTACT_TO_EMAIL?.trim() &&
      process.env.CONTACT_FROM_EMAIL?.trim(),
  );

  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionHeading
          index="06"
          eyebrow="Contact"
          titleId="contact-title"
          title="Let's build something useful."
          description="I'm open to IT, development, and design opportunities. If you have a role, a project, or a problem worth solving, I'd like to hear about it."
        />

        <div className={styles.grid}>
          <div className={styles.info} data-reveal>
            <div>
              <p className="mono">Email</p>
              <a
                className={styles.email}
                href={`mailto:${profile.email}`}
              >
                {profile.email}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>

            <dl className={styles.details}>
              <div className={styles.detail}>
                <dt>Location</dt>
                <dd>
                  <span className={styles.inlineIcon} aria-hidden="true">
                    <MapPin />
                  </span>
                  {profile.location}
                </dd>
              </div>
              <div className={styles.detail}>
                <dt>Availability</dt>
                <dd>
                  <span className={styles.statusDot} aria-hidden="true" />
                  {profile.availability}
                </dd>
              </div>
              <div className={styles.detail}>
                <dt>Work style</dt>
                <dd>{profile.workPreference}</dd>
              </div>
            </dl>

            <div>
              <p className="mono" style={{ marginBottom: 12 }}>
                Elsewhere
              </p>
              <SocialLinks links={socialLinks} className="social-links" />
            </div>
          </div>

          <div data-reveal style={{ transitionDelay: "80ms" }}>
            <ContactForm configured={emailConfigured} email={profile.email} />
          </div>
        </div>
      </div>
    </section>
  );
}
