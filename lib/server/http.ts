import "server-only";

import { NextResponse } from "next/server";

export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
} as const;

export function jsonResponse(
  body: unknown,
  status = 200,
  headers?: Record<string, string>,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { ...NO_STORE_HEADERS, ...headers },
  });
}

export function errorResponse(
  status: number,
  message: string,
  code?: string,
  headers?: Record<string, string>,
): NextResponse {
  return jsonResponse({ ok: false, code, message }, status, headers);
}

export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; status: number; message: string };

function concatenate(chunks: Uint8Array[], total: number): Uint8Array {
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

/**
 * Reads a JSON request body without ever buffering more than `maxBytes`.
 * Checking Content-Length first avoids reading oversized payloads at all,
 * and the streaming guard still protects against lying or chunked requests.
 */
export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<JsonBodyResult> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      status: 415,
      message: "Expected a JSON request body.",
    };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, status: 413, message: "Request body is too large." };
  }

  if (!request.body) {
    return { ok: false, status: 400, message: "Request body is missing." };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 413, message: "Request body is too large." };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, message: "Could not read the request body." };
  }

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(
      concatenate(chunks, total),
    );
  } catch {
    return {
      ok: false,
      status: 400,
      message: "Request body is not valid UTF-8.",
    };
  }

  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      status: 400,
      message: "Request body is not valid JSON.",
    };
  }
}

export function getClientIp(request: Request): string {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "";

  return forwarded.split(",")[0]?.trim() || "unknown";
}

/**
 * Defense in depth on top of the session cookie and CSRF token. Browsers send
 * Origin on cross-origin POSTs, so a mismatch is rejected outright.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  if (origin === "null") return false;

  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host =
    forwardedHost?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    requestUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    requestUrl.protocol.replace(":", "");

  return origin === `${proto}://${host}`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
