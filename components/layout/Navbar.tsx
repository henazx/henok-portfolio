"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Menu, X } from "lucide-react";

import { useEditor } from "@/components/editor/ContentProvider";
import { SocialLinks } from "@/components/ui/SocialLinks";
import type { SiteContent, SocialLink } from "@/types";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Navbar.module.css";

function socialLinksFor(profile: SiteContent["profile"]): SocialLink[] {
  return [
    { label: "GitHub", href: profile.github, icon: "github" },
    ...(profile.linkedin
      ? [{ label: "LinkedIn", href: profile.linkedin, icon: "linkedin" as const }]
      : []),
    { label: "Email", href: `mailto:${profile.email}`, icon: "mail" },
  ];
}

export function Navbar() {
  const { content } = useEditor();
  const navigation = content.site.navigation;
  const profile = content.profile;
  const socialLinks = socialLinksFor(profile);
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
            aria-label={`${profile.name} — back to top`}
            onClick={closeMenu}
          >
            <span className={styles.monogram} aria-hidden="true">
              {profile.monogram}
            </span>
            <span className={styles.brandName}>{profile.name}</span>
          </a>

          <nav className={styles.desktopNav} aria-label="Primary">
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
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.actions}>
            <ThemeToggle />
            <a
              href={profile.cv.path}
              download={profile.cv.fileName}
              className={`btn btn-secondary ${styles.cvButton}`}
            >
              <Download aria-hidden="true" />
              <span className={styles.cvLabel}>Download CV</span>
            </a>
            <button
              ref={toggleRef}
              type="button"
              className={styles.menuButton}
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
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
          aria-label="Mobile navigation"
        >
          <nav className={styles.mobileNav} aria-label="Primary mobile">
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
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.mobileFooter}>
            <a
              href={profile.cv.path}
              download={profile.cv.fileName}
              className="btn btn-primary"
              onClick={closeMenu}
            >
              <Download aria-hidden="true" />
              Download CV
            </a>
            <div>
              <p className="mono" style={{ marginBottom: 12 }}>
                Elsewhere
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
