import type { NextRequest } from "next/server";

import { ensureCsrfCookie, isAuthenticated } from "@/lib/server/auth";
import { jsonResponse } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lets the editor restore a server-verified session after a page reload. */
export function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return jsonResponse({ authenticated: false });
  }
  const response = jsonResponse({ authenticated: true });
  ensureCsrfCookie(request, response);
  return response;
}
