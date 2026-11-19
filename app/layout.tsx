import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import "@/app/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Backdrop } from "@/components/layout/Backdrop";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { PointerGlow } from "@/components/interaction/PointerGlow";
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
    addressLocality: "Addis Ababa",
    addressCountry: "ET",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Kotebe University of Education",
  },
  sameAs: [profile.github, profile.linkedin].filter(Boolean),
  knowsAbout: skillCategories.flatMap((category) => category.skills),
};

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
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Backdrop />
        <ScrollReveal />
        <PointerGlow />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
