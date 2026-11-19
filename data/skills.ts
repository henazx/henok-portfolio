import type { SiteContent, SkillCategory } from "@/types";
import content from "./content.json";

const data = content as SiteContent;

export const skillCategories: SkillCategory[] = data.skills;
