import content from "@/data/content.json";
import amharic from "@/locales/am.json";
import english from "@/locales/en.json";
import type { SiteContent } from "@/types";

export type Language = "en" | "am";

export const languages: Language[] = ["en", "am"];

/** Editor-authored translations, keyed by their exact English source text. */
const editorAmharic = new Map<string, string>();
for (const entry of (content as SiteContent).translations?.am ?? []) {
  if (entry?.source && entry.value) {
    editorAmharic.set(entry.source, entry.value);
  }
}

/** True when a string already has a maintained translation in locales/am.json. */
export function hasBuiltInTranslation(text: string): boolean {
  return (
    Object.prototype.hasOwnProperty.call(english, text) ||
    Object.prototype.hasOwnProperty.call(amharic, text)
  );
}

const missingAmharicWarnings = new Set<string>();

function warnMissingAmharic(text: string) {
  if (process.env.NODE_ENV !== "development") return;
  if (missingAmharicWarnings.has(text)) return;
  missingAmharicWarnings.add(text);
  console.warn("Missing Amharic translation:", text);
}

/**
 * Amharic copy for the public portfolio. Keys are the exact English source
 * strings, so any editor-provided text that is not listed here safely falls
 * back to English. Brand names, technologies and URLs are intentionally kept
 * unchanged.
 *
 * Copy lives in `locales/en.json` and `locales/am.json` so it can be reviewed
 * and maintained separately from the components. Strings authored in the
 * private editor can be translated there too and are loaded from content.json.
 */
export function translate(text: string, language: Language): string {
  if (language === "en") {
    return (english as Record<string, string>)[text] ?? text;
  }
  const editorTranslation = editorAmharic.get(text);
  if (editorTranslation) return editorTranslation;

  const amharicTranslation = (amharic as Record<string, string>)[text];
  if (amharicTranslation) return amharicTranslation;

  warnMissingAmharic(text);
  return (english as Record<string, string>)[text] ?? text;
}

export function isLanguage(value: string | null | undefined): value is Language {
  return value === "en" || value === "am";
}
