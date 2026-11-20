import "server-only";

import { createHash } from "node:crypto";

/**
 * Rate limiting for serverless deployments.
 *
 * Vercel may run every request on a different instance, so an in-memory Map is
 * only a best-effort fallback. When an Upstash Redis REST database is
 * configured (directly or through the Vercel KV integration) counters are kept
 * in Redis and therefore shared by every instance.
 *
 * Supported environment variables:
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *   KV_REST_API_URL / KV_REST_API_TOKEN
 */

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const globalForRateLimit = globalThis as typeof globalThis & {
  __portfolioRateLimit?: Map<string, Bucket>;
};

const memory: Map<string, Bucket> =
  globalForRateLimit.__portfolioRateLimit ?? new Map();

globalForRateLimit.__portfolioRateLimit = memory;

const MAX_MEMORY_KEYS = 2000;

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function memoryLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = memory.get(key);

  if (!existing || existing.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + options.windowMs });
    pruneMemory(now);
    return {
      allowed: true,
      remaining: Math.max(0, options.limit - 1),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  existing.count += 1;

  return {
    allowed: existing.count <= options.limit,
    remaining: Math.max(0, options.limit - existing.count),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000),
    ),
  };
}

function pruneMemory(now: number): void {
  if (memory.size <= MAX_MEMORY_KEYS) return;
  for (const [key, bucket] of memory) {
    if (bucket.resetAt <= now) memory.delete(key);
  }
}

function redisConfig(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ??
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ??
    process.env.KV_REST_API_TOKEN?.trim();

  if (!url || !token) return null;
  if (!/^https:\/\//.test(url)) return null;

  return { url: url.replace(/\/$/, ""), token };
}

interface RedisResult {
  result?: unknown;
  error?: string;
}

async function redisPipeline(
  commands: unknown[][],
): Promise<RedisResult[] | null> {
  const config = redisConfig();
  if (!config) return null;

  try {
    const response = await fetch(`${config.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as unknown;
    return Array.isArray(payload) ? (payload as RedisResult[]) : null;
  } catch {
    // A rate-limit outage must not take the whole endpoint down.
    return null;
  }
}

export async function rateLimit(
  scope: string,
  identifier: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const key = `portfolio:rl:${scope}:${hash(identifier)}`;

  const pipeline = await redisPipeline([
    ["SET", key, 0, "PX", options.windowMs, "NX"],
    ["INCR", key],
    ["PTTL", key],
  ]);

  if (pipeline) {
    const count = Number(pipeline[1]?.result);
    const ttl = Number(pipeline[2]?.result);

    if (Number.isFinite(count)) {
      return {
        allowed: count <= options.limit,
        remaining: Math.max(0, options.limit - count),
        retryAfterSeconds:
          Number.isFinite(ttl) && ttl > 0
            ? Math.ceil(ttl / 1000)
            : Math.ceil(options.windowMs / 1000),
      };
    }
  }

  return memoryLimit(key, options);
}
