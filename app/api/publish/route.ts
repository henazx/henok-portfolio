import { NextResponse } from "next/server";

import { EDIT_KEYWORD } from "@/lib/editor";
import type { SiteContent } from "@/types";

export const runtime = "nodejs";

const token = process.env.GITHUB_TOKEN?.trim();
const repository = process.env.GITHUB_REPO?.trim();
const branch = process.env.GITHUB_BRANCH?.trim() || "main";
const contentPath =
  process.env.GITHUB_CONTENT_PATH?.trim() || "data/content.json";

const githubHeaders = {
  Authorization: `Bearer ${token ?? ""}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

function apiUrl(path: string) {
  return `https://api.github.com/repos/${repository}/contents/${path}`;
}

async function getSha(path: string): Promise<string | undefined> {
  const response = await fetch(`${apiUrl(path)}?ref=${branch}`, {
    headers: githubHeaders,
    cache: "no-store",
  });
  if (response.status === 404) return undefined;
  if (!response.ok) {
    throw new Error(`Could not read ${path} from GitHub (${response.status}).`);
  }
  const data = (await response.json()) as { sha?: string };
  return data.sha;
}

async function putFile(path: string, base64: string, message: string) {
  const sha = await getSha(path);
  const response = await fetch(apiUrl(path), {
    method: "PUT",
    headers: { ...githubHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: base64, sha, branch }),
  });

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as {
      message?: string;
    };
    throw new Error(detail?.message ?? `Could not update ${path}.`);
  }
}

function validateContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SiteContent>;
  return Boolean(
    candidate.profile?.name &&
      candidate.profile?.email &&
      Array.isArray(candidate.projects) &&
      Array.isArray(candidate.skills) &&
      Array.isArray(candidate.experience) &&
      candidate.sections &&
      candidate.site?.description,
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
    content?: unknown;
  } | null;

  if (!body || body.password !== EDIT_KEYWORD) {
    return NextResponse.json({ message: "Incorrect keyword." }, { status: 401 });
  }

  if (!token || !repository || !repository.includes("/")) {
    return NextResponse.json(
      {
        message:
          "Publishing is not configured. Add GITHUB_TOKEN and GITHUB_REPO (owner/repo) to the project environment.",
      },
      { status: 503 },
    );
  }

  if (!validateContent(body.content)) {
    return NextResponse.json(
      { message: "The edited content is missing required fields." },
      { status: 400 },
    );
  }

  if (JSON.stringify(body).length > 12 * 1024 * 1024) {
    return NextResponse.json(
      { message: "Uploaded files must be smaller than 12 MB." },
      { status: 413 },
    );
  }

  const content: SiteContent = JSON.parse(JSON.stringify(body.content));
  const timestamp = new Date().toISOString();
  const portrait = content.profile.portrait.src;
  const imageMatch = portrait.match(
    /^data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)$/,
  );

  try {
    if (imageMatch) {
      const extension = imageMatch[1] === "jpeg" ? "jpg" : imageMatch[1];
      const path = `public/images/profile.${extension}`;
      await putFile(
        path,
        imageMatch[2],
        `Update profile photo — ${timestamp}`,
      );
      content.profile.portrait.src = `/images/profile.${extension}`;
      content.profile.portrait.isPlaceholder = false;
    }

    await putFile(
      contentPath,
      Buffer.from(`${JSON.stringify(content, null, 2)}\n`, "utf8").toString(
        "base64",
      ),
      `Update site content — ${timestamp}`,
    );

    return NextResponse.json({ ok: true, content });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Publishing failed.",
      },
      { status: 502 },
    );
  }
}
