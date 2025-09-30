/**
 * Tests for accessGuard middleware
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createAccessGuard, requireAdmin, requireMember, requireOwner, requireEditor } from '../middleware/accessGuard';
import { getUserOrgRole } from '../rbac';

// Mock the getUserOrgRole function
vi.mock('../rbac', () => ({
  getUserOrgRole: vi.fn(),
  roleIsSufficient: vi.fn(),
}));

describe('AccessGuard Middleware', () => {
  const mockSupabase = {};
  const mockUser = { id: 'user-123' };
  const mockOrgId = 'org-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAccessGuard', () => {
    it('should allow access when user has sufficient role', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('admin');

      const middleware = createAccessGuard('admin', {
        orgIdSource: 'input',
        orgIdField: 'orgId',
      });

      const mockNext = vi.fn().mockResolvedValue('success');
      const mockCtx = {
        user: mockUser,
        supabase: mockSupabase,
      };
      const mockInput = { orgId: mockOrgId };

      const result = await middleware({
        ctx: mockCtx,
        input: mockInput,
        next: mockNext,
      });

      expect(mockGetUserOrgRole).toHaveBeenCalledWith(mockOrgId, mockUser.id, mockSupabase);
      expect(mockNext).toHaveBeenCalledWith({
        ctx: expect.objectContaining({
          userRole: 'admin',
          orgId: mockOrgId,
        }),
        input: mockInput,
      });
      expect(result).toBe('success');
    });

    it('should deny access when user has insufficient role', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('viewer');

      const middleware = createAccessGuard('admin', {
        orgIdSource: 'input',
        orgIdField: 'orgId',
      });

      const mockNext = vi.fn();
      const mockCtx = {
        user: mockUser,
        supabase: mockSupabase,
      };
      const mockInput = { orgId: mockOrgId };

      await expect(
        middleware({
          ctx: mockCtx,
          input: mockInput,
          next: mockNext,
        })
      ).rejects.toThrow(TRPCError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when user is not a member', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue(null);

      const middleware = createAccessGuard('viewer', {
        orgIdSource: 'input',
        orgIdField: 'orgId',
      });

      const mockNext = vi.fn();
      const mockCtx = {
        user: mockUser,
        supabase: mockSupabase,
      };
      const mockInput = { orgId: mockOrgId };

      await expect(
        middleware({
          ctx: mockCtx,
          input: mockInput,
          next: mockNext,
        })
      ).rejects.toThrow(TRPCError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw error when orgId is missing from input', async () => {
      const middleware = createAccessGuard('admin', {
        orgIdSource: 'input',
        orgIdField: 'orgId',
      });

      const mockNext = vi.fn();
      const mockCtx = {
        user: mockUser,
        supabase: mockSupabase,
      };
      const mockInput = {}; // Missing orgId

      await expect(
        middleware({
          ctx: mockCtx,
          input: mockInput,
          next: mockNext,
        })
      ).rejects.toThrow(TRPCError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should get orgId from context when orgIdSource is context', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('admin');

      const middleware = createAccessGuard('admin', {
        orgIdSource: 'context',
      });

      const mockNext = vi.fn().mockResolvedValue('success');
      const mockCtx = {
        user: mockUser,
        supabase: mockSupabase,
        orgId: mockOrgId,
      };
      const mockInput = {};

      await middleware({
        ctx: mockCtx,
        input: mockInput,
        next: mockNext,
      });

      expect(mockGetUserOrgRole).toHaveBeenCalledWith(mockOrgId, mockUser.id, mockSupabase);
    });

    it('should use custom role resolver when provided', async () => {
      const customRoleResolver = vi.fn().mockResolvedValue('admin');

      const middleware = createAccessGuard('admin', {
        orgIdSource: 'input',
        orgIdField: 'orgId',
        customRoleResolver,
      });

      const mockNext = vi.fn().mockResolvedValue('success');
      const mockCtx = {
        user: mockUser,
        supabase: mockSupabase,
      };
      const mockInput = { orgId: mockOrgId };

      await middleware({
        ctx: mockCtx,
        input: mockInput,
        next: mockNext,
      });

      expect(customRoleResolver).toHaveBeenCalledWith(mockCtx, mockInput);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Convenience functions', () => {
    it('should create correct middleware for requireAdmin', () => {
      const middleware = requireAdmin();
      expect(middleware).toBeDefined();
    });

    it('should create correct middleware for requireMember', () => {
      const middleware = requireMember();
      expect(middleware).toBeDefined();
    });

    it('should create correct middleware for requireOwner', () => {
      const middleware = requireOwner();
      expect(middleware).toBeDefined();
    });

    it('should create correct middleware for requireEditor', () => {
      const middleware = requireEditor();
      expect(middleware).toBeDefined();
    });
  });
});
