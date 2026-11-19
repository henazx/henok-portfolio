import type { Project, ProjectCategory, SiteContent } from "@/types";
import content from "./content.json";

const data = content as SiteContent;

export const projects: Project[] = data.projects;

export const projectCategories: ProjectCategory[] = Array.from(
  new Set(projects.map((project) => project.category)),
) as ProjectCategory[];
