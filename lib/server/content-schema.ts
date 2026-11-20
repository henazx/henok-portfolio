import "server-only";

import type { SiteContent } from "@/types";

/**
 * Strict, dependency-free validation for everything the editor can publish.
 * Unknown properties are rejected rather than silently stored, so the public
 * content file always matches the SiteContent contract.
 */

export interface ValidationIssue {
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; content: SiteContent }
  | { ok: false; issues: ValidationIssue[] };

const SECTION_KEYS = [
  "about",
  "experience",
  "projects",
  "skills",
  "credentials",
  "contact",
] as const;

const NAV_HREFS =
  /^#(home|about|experience|projects|skills|credentials|contact)$/;

const PROJECT_CATEGORIES = ["Development", "IT & Systems", "UI/UX Design"];
const SKILL_ICONS = [
  "frontend",
  "backend",
  "database",
  "support",
  "design",
  "tools",
];

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATA_IMAGE_PATTERN =
  /^data:image\/(png|jpe?g|webp|gif|avif);base64,([A-Za-z0-9+/]+={0,2})$/;

export const MAX_CONTENT_BYTES = 512 * 1024;
export const MAX_INLINE_IMAGE_BYTES = 2 * 1024 * 1024;
// Keeps a single request within the endpoint's body limit (content + images).
export const MAX_INLINE_IMAGES = 6;
// Primary preview plus up to three additional screenshots per project.
export const MAX_PROJECT_GALLERY_IMAGES = 3;

interface StringOptions {
  min?: number;
  max?: number;
  optional?: boolean;
  allowEmpty?: boolean;
  pattern?: RegExp;
  patternMessage?: string;
}

class Validator {
  readonly issues: ValidationIssue[] = [];

  fail(path: string, message: string): void {
    if (this.issues.length < 50) this.issues.push({ path, message });
  }

  isRecord(value: unknown, path: string): value is Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      this.fail(path, "Must be an object.");
      return false;
    }
    return true;
  }

  object(
    value: unknown,
    path: string,
    shape: Record<string, (value: unknown, path: string) => void>,
  ): void {
    if (!this.isRecord(value, path)) return;

    for (const key of Object.keys(value)) {
      if (!Object.prototype.hasOwnProperty.call(shape, key)) {
        this.fail(`${path}.${key}`, "Unexpected property.");
      }
    }

    for (const [key, check] of Object.entries(shape)) {
      check(value[key], `${path}.${key}`);
    }
  }

  string(
    value: unknown,
    path: string,
    options: StringOptions = {},
  ): string | undefined {
    if (value === undefined || value === null) {
      if (!options.optional) this.fail(path, "Required.");
      return undefined;
    }

    if (typeof value !== "string") {
      this.fail(path, "Must be text.");
      return undefined;
    }

    if (CONTROL_CHARS.test(value)) {
      this.fail(path, "Contains unsupported control characters.");
      return undefined;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      if (!options.optional && !options.allowEmpty) {
        this.fail(path, "Required.");
      }
      return trimmed;
    }

    if (trimmed.length < (options.min ?? 0)) {
      this.fail(path, `Must be at least ${options.min} characters.`);
      return undefined;
    }

    if (trimmed.length > (options.max ?? 2000)) {
      this.fail(path, `Must be ${options.max} characters or fewer.`);
      return undefined;
    }

    if (options.pattern && !options.pattern.test(trimmed)) {
      this.fail(path, options.patternMessage ?? "Invalid format.");
      return undefined;
    }

    return trimmed;
  }

  integer(value: unknown, path: string, min: number, max: number): void {
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < min ||
      value > max
    ) {
      this.fail(path, `Must be a whole number between ${min} and ${max}.`);
    }
  }

  boolean(value: unknown, path: string): void {
    if (typeof value !== "boolean") this.fail(path, "Must be true or false.");
  }

  array(
    value: unknown,
    path: string,
    max: number,
    item: (value: unknown, path: string) => void,
  ): void {
    if (!Array.isArray(value)) {
      this.fail(path, "Must be a list.");
      return;
    }
    if (value.length > max) {
      this.fail(path, `Must contain ${max} items or fewer.`);
      return;
    }
    value.forEach((entry, index) => item(entry, `${path}[${index}]`));
  }
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      url.hostname.length > 0
    );
  } catch {
    return false;
  }
}

function isSafeAssetPath(value: string, extension?: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (value.includes("..") || value.includes("\\")) return false;
  if (!/^\/[A-Za-z0-9._\-/]+$/.test(value)) return false;
  if (extension && !value.toLowerCase().endsWith(extension)) return false;
  return true;
}

function urlField(
  validator: Validator,
  value: unknown,
  path: string,
  optional: boolean,
): void {
  const text = validator.string(value, path, {
    optional,
    allowEmpty: optional,
    max: 300,
  });
  if (text && !isHttpsUrl(text)) {
    validator.fail(path, "Must be a full https:// link.");
  }
}

function emailField(validator: Validator, value: unknown, path: string): void {
  const text = validator.string(value, path, {
    min: 3,
    max: 254,
    pattern: EMAIL_PATTERN,
    patternMessage: "Must be a valid email address.",
  });
  if (text && text !== text.trim()) {
    validator.fail(path, "Must not contain surrounding whitespace.");
  }
}

function assetField(
  validator: Validator,
  value: unknown,
  path: string,
  options: { extension?: string; allowDataImage?: boolean } = {},
): void {
  const text = validator.string(value, path, {
    min: 1,
    max: options.allowDataImage ? 4_000_000 : 300,
  });
  if (!text) return;

  if (isSafeAssetPath(text, options.extension)) return;

  if (options.allowDataImage && DATA_IMAGE_PATTERN.test(text)) return;

  validator.fail(
    path,
    options.allowDataImage
      ? "Must be a site image path or a PNG, JPEG, WebP, GIF, or AVIF upload."
      : "Must be a safe path inside the site.",
  );
}

function projectImageField(
  validator: Validator,
  value: unknown,
  path: string,
): void {
  validator.object(value, path, {
    src: (entry, entryPath) =>
      assetField(validator, entry, entryPath, { allowDataImage: true }),
    alt: (entry, entryPath) => validator.string(entry, entryPath, { max: 300 }),
    width: (entry, entryPath) => validator.integer(entry, entryPath, 1, 6000),
    height: (entry, entryPath) => validator.integer(entry, entryPath, 1, 6000),
  });
}

export function validateContent(value: unknown): ValidationResult {
  const v = new Validator();

  if (!v.isRecord(value, "content")) {
    return { ok: false, issues: v.issues };
  }

  const slugs = new Set<string>();

  v.object(value, "content", {
    site: (site, path) =>
      v.object(site, path, {
        description: (entry, entryPath) =>
          v.string(entry, entryPath, { min: 1, max: 600 }),
        navigation: (entries, entriesPath) =>
          v.array(entries, entriesPath, 12, (item, itemPath) =>
            v.object(item, itemPath, {
              label: (label, labelPath) =>
                v.string(label, labelPath, { min: 1, max: 40 }),
              href: (href, hrefPath) =>
                v.string(href, hrefPath, {
                  min: 1,
                  max: 32,
                  pattern: NAV_HREFS,
                  patternMessage: "Must point to a section on this page.",
                }),
            }),
          ),
      }),

    sections: (sections, path) =>
      v.object(
        sections,
        path,
        Object.fromEntries(
          SECTION_KEYS.map((key) => [
            key,
            (section: unknown, sectionPath: string) =>
              v.object(section, sectionPath, {
                title: (entry, entryPath) =>
                  v.string(entry, entryPath, { min: 1, max: 200 }),
                description: (entry, entryPath) =>
                  v.string(entry, entryPath, { min: 1, max: 600 }),
              }),
          ]),
        ),
      ),

    profile: (profile, path) =>
      v.object(profile, path, {
        name: (entry, entryPath) =>
          v.string(entry, entryPath, { min: 1, max: 80 }),
        monogram: (entry, entryPath) =>
          v.string(entry, entryPath, { min: 1, max: 4 }),
        role: (entry, entryPath) =>
          v.string(entry, entryPath, { min: 1, max: 120 }),
        positioning: (entries, entriesPath) =>
          v.array(entries, entriesPath, 6, (item, itemPath) =>
            v.string(item, itemPath, { min: 1, max: 80 }),
          ),
        summary: (entry, entryPath) =>
          v.string(entry, entryPath, { min: 1, max: 1200 }),
        about: (about, aboutPath) =>
          v.object(about, aboutPath, {
            lead: (entry, entryPath) =>
              v.string(entry, entryPath, { min: 1, max: 600 }),
            paragraphs: (entries, entriesPath) =>
              v.array(entries, entriesPath, 12, (item, itemPath) =>
                v.string(item, itemPath, { min: 1, max: 2500 }),
              ),
            focus: (entries, entriesPath) =>
              v.array(entries, entriesPath, 12, (item, itemPath) =>
                v.string(item, itemPath, { min: 1, max: 100 }),
              ),
          }),
        email: (entry, entryPath) => emailField(v, entry, entryPath),
        location: (entry, entryPath) =>
          v.string(entry, entryPath, { optional: true, allowEmpty: true, max: 120 }),
        availability: (entry, entryPath) =>
          v.string(entry, entryPath, { optional: true, allowEmpty: true, max: 120 }),
        workPreference: (entry, entryPath) =>
          v.string(entry, entryPath, { optional: true, allowEmpty: true, max: 120 }),
        github: (entry, entryPath) => urlField(v, entry, entryPath, false),
        linkedin: (entry, entryPath) => urlField(v, entry, entryPath, true),
        cv: (cv, cvPath) =>
          v.object(cv, cvPath, {
            path: (entry, entryPath) =>
              assetField(v, entry, entryPath, { extension: ".pdf" }),
            fileName: (entry, entryPath) =>
              v.string(entry, entryPath, {
                optional: true,
                allowEmpty: true,
                max: 120,
                pattern: /^[^/\\]+$/,
                patternMessage: "Must be a file name, not a path.",
              }),
          }),
        portrait: (portrait, portraitPath) =>
          v.object(portrait, portraitPath, {
            src: (entry, entryPath) =>
              assetField(v, entry, entryPath, { allowDataImage: true }),
            alt: (entry, entryPath) =>
              v.string(entry, entryPath, { max: 240 }),
            isPlaceholder: (entry, entryPath) =>
              v.boolean(entry, entryPath),
          }),
      }),

    experience: (entries, path) =>
      v.array(entries, path, 20, (item, itemPath) =>
        v.object(item, itemPath, {
          role: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 140 }),
          organization: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 140 }),
          location: (entry, entryPath) =>
            v.string(entry, entryPath, { optional: true, allowEmpty: true, max: 140 }),
          period: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 100 }),
          summary: (entry, entryPath) =>
            v.string(entry, entryPath, { optional: true, allowEmpty: true, max: 1500 }),
          highlights: (list, listPath) =>
            v.array(list, listPath, 16, (entry, entryPath) =>
              v.string(entry, entryPath, { min: 1, max: 600 }),
            ),
          current: (entry, entryPath) => {
            if (entry !== undefined) v.boolean(entry, entryPath);
          },
        }),
      ),

    projects: (entries, path) =>
      v.array(entries, path, 24, (item, itemPath) => {
        if (v.isRecord(item, itemPath) && typeof item.slug === "string") {
          const slug = item.slug.trim();
          if (slugs.has(slug)) {
            v.fail(`${itemPath}.slug`, "Project slugs must be unique.");
          }
          slugs.add(slug);
        }

        v.object(item, itemPath, {
          slug: (entry, entryPath) =>
            v.string(entry, entryPath, {
              min: 1,
              max: 60,
              pattern: SLUG_PATTERN,
              patternMessage:
                "Use lowercase letters, numbers, and single hyphens.",
            }),
          name: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 120 }),
          category: (entry, entryPath) => {
            if (
              typeof entry !== "string" ||
              !PROJECT_CATEGORIES.includes(entry)
            ) {
              v.fail(entryPath, "Must be a supported project category.");
            }
          },
          description: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 1500 }),
          technologies: (list, listPath) =>
            v.array(list, listPath, 20, (entry, entryPath) =>
              v.string(entry, entryPath, { min: 1, max: 60 }),
            ),
          image: (image, imagePath) =>
            projectImageField(v, image, imagePath),
          images: (entries, entriesPath) => {
            if (entries === undefined || entries === null) return;
            v.array(
              entries,
              entriesPath,
              MAX_PROJECT_GALLERY_IMAGES,
              (item, itemPath) => projectImageField(v, item, itemPath),
            );
          },
          repository: (entry, entryPath) =>
            urlField(v, entry, entryPath, true),
          demo: (entry, entryPath) => urlField(v, entry, entryPath, true),
          note: (entry, entryPath) =>
            v.string(entry, entryPath, { optional: true, allowEmpty: true, max: 200 }),
        });
      }),

    skills: (entries, path) =>
      v.array(entries, path, 12, (item, itemPath) =>
        v.object(item, itemPath, {
          title: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 120 }),
          description: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 400 }),
          icon: (entry, entryPath) => {
            if (typeof entry !== "string" || !SKILL_ICONS.includes(entry)) {
              v.fail(entryPath, "Must be a supported skill icon.");
            }
          },
          skills: (list, listPath) =>
            v.array(list, listPath, 20, (entry, entryPath) =>
              v.string(entry, entryPath, { min: 1, max: 80 }),
            ),
        }),
      ),

    education: (entries, path) =>
      v.array(entries, path, 12, (item, itemPath) =>
        v.object(item, itemPath, {
          qualification: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 160 }),
          institution: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 160 }),
          period: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 100 }),
          detail: (entry, entryPath) =>
            v.string(entry, entryPath, { optional: true, allowEmpty: true, max: 800 }),
        }),
      ),

    certifications: (entries, path) =>
      v.array(entries, path, 24, (item, itemPath) =>
        v.object(item, itemPath, {
          name: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 160 }),
          issuer: (entry, entryPath) =>
            v.string(entry, entryPath, { min: 1, max: 160 }),
          note: (entry, entryPath) =>
            v.string(entry, entryPath, { optional: true, allowEmpty: true, max: 800 }),
          link: (entry, entryPath) => urlField(v, entry, entryPath, true),
        }),
      ),
  });

  if (v.issues.length > 0) {
    return { ok: false, issues: v.issues };
  }

  return { ok: true, content: value as unknown as SiteContent };
}

export interface InlineImage {
  kind: "portrait" | "project";
  index: number;
  imageIndex: number;
  extension: string;
  buffer: Buffer;
}

function detectImageExtension(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  const header = buffer.toString("ascii", 0, 6);
  if (header === "GIF87a" || header === "GIF89a") return "gif";

  if (buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") return "avif";
  }

  return null;
}

/**
 * Extracts base64 image payloads and verifies their real file signature, not
 * just the MIME type claimed in the data URL.
 */
export function extractInlineImages(content: SiteContent): {
  images: InlineImage[];
  issues: ValidationIssue[];
} {
  const images: InlineImage[] = [];
  const issues: ValidationIssue[] = [];

  const collect = (
    src: string,
    kind: InlineImage["kind"],
    index: number,
    imageIndex: number,
    path: string,
  ) => {
    const match = src.match(DATA_IMAGE_PATTERN);
    if (!match) return;

    if (images.length >= MAX_INLINE_IMAGES) {
      issues.push({
        path,
        message: `Publish at most ${MAX_INLINE_IMAGES} uploaded images at a time.`,
      });
      return;
    }

    const declared = match[1] === "jpeg" ? "jpg" : match[1];
    const base64 = match[2];

    if (base64.length % 4 !== 0) {
      issues.push({ path, message: "The uploaded image is not valid base64." });
      return;
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64, "base64");
    } catch {
      issues.push({ path, message: "The uploaded image could not be decoded." });
      return;
    }

    if (buffer.length === 0) {
      issues.push({ path, message: "The uploaded image is empty." });
      return;
    }

    if (buffer.length > MAX_INLINE_IMAGE_BYTES) {
      issues.push({
        path,
        message: "Uploaded images must be 2 MB or smaller.",
      });
      return;
    }

    const detected = detectImageExtension(buffer);
    if (!detected) {
      issues.push({
        path,
        message: "The uploaded file is not a supported image.",
      });
      return;
    }

    if (detected !== declared) {
      issues.push({
        path,
        message: "The uploaded image does not match its declared file type.",
      });
      return;
    }

    images.push({ kind, index, imageIndex, extension: detected, buffer });
  };

  collect(
    content.profile.portrait.src,
    "portrait",
    0,
    0,
    "profile.portrait.src",
  );

  content.projects.forEach((project, index) => {
    collect(
      project.image.src,
      "project",
      index,
      0,
      `projects[${index}].image.src`,
    );
    project.images?.forEach((image, imageIndex) => {
      collect(
        image.src,
        "project",
        index,
        imageIndex + 1,
        `projects[${index}].images[${imageIndex}].src`,
      );
    });
  });

  return { images, issues };
}

export function safeImageSlug(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || fallback;
}
