import type { NavItem } from "@/types";

export const siteConfig = {
  /**
   * Set NEXT_PUBLIC_SITE_URL in Vercel (and in .env.local for local builds).
   * Falls back to a clearly labelled placeholder so local builds still work.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-domain.com").replace(
    /\/$/,
    "",
  ),
  locale: "en_US",
  titleTemplate: "%s | Your Name",
  description:
    "Portfolio of an Information Technology Specialist and Computer Science graduate working across IT support, software development and UX/UI design.",
} as const;

export const navigation: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Certifications", href: "#credentials" },
  { label: "Contact", href: "#contact" },
];
