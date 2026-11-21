import { Mail } from "lucide-react";

import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import type { SocialLink } from "@/types";

const icons = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  mail: Mail,
} as const;

interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
}

export function SocialLinks({ links, className }: SocialLinksProps) {
  return (
    <ul className={className}>
      {links.map((link) => {
        const Icon = icons[link.icon];
        const isExternal = link.href.startsWith("http");

        return (
          <li key={link.label}>
            <a
              href={link.href}
              aria-label={`${link.label}${isExternal ? " (opens in a new tab)" : ""}`}
              {...(isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <Icon aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
