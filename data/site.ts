import type { NavItem, SiteContent } from "@/types";
import content from "./content.json";
import { profile } from "./profile";

const data = content as SiteContent;

/**
 * SITE_URL is the preferred explicit setting. VERCEL_URL is provided
 * automatically on Vercel, and NEXT_PUBLIC_SITE_URL remains supported as a
 * legacy alias. When none is present (local development), fall back to the
 * local server instead of emitting a fake production domain in canonical and
 * Open Graph URLs.
 */
function resolveSiteUrl(): string {
  const explicit =
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL?.trim()
      ? `https://${process.env.VERCEL_URL.trim()}`
      : "");

  if (explicit) return explicit.replace(/\/$/, "");

  return `http://localhost:${process.env.PORT?.trim() || "3000"}`;
}

export const siteConfig = {
  url: resolveSiteUrl(),
  locale: "en_US",
  titleTemplate: `%s | ${profile.name}`,
  description: data.site.description,
} as const;

export const navigation: NavItem[] = data.site.navigation;
