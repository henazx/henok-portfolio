import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Server-only publishing authentication.
 *
 * The editor keyword in `lib/editor.ts` is a convenience gate for the UI only.
 * Everything that can change the deployed site is authorised here, using a
 * password that never reaches the browser bundle.
 */

export const SESSION_COOKIE = "pf_session";
export const CSRF_COOKIE = "pf_csrf";
export const SESSION_TTL_SECONDS = 60 * 60 * 2;

const isProduction = process.env.NODE_ENV === "production";

interface SessionPayload {
  v: 1;
  iat: number;
  exp: number;
  fp: string;
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/**
 * The session key is derived from PUBLISH_PASSWORD so that rotating the
 * password immediately invalidates every existing session. A dedicated
 * PUBLISH_SESSION_SECRET is supported for deployments that want the signing
 * key to be independent of the password.
 */
function sessionKey(): string | null {
  const password = process.env.PUBLISH_PASSWORD?.trim();
  if (!password) return null;
  return (
    process.env.PUBLISH_SESSION_SECRET?.trim() ||
    `portfolio-publish-session:${password}`
  );
}

function fingerprint(key: string): string {
  return sha256(`fingerprint:${key}`).subarray(0, 8).toString("hex");
}

function sign(value: string, key: string): string {
  return createHmac("sha256", key).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = sha256(a);
  const right = sha256(b);
  return timingSafeEqual(left, right);
}

export function isPublishingConfigured(): boolean {
  return Boolean(process.env.PUBLISH_PASSWORD?.trim());
}

export function verifyPublishingPassword(input: string): boolean {
  const password = process.env.PUBLISH_PASSWORD?.trim();
  if (!password) return false;
  return safeEqual(input, password);
}

export function createSessionToken(): string | null {
  const key = sessionKey();
  if (!key) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    v: 1,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    fp: fingerprint(key),
  };

  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${body}.${sign(body, key)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const key = sessionKey();
  if (!key) return false;

  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  const expected = sign(body, key);
  if (!safeEqual(signature, expected)) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    return (
      payload.v === 1 &&
      typeof payload.exp === "number" &&
      payload.exp > Math.floor(Date.now() / 1000) &&
      payload.fp === fingerprint(key)
    );
  } catch {
    return false;
  }
}

export function isAuthenticated(request: NextRequest): boolean {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

/**
 * Double-submit CSRF check. The token cookie is readable by same-origin
 * JavaScript, while the session cookie stays HttpOnly. SameSite=Strict on both
 * cookies means cross-site requests never carry either value.
 */
export function verifyCsrf(request: NextRequest): boolean {
  const cookie = request.cookies.get(CSRF_COOKIE)?.value;
  const header = request.headers.get("x-csrf-token");
  if (!cookie || !header) return false;
  return safeEqual(cookie, header);
}

function cookieOptions(httpOnly: boolean) {
  return {
    httpOnly,
    sameSite: "strict" as const,
    secure: isProduction,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function setSessionCookies(response: NextResponse): string | null {
  const token = createSessionToken();
  if (!token) return null;

  const csrf = randomBytes(32).toString("base64url");
  response.cookies.set(SESSION_COOKIE, token, cookieOptions(true));
  response.cookies.set(CSRF_COOKIE, csrf, cookieOptions(false));
  return csrf;
}

export function ensureCsrfCookie(
  request: NextRequest,
  response: NextResponse,
): void {
  if (request.cookies.get(CSRF_COOKIE)?.value) return;
  response.cookies.set(
    CSRF_COOKIE,
    randomBytes(32).toString("base64url"),
    cookieOptions(false),
  );
}

export function clearSessionCookies(response: NextResponse): void {
  const expired = { ...cookieOptions(true), maxAge: 0 };
  response.cookies.set(SESSION_COOKIE, "", expired);
  response.cookies.set(CSRF_COOKIE, "", { ...expired, httpOnly: false });
}
