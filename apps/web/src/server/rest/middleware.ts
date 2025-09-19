// tRPC Middleware for Idempotency & Rate Limiting
// Provides middleware for tRPC procedures

import { TRPCError } from '@trpc/server';
import { createHash } from 'crypto';
import { 
  checkIdempotency, 
  storeIdempotencyResult, 
  extractIdempotencyKey,
  generateIdempotencyKey 
} from './idempotency';
import { 
  checkRateLimit, 
  generateRateLimitKey
} from './ratelimit';
import { 
  getRateLimitConfigForTRPC,
  generateRateLimitBucket
} from './ratelimit.config';
import { 
  createErrorResponse, 
  createRateLimitError 
} from './errors';

export interface TRPCMiddlewareContext {
  user: { id: string };
  supabase?: any;
  orgId?: string;
  ip?: string;
}

/**
 * Hash request for idempotency
 */
export function hashRequest(
  body: any, 
  headers: Record<string, string>, 
  whitelistHeaders: string[] = []
): string {
  const relevantHeaders = whitelistHeaders.reduce((acc, key) => {
    if (headers[key]) {
      acc[key] = headers[key];
    }
    return acc;
  }, {} as Record<string, string>);

  const requestData = {
    body,
    headers: relevantHeaders,
  };

  return createHash('sha256')
    .update(JSON.stringify(requestData))
    .digest('hex');
}

/**
 * Get or create idempotency result
 */
export async function getOrCreateIdempotencyResult<T>({
  key,
  method,
  path,
  orgId,
  userId,
  requestHash,
  exec,
  supabase,
}: {
  key: string;
  method: string;
  path: string;
  orgId: string;
  userId: string;
  requestHash: string;
  exec: () => Promise<T>;
  supabase?: any;
}): Promise<{ result: T; status: number; fromCache: boolean }> {
  // Check for existing idempotency record
  const existingRecord = await checkIdempotency(
    { headers: new Headers() } as any, // Mock request for key extraction
    orgId,
    userId,
    supabase
  );

  if (existingRecord) {
    // Verify request hash matches
    if (existingRecord.request_hash === requestHash) {
      return {
        result: existingRecord.response as T,
        status: existingRecord.status || 200,
        fromCache: true,
      };
    } else {
      // Request hash mismatch - return conflict
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Idempotency key already used with different request',
      });
    }
  }

  // Execute the procedure
  const result = await exec();
  const status = 200; // tRPC procedures typically return 200

  // Store the result
  await storeIdempotencyResult(
    key,
    method,
    path,
    status,
    result,
    orgId,
    userId,
    supabase
  );

  return {
    result,
    status,
    fromCache: false,
  };
}

/**
 * Check rate limit for tRPC procedure
 */
export async function checkTRPCRateLimit({
  procedure,
  orgId,
  ip,
  supabase,
}: {
  procedure: string;
  orgId: string;
  ip: string;
  supabase?: any;
}): Promise<{ allowed: boolean; retryAfter?: number; limit: number; remaining: number }> {
  const config = getRateLimitConfigForTRPC(procedure);
  const bucket = generateRateLimitBucket(ip, orgId, procedure);
  
  // Mock request for rate limiting
  const mockRequest = {
    headers: new Headers(),
  } as any;

  const rateLimitInfo = await checkRateLimit(mockRequest, orgId, config, supabase);
  
  return {
    allowed: rateLimitInfo.remaining > 0,
    retryAfter: rateLimitInfo.retryAfter,
    limit: rateLimitInfo.limit,
    remaining: rateLimitInfo.remaining,
  };
}

/**
 * Idempotency middleware for tRPC
 */
export function createIdempotencyMiddleware() {
  return async function idempotencyMiddleware({
    next,
    ctx,
    path,
    type,
  }: {
    next: any;
    ctx: any;
    path: string;
    type: string;
  }) {
    // Only apply to mutations
    if (type !== 'mutation') {
      return next();
    }

    // Extract idempotency key from context (would be set by client)
    const idempotencyKey = (ctx as any).idempotencyKey;
    
    if (!idempotencyKey) {
      return next();
    }

    // Extract context
    const orgId = (ctx as any).orgId || ctx.user?.orgId;
    const userId = ctx.user?.id;
    
    if (!orgId || !userId) {
      return next();
    }

    // Generate request hash
    const requestHash = hashRequest(
      (ctx as any).input,
      (ctx as any).headers || {},
      ['content-type', 'authorization']
    );

    // Generate idempotency key if not provided
    const key = idempotencyKey || generateIdempotencyKey(
      'POST', // tRPC mutations are POST
      path,
      orgId,
      userId,
      (ctx as any).input
    );

    try {
      const { result, fromCache } = await getOrCreateIdempotencyResult({
        key,
        method: 'POST',
        path,
        orgId,
        userId,
        requestHash,
        exec: () => next(),
        supabase: ctx.supabase,
      });

      // Add idempotency headers to response
      if (fromCache) {
        console.log(`Idempotency cache hit for key: ${key}`);
      }

      return result;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      // If idempotency fails, continue without it
      console.error('Idempotency error:', error);
      return next();
    }
  };
}

/**
 * Rate limiting middleware for tRPC
 */
export function createRateLimitMiddleware() {
  return async function rateLimitMiddleware({
    next,
    ctx,
    path,
    type,
  }: {
    next: any;
    ctx: any;
    path: string;
    type: string;
  }) {
    // Extract context
    const orgId = (ctx as any).orgId || ctx.user?.orgId;
    const ip = (ctx as any).ip || 'unknown';
    
    if (!orgId) {
      return next();
    }

    try {
      const rateLimitResult = await checkTRPCRateLimit({
        procedure: path,
        orgId,
        ip,
        supabase: ctx.supabase,
      });

      if (!rateLimitResult.allowed) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded',
          cause: {
            retryAfter: rateLimitResult.retryAfter,
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
          },
        });
      }

      return next();
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      // If rate limiting fails, continue without it
      console.error('Rate limit error:', error);
      return next();
    }
  };
}

/**
 * Combined middleware for both idempotency and rate limiting
 */
export function createIdempotencyAndRateLimitMiddleware() {
  const idempotencyMiddleware = createIdempotencyMiddleware();
  const rateLimitMiddleware = createRateLimitMiddleware();

  return async function combinedMiddleware({
    next,
    ctx,
    path,
    type,
  }: {
    next: any;
    ctx: any;
    path: string;
    type: string;
  }) {
    // Apply rate limiting first
    await rateLimitMiddleware({ next, ctx, path, type });
    
    // Then apply idempotency
    return idempotencyMiddleware({ next, ctx, path, type });
  };
}
