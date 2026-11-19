import type { ExperienceEntry, SiteContent } from "@/types";
import content from "./content.json";

const data = content as SiteContent;

export const experience: ExperienceEntry[] = data.experience;
