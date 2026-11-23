"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import styles from "./BackToTop.module.css";

/** Appears after scrolling; stays out of the way on short pages and at the top. */
export function BackToTop() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 600);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={t("Scroll back to top")}
      title={t("Back to top")}
      onClick={() =>
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        })
      }
    >
      <ArrowUp aria-hidden="true" />
    </button>
  );
}
