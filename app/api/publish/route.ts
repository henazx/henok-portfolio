import type { NextRequest } from "next/server";

import {
  isAuthenticated,
  isPublishingConfigured,
  verifyCsrf,
} from "@/lib/server/auth";
import {
  MAX_CONTENT_BYTES,
  MAX_INLINE_IMAGE_BYTES,
  MAX_INLINE_IMAGES,
  extractInlineImages,
  safeImageSlug,
  validateContent,
} from "@/lib/server/content-schema";
import {
  GithubError,
  commitContent,
  getGithubConfig,
  type PublishImage,
} from "@/lib/server/github";
import {
  errorResponse,
  getClientIp,
  isRecord,
  isSameOrigin,
  jsonResponse,
  readJsonBody,
} from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Room for content.json plus several inline images (base64 adds ~33%).
const MAX_BODY_BYTES =
  MAX_CONTENT_BYTES +
  MAX_INLINE_IMAGES * Math.ceil((MAX_INLINE_IMAGE_BYTES * 4) / 3);
const LIMIT = 10;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  // --- gates that need no body parsing --------------------------------------
  if (!isSameOrigin(request)) {
    return errorResponse(403, "Invalid request origin.");
  }
  if (!isPublishingConfigured()) {
    return errorResponse(
      503,
      "Publishing is not configured. Set PUBLISH_PASSWORD on the server.",
    );
  }
  if (!isAuthenticated(request)) {
    return errorResponse(401, "Your editing session has expired. Unlock again.");
  }
  if (!verifyCsrf(request)) {
    return errorResponse(403, "Invalid CSRF token.");
  }

  const github = getGithubConfig();
  if (!github) {
    return errorResponse(
      503,
      "Publishing is not configured. Add GITHUB_TOKEN and GITHUB_REPO (owner/repo) to the project environment.",
    );
  }

  const limit = await rateLimit("publish", getClientIp(request), {
    limit: LIMIT,
    windowMs: WINDOW_MS,
  });
  if (!limit.allowed) {
    return errorResponse(
      429,
      "Too many publishing attempts. Please try again later.",
      "rate_limited",
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  // --- request body ----------------------------------------------------------
  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) return errorResponse(body.status, body.message);
  if (!isRecord(body.value) || Object.keys(body.value).some((key) => key !== "content")) {
    return errorResponse(400, "Unexpected properties were submitted.");
  }

  const validity = validateContent(body.value.content);
  if (!validity.ok) {
    const detail = validity.issues
      .slice(0, 3)
      .map((issue) => `${issue.path}: ${issue.message}`)
      .join(" ");
    return errorResponse(400, `Invalid content. ${detail}`);
  }

  const content = validity.content;
  const extracted = extractInlineImages(content);
  if (extracted.issues.length > 0) {
    const detail = extracted.issues
      .slice(0, 3)
      .map((issue) => `${issue.path}: ${issue.message}`)
      .join(" ");
    return errorResponse(400, `Invalid image. ${detail}`);
  }

  // --- rewrite inline image references and stage the uploads -----------------
  const images: PublishImage[] = [];
  const portrait = extracted.images.find((image) => image.kind === "portrait");
  if (portrait) {
    const publicSrc = `/images/profile.${portrait.extension}`;
    content.profile.portrait.src = publicSrc;
    content.profile.portrait.isPlaceholder = false;
    images.push({
      path: `public${publicSrc}`,
      base64: portrait.buffer.toString("base64"),
    });
  }

  for (const image of extracted.images) {
    if (image.kind === "experience") {
      const entry = content.experience[image.index];
      if (!entry?.logo) continue;

      const fileName = `${safeImageSlug(entry.organization, `organization-${image.index + 1}`)}.${image.extension}`;
      const publicSrc = `/experience/${fileName}`;
      entry.logo.src = publicSrc;
      images.push({
        path: `public${publicSrc}`,
        base64: image.buffer.toString("base64"),
      });
      continue;
    }

    if (image.kind !== "project") continue;
    const project = content.projects[image.index];
    if (!project) continue;

    const suffix = image.imageIndex === 0 ? "" : `-${image.imageIndex + 1}`;
    const fileName = `${safeImageSlug(project.slug, `project-${image.index + 1}`)}${suffix}.${image.extension}`;
    const publicSrc = `/projects/${fileName}`;

    if (image.imageIndex === 0) {
      project.image.src = publicSrc;
    } else if (project.images?.[image.imageIndex - 1]) {
      project.images[image.imageIndex - 1].src = publicSrc;
    } else {
      continue;
    }

    images.push({
      path: `public${publicSrc}`,
      base64: image.buffer.toString("base64"),
    });
  }

  const contentJson = `${JSON.stringify(content, null, 2)}\n`;

  // --- publish ---------------------------------------------------------------
  try {
    const result = await commitContent(github, contentJson, images);
    return jsonResponse({ ok: true, content, changed: result.changed });
  } catch (publishError) {
    return errorResponse(
      502,
      publishError instanceof GithubError
        ? publishError.message
        : "Publishing failed. Please try again.",
    );
  }
}
