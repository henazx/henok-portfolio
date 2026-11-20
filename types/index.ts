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

export interface OrganizationLogo {
  src: string;
  alt: string;
}

export interface ExperienceEntry {
  role: string;
  organization: string;
  location: string;
  period: string;
  summary?: string;
  highlights: string[];
  current?: boolean;
  logo?: OrganizationLogo;
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
  link?: string;
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
  /** Optional additional screenshots, shown as a gallery on the project card. */
  images?: ProjectImage[];
  repository?: string;
  demo?: string;
  note?: string;
}

export type SkillIcon =
  | "frontend"
  | "backend"
  | "database"
  | "support"
  | "design"
  | "tools";

export interface SkillCategory {
  title: string;
  description: string;
  icon: SkillIcon;
  skills: string[];
}

export interface SectionCopy {
  title: string;
  description: string;
}

export type SectionKey =
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "credentials"
  | "contact";

/** The single editable content source used by the site and the visual editor. */
export interface SiteContent {
  site: {
    description: string;
    navigation: NavItem[];
  };
  sections: Record<SectionKey, SectionCopy>;
  profile: {
    name: string;
    monogram: string;
    role: string;
    positioning: string[];
    summary: string;
    about: {
      lead: string;
      paragraphs: string[];
      focus: string[];
    };
    email: string;
    location: string;
    availability: string;
    workPreference: string;
    github: string;
    linkedin: string;
    cv: { path: string; fileName: string };
    portrait: { src: string; alt: string; isPlaceholder: boolean };
  };
  experience: ExperienceEntry[];
  projects: Project[];
  skills: SkillCategory[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
}
