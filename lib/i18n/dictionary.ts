import amharic from "@/locales/am.json";
import english from "@/locales/en.json";

export type Language = "en" | "am";

export const languages: Language[] = ["en", "am"];

/**
 * Amharic copy for the public portfolio. Keys are the exact English source
 * strings, so any editor-provided text that is not listed here safely falls
 * back to English. Brand names, technologies and URLs are intentionally kept
 * unchanged.
 *
 * Copy lives in `locales/en.json` and `locales/am.json` so it can be reviewed
 * and maintained separately from the components.
 */
export function translate(text: string, language: Language): string {
  if (language === "en") {
    return (english as Record<string, string>)[text] ?? text;
  }
  return (
    (amharic as Record<string, string>)[text] ??
    (english as Record<string, string>)[text] ??
    text
  );
}

export function isLanguage(value: string | null | undefined): value is Language {
  return value === "en" || value === "am";
}
