"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useEditor } from "@/components/editor/ContentProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { translate } from "@/lib/i18n/dictionary";
import en from "@/locales/en.json";

const enDescription = en["metadata.home.description"];

/**
 * The server renders English metadata so every route stays static. This keeps
 * the browser title and description in sync with the visitor's chosen language
 * after hydration and when the language changes.
 */
export function LocalizedMetadata() {
  const { language } = useLanguage();
  const { content } = useEditor();
  const pathname = usePathname();

  useEffect(() => {
    const t = (text: string) => translate(text, language);
    let title: string;
    let description: string;

    if (pathname.startsWith("/projects/")) {
      const slug = pathname.split("/")[2];
      const project = content.projects.find((entry) => entry.slug === slug);
      title = project
        ? `${t(project.name)}${t("metadata.project.titleSuffix")}`
        : t("metadata.notFound.title");
      description = project
        ? t(project.caseStudy?.overview ?? "metadata.project.description")
        : t("metadata.notFound.description");
    } else if (pathname === "/cv") {
      title = t("metadata.cv.title");
      description = t("metadata.cv.description");
    } else if (pathname === "/") {
      title = t("metadata.home.title");
      description = t("metadata.home.description");
    } else {
      title = t("metadata.notFound.title");
      description = t("metadata.notFound.description");
    }

    // Fall back to the server-rendered English copy if a translation is absent.
    const fallbackTitle =
      pathname === "/cv"
        ? en["metadata.cv.title"]
        : pathname === "/"
          ? en["metadata.home.title"]
          : en["metadata.notFound.title"];
    const siteSuffix = ` | ${content.profile.name}`;
    const localizedTitle = title || fallbackTitle;
    // The root metadata template adds the site name to every route except the
    // home default. Mirror it here so the browser title does not jump after
    // hydration or when the visitor switches language.
    const resolvedTitle =
      pathname === "/" || localizedTitle.endsWith(siteSuffix)
        ? localizedTitle
        : `${localizedTitle}${siteSuffix}`;
    const resolvedDescription = description || enDescription;
    const resolvedLocale = language === "am" ? "am_ET" : "en_US";

    function apply() {
      // Every write is guarded so the MutationObserver cannot loop.
      if (document.title !== resolvedTitle) document.title = resolvedTitle;
      const tags: Array<[string, string]> = [
        ['meta[name="description"]', resolvedDescription],
        ['meta[property="og:title"]', resolvedTitle],
        ['meta[property="og:description"]', resolvedDescription],
        ['meta[name="twitter:title"]', resolvedTitle],
        ['meta[name="twitter:description"]', resolvedDescription],
        ['meta[property="og:locale"]', resolvedLocale],
      ];

      for (const [selector, value] of tags) {
        const meta = document.querySelector<HTMLMetaElement>(selector);
        if (meta && meta.content !== value) meta.content = value;
      }
    }

    apply();
    // Next's metadata outlet can restore the server-rendered title after our
    // effect on the first hydration pass. Keep the localized title and social
    // tags authoritative for as long as this route and language are mounted.
    const observer = new MutationObserver(() => apply());
    observer.observe(document.head, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["content"],
    });
    return () => observer.disconnect();
  }, [content.projects, content.profile.name, language, pathname]);

  return null;
}
