import type { SkillCategory } from "@/types";

/**
 * Six disciplines, no percentage bars. Add or remove skills freely — each item
 * is rendered as a compact tag. A technology can appear in more than one group
 * because these categories describe how a skill is used, not a ranking.
 */
export const skillCategories: SkillCategory[] = [
  {
    title: "Frontend Development",
    description: "Component-driven interfaces built to stay clear and responsive.",
    icon: "frontend",
    skills: ["React", "Next.js", "JavaScript", "Responsive layouts"],
  },
  {
    title: "Backend Development",
    description: "Application logic, server routes, and API workflows.",
    icon: "backend",
    skills: ["Node.js", "Express.js", "JavaScript"],
  },
  {
    title: "Databases",
    description: "Structured storage and dependable data access.",
    icon: "database",
    skills: ["MySQL", "SQL"],
  },
  {
    title: "IT Infrastructure & Support",
    description: "Keeping hardware, software, and networks dependable.",
    icon: "support",
    skills: [
      "IT Support",
      "Hardware Troubleshooting",
      "Software Installation & Configuration",
      "Network Troubleshooting",
      "System Maintenance",
    ],
  },
  {
    title: "UI/UX Design",
    description: "Turning requirements into clear, usable interfaces.",
    icon: "design",
    skills: [
      "Figma",
      "Adobe Photoshop",
      "UX/UI Design",
      "Wireframing",
      "User-Centered Design",
    ],
  },
  {
    title: "Development Tools",
    description: "The everyday environment behind the work.",
    icon: "tools",
    skills: ["Git & GitHub", "Vercel", "Figma", "Adobe Photoshop"],
  },
];
