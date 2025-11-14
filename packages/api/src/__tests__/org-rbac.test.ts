/**
 * Integration tests for Organization Router with RBAC
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { orgRouter } from '../routers/org';
import { getUserOrgRole } from '../rbac';

// Mock the RBAC functions
vi.mock('../rbac', () => ({
  getUserOrgRole: vi.fn(),
  roleIsSufficient: vi.fn(),
}));

// Mock the org store and utility functions
const mockOrgStore = {
  getUserRole: vi.fn(),
  updateOrg: vi.fn(),
  createOrg: vi.fn(),
  listUserOrgs: vi.fn(),
  getCurrentOrg: vi.fn(),
  setCurrentOrg: vi.fn(),
  listOrgMembers: vi.fn(),
  addMember: vi.fn(),
  updateMemberRole: vi.fn(),
  removeMember: vi.fn(),
  isUserMember: vi.fn(),
  createInvite: vi.fn(),
  acceptInvite: vi.fn(),
  listOrgInvites: vi.fn(),
  revokeInvite: vi.fn(),
};

// Mock utility functions
const mockGenerateInviteToken = vi.fn(() => 'mock-token');
const mockGetInviteExpiryDate = vi.fn(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
const mockIsInviteExpired = vi.fn(() => false);
const mockCanManageMembers = vi.fn();
const mockCanManageInvites = vi.fn();
const mockCanChangeRole = vi.fn();

// Declare global mocks
declare global {
  var orgStore: typeof mockOrgStore;
  var generateInviteToken: typeof mockGenerateInviteToken;
  var getInviteExpiryDate: typeof mockGetInviteExpiryDate;
  var isInviteExpired: typeof mockIsInviteExpired;
  var canManageMembers: typeof mockCanManageMembers;
  var canManageInvites: typeof mockCanManageInvites;
  var canChangeRole: typeof mockCanChangeRole;
}

// Set up global mocks
global.orgStore = mockOrgStore;
global.generateInviteToken = mockGenerateInviteToken;
global.getInviteExpiryDate = mockGetInviteExpiryDate;
global.isInviteExpired = mockIsInviteExpired;
global.canManageMembers = mockCanManageMembers;
global.canManageInvites = mockCanManageInvites;
global.canChangeRole = mockCanChangeRole;

describe('Organization Router RBAC Integration', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(),
            })),
          })),
          update: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(),
            })),
          })),
          delete: vi.fn(),
        })),
      })),
    })),
  };

  const mockUser = { id: 'user-123' };
  const mockOrgId = 'org-123';

  beforeEach(() => {
    vi.clearAllMocks();
    // Set offline mode for testing
    process.env.TEMPLATE_OFFLINE = '1';
  });

  describe('updateOrgSettings', () => {
    it('should allow owner to update organization settings', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('owner');

      mockOrgStore.updateOrg.mockReturnValue({
        id: mockOrgId,
        name: 'Updated Org Name',
        owner_id: mockUser.id,
        created_at: new Date().toISOString(),
      });

      const caller = orgRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
        posthog: null,
      });

      const result = await caller.updateOrgSettings({
        orgId: mockOrgId,
        name: 'Updated Org Name',
      });

      expect(result).toBeDefined();
      expect(mockOrgStore.updateOrg).toHaveBeenCalledWith(mockOrgId, { name: 'Updated Org Name' });
    });

    it('should deny member access to update organization settings', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      const caller = orgRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
        posthog: null,
      });

      await expect(
        caller.updateOrgSettings({
          orgId: mockOrgId,
          name: 'Updated Org Name',
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should deny viewer access to update organization settings', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('viewer');

      const caller = orgRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
        posthog: null,
      });

      await expect(
        caller.updateOrgSettings({
          orgId: mockOrgId,
          name: 'Updated Org Name',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('updateMemberRole', () => {
    it('should allow owner to update member roles', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('owner');

      mockOrgStore.getUserRole.mockReturnValue('owner');
      mockCanManageMembers.mockReturnValue(true);
      mockCanChangeRole.mockReturnValue(true);
      mockOrgStore.updateMemberRole.mockReturnValue({
        user_id: 'target-user',
        role: 'viewer',
        org_id: mockOrgId,
      });

      const caller = orgRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
        posthog: null,
      });

      const result = await caller.updateMemberRole({
        orgId: mockOrgId,
        userId: 'target-user',
        role: 'viewer',
      });

      expect(result).toBeDefined();
    });

    it('should deny member access to update member roles', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      const caller = orgRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
        posthog: null,
      });

      await expect(
        caller.updateMemberRole({
          orgId: mockOrgId,
          userId: 'target-user',
          role: 'viewer',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('removeMember', () => {
    it('should allow member to remove members', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      mockOrgStore.getUserRole.mockReturnValue('member');
      mockCanManageMembers.mockReturnValue(true);
      mockOrgStore.removeMember.mockReturnValue(true);

      const caller = orgRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
        posthog: null,
      });

      const result = await caller.removeMember({
        orgId: mockOrgId,
        userId: 'target-user',
      });

      expect(result.success).toBe(true);
    });

    it('should deny viewer access to remove members', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('viewer');

      const caller = orgRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
        posthog: null,
      });

      await expect(
        caller.removeMember({
          orgId: mockOrgId,
          userId: 'target-user',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('invite', () => {
    it('should allow member to create invites', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      mockOrgStore.getUserRole.mockReturnValue('member');
      mockCanManageInvites.mockReturnValue(true);
      mockOrgStore.createInvite.mockReturnValue({
        id: 'invite-123',
        org_id: mockOrgId,
        email: 'test@example.com',
        role: 'viewer',
        token: 'mock-token',
        status: 'pending',
        created_by: mockUser.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      const caller = orgRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
        posthog: null,
      });

      const result = await caller.invite({
        orgId: mockOrgId,
        email: 'test@example.com',
        role: 'viewer',
      });

      expect(result).toBeDefined();
    });

    it('should deny viewer access to create invites', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('viewer');

      const caller = orgRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
        posthog: null,
      });

      await expect(
        caller.invite({
          orgId: mockOrgId,
          email: 'test@example.com',
          role: 'viewer',
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});
