import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, FileText } from "lucide-react";

import { T } from "@/components/i18n/T";
import { profile } from "@/data/profile";
import { siteConfig } from "@/data/site";
import styles from "./cv.module.css";

const canonicalPath = "/cv";

export const metadata: Metadata = {
  title: "CV / Résumé",
  description: `View or download ${profile.name}'s CV.`,
  alternates: { canonical: canonicalPath },
  openGraph: {
    type: "article",
    url: canonicalPath,
    title: `CV — ${profile.name}`,
    description: `View or download ${profile.name}'s CV.`,
    siteName: `${profile.name} — Portfolio`,
  },
  twitter: {
    card: "summary",
    title: `CV — ${profile.name}`,
    description: `View or download ${profile.name}'s CV.`,
  },
};

export default function CvPage() {
  const pdfUrl = profile.cv.path;
  const fileName = profile.cv.fileName || "CV.pdf";

  return (
    <div className={styles.page}>
      <div className="container">
        <nav className={styles.breadcrumb} aria-label={undefined}>
          <Link href="/#home">
            <ArrowLeft aria-hidden="true" />
            <T text="Back to portfolio" />
          </Link>
        </nav>

        <header className={styles.header}>
          <div>
            <p className="mono">
              <T text="Document" />
            </p>
            <h1>
              <T text="CV / Résumé" />
            </h1>
            <p className={styles.intro}>
              <T text="A current copy of " />
              {profile.name}
              <T text="'s CV is embedded below. Use the download button if you would like to keep a local copy." />
            </p>
          </div>

          <div className={styles.actions}>
            <a
              className="btn btn-primary"
              href={pdfUrl}
              download={fileName}
            >
              <Download aria-hidden="true" />
              <T text="Download CV" />
            </a>
            <a
              className="btn btn-secondary"
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink aria-hidden="true" />
              <T text="Open in new tab" />
            </a>
          </div>
        </header>

        <section
          className={styles.viewer}
          aria-labelledby="cv-viewer-title"
        >
          <div className={styles.viewerBar}>
            <span className={styles.file}>
              <FileText aria-hidden="true" />
              {fileName}
            </span>
            <span className={styles.hint}>
              <T text="Scroll inside the frame to read" />
            </span>
          </div>

          <h2 id="cv-viewer-title" className="sr-only">
            <T text="Embedded CV document" />
          </h2>
          <iframe
            className={styles.frame}
            src={pdfUrl}
            title={`${profile.name} — CV / Résumé`}
          />

          <p className={styles.fallback}>
            <T text="If the document does not load, " />
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <T text="open the CV in a new tab" />
            </a>
            .
          </p>
        </section>

        <footer className={styles.footer}>
          <p>
            <T text="Prefer to talk first? " />
            <Link href="/#contact">
              <T text="Use the contact form" />
            </Link>
            <T text=" and I will reply directly." />
          </p>
          <p className="mono">{siteConfig.url}</p>
        </footer>
      </div>
    </div>
  );
}
