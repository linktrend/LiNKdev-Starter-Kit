/**
 * Tests for Team Router
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { teamRouter } from '../../routers/team';
import { getUserOrgRole, canChangeRole, ROLE_PERMISSIONS } from '../../rbac';

// Mock the RBAC functions
vi.mock('../../rbac', () => ({
  getUserOrgRole: vi.fn(),
  roleIsSufficient: vi.fn((required, user) => {
    const hierarchy = { owner: 3, member: 2, viewer: 1 };
    return hierarchy[user as keyof typeof hierarchy] >= hierarchy[required as keyof typeof hierarchy];
  }),
  canChangeRole: vi.fn(),
  createRBACError: vi.fn((msg) => new TRPCError({ code: 'FORBIDDEN', message: msg })),
  ROLE_PERMISSIONS: {
    owner: ['manage_org', 'manage_members', 'manage_invites', 'manage_billing', 'view_content', 'edit_content'],
    member: ['manage_members', 'manage_invites', 'view_content', 'edit_content'],
    viewer: ['view_content'],
  },
}));

// Mock utilities
const mockGenerateInviteToken = vi.fn(() => 'mock-token-123');
const mockIsInviteExpired = vi.fn(() => false);

global.generateInviteToken = mockGenerateInviteToken;
global.isInviteExpired = mockIsInviteExpired;

// Mock store
const mockTeamStore = {
  inviteMember: vi.fn(),
  listInvites: vi.fn(),
  acceptInvite: vi.fn(),
  revokeInvite: vi.fn(),
  isUserMember: vi.fn(),
  getUserRole: vi.fn(),
};

global.teamStore = mockTeamStore as any;

describe('Team Router', () => {
  const mockUser = { id: '11111111-1111-4111-8111-111111111111', email: 'user@example.com' };
  const mockOrgId = '22222222-2222-4222-8222-222222222222';
  const mockInviteId = '33333333-3333-4333-8333-333333333333';
  const secondInviteId = '33333333-3333-4333-8333-333333333334';
  const otherUserId = '44444444-4444-4444-8444-444444444444';
  const newOwnerId = '55555555-5555-4555-8555-555555555555';

  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TEMPLATE_OFFLINE = '1';

    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        })),
        auth: {
          user: () => ({ id: mockUser.id }),
        },
      })),
    };
  });

  const makeCaller = () =>
    teamRouter.createCaller({
      user: mockUser,
      supabase: mockSupabase,
      orgId: mockOrgId,
    });

  describe('inviteMember', () => {
    it('should create a team invitation', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      const mockInvite = {
        id: mockInviteId,
        org_id: mockOrgId,
        email: 'newuser@example.com',
        role: 'viewer',
        invited_by: mockUser.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      mockTeamStore.inviteMember.mockReturnValue(mockInvite);

      const caller = makeCaller();

      const result = await caller.inviteMember({
        orgId: mockOrgId,
        email: 'newuser@example.com',
        role: 'viewer',
      });

      expect(result.email).toBe('newuser@example.com');
      expect(result.role).toBe('viewer');
      expect(mockTeamStore.inviteMember).toHaveBeenCalledWith(
        mockOrgId,
        'newuser@example.com',
        'viewer',
        mockUser.id
      );
    });

    it('should deny access to viewers', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('viewer');

      const caller = makeCaller();

      await expect(
        caller.inviteMember({
          orgId: mockOrgId,
          email: 'newuser@example.com',
          role: 'viewer',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('listInvites', () => {
    it('should list pending invitations', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      const mockInvites = [
        {
          id: mockInviteId,
          org_id: mockOrgId,
          email: 'user1@example.com',
          role: 'member',
          invited_by: mockUser.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        {
          id: secondInviteId,
          org_id: mockOrgId,
          email: 'user2@example.com',
          role: 'viewer',
          invited_by: mockUser.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ];

      mockTeamStore.listInvites.mockReturnValue(mockInvites);

      const caller = makeCaller();

      const result = await caller.listInvites({ orgId: mockOrgId });

      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user1@example.com');
      expect(mockTeamStore.listInvites).toHaveBeenCalledWith(mockOrgId);
    });

    it('should deny access to non-members', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue(null);

      const caller = makeCaller();

      await expect(
        caller.listInvites({ orgId: mockOrgId })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('acceptInvite', () => {
    it('should accept a valid invitation', async () => {
      mockTeamStore.acceptInvite.mockReturnValue({
        success: true,
        orgId: mockOrgId,
        role: 'member',
      });

      const caller = makeCaller();

      const result = await caller.acceptInvite({ token: 'valid-token' });

      expect(result.success).toBe(true);
      expect(result.orgId).toBe(mockOrgId);
      expect(result.role).toBe('member');
      expect(mockTeamStore.acceptInvite).toHaveBeenCalledWith(
        'valid-token',
        mockUser.id,
        mockUser.email
      );
    });

    it('should reject invalid token', async () => {
      mockTeamStore.acceptInvite.mockReturnValue({
        success: false,
        orgId: '',
        role: '',
      });

      const caller = makeCaller();

      await expect(
        caller.acceptInvite({ token: 'invalid-token' })
      ).rejects.toThrow('Invalid or expired invitation');
    });
  });

  describe('revokeInvite', () => {
    it('should revoke an invitation', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      mockTeamStore.revokeInvite.mockReturnValue(true);

      const caller = makeCaller();

      const result = await caller.revokeInvite({
        inviteId: mockInviteId,
        orgId: mockOrgId,
      });

      expect(result.success).toBe(true);
      expect(mockTeamStore.revokeInvite).toHaveBeenCalledWith(mockInviteId, mockOrgId);
    });

    it('should deny access to viewers', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('viewer');

      const caller = makeCaller();

      await expect(
        caller.revokeInvite({
          inviteId: mockInviteId,
          orgId: mockOrgId,
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('updateMemberRole', () => {
    it('should update a member role (owner only)', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('owner');

      const mockCanChangeRole = vi.mocked(canChangeRole);
      mockCanChangeRole.mockReturnValue(true);

      mockTeamStore.getUserRole.mockReturnValue('member');

      const caller = makeCaller();

      const result = await caller.updateMemberRole({
        orgId: mockOrgId,
        userId: otherUserId,
        role: 'viewer',
      });

      expect(result.success).toBe(true);
    });

    it('should prevent changing own role', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('owner');

      const caller = makeCaller();

      await expect(
        caller.updateMemberRole({
          orgId: mockOrgId,
          userId: mockUser.id,
          role: 'member',
        })
      ).rejects.toThrow('You cannot change your own role');
    });

    it('should deny access to non-owners', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      const caller = makeCaller();

      await expect(
        caller.updateMemberRole({
          orgId: mockOrgId,
          userId: otherUserId,
          role: 'viewer',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('transferOwnership', () => {
    it('should transfer ownership to another member', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('owner');

      mockTeamStore.isUserMember.mockReturnValue(true);

      const caller = makeCaller();

      const result = await caller.transferOwnership({
        orgId: mockOrgId,
        newOwnerId,
      });

      expect(result.success).toBe(true);
      expect(mockTeamStore.isUserMember).toHaveBeenCalledWith(mockOrgId, newOwnerId);
    });

    it('should prevent transferring to self', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('owner');

      const caller = makeCaller();

      await expect(
        caller.transferOwnership({
          orgId: mockOrgId,
          newOwnerId: mockUser.id,
        })
      ).rejects.toThrow('You are already the owner');
    });

    it('should prevent transferring to non-member', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('owner');

      mockTeamStore.isUserMember.mockReturnValue(false);

      const caller = makeCaller();

      await expect(
        caller.transferOwnership({
          orgId: mockOrgId,
          newOwnerId: otherUserId,
        })
      ).rejects.toThrow('Target user is not a member of this organization');
    });

    it('should deny access to non-owners', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      const caller = makeCaller();

      await expect(
        caller.transferOwnership({
          orgId: mockOrgId,
          newOwnerId,
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('listAvailableRoles', () => {
    it('should return list of available roles', async () => {
      const caller = makeCaller();

      const result = await caller.listAvailableRoles();

      expect(result.roles).toHaveLength(3);
      expect(result.roles[0].id).toBe('owner');
      expect(result.roles[1].id).toBe('member');
      expect(result.roles[2].id).toBe('viewer');
      expect(result.roles[0].permissions).toEqual(ROLE_PERMISSIONS.owner);
    });
  });
});
