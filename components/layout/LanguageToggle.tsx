"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import styles from "./LanguageToggle.module.css";

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
      aria-label={t("Site language")}
    >
      <button
        type="button"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
      >
        {t("English")}
      </button>
      <button
        type="button"
        aria-pressed={language === "am"}
        onClick={() => setLanguage("am")}
      >
        አማርኛ
      </button>
    </div>
  );
}
