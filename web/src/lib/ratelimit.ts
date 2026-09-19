/**
 * Rate limiting for /api/ask, backed by Upstash Redis.
 *
 * WHY THIS EXISTS: the endpoint proxies a free-tier LLM with no auth. The
 * provider's own limits are tight — roughly two requests per minute on the
 * tokens-per-minute ceiling — so a single scripted client can make the tool
 * unavailable for everyone. That is an availability problem, not a billing
 * one: on the free tier excess traffic is refused rather than charged.
 *
 * WHY UPSTASH RATHER THAN AN IN-MEMORY COUNTER: this runs as a serverless
 * function. Each invocation may land on a fresh instance, so a module-level
 * Map counts almost nothing. The limiter needs shared state.
 *
 * WHY VERCEL KV IS NOT USED: Vercel KV was retired and existing stores were
 * moved to Upstash Redis in December 2024; @vercel/kv is deprecated on npm and
 * new projects are pointed at a Redis integration from the Vercel Marketplace.
 * Provisioning Upstash through that Marketplace is the current path, and it
 * injects the credentials below automatically.
 *
 * TWO LIMITS, DIFFERENT JOBS:
 *   per-IP   stops one client monopolising the endpoint
 *   daily    protects the token budget when many distinct IPs arrive
 * Neither alone is sufficient.
 *
 * FAIL-OPEN BY DESIGN: if Redis is unreachable or unconfigured, requests are
 * allowed. This is a public research demo — a limiter outage taking the site
 * down would be worse than the handful of extra requests it would have
 * refused. Set RATELIMIT_FAIL_CLOSED=1 to invert that.
 */

import { Redis } from "@upstash/redis";

// ---------- configuration ----------

const PER_IP_MAX = Number(process.env.RATELIMIT_PER_IP ?? 5);
const WINDOW_SECONDS = Number(process.env.RATELIMIT_WINDOW_SECONDS ?? 600);
const DAILY_MAX = Number(process.env.RATELIMIT_DAILY_CAP ?? 150);
const DISABLED = process.env.RATELIMIT_DISABLED === "1";
const FAIL_CLOSED = process.env.RATELIMIT_FAIL_CLOSED === "1";

// ---------- credential discovery ----------

/**
 * The Vercel Marketplace integration names these variables differently
 * depending on how the store was provisioned, and it may prefix them with the
 * store name (e.g. UPSTASH_KV_CAMEL_JACKET_KV_REST_API_URL). Rather than
 * hardcode one spelling and fail silently on another, look for the exact
 * names first and then for any variable ending in the expected suffix.
 */
function findEnv(exact: string[], suffix: string): string | undefined {
  for (const name of exact) {
    const v = process.env[name];
    if (v) return v;
  }
  for (const [name, value] of Object.entries(process.env)) {
    if (value && name.toUpperCase().endsWith(suffix)) return value;
  }
  return undefined;
}

const REST_URL = findEnv(
  ["UPSTASH_REDIS_REST_URL", "KV_REST_API_URL"],
  "REST_API_URL"
);
const REST_TOKEN = findEnv(
  ["UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN"],
  "REST_API_TOKEN"
);

let redis: Redis | null = null;
function client(): Redis | null {
  if (DISABLED || !REST_URL || !REST_TOKEN) return null;
  if (!redis) redis = new Redis({ url: REST_URL, token: REST_TOKEN });
  return redis;
}

/** True when a store is wired up. Useful for a startup log line. */
export function rateLimitConfigured(): boolean {
  return Boolean(REST_URL && REST_TOKEN) && !DISABLED;
}

// ---------- client identity ----------

/**
 * Vercel sets x-forwarded-for; the leftmost entry is the client. This is
 * spoofable, which is fine: the per-IP limit is a courtesy control against
 * ordinary over-use. The daily cap is what actually protects the budget, and
 * it does not depend on identity at all.
 */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

// ---------- the check ----------

export type RateLimitVerdict =
  | { allowed: true }
  | { allowed: false; reason: "per_ip" | "daily"; retryAfterSeconds: number };

/**
 * Fixed-window counters via INCR + EXPIRE. Fixed rather than sliding on
 * purpose: it is two commands instead of a sorted-set dance, and at these
 * volumes the boundary effect (a client getting up to 2x the allowance across
 * a window edge) does not matter.
 */
export async function checkRateLimit(ip: string): Promise<RateLimitVerdict> {
  const r = client();
  if (!r) return { allowed: true };

  const now = Date.now();
  const windowStart = Math.floor(now / 1000 / WINDOW_SECONDS);
  const today = new Date(now).toISOString().slice(0, 10);

  const ipKey = `ask:ip:${ip}:${windowStart}`;
  const dayKey = `ask:day:${today}`;

  try {
    const pipe = r.pipeline();
    pipe.incr(ipKey);
    pipe.expire(ipKey, WINDOW_SECONDS);
    pipe.incr(dayKey);
    pipe.expire(dayKey, 60 * 60 * 26); // a little over a day, to cover skew
    const [ipCount, , dayCount] = (await pipe.exec()) as [
      number,
      unknown,
      number,
      unknown
    ];

    if (ipCount > PER_IP_MAX) {
      const secondsIntoWindow = Math.floor(now / 1000) % WINDOW_SECONDS;
      return {
        allowed: false,
        reason: "per_ip",
        retryAfterSeconds: Math.max(1, WINDOW_SECONDS - secondsIntoWindow),
      };
    }

    if (dayCount > DAILY_MAX) {
      const midnight = new Date(now);
      midnight.setUTCHours(24, 0, 0, 0);
      return {
        allowed: false,
        reason: "daily",
        retryAfterSeconds: Math.max(1, Math.floor((midnight.getTime() - now) / 1000)),
      };
    }

    return { allowed: true };
  } catch (err) {
    console.error("ratelimit: store unreachable", err);
    if (FAIL_CLOSED) {
      return { allowed: false, reason: "daily", retryAfterSeconds: 60 };
    }
    return { allowed: true };
  }
}
