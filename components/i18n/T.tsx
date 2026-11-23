"use client";

import { useLanguage } from "./LanguageProvider";

/** Translate a literal string inside a server component that keeps metadata. */
export function T({ text }: { text: string }) {
  const { t } = useLanguage();
  return <>{t(text)}</>;
}
