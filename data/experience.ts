import type { ExperienceEntry } from "@/types";

/**
 * Add a new object to the top of this array when you start a new role.
 * The Experience section renders whatever is here.
 */
export const experience: ExperienceEntry[] = [
  {
    role: "Information Technology Specialist",
    organization: "Addis Mesob",
    location: "Addis Ababa, Ethiopia",
    period: "Present",
    current: true,
    summary:
      "Providing day-to-day technical support and keeping business-critical systems, hardware, and networks dependable.",
    highlights: [
      "Provided technical support and troubleshooting for hardware, software, and network-related issues.",
      "Installed, configured, and maintained computers, printers, and IT systems.",
      "Assisted employees with technical problems and daily IT operations.",
      "Supported software development and technology-related projects.",
    ],
  },
];
