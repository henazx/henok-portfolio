import "server-only";

import { MAX_CONTENT_BYTES } from "./content-schema";

/**
 * Server-only GitHub Contents API client used by the publishing endpoint.
 * Errors never include the token, request headers, or raw GitHub responses.
 */

const API = "https://api.github.com";
const REQUEST_TIMEOUT_MS = 20_000;

export interface GithubConfig {
  token: string;
  repo: string;
  branch: string;
  contentPath: string;
}

export class GithubError extends Error {
  readonly stage: "read" | "image" | "content";

  constructor(stage: "read" | "image" | "content", message: string) {
    super(message);
    this.name = "GithubError";
    this.stage = stage;
  }
}

export function getGithubConfig(): GithubConfig | null {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";
  const contentPath =
    process.env.GITHUB_CONTENT_PATH?.trim() || "data/content.json";

  if (!token || !repo) return null;
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) return null;
  if (!/^[A-Za-z0-9._/-]+$/.test(branch) || branch.includes("..")) return null;
  if (
    !/^[A-Za-z0-9._/-]+$/.test(contentPath) ||
    contentPath.includes("..") ||
    contentPath.startsWith("/")
  ) {
    return null;
  }

  return { token, repo, branch, contentPath };
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function requestErrorMessage(action: "read" | "write", status: number): string {
  if (status === 401 || status === 403) {
    return `GitHub denied ${action} access (${status}). Check GITHUB_TOKEN and its Contents: read and write permission in Vercel.`;
  }
  return `GitHub ${action} failed (${status}).`;
}

function contentsUrl(config: GithubConfig, path: string): string {
  return `${API}/repos/${config.repo}/contents/${encodePath(path)}`;
}

interface RemoteFile {
  sha: string;
  base64: string;
}

async function getFile(
  config: GithubConfig,
  path: string,
): Promise<RemoteFile | null> {
  const response = await fetch(
    `${contentsUrl(config, path)}?ref=${encodeURIComponent(config.branch)}`,
    {
      headers: headers(config.token),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new GithubError("read", requestErrorMessage("read", response.status));
  }

  const data = (await response.json()) as {
    sha?: string;
    content?: string;
    encoding?: string;
  };

  if (!data.sha || typeof data.content !== "string") {
    throw new GithubError("read", "GitHub returned an unexpected response.");
  }

  return { sha: data.sha, base64: data.content.replace(/\s/g, "") };
}

async function putFile(
  config: GithubConfig,
  path: string,
  base64: string,
  message: string,
  stage: "image" | "content",
): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const current = await getFile(config, path);

    const response = await fetch(contentsUrl(config, path), {
      method: "PUT",
      headers: { ...headers(config.token), "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: base64,
        branch: config.branch,
        ...(current ? { sha: current.sha } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.ok) return;

    // The branch moved between reading the SHA and writing. Refreshing the SHA
    // once handles the common case of two publishes arriving close together.
    if ((response.status === 409 || response.status === 422) && attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      continue;
    }

    throw new GithubError(stage, requestErrorMessage("write", response.status));
  }

  throw new GithubError(stage, "GitHub write failed after a retry.");
}

export interface PublishImage {
  path: string;
  base64: string;
}

/**
 * Images are written before content.json. If an image fails, the published
 * content is untouched; if content.json fails afterwards, the site still shows
 * the previous content and the publish can simply be retried.
 */
export async function commitContent(
  config: GithubConfig,
  contentJson: string,
  images: PublishImage[],
): Promise<{ changed: boolean }> {
  if (Buffer.byteLength(contentJson, "utf8") > MAX_CONTENT_BYTES) {
    throw new GithubError("content", "The content file is too large.");
  }

  const timestamp = new Date().toISOString();

  for (const image of images) {
    const current = await getFile(config, image.path);
    if (current && current.base64 === image.base64) continue;

    const name = image.path.split("/").pop() ?? image.path;
    await putFile(
      config,
      image.path,
      image.base64,
      `Update ${name} — ${timestamp}`,
      "image",
    );
  }

  const currentContent = await getFile(config, config.contentPath);
  if (
    currentContent &&
    Buffer.from(currentContent.base64, "base64").toString("utf8") ===
      contentJson
  ) {
    return { changed: false };
  }

  await putFile(
    config,
    config.contentPath,
    Buffer.from(contentJson, "utf8").toString("base64"),
    `Update site content — ${timestamp}`,
    "content",
  );

  return { changed: true };
}
