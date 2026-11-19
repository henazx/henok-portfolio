import type { NavItem, SiteContent } from "@/types";
import content from "./content.json";
import { profile } from "./profile";

const data = content as SiteContent;

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
  titleTemplate: `%s | ${profile.name}`,
  description: data.site.description,
} as const;

export const navigation: NavItem[] = data.site.navigation;
