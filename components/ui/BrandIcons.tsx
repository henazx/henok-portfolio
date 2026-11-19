import type { SVGProps } from "react";

/**
 * Brand marks are not part of Lucide anymore, so they live here as small,
 * dependency-free SVG components that inherit the current text colour.
 */

export function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.1.79-.25.79-.55v-1.94c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

export function ReactIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4.1" />
      <ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(120 12 12)" />
    </svg>
  );
}

export function NextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9.6" opacity="0.7" />
      <path d="M8.2 16.7V7.3l7.5 10.1V7.3" />
      <path d="M15.7 7.3v4.7" opacity="0.55" />
    </svg>
  );
}

export function TypeScriptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect
        x="2.2"
        y="2.2"
        width="19.6"
        height="19.6"
        rx="4"
        fill="currentColor"
        opacity="0.12"
      />
      <rect
        x="2.2"
        y="2.2"
        width="19.6"
        height="19.6"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.75"
      />
      <text
        x="12"
        y="15.6"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="8.6"
        fontWeight="700"
        fill="currentColor"
      >
        TS
      </text>
    </svg>
  );
}

export function NodeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 2.3 20.4 7.2v9.6L12 21.7 3.6 16.8V7.2Z"
        fill="currentColor"
        opacity="0.11"
      />
      <path
        d="M12 2.3 20.4 7.2v9.6L12 21.7 3.6 16.8V7.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.75"
      />
      <text
        x="12"
        y="15.2"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="7.8"
        fontWeight="700"
        fill="currentColor"
      >
        JS
      </text>
    </svg>
  );
}

export function MySqlIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      aria-hidden="true"
      {...props}
    >
      <ellipse cx="12" cy="6" rx="7.4" ry="3" />
      <path d="M4.6 6v12c0 1.7 3.3 3 7.4 3s7.4-1.3 7.4-3V6" />
      <path d="M4.6 12c0 1.7 3.3 3 7.4 3s7.4-1.3 7.4-3" opacity="0.65" />
    </svg>
  );
}

export function FigmaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M9.2 2H12v6.6H9.2a3.3 3.3 0 1 1 0-6.6Z" opacity="0.95" />
      <path d="M14.8 2a3.3 3.3 0 1 1 0 6.6h-2.8V2h2.8Z" opacity="0.75" />
      <path d="M9.2 8.6H12v6.6H9.2a3.3 3.3 0 1 1 0-6.6Z" opacity="0.8" />
      <path d="M14.8 8.6a3.3 3.3 0 1 1 0 6.6h-2.8V8.6h2.8Z" opacity="0.6" />
      <path d="M9.2 15.2H12V18a3.3 3.3 0 1 1-2.8-2.8Z" opacity="0.7" />
    </svg>
  );
}
