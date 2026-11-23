import type { MetadataRoute } from "next";

import { projects } from "@/data/projects";
import { languageAlternates } from "@/lib/i18n/seo";
import { siteConfig } from "@/data/site";

const today = new Date();

/** Sitemap language alternates use absolute URLs, as required by the format. */
function languagesFor(path: string) {
  const alternates = languageAlternates(path);
  return Object.fromEntries(
    Object.entries(alternates).map(([key, value]) => [
      key,
      value.startsWith("http") ? value : `${siteConfig.url}${value}`,
    ]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: languagesFor("/") },
    },
    {
      url: `${siteConfig.url}/cv`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: languagesFor("/cv") },
    },
    ...projects
      .filter((project) => Boolean(project.caseStudy))
      .map((project) => ({
        url: `${siteConfig.url}/projects/${project.slug}`,
        lastModified: today,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: {
          languages: languagesFor(`/projects/${project.slug}`),
        },
      })),
  ];
}
