import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { T } from "@/components/i18n/T";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="section" style={{ paddingBlock: "clamp(100px, 16vw, 180px)" }}>
      <div className="container">
        <div
          className="glass"
          style={{
            maxWidth: 680,
            padding: "clamp(28px, 5vw, 48px)",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <p className="mono" style={{ marginBottom: 20 }}>
            <T text="Error 404" />
          </p>
          <h1
            style={{
              fontSize: "clamp(2.25rem, 6vw, 3.5rem)",
              marginBottom: 16,
            }}
          >
            <T text="This page doesn't exist." />
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
            <T text="The link may be out of date, or the page may have moved. Head back to the portfolio to keep exploring." />
          </p>
          <Link href="/" className="btn btn-primary">
            <ArrowLeft aria-hidden="true" />
            <T text="Back to the homepage" />
          </Link>
        </div>
      </div>
    </section>
  );
}
