import crypto from 'crypto';

export function sanitizeMetadata(meta: unknown): Record<string, any> {
  if (!meta || typeof meta !== 'object') return {};
  const forbidden = /(password|token|secret|authorization|cookie|apikey|api_key)/i;

  const recurse = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(recurse);
    }
    if (value && typeof value === 'object') {
      return Object.entries(value).reduce<Record<string, any>>((acc, [key, val]) => {
        if (forbidden.test(key)) {
          acc[key] = '[redacted]';
          return acc;
        }
        acc[key] = recurse(val);
        return acc;
      }, {});
    }
    if (typeof value === 'string' && forbidden.test(value)) {
      return '[redacted]';
    }
    return value;
  };

  return recurse(meta);
}

export function sanitizeStackTrace(stack?: string | null): string | null {
  if (!stack) return null;
  // Remove absolute paths and query params
  return stack
    .replace(/file:\/\/\/[^\s)]+/g, '[redacted]')
    .replace(/\/[A-Za-z0-9._-]+\/(src|app|packages)\/[^\s)]+/g, '[redacted]')
    .slice(0, 8000);
}

export function computeGroupingHash(message: string, stack?: string | null, componentStack?: string | null) {
  const basis = `${message}|${stack ?? ''}|${componentStack ?? ''}`;
  return crypto.createHash('sha256').update(basis).digest('hex').slice(0, 24);
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
export function checkRateLimit(key: string, windowMs = 60_000, max = 30) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (bucket.count >= max) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.count += 1;
  return { allowed: true };
}

// Testing utility to reset rate limit buckets
export function __resetRateLimits() {
  rateBuckets.clear();
}
