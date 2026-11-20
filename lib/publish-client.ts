import type { SiteContent } from "@/types";

/**
 * Browser helpers for the publishing API. Keeping the cookie/CSRF plumbing in
 * one place means the editor never needs to know the publishing password after
 * sign-in, and the password is never part of the publish request.
 */

const CSRF_COOKIE = "pf_csrf";

export interface LoginResult {
  ok: boolean;
  status: number;
  message?: string;
}

export interface PublishResult {
  ok: boolean;
  status: number;
  message?: string;
  content?: SiteContent;
  changed?: boolean;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const entry = part.trim();
    if (!entry.startsWith(prefix)) continue;

    try {
      return decodeURIComponent(entry.slice(prefix.length));
    } catch {
      return null;
    }
  }

  return null;
}

async function readMessage(response: Response): Promise<string | undefined> {
  try {
    const payload = (await response.json()) as { message?: unknown };
    return typeof payload.message === "string" ? payload.message : undefined;
  } catch {
    return undefined;
  }
}

export async function getPublishSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/session", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!response.ok) return false;
    const payload = (await response.json()) as { authenticated?: unknown };
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

export async function loginToPublish(password: string): Promise<LoginResult> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.ok) return { ok: true, status: response.status };

    return {
      ok: false,
      status: response.status,
      message: await readMessage(response),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Could not reach the server. Check your connection.",
    };
  }
}

export async function logoutPublish(): Promise<void> {
  const csrf = readCookie(CSRF_COOKIE);

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: csrf ? { "x-csrf-token": csrf } : undefined,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    // Signing out locally still clears the editor state.
  }
}

export async function publishSite(content: SiteContent): Promise<PublishResult> {
  const csrf = readCookie(CSRF_COOKIE);

  try {
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "x-csrf-token": csrf } : {}),
      },
      body: JSON.stringify({ content }),
      credentials: "same-origin",
      cache: "no-store",
    });

    interface PublishPayload {
      ok?: boolean;
      message?: string;
      content?: SiteContent;
      changed?: boolean;
    }
    let payload: PublishPayload | null = null;

    try {
      payload = (await response.json()) as PublishPayload;
    } catch {
      payload = null;
    }

    return {
      ok: response.ok && payload?.ok !== false,
      status: response.status,
      message: payload?.message,
      content: payload?.content,
      changed: payload?.changed,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Could not reach the server. Check your connection.",
    };
  }
}
