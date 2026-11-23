"use client";

import { Moon, Sun } from "lucide-react";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { t } = useLanguage();

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";

    root.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem("theme", next);
    } catch {
      // Storage can be unavailable in private browsing; the toggle still works
      // for the current page view.
    }
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={t("Toggle dark and light theme")}
      title={t("Toggle theme")}
    >
      <Sun className={styles.sun} aria-hidden="true" />
      <Moon className={styles.moon} aria-hidden="true" />
    </button>
  );
}
