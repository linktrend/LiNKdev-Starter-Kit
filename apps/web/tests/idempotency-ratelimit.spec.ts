import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { 
  hashRequest,
  getOrCreateIdempotencyResult,
  checkTRPCRateLimit,
  createIdempotencyMiddleware,
  createRateLimitMiddleware
} from '../src/server/rest/middleware';
import { 
  checkIdempotency, 
  storeIdempotencyResult,
  generateIdempotencyKey 
} from '../src/server/rest/idempotency';
import { 
  checkRateLimit, 
  generateRateLimitKey
} from '../src/server/rest/ratelimit';
import { 
  getRateLimitConfigForTRPC,
  generateRateLimitBucket
} from '../src/server/rest/ratelimit.config';
import { TRPCError } from '@trpc/server';

describe('Idempotency & Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Idempotency', () => {
    it('should hash request consistently', () => {
      const body = { name: 'Test' };
      const headers = { 'content-type': 'application/json' };
      const whitelist = ['content-type'];

      const hash1 = hashRequest(body, headers, whitelist);
      const hash2 = hashRequest(body, headers, whitelist);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA256 hex length
    });

    it('should generate different hashes for different requests', () => {
      const body1 = { name: 'Test1' };
      const body2 = { name: 'Test2' };
      const headers = { 'content-type': 'application/json' };

      const hash1 = hashRequest(body1, headers, ['content-type']);
      const hash2 = hashRequest(body2, headers, ['content-type']);

      expect(hash1).not.toBe(hash2);
    });

    it('should get or create idempotency result', async () => {
      const mockExec = vi.fn().mockResolvedValue({ success: true });
      
      const result = await getOrCreateIdempotencyResult({
        key: 'test-key-123',
        method: 'POST',
        path: '/api/v1/records',
        orgId: 'org-123',
        userId: 'user-123',
        requestHash: 'hash-123',
        exec: mockExec,
      });

      expect(result.result).toEqual({ success: true });
      expect(result.status).toBe(200);
      expect(result.fromCache).toBe(false);
      expect(mockExec).toHaveBeenCalledOnce();
    });

    it('should generate idempotency key', () => {
      const key = generateIdempotencyKey(
        'POST',
        '/api/v1/records',
        'org-123',
        'user-123',
        { name: 'Test' }
      );

      expect(key).toMatch(/^idem_/);
      expect(key).toContain('_');
    });

    it('should generate consistent keys for same input', () => {
      const input = { name: 'Test' };
      
      const key1 = generateIdempotencyKey(
        'POST',
        '/api/v1/records',
        'org-123',
        'user-123',
        input
      );
      
      const key2 = generateIdempotencyKey(
        'POST',
        '/api/v1/records',
        'org-123',
        'user-123',
        input
      );

      expect(key1).toBe(key2);
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limit for tRPC procedure', async () => {
      const result = await checkTRPCRateLimit({
        procedure: 'records.createRecord',
        orgId: 'org-123',
        ip: '192.168.1.1',
      });

      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('remaining');
      expect(typeof result.allowed).toBe('boolean');
    });

    it('should generate rate limit key', () => {
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.1'
        })
      } as any;
      
      const key = generateRateLimitKey(mockRequest, 'org-123');
      
      expect(key).toMatch(/^rate_limit:/);
      expect(key).toContain('192.168.1.1');
      expect(key).toContain('org-123');
    });

    it('should get rate limit config for tRPC procedure', () => {
      const config = getRateLimitConfigForTRPC('records.createRecord');
      
      expect(config).toHaveProperty('limit');
      expect(config).toHaveProperty('windowMs');
      expect(config.limit).toBeGreaterThan(0);
      expect(config.windowMs).toBeGreaterThan(0);
    });

    it('should use default config for unknown procedure', () => {
      const config = getRateLimitConfigForTRPC('unknown.procedure');
      
      expect(config).toHaveProperty('limit');
      expect(config).toHaveProperty('windowMs');
      expect(config.limit).toBeGreaterThan(0);
    });

    it('should generate rate limit bucket key', () => {
      const bucket = generateRateLimitBucket('192.168.1.1', 'org-123', 'records.createRecord');
      
      expect(bucket).toBe('192.168.1.1:org-123:records.createRecord');
    });
  });

  describe('tRPC Middleware', () => {
    it('should create idempotency middleware', () => {
      const middleware = createIdempotencyMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('should create rate limit middleware', () => {
      const middleware = createRateLimitMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('should pass through for non-mutation procedures', async () => {
      const middleware = createIdempotencyMiddleware();
      const mockNext = vi.fn().mockResolvedValue({ data: 'test' });
      
      const result = await middleware({
        next: mockNext,
        ctx: { user: { id: 'user-123' } },
        path: 'records.listRecords',
        type: 'query',
      });

      expect(result).toEqual({ data: 'test' });
      expect(mockNext).toHaveBeenCalledOnce();
    });
  });

  describe('Integration Tests', () => {
    it('should handle offline mode gracefully', async () => {
      // Test that offline mode works without database
      const result = await checkTRPCRateLimit({
        procedure: 'records.createRecord',
        orgId: 'org-123',
        ip: '192.168.1.1',
        supabase: null, // No database
      });

      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('remaining');
    });
  });
});