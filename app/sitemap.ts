import type { MetadataRoute } from "next";

import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site";

const today = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/cv`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...projects
      .filter((project) => Boolean(project.caseStudy))
      .map((project) => ({
        url: `${siteConfig.url}/projects/${project.slug}`,
        lastModified: today,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
  ];
}
