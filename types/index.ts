export type SectionId =
  | "home"
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "credentials"
  | "contact";

export interface NavItem {
  label: string;
  href: `#${SectionId}`;
}

export type SocialIcon = "github" | "linkedin" | "mail";

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
}

export interface ExperienceEntry {
  role: string;
  organization: string;
  location: string;
  period: string;
  summary?: string;
  highlights: string[];
  current?: boolean;
}

export interface EducationEntry {
  qualification: string;
  institution: string;
  period: string;
  detail?: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  note?: string;
}

export type ProjectCategory = "Development" | "IT & Systems" | "UI/UX Design";

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  slug: string;
  name: string;
  category: ProjectCategory;
  description: string;
  technologies: string[];
  image: ProjectImage;
  repository?: string;
  demo?: string;
  note?: string;
}

export type SkillIcon =
  | "code"
  | "frontend"
  | "backend"
  | "support"
  | "design"
  | "tools";

export interface SkillCategory {
  title: string;
  description: string;
  icon: SkillIcon;
  skills: string[];
}
