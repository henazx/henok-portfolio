import type { SocialLink } from "@/types";

/**
 * ---------------------------------------------------------------------------
 * EDIT THIS FILE FIRST
 * ---------------------------------------------------------------------------
 * Every piece of personal information on the site is read from here.
 * The remaining placeholders are marked EDIT ME below and in README.md.
 */
export const profile = {
  name: "Henok Neknikie",
  // Initials shown in the navigation logo and footer badge.
  monogram: "HN",
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

  email: "henokneknikiezx@gmail.com",
  location: "Addis Ababa, Ethiopia",
  availability: "Open to full-time & freelance",
  workPreference: "Remote · Hybrid · On-site",

  github: "https://github.com/henazx",
  // PLACEHOLDER — add your LinkedIn profile URL. The link is hidden while this is empty.
  linkedin: "",

  cv: {
    // EDIT ME — replace public/cv/your-name-cv.pdf with your real CV, then
    // update both values below to match the new file name.
    path: "/cv/your-name-cv.pdf",
    fileName: "Your-Name-CV.pdf",
  },

  portrait: {
    // EDIT ME — add your photograph to public/images/ and point src at it.
    // Set isPlaceholder to false once a real photo is in place.
    src: "/images/portrait-placeholder.svg",
    alt: "Portrait of Henok Neknikie",
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
