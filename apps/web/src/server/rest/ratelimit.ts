// REST API Rate Limiting System
// Token bucket implementation for per-IP+org rate limiting

import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Timestamp when limit resets
  retryAfter?: number; // Seconds to wait before retry
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitInfo | null>;
  set(key: string, info: RateLimitInfo): Promise<void>;
  increment(key: string, config: RateLimitConfig): Promise<RateLimitInfo>;
  cleanup(): Promise<void>;
}

/**
 * Token bucket rate limiter (in-memory)
 */
class TokenBucketRateLimiter {
  private tokens: Map<string, { count: number; lastRefill: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    const entry = this.tokens.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const timeSinceLastRefill = now - entry.lastRefill;
    
    // Refill tokens based on time passed
    const tokensToAdd = Math.floor(timeSinceLastRefill / 1000); // 1 token per second
    const newCount = Math.min(entry.count + tokensToAdd, 60); // Max 60 tokens (1 per second)
    
    if (tokensToAdd > 0) {
      entry.count = newCount;
      entry.lastRefill = now;
    }

    return {
      limit: 60,
      remaining: Math.max(0, newCount - 1),
      reset: now + (60 - newCount) * 1000,
    };
  }

  async set(key: string, info: RateLimitInfo): Promise<void> {
    this.tokens.set(key, {
      count: info.limit - info.remaining,
      lastRefill: Date.now(),
    });
  }

  async increment(key: string, config: RateLimitConfig): Promise<RateLimitInfo> {
    const now = Date.now();
    const entry = this.tokens.get(key);
    
    if (!entry) {
      // First request
      this.tokens.set(key, {
        count: config.maxRequests - 1,
        lastRefill: now,
      });
      
      return {
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        reset: now + config.windowMs,
      };
    }

    // Refill tokens based on time passed
    const timeSinceLastRefill = now - entry.lastRefill;
    const tokensToAdd = Math.floor(timeSinceLastRefill / (config.windowMs / config.maxRequests));
    const newCount = Math.min(entry.count + tokensToAdd, config.maxRequests);
    
    if (tokensToAdd > 0) {
      entry.count = newCount;
      entry.lastRefill = now;
    }

    if (entry.count <= 0) {
      // Rate limit exceeded
      const resetTime = entry.lastRefill + config.windowMs;
      return {
        limit: config.maxRequests,
        remaining: 0,
        reset: resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000),
      };
    }

    // Consume a token
    entry.count--;
    
    return {
      limit: config.maxRequests,
      remaining: entry.count,
      reset: entry.lastRefill + config.windowMs,
    };
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.tokens.entries()) {
      // Remove entries older than 1 hour
      if (now - entry.lastRefill > 60 * 60 * 1000) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.tokens.delete(key));
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

/**
 * Database-backed rate limiter
 */
class DatabaseRateLimiter {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    // Not implemented for database - use increment instead
    return null;
  }

  async set(key: string, info: RateLimitInfo): Promise<void> {
    // Not implemented for database - use increment instead
  }

  async increment(key: string, config: RateLimitConfig): Promise<RateLimitInfo> {
    const windowStart = new Date(Math.floor(Date.now() / config.windowMs) * config.windowMs);
    
    const { data, error } = await this.supabase.rpc('get_or_create_rate_limit_bucket', {
      p_bucket: key,
      p_window_start: windowStart.toISOString(),
      p_limit: config.maxRequests,
    });

    if (error) {
      console.error('Rate limit database error:', error);
      // Fallback to allowing the request
      return {
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        reset: Date.now() + config.windowMs,
      };
    }

    const result = data[0];
    const isAllowed = result.allowed;
    const retryAfter = result.retry_after_sec;

    return {
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - result.count),
      reset: windowStart.getTime() + config.windowMs,
      retryAfter: isAllowed ? undefined : retryAfter,
    };
  }

  async cleanup(): Promise<void> {
    await this.supabase.rpc('cleanup_expired_rate_limits');
  }
}

// Global rate limiter instances
let memoryRateLimiter: TokenBucketRateLimiter | null = null;
let databaseRateLimiter: DatabaseRateLimiter | null = null;

/**
 * Get the appropriate rate limiter instance
 */
function getRateLimiter(supabase?: any): TokenBucketRateLimiter | DatabaseRateLimiter {
  if (supabase) {
    if (!databaseRateLimiter) {
      databaseRateLimiter = new DatabaseRateLimiter(supabase);
    }
    return databaseRateLimiter;
  } else {
    if (!memoryRateLimiter) {
      memoryRateLimiter = new TokenBucketRateLimiter();
    }
    return memoryRateLimiter;
  }
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMIT_CONFIGS = {
  // General API endpoints
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  
  // Mutating operations (POST, PATCH, DELETE)
  mutating: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  
  // Read operations (GET)
  reading: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120, // 120 requests per minute
  },
  
  // Strict limits for sensitive operations
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  },
} as const;

/**
 * Generate rate limit key from request
 */
export function generateRateLimitKey(request: NextRequest, orgId: string): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return `rate_limit:${ip}:${orgId}`;
}

/**
 * Check rate limit for request
 */
export async function checkRateLimit(
  request: NextRequest,
  orgId: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default,
  supabase?: any
): Promise<RateLimitInfo> {
  const key = generateRateLimitKey(request, orgId);
  const limiter = getRateLimiter(supabase);
  
  return await limiter.increment(key, config);
}

/**
 * Get rate limit info without consuming a token
 */
export async function getRateLimitInfo(
  request: NextRequest,
  orgId: string
): Promise<RateLimitInfo | null> {
  const key = generateRateLimitKey(request, orgId);
  const limiter = getRateLimiter();
  
  return await limiter.get(key);
}

/**
 * Check if request should be rate limited
 */
export function isRateLimited(rateLimitInfo: RateLimitInfo): boolean {
  return rateLimitInfo.remaining <= 0;
}

/**
 * Create rate limit headers
 */
export function createRateLimitHeaders(rateLimitInfo: RateLimitInfo): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
    'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
    'X-RateLimit-Reset': new Date(rateLimitInfo.reset).toISOString(),
  };

  if (rateLimitInfo.retryAfter) {
    headers['Retry-After'] = rateLimitInfo.retryAfter.toString();
  }

  return headers;
}

/**
 * Rate limit middleware
 */
export function withRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const orgId = request.headers.get('x-org-id');
    
    if (!orgId) {
      return await handler(request, ...args as any);
    }

    const rateLimitInfo = await checkRateLimit(request, orgId, config);
    
    if (isRateLimited(rateLimitInfo)) {
      const headers = createRateLimitHeaders(rateLimitInfo);
      
      return NextResponse.json(
        {
          error: {
            code: 'rate_limit_exceeded',
            message: 'Rate limit exceeded',
            details: {
              limit: rateLimitInfo.limit,
              remaining: rateLimitInfo.remaining,
              reset: new Date(rateLimitInfo.reset).toISOString(),
              retryAfter: rateLimitInfo.retryAfter,
            },
          },
        },
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...headers,
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(request, ...args as any);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitInfo);
    
    // Clone response and add headers
    const newResponse = NextResponse.json(
      response.body ? await response.json() : null,
      {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          ...rateLimitHeaders,
        },
      }
    );

    return newResponse;
  };
}

/**
 * Cleanup expired rate limit entries
 */
export async function cleanupRateLimits(): Promise<void> {
  const limiter = getRateLimiter();
  await limiter.cleanup();
}

/**
 * Get rate limit configuration for endpoint
 */
export function getRateLimitConfigForEndpoint(method: string, path: string): RateLimitConfig {
  // Apply stricter limits for mutating operations
  if (['POST', 'PATCH', 'DELETE'].includes(method)) {
    return RATE_LIMIT_CONFIGS.mutating;
  }
  
  // Apply stricter limits for sensitive endpoints
  if (path.includes('/billing/') || path.includes('/audit/')) {
    return RATE_LIMIT_CONFIGS.strict;
  }
  
  // Default limits for read operations
  return RATE_LIMIT_CONFIGS.reading;
}
