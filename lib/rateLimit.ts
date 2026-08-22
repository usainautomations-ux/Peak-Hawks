/**
 * Simple in-memory per-IP rate limiter, shared across API routes that
 * write to GHL (leads, booking, chat) so none of them can be spammed to
 * flood the CRM/calendar with junk contacts or fake appointments.
 *
 * Each route gets its own independent counter map (pass a distinct
 * `scope` string) so hitting the limit on one endpoint doesn't affect
 * another. Good enough for a single-instance/low-traffic marketing site;
 * swap for Upstash/Redis if this ever needs to work across multiple
 * serverless regions/instances.
 */

const buckets = new Map<string, Map<string, { count: number; resetAt: number }>>();

export function rateLimited(
  scope: string,
  ip: string,
  limit = 5,
  windowMs = 60_000,
): boolean {
  let hits = buckets.get(scope);
  if (!hits) {
    hits = new Map();
    buckets.set(scope, hits);
  }

  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

/** Pulls the client IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
