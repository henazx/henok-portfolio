import type { Metadata, Viewport } from "next";
import Script from "next/script";
import {
  Geist,
  Geist_Mono,
  Newsreader,
  Noto_Sans_Ethiopic,
} from "next/font/google";

import "@/app/globals.css";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { LocalizedMetadata } from "@/components/i18n/LocalizedMetadata";
import { T } from "@/components/i18n/T";
import { Navbar } from "@/components/layout/Navbar";
import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { Backdrop } from "@/components/layout/Backdrop";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { PointerGlow } from "@/components/interaction/PointerGlow";
import { AuthGate } from "@/components/editor/AuthGate";
import { ContentProvider } from "@/components/editor/ContentProvider";
import { EditUnlock } from "@/components/editor/EditUnlock";
import { EditorMount } from "@/components/editor/EditorMount";
import { education } from "@/data/education";
import { languageAlternates } from "@/lib/i18n/seo";
import { profile } from "@/data/profile";
import { siteConfig } from "@/data/site";
import { skillCategories } from "@/data/skills";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  variable: "--font-amharic",
  display: "swap",
  preload: false,
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const pageTitle = `${profile.name} — ${profile.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: pageTitle,
    template: `%s | ${profile.name}`,
  },
  description: siteConfig.description,
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, url: siteConfig.url }],
  creator: profile.name,
  keywords: [
    "Information Technology Specialist",
    "Computer Science Graduate",
    "Software Developer",
    "UX/UI Designer",
    "IT Support",
    "Frontend Developer",
    "Addis Ababa",
    "Ethiopia",
    "Portfolio",
  ],
  alternates: {
    canonical: "/",
    languages: languageAlternates("/"),
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: `${profile.name} — Portfolio`,
    title: pageTitle,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#060910" },
    { media: "(prefers-color-scheme: light)", color: "#edf1f8" },
  ],
};

/**
 * Runs before paint so the saved theme is applied without a flash. First-time
 * visitors follow their system preference; the dark theme is the fallback when
 * that preference is unavailable.
 */
const themeScript = `(function(){try{var root=document.documentElement;var stored=localStorage.getItem("theme");var mode=stored==="light"||stored==="dark"||stored==="system"?stored:"system";var resolved=mode==="system"?(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):mode;root.setAttribute("data-theme-mode",mode);root.setAttribute("data-theme",resolved);}catch(e){}})();`;

/** Applies the saved or URL language before paint so the correct font loads. */
const languageScript = `(function(){try{var root=document.documentElement;var fromUrl=new URLSearchParams(window.location.search).get("lang");var stored=localStorage.getItem("henok-portfolio-language");var language=fromUrl==="am"||fromUrl==="en"?fromUrl:stored==="am"?"am":"en";root.lang=language;root.dir="ltr";root.setAttribute("data-language",language);}catch(e){}})();`;

// Derived from the same editable content source as the visible page, rather
// than duplicating personal details in the layout.
const [addressLocality, addressCountry] = profile.location
  .split(",")
  .map((part) => part.trim());

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  description: profile.summary,
  email: `mailto:${profile.email}`,
  url: siteConfig.url,
  address: {
    "@type": "PostalAddress",
    ...(addressLocality ? { addressLocality } : {}),
    ...(addressCountry ? { addressCountry } : {}),
  },
  ...(education[0]
    ? {
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: education[0].institution,
        },
      }
    : {}),
  sameAs: [profile.github, profile.linkedin].filter(Boolean),
  knowsAbout: skillCategories.flatMap((category) => category.skills),
};

// JSON-LD is embedded in a <script> element; escape `<` so editable copy can
// never terminate the tag early.
const jsonLd = JSON.stringify(personJsonLd).replace(/</g, "\\u003c");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${notoSansEthiopic.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      {/* Browser extensions can add attributes to body before hydration. */}
      <body suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Script id="language-init" strategy="beforeInteractive">
          {languageScript}
        </Script>
        <ContentProvider>
          <LanguageProvider>
            <LocalizedMetadata />
            <Backdrop />
            <ScrollReveal />
            <PointerGlow />
            <a className="skip-link" href="#main">
              <T text="Skip to content" />
            </a>
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
            <BackToTop />
            <EditUnlock />
            <AuthGate />
            <EditorMount />
          </LanguageProvider>
        </ContentProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </body>
    </html>
  );
}
