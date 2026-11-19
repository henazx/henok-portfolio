import type { SocialLink } from "@/types";

/**
 * ---------------------------------------------------------------------------
 * EDIT THIS FILE FIRST
 * ---------------------------------------------------------------------------
 * Every piece of personal information on the site is read from here.
 * Replace the placeholder values (marked PLACEHOLDER) before deploying.
 */
export const profile = {
  // PLACEHOLDER — replace with your name.
  name: "Your Name",
  // PLACEHOLDER — monogram shown in the logo and footer.
  monogram: "YN",
  role: "Information Technology Specialist",
  positioning: [
    "Computer Science Graduate",
    "Software Developer",
    "UX/UI Designer",
  ],

  // Short line used in the hero.
  summary:
    "I'm a Computer Science graduate with practical experience in IT support, software development, and user-centered design. I build and maintain reliable systems, and I care about the details that make technology feel simple for the people who use it.",

  // Editorial paragraphs used in the About section.
  about: {
    lead: "I work at the intersection of technology and people — keeping systems running, building practical software, and designing interfaces that get out of the way.",
    paragraphs: [
      "I am a Computer Science graduate with practical experience in Information Technology support, troubleshooting, hardware and software maintenance, and software development. My day-to-day work involves helping people resolve technical problems and keeping the systems they depend on available and reliable.",
      "Alongside IT operations, I build web applications using JavaScript, React, Next.js and Node.js. I also have a strong interest in UX/UI design, and I use Figma to turn requirements into clear, usable interfaces — from wireframes through to implementation.",
      "I enjoy solving technical problems, learning new technologies, and developing practical solutions that improve everyday workflows. I care about maintainability, accessibility, and the small details that make a product feel considered.",
    ],
    focus: [
      "IT support and systems",
      "Web application development",
      "UX/UI and product design",
      "Continuous learning",
    ],
  },

  // PLACEHOLDER — replace with an email address you actually monitor.
  email: "your.email@example.com",
  location: "Addis Ababa, Ethiopia",
  availability: "Open to full-time & freelance",
  workPreference: "Remote · Hybrid · On-site",

  github: "https://github.com/henazx",
  // PLACEHOLDER — add your LinkedIn profile URL. The link is hidden while this is empty.
  linkedin: "",

  cv: {
    // Replace the file in public/cv/ and update this path if you rename it.
    path: "/cv/your-name-cv.pdf",
    fileName: "Your-Name-CV.pdf",
  },

  portrait: {
    // Drop your photograph in public/images/ and point this at it.
    src: "/images/portrait-placeholder.svg",
    alt: "Portrait of Your Name",
    isPlaceholder: true,
  },
} as const;

export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: profile.github,
    icon: "github",
  },
  ...(profile.linkedin
    ? [
        {
          label: "LinkedIn",
          href: profile.linkedin,
          icon: "linkedin" as const,
        },
      ]
    : []),
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    icon: "mail",
  },
];
