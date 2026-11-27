import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyView } from "@/components/sections/CaseStudyView";
import { translate } from "@/lib/i18n/dictionary";
import { languageAlternates } from "@/lib/i18n/seo";
import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects
    .filter((project) => Boolean(project.caseStudy))
    .map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((entry) => entry.slug === slug);

  if (!project) {
    return { title: translate("Case study not found", "en") };
  }

  const title =
    translate(project.name, "en") + translate(" — Case study", "en");
  const description = translate(
    project.caseStudy?.overview ??
      project.description ??
      siteConfig.description,
    "en",
  );
  const canonicalPath = `/projects/${project.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates(canonicalPath),
    },
    openGraph: {
      type: "article",
      url: canonicalPath,
      title,
      description,
      siteName: translate("Henok Neknikie — Portfolio", "en"),
      images: [
        {
          url: project.image.src,
          alt: translate(project.image.alt, "en"),
          width: project.image.width,
          height: project.image.height,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [project.image.src],
    },
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = projects.find((entry) => entry.slug === slug);

  if (!project?.caseStudy) notFound();

  return <CaseStudyView slug={slug} />;
}
