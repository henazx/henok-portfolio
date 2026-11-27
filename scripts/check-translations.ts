import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(root, "locales");

type Missing = {
  text: string;
  source: string;
};

const nonTranslatableKeys = new Set([
  "demo",
  "email",
  "fileName",
  "github",
  "height",
  "href",
  "icon",
  "isPlaceholder",
  "link",
  "linkedin",
  "path",
  "repository",
  "slug",
  "src",
  "translations",
  "width",
]);

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function walk(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(full);
  }

  return files;
}

function unescapeLiteral(raw: string): string {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\(['"`\\])/g, "$1");
}

function extractCodeStrings(): { strings: Set<string>; dynamic: string[] } {
  const strings = new Set<string>();
  const dynamic: string[] = [];
  const directories = ["components", "app", "pages"];
  const files = directories.flatMap((dir) => walk(path.join(root, dir)));

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const relative = path.relative(root, file).replaceAll(path.sep, "/");

    // Static literals passed to t("...") / translate("...").
    const call = /\b(?:t|translate)\(\s*(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g;
    for (const match of source.matchAll(call)) {
      const quote = match[1];
      const literal = match[2];
      if (quote === "`" && literal.includes("${")) {
        dynamic.push(`${relative}: translated template literal with an interpolation`);
        continue;
      }
      if (literal.trim()) strings.add(unescapeLiteral(literal));
    }

    // The <T text="..." /> helper is another way to call translate().
    const tComponent = /<T\b[^>]*\btext=(?:\{)?(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g;
    for (const match of source.matchAll(tComponent)) {
      const literal = match[2];
      if (literal.trim()) strings.add(unescapeLiteral(literal));
    }
  }

  return { strings, dynamic };
}

function extractContentStrings(): Missing[] {
  const content = readJson<unknown>(path.join(root, "data", "content.json"));
  const found = new Map<string, Missing>();

  function collect(value: unknown, keyPath: string) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return;

      const segments = keyPath.split(".");
      if (segments.some((segment) => nonTranslatableKeys.has(segment))) return;
      if (/^(https?:|mailto:|\/|#)/.test(trimmed)) return;
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;

      if (!found.has(value)) found.set(value, { text: value, source: keyPath });
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => collect(item, `${keyPath}[${index}]`));
      return;
    }

    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        collect(child, keyPath ? `${keyPath}.${key}` : key);
      }
    }
  }

  collect(content, "");
  return [...found.values()];
}

const amharic = readJson<Record<string, string>>(path.join(localesDir, "am.json"));
const english = readJson<Record<string, string>>(path.join(localesDir, "en.json"));
const { strings: codeStrings, dynamic } = extractCodeStrings();
const contentStrings = extractContentStrings();

const missingAmharic: Missing[] = [];
for (const text of codeStrings) {
  if (!(text in amharic)) missingAmharic.push({ text, source: "t()" });
}
for (const entry of contentStrings) {
  if (!(entry.text in amharic)) missingAmharic.push(entry);
}

const missingEnglish = [...new Set([...codeStrings, ...contentStrings.map((entry) => entry.text)])]
  .filter((text) => !(text in english));

if (dynamic.length) {
  console.error("Interpolated strings are not supported in t():");
  for (const item of dynamic) console.error(`  ${item}`);
}

if (missingAmharic.length) {
  console.error(`Missing from locales/am.json (${missingAmharic.length}):`);
  for (const { text, source } of missingAmharic) {
    console.error(`  [${source}] ${JSON.stringify(text)}`);
  }
}

if (missingEnglish.length) {
  console.error(`Missing from locales/en.json (${missingEnglish.length}):`);
  for (const text of missingEnglish) console.error(`  ${JSON.stringify(text)}`);
}

if (dynamic.length || missingAmharic.length || missingEnglish.length) {
  process.exitCode = 1;
} else {
  console.log(
    `i18n OK: ${codeStrings.size} code strings and ${contentStrings.length} content strings have translations.`,
  );
}
