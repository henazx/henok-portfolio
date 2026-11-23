/**
 * Query-parameter locale variants keep the existing URLs and deploy links
 * intact while still exposing machine-readable language alternatives. The
 * default URL remains the canonical, English-first route for crawlers.
 */
export function languageAlternates(
  pathname: string,
): Record<"en" | "am" | "x-default", string> {
  const base = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const separator = base.includes("?") ? "&" : "?";

  return {
    en: `${base}${separator}lang=en`,
    am: `${base}${separator}lang=am`,
    "x-default": base,
  };
}
