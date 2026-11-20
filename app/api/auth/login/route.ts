import type { NextRequest } from "next/server";

import {
  isPublishingConfigured,
  setSessionCookies,
  verifyPublishingPassword,
} from "@/lib/server/auth";
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

const MAX_BODY_BYTES = 4096;
const LIMIT = 8;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return errorResponse(403, "Invalid request origin.");
  }
  if (!isPublishingConfigured()) {
    return errorResponse(
      503,
      "Publishing is not configured. Set PUBLISH_PASSWORD on the server.",
    );
  }

  const limit = await rateLimit("auth-login", getClientIp(request), {
    limit: LIMIT,
    windowMs: WINDOW_MS,
  });
  if (!limit.allowed) {
    return errorResponse(
      429,
      "Too many attempts. Please wait before trying again.",
      "rate_limited",
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) return errorResponse(body.status, body.message);

  const value = body.value;
  if (!isRecord(value) || Object.keys(value).some((key) => key !== "password")) {
    return errorResponse(400, "Invalid request.");
  }
  const password = value.password;
  if (typeof password !== "string" || password.length > 256) {
    return errorResponse(400, "Invalid request.");
  }
  if (!verifyPublishingPassword(password)) {
    return errorResponse(401, "Incorrect password.");
  }

  const response = jsonResponse({ ok: true });
  if (!setSessionCookies(response)) {
    return errorResponse(503, "Publishing is not configured.");
  }
  return response;
}
