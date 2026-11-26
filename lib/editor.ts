import type { SiteContent } from "@/types";

/**
 * Shared constants for the visual editor.
 *
 * EDIT_KEYWORD is a harmless UI activation gesture only. It is shipped to the
 * browser on purpose and is NOT an authentication credential. Publishing is
 * authorized exclusively by the server-issued session cookie (see
 * `lib/server/auth.ts`) and the server-only PUBLISH_PASSWORD.
 */
export const EDIT_KEYWORD = "Henok";
export const DRAFT_KEY = "henok-portfolio-draft";
export const UNLOCK_EVENT = "henok:unlock";

/**
 * Client-side guard rails for image uploads. These mirror the limits enforced
 * by the publishing endpoint; the server remains the source of truth.
 */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;
export const ACCEPTED_IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(",");

/** Shared ceiling for long case-study list entries (decisions/challenges). */
export const MAX_LIST_TEXT = 12000;

export type ImageReadResult =
  | { ok: true; dataUrl: string }
  | { ok: false; message: string };

/**
 * Reads an image file into a data URL after checking its type and size. The
 * server still verifies the binary signature, so a renamed file cannot slip
 * through by claiming an allowed MIME type here.
 */
export function readImageFile(file: File): Promise<ImageReadResult> {
  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return Promise.resolve({
      ok: false,
      message: "Choose a PNG, JPEG, WebP, GIF, or AVIF image.",
    });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return Promise.resolve({
      ok: false,
      message: "Images must be 2 MB or smaller.",
    });
  }

  if (file.size === 0) {
    return Promise.resolve({ ok: false, message: "That file is empty." });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () =>
      resolve({ ok: false, message: "The image could not be read." });
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        resolve({ ok: false, message: "The image could not be read." });
        return;
      }
      resolve({ ok: true, dataUrl: result });
    };
    reader.readAsDataURL(file);
  });
}


export function getByPath(source: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      source,
    );
}

export function setByPath<T>(source: T, path: string, value: unknown): T {
  const next = JSON.parse(JSON.stringify(source)) as Record<string, unknown>;
  const keys = path.split(".");
  let cursor = next;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    const existing = cursor[key];
    // Preserve existing arrays and objects. Only create a container when the
    // path genuinely does not exist yet — recreating an array here would wipe
    // every other item in that list.
    if (!existing || typeof existing !== "object") {
      cursor[key] = /^\d+$/.test(keys[index + 1]) ? [] : {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  });

  return next as T;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(override)) return base;
  const result = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;

  for (const [key, value] of Object.entries(override)) {
    const current = result[key];
    result[key] =
      isPlainObject(value) && isPlainObject(current)
        ? deepMerge(current, value)
        : value;
  }

  return result as T;
}

/** Turns any human-entered project title or slug into a valid URL slug. */
export function normalizeSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/**
 * Normalizes only the fields where a human typo would otherwise block a whole
 * publish. Content is preserved; project slugs become valid and unique.
 */
export function normalizePublishContent(value: unknown): unknown {
  if (!isPlainObject(value) || !Array.isArray(value.projects)) return value;

  const used = new Set<string>();
  const projects = value.projects.map((project, index) => {
    if (!isPlainObject(project)) return project;

    const source = typeof project.slug === "string" ? project.slug : "";
    const base = normalizeSlug(source) || `project-${index + 1}`;
    let slug = base;
    let suffix = 2;

    while (used.has(slug)) {
      const tail = `-${suffix}`;
      slug = `${base.slice(0, 60 - tail.length)}${tail}`;
      suffix += 1;
    }

    used.add(slug);
    return { ...project, slug };
  });

  return { ...value, projects };
}

/**
 * User-facing strings an editor might add. URLs, slugs, dates, brand names and
 * image sources are intentionally excluded; those should stay as written.
 */
export function collectTranslatableStrings(content: SiteContent): string[] {
  const values = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value !== "string") return;
    const text = value.trim();
    if (text) values.add(text);
  };
  const addList = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(add);
  };

  add(content.site?.description);
  Object.values(content.sections ?? {}).forEach((section) => {
    add(section?.title);
    add(section?.description);
  });

  const profile = content.profile;
  add(profile?.role);
  add(profile?.headline);
  add(profile?.currentFocus);
  addList(profile?.positioning);
  add(profile?.summary);
  add(profile?.about?.lead);
  addList(profile?.about?.paragraphs);
  addList(profile?.about?.focus);
  add(profile?.availability);
  add(profile?.workPreference);
  add(profile?.location);

  content.experience?.forEach((entry) => {
    add(entry.role);
    add(entry.summary);
    addList(entry.highlights);
    addList(entry.impact);
  });

  content.projects?.forEach((project) => {
    add(project.name);
    add(project.description);
    add(project.note);
    add(project.image?.alt);
    project.images?.forEach((image) => add(image.alt));

    const study = project.caseStudy;
    if (!study) return;
    add(study.role);
    add(study.overview);
    add(study.problem);
    add(study.solution);
    add(study.approach);
    addList(study.features);
    addList(study.decisions);
    addList(study.challenges);
    add(study.outcome);
    add(study.learnings);
    study.architecture?.forEach((layer) => {
      add(layer.title);
      add(layer.subtitle);
      layer.nodes?.forEach((node) => {
        add(node.title);
        add(node.description);
      });
    });
  });

  content.skills?.forEach((category) => {
    add(category.title);
    add(category.description);
    addList(category.skills);
    add(category.evidenceLabel);
  });

  content.education?.forEach((entry) => {
    add(entry.qualification);
    add(entry.institution);
    add(entry.detail);
  });

  content.certifications?.forEach((entry) => {
    add(entry.name);
    add(entry.issuer);
    add(entry.note);
  });

  return Array.from(values).sort((a, b) => a.localeCompare(b));
}
