"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import styles from "./LanguageToggle.module.css";

/** Compact EN | አማ selector shared by desktop, mobile and the footer. */
export function LanguageToggle({
  inline = false,
  className = "",
}: {
  inline?: boolean;
  className?: string;
}) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={`${styles.toggle} ${inline ? styles.inline : ""} ${className}`}
      role="group"
      aria-label={t("Select language")}
    >
      <button
        type="button"
        lang="en"
        aria-label={`${t("English language")} (EN)`}
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
      <span className={styles.divider} aria-hidden="true" />
      <button
        type="button"
        lang="am"
        aria-label={`${t("Amharic language")} (አማ)`}
        aria-pressed={language === "am"}
        onClick={() => setLanguage("am")}
      >
        አማ
      </button>
    </div>
  );
}
