"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { BrandMark } from "@/components/ui/BrandMark";
import { SocialLinks } from "@/components/ui/SocialLinks";
import type { SiteContent, SocialLink } from "@/types";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Navbar.module.css";

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

export function Navbar() {
  const { content } = useEditor();
  const { t } = useLanguage();
  const navigation = content.site.navigation;
  const profile = content.profile;
  const socialLinks = socialLinksFor(profile, t);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navigation
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-42% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navigation]);

  useEffect(() => {
    if (!open) return;

    const panel = menuRef.current;
    panel?.querySelector<HTMLElement>("a, button")?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || !panel.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !panel.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktopQuery.addEventListener("change", onDesktop);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktopQuery.removeEventListener("change", onDesktop);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className="container">
        <div className={styles.inner} data-glow>
          <a
            href="#home"
            className={styles.brand}
            aria-label={`${profile.name}${t(" — back to top")}`}
            onClick={closeMenu}
          >
            <span className={styles.mark} aria-hidden="true">
              <BrandMark />
            </span>
            <span className={styles.brandName}>{profile.name}</span>
          </a>

          <nav className={styles.desktopNav} aria-label={t("Primary")}>
            <ul>
              {navigation.map((item) => {
                const isActive = active === item.href.slice(1);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={isActive ? styles.active : undefined}
                      aria-current={isActive ? "location" : undefined}
                    >
                      {t(item.label)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.actions}>
            <LanguageToggle className={styles.languageToggle} />
            <ThemeToggle />
            <button
              ref={toggleRef}
              type="button"
              className={styles.menuButton}
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={t(open ? "Close menu" : "Open menu")}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className={styles.mobilePanel}
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("Mobile navigation")}
        >
          <nav className={styles.mobileNav} aria-label={t("Primary mobile")}>
            <ul>
              {navigation.map((item, index) => {
                const isActive = active === item.href.slice(1);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={closeMenu}
                      className={isActive ? styles.mobileActive : undefined}
                      aria-current={isActive ? "location" : undefined}
                    >
                      <span className={styles.mobileIndex} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {t(item.label)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.mobileFooter}>
            <LanguageToggle inline />

            <div>
              <p className="mono" style={{ marginBottom: 12 }}>
                {t("Elsewhere")}
              </p>
              <SocialLinks
                links={socialLinks}
                className={`social-links ${styles.mobileSocials}`}
              />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
