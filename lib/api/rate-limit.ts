/**
 * Best-effort fixed-window rate limiter kept in process memory. Adequate for a
 * single-instance MVP; on serverless or multi-instance deployments replace it
 * with a shared store (e.g. Upstash Redis or a database table).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return { allowed: true, remaining: limit - 1 };
  }
  if (bucket.count >= limit)
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}
