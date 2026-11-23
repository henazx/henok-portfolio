import { NextResponse } from "next/server";

/**
 * Public, read-only GitHub proxy. No token is used or exposed; responses are
 * cached for an hour so the unauthenticated API limit is not burned on every
 * page view.
 */
export const runtime = "nodejs";
export const revalidate = 3600;

const USERNAME = "henazx";
const API_URL = `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=4`;
const TIMEOUT_MS = 10_000;
const CACHE_HEADER = "public, s-maxage=3600, stale-while-revalidate=86400";

interface PublicRepository {
  id: number;
  name: string;
  description: string | null;
  href: string;
  language: string | null;
  updatedAt: string;
  stars: number;
  fork: boolean;
}

function asRepository(value: unknown): PublicRepository | null {
  if (!value || typeof value !== "object") return null;
  const repo = value as Record<string, unknown>;
  if (
    typeof repo.id !== "number" ||
    typeof repo.name !== "string" ||
    typeof repo.html_url !== "string" ||
    typeof repo.updated_at !== "string" ||
    repo.private === true
  ) {
    return null;
  }

  return {
    id: repo.id,
    name: repo.name,
    description:
      typeof repo.description === "string" ? repo.description : null,
    href: repo.html_url,
    language: typeof repo.language === "string" ? repo.language : null,
    updatedAt: repo.updated_at,
    stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
    fork: repo.fork === true,
  };
}

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "force-cache",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`GitHub responded with ${response.status}.`);
    }

    const payload: unknown = await response.json();
    const repositories = Array.isArray(payload)
      ? payload
          .map(asRepository)
          .filter((repo): repo is PublicRepository => repo !== null)
          .slice(0, 3)
      : [];

    return NextResponse.json(
      { ok: true, repositories },
      { headers: { "Cache-Control": CACHE_HEADER } },
    );
  } catch (error) {
    console.error(
      "Public GitHub request failed",
      error instanceof Error ? error.message : "unknown error",
    );

    // A blocked network or rate limit must never break the portfolio page.
    return NextResponse.json(
      { ok: false, repositories: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
