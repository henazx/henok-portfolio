import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import "@/app/globals.css";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { T } from "@/components/i18n/T";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Backdrop } from "@/components/layout/Backdrop";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { PointerGlow } from "@/components/interaction/PointerGlow";
import { AuthGate } from "@/components/editor/AuthGate";
import { ContentProvider } from "@/components/editor/ContentProvider";
import { EditUnlock } from "@/components/editor/EditUnlock";
import { EditorMount } from "@/components/editor/EditorMount";
import { education } from "@/data/education";
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
 * Runs before paint so the saved theme is applied without a flash. The site is
 * dark-first, so first-time visitors get the dark theme unless they have picked
 * one before.
 */
const themeScript = `(function(){try{var stored=localStorage.getItem("theme");var theme=stored==="light"||stored==="dark"?stored:"dark";document.documentElement.setAttribute("data-theme",theme);}catch(e){}})();`;

/** Applies the saved language before paint so the correct font stack is used. */
const languageScript = `(function(){try{var stored=localStorage.getItem("henok-portfolio-language");var language=stored==="am"?"am":"en";document.documentElement.lang=language;document.documentElement.setAttribute("data-language",language);}catch(e){}})();`;

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
      className={`${geist.variable} ${geistMono.variable}`}
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
            <Backdrop />
            <ScrollReveal />
            <PointerGlow />
            <a className="skip-link" href="#main">
              <T text="Skip to content" />
            </a>
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
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
