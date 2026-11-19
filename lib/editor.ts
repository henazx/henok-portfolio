/** Shared constants for the keyword-gated visual editor. */
export const EDIT_KEYWORD = "Henok";
export const DRAFT_KEY = "henok-portfolio-draft";
export const UNLOCK_KEY = "henok-portfolio-unlocked";
export const UNLOCK_EVENT = "henok:unlock";

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
    if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
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
