import { ArrowUp } from "lucide-react";

import { navigation } from "@/data/site";
import { profile, socialLinks } from "@/data/profile";
import { SocialLinks } from "@/components/ui/SocialLinks";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.panel} data-reveal>
          <div className={styles.top}>
            <div>
              <a href="#home" className={styles.brand}>
                <span className={styles.monogram} aria-hidden="true">
                  {profile.monogram}
                </span>
                <span>{profile.name}</span>
              </a>
              <p className={styles.tagline}>
                {profile.role} · {profile.location}
              </p>
            </div>

            <nav className={styles.nav} aria-label="Footer">
              <ul>
                {navigation.map((item) => (
                  <li key={item.href}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="mono">Elsewhere</p>
              <SocialLinks
                links={socialLinks}
                className={`social-links ${styles.socialLinks}`}
              />
            </div>
          </div>

          <div className={styles.bottom}>
            <p>
              © {year} {profile.name}. All rights reserved.
            </p>
            <p className={styles.status}>
              <span aria-hidden="true" />
              Open to new opportunities
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
