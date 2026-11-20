import type { NextRequest } from "next/server";

import { clearSessionCookies } from "@/lib/server/auth";
import {
  errorResponse,
  getClientIp,
  isSameOrigin,
  jsonResponse,
} from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return errorResponse(403, "Invalid request origin.");
  }

  const limit = await rateLimit("auth-logout", getClientIp(request), {
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!limit.allowed) {
    return errorResponse(429, "Too many requests.", "rate_limited", {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  const response = jsonResponse({ ok: true });
  clearSessionCookies(response);
  return response;
}
