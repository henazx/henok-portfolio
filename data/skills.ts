import type { SkillCategory } from "@/types";

/**
 * Six disciplines, no percentage bars. Add or remove skills freely — each item
 * is rendered as a compact tag. A technology can appear in more than one group
 * (for example React in Frontend and Git in Tools) because the groups describe
 * how the skill is used, not a ranking.
 */
export const skillCategories: SkillCategory[] = [
  {
    title: "Programming & Development",
    description: "Writing and maintaining application logic.",
    icon: "code",
    skills: ["JavaScript", "Node.js", "Express.js", "Git & GitHub"],
  },
  {
    title: "Frontend Technologies",
    description: "Building responsive, component-driven interfaces.",
    icon: "frontend",
    skills: ["React", "Next.js", "JavaScript", "Responsive layouts"],
  },
  {
    title: "Backend & Databases",
    description: "APIs, server logic, and structured data.",
    icon: "backend",
    skills: ["Node.js", "Express.js", "MySQL"],
  },
  {
    title: "IT & Technical Support",
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
    title: "UI/UX & Design",
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
    title: "Tools & Platforms",
    description: "The everyday environment behind the work.",
    icon: "tools",
    skills: ["Git & GitHub", "Figma", "Adobe Photoshop", "Vercel"],
  },
];
