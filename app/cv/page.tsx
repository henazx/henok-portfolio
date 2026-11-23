import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, FileText } from "lucide-react";

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
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/#home">
            <ArrowLeft aria-hidden="true" />
            Back to portfolio
          </Link>
        </nav>

        <header className={styles.header}>
          <div>
            <p className="mono">Document</p>
            <h1>CV / Résumé</h1>
            <p className={styles.intro}>
              A current copy of {profile.name}&apos;s CV is embedded below. Use
              the download button if you would like to keep a local copy.
            </p>
          </div>

          <div className={styles.actions}>
            <a
              className="btn btn-primary"
              href={pdfUrl}
              download={fileName}
              aria-label={`Download CV — ${fileName}`}
            >
              <Download aria-hidden="true" />
              Download CV
            </a>
            <a
              className="btn btn-secondary"
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open in new tab — ${fileName}`}
            >
              <ExternalLink aria-hidden="true" />
              Open in new tab
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
            <span className={styles.hint}>Scroll inside the frame to read</span>
          </div>

          <h2 id="cv-viewer-title" className="sr-only">
            Embedded CV document
          </h2>
          <iframe
            className={styles.frame}
            src={pdfUrl}
            title={`${profile.name} CV document`}
          />

          <p className={styles.fallback}>
            If the document does not load,{" "}
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              open the CV in a new tab
            </a>
            .
          </p>
        </section>

        <footer className={styles.footer}>
          <p>
            Prefer to talk first?{" "}
            <Link href="/#contact">Use the contact form</Link> and I will reply
            directly.
          </p>
          <p className="mono">{siteConfig.url}</p>
        </footer>
      </div>
    </div>
  );
}
