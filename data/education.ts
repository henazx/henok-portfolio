import type {
  CertificationEntry,
  EducationEntry,
  SiteContent,
} from "@/types";
import content from "./content.json";

const data = content as SiteContent;

export const education: EducationEntry[] = data.education;
export const certifications: CertificationEntry[] = data.certifications;
