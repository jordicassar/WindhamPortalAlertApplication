import 'server-only';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { db } from './db';

/**
 * Fixed-window rate limiting backed by Postgres, so the limit holds across every
 * serverless instance. One atomic upsert per check: no read-then-write race.
 *
 * For very high traffic, swap the storage for Redis (e.g. @upstash/ratelimit);
 * callers only use rateLimit() and clientIp(), so nothing else needs to change.
 */

export type Limit = { limit: number; windowSeconds: number };

export const LIMITS = {
  // Generous per-IP limits: many residents can share one IP (libraries, schools,
  // mobile carriers). Turnstile is the main defence on the subscribe form.
  subscribeIp: { limit: 30, windowSeconds: 3600 },
  subscribeContact: { limit: 5, windowSeconds: 3600 },
  loginIp: { limit: 20, windowSeconds: 900 },
  loginAccount: { limit: 10, windowSeconds: 900 },
} satisfies Record<string, Limit>;

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/** Hash identifiers so the table never holds raw IP addresses, emails or phone numbers. */
function hashId(value: string): string {
  return createHash('sha256')
    .update(`${process.env.SESSION_SECRET ?? ''}:${value.toLowerCase()}`)
    .digest('hex')
    .slice(0, 32);
}

export async function rateLimit(
  bucket: string,
  identifier: string,
  { limit, windowSeconds }: Limit,
): Promise<RateLimitResult> {
  const key = `${bucket}:${hashId(identifier)}`;
  const [row] = await db.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}::double precision))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" <= now() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" <= now()
        THEN now() + make_interval(secs => ${windowSeconds}::double precision)
        ELSE "RateLimit"."resetAt" END
    RETURNING "count", "resetAt"`;

  // Occasionally clear out expired counters so the table stays small.
  if (Math.random() < 0.01) {
    await db.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 3600_000) } } });
  }

  if (row.count <= limit) return { ok: true };
  return {
    ok: false,
    retryAfterSeconds: Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)),
  };
}

/**
 * The visitor's IP address. On Vercel these headers are set by the platform and
 * can't be spoofed by the client; if self-hosting, make sure the proxy in front
 * of the app overwrites them.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export function retryMessage(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return `Too many attempts. Please wait ${minutes} minute${minutes === 1 ? '' : 's'} and try again.`;
}
