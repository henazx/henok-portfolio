import type { Project, ProjectCategory } from "@/types";

/**
 * Project content lives here. To add a project, copy an entry, point `image`
 * at a real screenshot in /public/projects/, and fill in the links.
 *
 * `category` must be one of the values below so the filter keeps working.
 */
export const projectCategories: ProjectCategory[] = [
  "Development",
  "IT & Systems",
  "UI/UX Design",
];

export const projects: Project[] = [
  {
    slug: "smartcv",
    name: "SmartCV",
    category: "Development",
    description:
      "A browser-based career toolkit that helps job seekers create professional CVs, evaluate job compatibility, prepare cover letters, and manage their job applications.",
    technologies: ["React", "Next.js", "JavaScript", "UX/UI Design"],
    image: {
      src: "/projects/smartcv.svg",
      alt: "Stylised preview of the SmartCV interface showing a CV builder and compatibility score",
      width: 1200,
      height: 750,
    },
    repository: "https://github.com/henazx/smartcv",
    demo: "https://smartcv-virid.vercel.app/",
  },
  {
    slug: "mesob-connect",
    name: "Mesob Connect",
    category: "IT & Systems",
    description:
      "An internal messaging and document management system designed to improve communication and information sharing within an organization.",
    technologies: ["JavaScript", "React", "Node.js", "Express.js", "MySQL"],
    image: {
      src: "/projects/mesob-connect.svg",
      alt: "Stylised preview of the Mesob Connect messaging and document management interface",
      width: 1200,
      height: 750,
    },
    repository: "https://github.com/henazx/internal-messaging-system",
  },
  {
    slug: "telegram-job-board",
    name: "Telegram Job Board",
    category: "Development",
    description:
      "A project focused on sharing job opportunities through Telegram, helping users discover relevant employment opportunities in one place.",
    technologies: ["JavaScript", "Node.js", "Telegram Bot API"],
    image: {
      src: "/projects/telegram-job-board.svg",
      alt: "Stylised preview of the Telegram Job Board showing a feed of job listings",
      width: 1200,
      height: 750,
    },
    repository: "https://github.com/henazx/telegram-job-board",
  },
  {
    slug: "high-school-counseling",
    name: "High School Counseling Website",
    category: "UI/UX Design",
    description:
      "An academic project developed to give high school students access to academic guidance, emotional support resources, and educational information.",
    technologies: ["UX/UI Design", "Figma", "Wireframing"],
    image: {
      src: "/projects/counseling-website.svg",
      alt: "Stylised preview of the High School Counseling website with guidance and support resources",
      width: 1200,
      height: 750,
    },
    note: "Academic project",
  },
];
