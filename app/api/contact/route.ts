import { NextResponse } from "next/server";

import { validateContact } from "@/lib/contact";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

type RateLimitStore = Map<string, number[]>;

const globalForRateLimit = globalThis as typeof globalThis & {
  __contactRateLimit?: RateLimitStore;
};

const rateLimitStore: RateLimitStore =
  globalForRateLimit.__contactRateLimit ?? new Map();

globalForRateLimit.__contactRateLimit = rateLimitStore;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitStore.get(ip) ?? []).filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS,
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);

  // Keep the map from growing without bound on long-lived instances.
  if (rateLimitStore.size > 500) {
    for (const [key, values] of rateLimitStore) {
      if (values.every((time) => now - time >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitStore.delete(key);
      }
    }
  }

  return false;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!apiKey || !to || !from) {
    return NextResponse.json(
      {
        ok: false,
        code: "not_configured",
        message:
          "Email delivery is not configured on this deployment. Please use the direct email link instead.",
      },
      { status: 503 },
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { ok: false, code: "unsupported_media_type", message: "Invalid request." },
      { status: 415 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_json", message: "Invalid request body." },
      { status: 400 },
    );
  }

  const { data, errors } = validateContact(body);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      {
        ok: false,
        code: "validation_error",
        message: "Please check the highlighted fields.",
        errors,
      },
      { status: 422 },
    );
  }

  // Honeypot: real users never fill this hidden field.
  if (data.company) {
    return NextResponse.json({ ok: true });
  }

  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      {
        ok: false,
        code: "rate_limited",
        message:
          "Too many messages have been sent from this connection. Please try again later.",
      },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }

  const subject = `Portfolio enquiry from ${data.name}`.replace(/[\r\n]+/g, " ");
  const text = `New message from your portfolio contact form.\n\nName: ${data.name}\nEmail: ${data.email}\n\n${data.message}`;
  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #18181b;">
      <h2 style="margin: 0 0 16px;">New portfolio enquiry</h2>
      <p style="margin: 0 0 4px;"><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p style="margin: 0 0 4px;"><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      console.error("Resend rejected the contact email", await response.text());
      return NextResponse.json(
        {
          ok: false,
          code: "delivery_failed",
          message:
            "The message could not be delivered right now. Please email me directly instead.",
        },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Contact email request failed", error);
    return NextResponse.json(
      {
        ok: false,
        code: "delivery_failed",
        message:
          "The message could not be delivered right now. Please email me directly instead.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
