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
