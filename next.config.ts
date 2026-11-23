import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * A static CSP is used instead of a per-request nonce so the page can stay
 * statically rendered. `'unsafe-inline'` is required by the theme bootstrap and
 * Next.js's inline hydration data; everything else is locked to this origin.
 * React's development runtime also needs `'unsafe-eval'`, but that is never
 * included in production builds.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const contentSecurityPolicyWithSelfFraming = contentSecurityPolicy.replace(
  "frame-ancestors 'none'",
  "frame-ancestors 'self'",
);

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

// The CV page embeds its PDF in a same-origin iframe. The document itself must
// therefore allow same-origin framing; every HTML route keeps the stricter
// `frame-ancestors 'none'` policy from `securityHeaders`.
const cvDocumentHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: contentSecurityPolicyWithSelfFraming },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep Turbopack scoped to this project when it lives inside a user folder.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/cv/your-name-cv.pdf",
        destination: "/cv/henok-neknikie-cv.pdf",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/cv/henok-neknikie-cv.pdf",
        headers: cvDocumentHeaders,
      },
    ];
  },
};

export default nextConfig;
