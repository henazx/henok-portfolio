import type { SiteContent, SocialLink } from "@/types";
import content from "./content.json";

/**
 * Personal content is stored in content.json so the visual editor can update
 * it. This module keeps the original import path stable for the site.
 */
const data = content as SiteContent;

export const profile = data.profile;

export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: profile.github,
    icon: "github",
  },
  ...(profile.linkedin
    ? [
        {
          label: "LinkedIn",
          href: profile.linkedin,
          icon: "linkedin" as const,
        },
      ]
    : []),
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    icon: "mail",
  },
];
