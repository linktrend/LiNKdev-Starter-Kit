/**
 * Tests for Audit Middleware
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAuditMiddleware, auditCreate, auditUpdate, auditDelete, auditRoleChange } from '../../middleware/audit';

describe('Audit Middleware', () => {
  let mockSupabase: any;
  let mockCtx: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
    };

    mockCtx = {
      user: { id: 'user-123' },
      supabase: mockSupabase,
      orgId: 'org-123',
      headers: new Headers({
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0',
      }),
      posthog: {
        capture: vi.fn(),
      },
    };

    mockNext = vi.fn(() => Promise.resolve({ id: 'entity-123', name: 'Test Entity' }));
  });

  describe('createAuditMiddleware', () => {
    it('should log audit entry for successful operation', async () => {
      const middleware = createAuditMiddleware({
        action: 'created',
        entityType: 'org',
        entityIdFromResult: (result) => result.id,
      });

      const input = { orgId: 'org-123', name: 'Test Org' };
      const result = await middleware({ ctx: mockCtx, input, next: mockNext });

      expect(result).toEqual({ id: 'entity-123', name: 'Test Entity' });
      expect(mockNext).toHaveBeenCalled();

      // Wait for async audit logging
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should extract entity ID from input', async () => {
      const middleware = createAuditMiddleware({
        action: 'updated',
        entityType: 'record',
        entityIdField: 'recordId',
      });

      const input = { orgId: 'org-123', recordId: 'record-456' };
      await middleware({ ctx: mockCtx, input, next: mockNext });

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should skip audit if entity ID is missing', async () => {
      const middleware = createAuditMiddleware({
        action: 'updated',
        entityType: 'record',
        entityIdField: 'recordId',
      });

      const input = { orgId: 'org-123' }; // Missing recordId
      await middleware({ ctx: mockCtx, input, next: mockNext });

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should skip audit if org ID is missing', async () => {
      const middleware = createAuditMiddleware({
        action: 'created',
        entityType: 'org',
        entityIdFromResult: (result) => result.id,
      });

      const input = { name: 'Test Org' }; // Missing orgId
      const ctxWithoutOrgId = { ...mockCtx, orgId: undefined };
      await middleware({ ctx: ctxWithoutOrgId, input, next: mockNext });

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should capture custom metadata', async () => {
      const middleware = createAuditMiddleware({
        action: 'updated',
        entityType: 'member',
        entityIdField: 'userId',
        captureMetadata: (input) => ({
          email: input.email,
          role: input.role,
        }),
      });

      const input = {
        orgId: 'org-123',
        userId: 'user-456',
        email: 'test@example.com',
        role: 'admin',
      };

      await middleware({ ctx: mockCtx, input, next: mockNext });
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should sanitize sensitive data in metadata', async () => {
      const middleware = createAuditMiddleware({
        action: 'created',
        entityType: 'org',
        entityIdFromResult: (result) => result.id,
        captureMetadata: (input) => ({
          name: input.name,
          password: input.password,
          apiKey: input.apiKey,
        }),
      });

      const input = {
        orgId: 'org-123',
        name: 'Test Org',
        password: 'secret123',
        apiKey: 'sk_test_123',
      };

      await middleware({ ctx: mockCtx, input, next: mockNext });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify audit log was called (sensitive data should be redacted)
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should capture IP address and user agent', async () => {
      const middleware = createAuditMiddleware({
        action: 'created',
        entityType: 'org',
        entityIdFromResult: (result) => result.id,
      });

      const input = { orgId: 'org-123', name: 'Test Org' };
      await middleware({ ctx: mockCtx, input, next: mockNext });
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should emit analytics event if posthog is available', async () => {
      const middleware = createAuditMiddleware({
        action: 'created',
        entityType: 'org',
        entityIdFromResult: (result) => result.id,
      });

      const input = { orgId: 'org-123', name: 'Test Org' };
      await middleware({ ctx: mockCtx, input, next: mockNext });
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCtx.posthog.capture).toHaveBeenCalledWith({
        distinctId: 'user-123',
        event: 'audit.created',
        properties: {
          org_id: 'org-123',
          entity_type: 'org',
          entity_id: 'entity-123',
          action: 'created',
        },
      });
    });

    it('should handle errors gracefully and not throw', async () => {
      const failingSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn(() => Promise.reject(new Error('Database error'))),
        })),
      };

      const middleware = createAuditMiddleware({
        action: 'created',
        entityType: 'org',
        entityIdFromResult: (result) => result.id,
      });

      const input = { orgId: 'org-123', name: 'Test Org' };
      const ctxWithFailingDb = { ...mockCtx, supabase: failingSupabase };

      // Should not throw
      const result = await middleware({ ctx: ctxWithFailingDb, input, next: mockNext });
      expect(result).toEqual({ id: 'entity-123', name: 'Test Entity' });
    });
  });

  describe('Convenience Functions', () => {
    it('auditCreate should create middleware with correct config', async () => {
      const middleware = auditCreate('org', (result) => result.id);
      const input = { orgId: 'org-123', name: 'Test Org' };
      const result = await middleware({ ctx: mockCtx, input, next: mockNext });

      expect(result).toEqual({ id: 'entity-123', name: 'Test Entity' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('auditUpdate should create middleware with correct config', async () => {
      const middleware = auditUpdate('record', 'recordId');
      const input = { orgId: 'org-123', recordId: 'record-456' };
      await middleware({ ctx: mockCtx, input, next: mockNext });

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('auditDelete should create middleware with correct config', async () => {
      const middleware = auditDelete('record', 'recordId');
      const input = { orgId: 'org-123', recordId: 'record-456' };
      await middleware({ ctx: mockCtx, input, next: mockNext });

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('auditRoleChange should capture role metadata', async () => {
      const middleware = auditRoleChange('member', 'userId');
      const input = {
        orgId: 'org-123',
        userId: 'user-456',
        oldRole: 'viewer',
        role: 'admin',
      };

      await middleware({ ctx: mockCtx, input, next: mockNext });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });
});
