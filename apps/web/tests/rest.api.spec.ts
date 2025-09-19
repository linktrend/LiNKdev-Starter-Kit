import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { 
  extractBearerToken, 
  extractOrgId, 
  authenticateRequest, 
  isOfflineMode,
  createMockAuthContext 
} from '@/server/rest/auth';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  handleTRPCError,
  ERROR_CODES 
} from '@/server/rest/errors';
import { 
  checkRateLimit, 
  isRateLimited, 
  createRateLimitHeaders,
  getRateLimitConfigForEndpoint 
} from '@/server/rest/ratelimit';
import { 
  extractIdempotencyKey, 
  generateIdempotencyKey,
  checkIdempotency 
} from '@/server/rest/idempotency';
import { 
  validateRequest, 
  validateQuery, 
  validateBody,
  formatValidationError,
  CreateOrgRequestSchema 
} from '@/server/rest/validators';
import { 
  extractPaginationParams, 
  createPaginatedResponse,
  validatePaginationParams 
} from '@/server/rest/pagination';

describe('REST API Utilities', () => {
  describe('Authentication', () => {
    it('should extract bearer token from Authorization header', () => {
      const request = new NextRequest('http://localhost:3000/api/v1/orgs', {
        headers: {
          'Authorization': 'Bearer test-token-123',
        },
      });

      const token = extractBearerToken(request);
      expect(token).toBe('test-token-123');
    });

    it('should return null for missing Authorization header', () => {
      const request = new NextRequest('http://localhost:3000/api/v1/orgs');
      const token = extractBearerToken(request);
      expect(token).toBeNull();
    });

    it('should return null for invalid Authorization header format', () => {
      const request = new NextRequest('http://localhost:3000/api/v1/orgs', {
        headers: {
          'Authorization': 'Basic test-token-123',
        },
      });

      const token = extractBearerToken(request);
      expect(token).toBeNull();
    });

    it('should extract org ID from X-Org-ID header', () => {
      const request = new NextRequest('http://localhost:3000/api/v1/orgs', {
        headers: {
          'X-Org-ID': 'org-123',
        },
      });

      const orgId = extractOrgId(request);
      expect(orgId).toBe('org-123');
    });

    it('should return null for missing X-Org-ID header', () => {
      const request = new NextRequest('http://localhost:3000/api/v1/orgs');
      const orgId = extractOrgId(request);
      expect(orgId).toBeNull();
    });

    it('should create mock auth context in offline mode', () => {
      vi.stubEnv('TEMPLATE_OFFLINE', '1');
      
      const context = createMockAuthContext('org-123');
      
      expect(context).toEqual({
        user: {
          id: 'mock-user-123',
          email: 'user@example.com',
        },
        orgId: 'org-123',
        supabase: null,
      });
    });
  });

  describe('Error Handling', () => {
    it('should create standardized error responses', () => {
      const response = createErrorResponse('INVALID_REQUEST', 'Test error message');
      
      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should create success responses with data', () => {
      const data = { id: '123', name: 'Test' };
      const response = createSuccessResponse(data, 201);
      
      expect(response.status).toBe(201);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should format validation errors correctly', () => {
      const mockError = {
        errors: [
          { path: ['name'], message: 'Name is required' },
          { path: ['email'], message: 'Invalid email format' },
        ],
      } as any;

      const formatted = formatValidationError(mockError);
      
      expect(formatted).toEqual({
        code: 'validation_error',
        message: 'Request validation failed',
        details: {
          fields: {
            name: ['Name is required'],
            email: ['Invalid email format'],
          },
        },
      });
    });

    it('should have all required error codes', () => {
      const requiredCodes = [
        'MISSING_TOKEN',
        'INVALID_TOKEN',
        'MISSING_ORG_ID',
        'ORG_ACCESS_DENIED',
        'INVALID_REQUEST',
        'RESOURCE_NOT_FOUND',
        'RATE_LIMIT_EXCEEDED',
        'INTERNAL_ERROR',
      ];

      requiredCodes.forEach(code => {
        expect(ERROR_CODES).toHaveProperty(code);
        expect(ERROR_CODES[code as keyof typeof ERROR_CODES]).toHaveProperty('status');
        expect(ERROR_CODES[code as keyof typeof ERROR_CODES]).toHaveProperty('message');
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limit and return info', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/orgs', {
        headers: {
          'X-Org-ID': 'org-123',
        },
      });

      const rateLimitInfo = await checkRateLimit(request, 'org-123');
      
      expect(rateLimitInfo).toHaveProperty('limit');
      expect(rateLimitInfo).toHaveProperty('remaining');
      expect(rateLimitInfo).toHaveProperty('reset');
    });

    it('should identify rate limited requests', () => {
      const rateLimitInfo = {
        limit: 60,
        remaining: 0,
        reset: Date.now() + 60000,
        retryAfter: 60,
      };

      expect(isRateLimited(rateLimitInfo)).toBe(true);
    });

    it('should identify non-rate-limited requests', () => {
      const rateLimitInfo = {
        limit: 60,
        remaining: 30,
        reset: Date.now() + 60000,
      };

      expect(isRateLimited(rateLimitInfo)).toBe(false);
    });

    it('should create rate limit headers', () => {
      const rateLimitInfo = {
        limit: 60,
        remaining: 30,
        reset: Date.now() + 60000,
        retryAfter: 60,
      };

      const headers = createRateLimitHeaders(rateLimitInfo);
      
      expect(headers).toHaveProperty('X-RateLimit-Limit', '60');
      expect(headers).toHaveProperty('X-RateLimit-Remaining', '30');
      expect(headers).toHaveProperty('Retry-After', '60');
    });

    it('should get appropriate rate limit config for endpoints', () => {
      const getConfig = getRateLimitConfigForEndpoint('GET', '/api/v1/records');
      const postConfig = getRateLimitConfigForEndpoint('POST', '/api/v1/records');
      const billingConfig = getRateLimitConfigForEndpoint('GET', '/api/v1/billing/subscription');

      expect(getConfig.maxRequests).toBeGreaterThan(postConfig.maxRequests);
      expect(billingConfig.maxRequests).toBeLessThan(getConfig.maxRequests);
    });
  });

  describe('Idempotency', () => {
    it('should extract idempotency key from headers', () => {
      const request = new NextRequest('http://localhost:3000/api/v1/orgs', {
        headers: {
          'Idempotency-Key': 'test-key-123',
        },
      });

      const key = extractIdempotencyKey(request);
      expect(key).toBe('test-key-123');
    });

    it('should return null for missing idempotency key', () => {
      const request = new NextRequest('http://localhost:3000/api/v1/orgs');
      const key = extractIdempotencyKey(request);
      expect(key).toBeNull();
    });

    it('should generate idempotency key', () => {
      const key = generateIdempotencyKey('POST', '/api/v1/orgs', 'org-123', 'user-123', { name: 'Test' });
      
      expect(key).toMatch(/^idem_/);
      expect(key).toContain('_');
    });

    it('should generate consistent keys for same input', () => {
      const input = { name: 'Test Org' };
      const key1 = generateIdempotencyKey('POST', '/api/v1/orgs', 'org-123', 'user-123', input);
      const key2 = generateIdempotencyKey('POST', '/api/v1/orgs', 'org-123', 'user-123', input);
      
      expect(key1).toBe(key2);
    });
  });

  describe('Validation', () => {
    it('should validate request data successfully', () => {
      const validData = { name: 'Test Organization' };
      const result = validateRequest(CreateOrgRequestSchema, validData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should fail validation for invalid data', () => {
      const invalidData = { name: '' }; // Empty name should fail
      const result = validateRequest(CreateOrgRequestSchema, invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(1);
        expect(result.error.errors[0].message).toContain('required');
      }
    });

    it('should validate query parameters', () => {
      const searchParams = new URLSearchParams({
        limit: '50',
        cursor: 'test-cursor',
      });

      const result = validateQuery(CreateOrgRequestSchema, searchParams);
      // This should fail because search params don't match the schema
      expect(result.success).toBe(false);
    });

    it('should validate request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/orgs', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Organization' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await validateBody(CreateOrgRequestSchema, request);
      expect(result.success).toBe(true);
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/orgs', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await validateBody(CreateOrgRequestSchema, request);
      expect(result.success).toBe(false);
    });
  });

  describe('Pagination', () => {
    it('should extract pagination parameters from URL', () => {
      const searchParams = new URLSearchParams({
        limit: '25',
        cursor: 'test-cursor',
      });

      const params = extractPaginationParams(searchParams);
      
      expect(params.limit).toBe(25);
      expect(params.cursor).toBe('test-cursor');
    });

    it('should use default values for missing parameters', () => {
      const searchParams = new URLSearchParams();
      const params = extractPaginationParams(searchParams);
      
      expect(params.limit).toBe(50);
      expect(params.cursor).toBeUndefined();
    });

    it('should enforce limit bounds', () => {
      const searchParams = new URLSearchParams({
        limit: '150', // Over maximum
      });

      const params = extractPaginationParams(searchParams);
      expect(params.limit).toBe(100); // Should be capped at 100
    });

    it('should create paginated response', () => {
      const data = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      const response = createPaginatedResponse(data, 50, 'cursor-123', 100);
      
      expect(response.data).toEqual(data);
      expect(response.nextCursor).toBe('cursor-123');
      expect(response.total).toBe(100);
    });

    it('should validate pagination parameters', () => {
      const validParams = { limit: 50, cursor: 'test' };
      const result = validatePaginationParams(validParams);
      
      expect(result.valid).toBe(true);
      expect(result.params).toEqual(validParams);
    });

    it('should reject invalid pagination parameters', () => {
      const invalidParams = { limit: 150 };
      const result = validatePaginationParams(invalidParams);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('between 1 and 100');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete request flow in offline mode', async () => {
      vi.stubEnv('TEMPLATE_OFFLINE', '1');
      
      const request = new NextRequest('http://localhost:3000/api/v1/orgs', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'X-Org-ID': 'org-123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test Organization' }),
      });

      // Test authentication
      const auth = createMockAuthContext('org-123');
      expect(auth.orgId).toBe('org-123');

      // Test validation
      const bodyValidation = await validateBody(CreateOrgRequestSchema, request);
      expect(bodyValidation.success).toBe(true);

      // Test rate limiting
      const rateLimitInfo = await checkRateLimit(request, 'org-123');
      expect(rateLimitInfo).toHaveProperty('limit');
    });

    it('should handle error cases gracefully', () => {
      const request = new NextRequest('http://localhost:3000/api/v1/orgs');
      
      // Missing auth headers
      const token = extractBearerToken(request);
      const orgId = extractOrgId(request);
      
      expect(token).toBeNull();
      expect(orgId).toBeNull();
    });
  });
});
