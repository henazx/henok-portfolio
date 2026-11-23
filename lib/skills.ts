import type { Project } from "@/types";

/**
 * A skill is linked to a project only when its name appears in that project's
 * published technology list. Version suffixes such as "Next.js 14" are treated
 * as the same technology; no other inference is made.
 */
export function findProjectsForSkill(
  projects: Project[],
  skill: string,
): Project[] {
  const needle = normalize(skill);
  if (!needle) return [];

  return projects.filter((project) =>
    project.technologies.some((technology) => {
      const value = normalize(technology);
      return value === needle || value.startsWith(`${needle} `);
    }),
  );
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[&]/g, " and ")
    .replace(/[._/]+/g, " ")
    .replace(/[^a-z0-9+ ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
