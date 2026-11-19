import type { CertificationEntry, EducationEntry } from "@/types";

export const education: EducationEntry[] = [
  {
    qualification: "BSc in Computer Science",
    institution: "Kotebe University of Education",
    period: "2020 – 2024",
    detail:
      "Foundations in programming, software engineering, databases, computer networks, and information systems.",
  },
  {
    qualification: "High School",
    institution: "Millennium Academy",
    period: "2016 – 2020",
  },
];

/**
 * These are professional certificates and courses — not licenses.
 */
export const certifications: CertificationEntry[] = [
  {
    name: "Google UX Design Certificate",
    issuer: "Google",
    note: "User research, wireframing, prototyping, and usability testing.",
  },
  {
    name: "Artificial Intelligence Fundamentals",
    issuer: "Udacity",
  },
  {
    name: "Introduction to Cybersecurity",
    issuer: "Cisco",
  },
];
