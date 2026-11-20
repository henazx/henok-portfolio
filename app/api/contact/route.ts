import type { NextRequest } from "next/server";

import { validateContact } from "@/lib/contact";
import {
  errorResponse,
  getClientIp,
  isSameOrigin,
  jsonResponse,
  readJsonBody,
} from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function safeAddress(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length > 320) return null;
  if (/[\r\n]/.test(trimmed)) return null;
  return trimmed;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return errorResponse(403, "Invalid request origin.", "invalid_origin");
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = safeAddress(process.env.CONTACT_TO_EMAIL);
  const from = safeAddress(process.env.CONTACT_FROM_EMAIL);

  if (!apiKey || !to || !from) {
    return errorResponse(
      503,
      "Email delivery is not configured on this deployment. Please use the direct email link instead.",
      "not_configured",
    );
  }

  const limit = await rateLimit("contact", getClientIp(request), {
    limit: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!limit.allowed) {
    return errorResponse(
      429,
      "Too many messages have been sent from this connection. Please try again later.",
      "rate_limited",
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return errorResponse(body.status, body.message);
  }

  const { data, errors } = validateContact(body.value);

  if (Object.keys(errors).length > 0) {
    return jsonResponse(
      {
        ok: false,
        code: "validation_error",
        message: "Please check the highlighted fields.",
        errors,
      },
      422,
    );
  }

  // Honeypot: real users never fill this hidden field.
  if (data.company) {
    return jsonResponse({ ok: true });
  }

  const subject = `Portfolio enquiry from ${data.name}`.replace(
    /[\r\n]+/g,
    " ",
  );
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
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        "Resend rejected the contact email",
        detail.slice(0, 500),
      );
      return errorResponse(
        502,
        "The message could not be delivered right now. Please email me directly instead.",
        "delivery_failed",
      );
    }
  } catch (error) {
    console.error(
      "Contact email request failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return errorResponse(
      502,
      "The message could not be delivered right now. Please email me directly instead.",
      "delivery_failed",
    );
  }

  return jsonResponse({ ok: true });
}
