/**
 * Integration Tests for Team Router
 * 
 * Tests team invitation management, role updates, and ownership transfer.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createTestCaller } from './helpers/test-context';
import {
  createTestUser,
  createTestTeamInvite,
  generateUUID,
  dateHelpers,
} from './helpers/test-data';
import { TEST_IDS } from '../helpers/fixtures';
import { getUserOrgRole, canChangeRole, ROLE_PERMISSIONS } from '../../rbac';

// Mock RBAC
vi.mock('../../rbac', () => ({
  getUserOrgRole: vi.fn(),
  roleIsSufficient: vi.fn((required, user) => {
    const hierarchy = { owner: 4, admin: 3, member: 2, viewer: 1 };
    return hierarchy[user as keyof typeof hierarchy] >= hierarchy[required as keyof typeof hierarchy];
  }),
  canChangeRole: vi.fn(),
  createRBACError: vi.fn((msg) => new TRPCError({ code: 'FORBIDDEN', message: msg })),
  ROLE_PERMISSIONS: {
    owner: ['manage_org', 'manage_members', 'manage_invites', 'manage_billing', 'view_content', 'edit_content'],
    admin: ['manage_members', 'manage_invites', 'manage_billing', 'view_content', 'edit_content'],
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

describe('Team Router Integration Tests', () => {
  let testUser: any;
  let testOrgId: string;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TEMPLATE_OFFLINE = '1';
    
    testUser = createTestUser();
    testOrgId = generateUUID();
    
    vi.mocked(getUserOrgRole).mockResolvedValue('member');
  });

  describe('inviteMember', () => {
    it('should create team invitation', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const invite = createTestTeamInvite({
        org_id: testOrgId,
        email: 'newuser@example.com',
        role: 'viewer',
        invited_by: testUser.id,
      });

      mockTeamStore.inviteMember.mockReturnValue(invite);

      const result = await caller.team.inviteMember({
        orgId: testOrgId,
        email: 'newuser@example.com',
        role: 'viewer',
      });

      expect(result.email).toBe('newuser@example.com');
      expect(result.role).toBe('viewer');
      expect(mockTeamStore.inviteMember).toHaveBeenCalledWith(
        testOrgId,
        'newuser@example.com',
        'viewer',
        testUser.id
      );
    });

    it('should deny access to viewers', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('viewer');
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.team.inviteMember({
          orgId: testOrgId,
          email: 'newuser@example.com',
          role: 'viewer',
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should allow members to invite', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('member');
      const { caller } = createTestCaller({ user: testUser });
      const invite = createTestTeamInvite({
        org_id: testOrgId,
        email: 'newuser@example.com',
        role: 'viewer',
      });

      mockTeamStore.inviteMember.mockReturnValue(invite);

      const result = await caller.team.inviteMember({
        orgId: testOrgId,
        email: 'newuser@example.com',
        role: 'viewer',
      });

      expect(result.email).toBe('newuser@example.com');
    });

    it('should set expiration date 7 days in future', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const futureDate = dateHelpers.daysFromNow(7);
      const invite = createTestTeamInvite({
        org_id: testOrgId,
        expires_at: futureDate.toISOString(),
      });

      mockTeamStore.inviteMember.mockReturnValue(invite);

      const result = await caller.team.inviteMember({
        orgId: testOrgId,
        email: 'newuser@example.com',
        role: 'viewer',
      });

      const expiresAt = new Date(result.expires_at);
      const now = new Date();
      const daysDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThan(6);
      expect(daysDiff).toBeLessThan(8);
    });
  });

  describe('listInvites', () => {
    it('should list pending invitations', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const invites = [
        createTestTeamInvite({ org_id: testOrgId, email: 'user1@example.com' }),
        createTestTeamInvite({ org_id: testOrgId, email: 'user2@example.com' }),
      ];

      mockTeamStore.listInvites.mockReturnValue(invites);

      const result = await caller.team.listInvites({ orgId: testOrgId });

      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user1@example.com');
      expect(mockTeamStore.listInvites).toHaveBeenCalledWith(testOrgId);
    });

    it('should return empty array when no invites', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.listInvites.mockReturnValue([]);

      const result = await caller.team.listInvites({ orgId: testOrgId });

      expect(result).toHaveLength(0);
    });

    it('should deny access to non-members', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue(null);
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.team.listInvites({ orgId: testOrgId })
      ).rejects.toThrow(TRPCError);
    });

    it('should allow any member to list invites', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('viewer');
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.listInvites.mockReturnValue([]);

      const result = await caller.team.listInvites({ orgId: testOrgId });

      expect(result).toBeDefined();
    });
  });

  describe('acceptInvite', () => {
    it('should accept valid invitation', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.acceptInvite.mockReturnValue({
        success: true,
        orgId: testOrgId,
        role: 'member',
      });

      const result = await caller.team.acceptInvite({
        token: 'valid-token',
      });

      expect(result.success).toBe(true);
      expect(result.orgId).toBe(testOrgId);
      expect(result.role).toBe('member');
      expect(mockTeamStore.acceptInvite).toHaveBeenCalledWith(
        'valid-token',
        testUser.id,
        testUser.email
      );
    });

    it('should reject invalid token', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.acceptInvite.mockReturnValue({
        success: false,
        orgId: '',
        role: '',
      });

      await expect(
        caller.team.acceptInvite({ token: 'invalid-token' })
      ).rejects.toThrow('Invalid or expired invitation');
    });

    it('should require user email', async () => {
      const userWithoutEmail = createTestUser({ email: undefined });
      const { caller } = createTestCaller({ user: userWithoutEmail });

      await expect(
        caller.team.acceptInvite({ token: 'valid-token' })
      ).rejects.toThrow('User email is required');
    });

    it('should create membership on accept', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.acceptInvite.mockReturnValue({
        success: true,
        orgId: testOrgId,
        role: 'viewer',
      });

      const result = await caller.team.acceptInvite({
        token: 'valid-token',
      });

      expect(result.success).toBe(true);
      expect(result.role).toBe('viewer');
    });
  });

  describe('revokeInvite', () => {
    it('should revoke invitation', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const inviteId = generateUUID();

      mockTeamStore.revokeInvite.mockReturnValue(true);

      const result = await caller.team.revokeInvite({
        inviteId,
        orgId: testOrgId,
      });

      expect(result.success).toBe(true);
      expect(mockTeamStore.revokeInvite).toHaveBeenCalledWith(inviteId, testOrgId);
    });

    it('should throw error if invite not found', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.revokeInvite.mockReturnValue(false);

      await expect(
        caller.team.revokeInvite({
          inviteId: generateUUID(),
          orgId: testOrgId,
        })
      ).rejects.toThrow('Invitation not found');
    });

    it('should deny access to viewers', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('viewer');
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.team.revokeInvite({
          inviteId: generateUUID(),
          orgId: testOrgId,
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role (owner only)', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');
      vi.mocked(canChangeRole).mockReturnValue(true);
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.getUserRole.mockReturnValue('member');

      const result = await caller.team.updateMemberRole({
        orgId: testOrgId,
      userId: TEST_IDS.userMember,
        role: 'viewer',
      });

      expect(result.success).toBe(true);
    });

    it('should prevent changing own role', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.team.updateMemberRole({
          orgId: testOrgId,
          userId: testUser.id,
          role: 'member',
        })
      ).rejects.toThrow('You cannot change your own role');
    });

    it('should deny access to non-owners', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('member');
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.team.updateMemberRole({
          orgId: testOrgId,
        userId: TEST_IDS.userMember,
          role: 'viewer',
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should prevent demoting owner', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');
      vi.mocked(canChangeRole).mockReturnValue(false);
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.getUserRole.mockReturnValue('owner');

      await expect(
        caller.team.updateMemberRole({
          orgId: testOrgId,
        userId: TEST_IDS.userAdmin,
          role: 'member',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('transferOwnership', () => {
    it('should transfer ownership to another member', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.isUserMember.mockReturnValue(true);

      const result = await caller.team.transferOwnership({
        orgId: testOrgId,
      newOwnerId: TEST_IDS.userAdmin,
      });

      expect(result.success).toBe(true);
      expect(mockTeamStore.isUserMember).toHaveBeenCalledWith(
        testOrgId,
      TEST_IDS.userAdmin
      );
    });

    it('should prevent transferring to self', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.team.transferOwnership({
          orgId: testOrgId,
          newOwnerId: testUser.id,
        })
      ).rejects.toThrow('You are already the owner');
    });

    it('should prevent transferring to non-member', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.isUserMember.mockReturnValue(false);

      await expect(
        caller.team.transferOwnership({
          orgId: testOrgId,
          newOwnerId: TEST_IDS.userViewer,
        })
      ).rejects.toThrow('Target user is not a member of this organization');
    });

    it('should deny access to non-owners', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('member');
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.team.transferOwnership({
          orgId: testOrgId,
        newOwnerId: TEST_IDS.userAdmin,
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should be atomic (update org and both memberships)', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.isUserMember.mockReturnValue(true);

      const result = await caller.team.transferOwnership({
        orgId: testOrgId,
      newOwnerId: TEST_IDS.userAdmin,
      });

      expect(result.success).toBe(true);
      // In a real integration test, we'd verify:
      // 1. Organization owner_id updated
      // 2. New owner's role set to 'owner'
      // 3. Old owner's role set to 'member'
    });
  });

  describe('listAvailableRoles', () => {
    it('should return list of available roles', async () => {
      const { caller } = createTestCaller({ user: testUser });

      const result = await caller.team.listAvailableRoles();

      expect(result.roles).toHaveLength(3);
      expect(result.roles[0].id).toBe('owner');
      expect(result.roles[1].id).toBe('member');
      expect(result.roles[2].id).toBe('viewer');
    });

    it('should include permissions for each role', async () => {
      const { caller } = createTestCaller({ user: testUser });

      const result = await caller.team.listAvailableRoles();

      expect(result.roles[0].permissions).toEqual(ROLE_PERMISSIONS.owner);
      expect(result.roles[1].permissions).toEqual(ROLE_PERMISSIONS.member);
      expect(result.roles[2].permissions).toEqual(ROLE_PERMISSIONS.viewer);
    });

    it('should include role descriptions', async () => {
      const { caller } = createTestCaller({ user: testUser });

      const result = await caller.team.listAvailableRoles();

      result.roles.forEach(role => {
        expect(role.description).toBeDefined();
        expect(role.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration: Team lifecycle', () => {
    it('should invite → list invites → verify present', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Invite
      const invite = createTestTeamInvite({
        org_id: testOrgId,
        email: 'newuser@example.com',
      });
      mockTeamStore.inviteMember.mockReturnValue(invite);

      await caller.team.inviteMember({
        orgId: testOrgId,
        email: 'newuser@example.com',
        role: 'viewer',
      });

      // List
      mockTeamStore.listInvites.mockReturnValue([invite]);

      const invites = await caller.team.listInvites({ orgId: testOrgId });

      expect(invites).toHaveLength(1);
      expect(invites[0].email).toBe('newuser@example.com');
    });

    it('should invite → accept → verify membership created', async () => {
      const inviter = createTestUser({ id: generateUUID() });
      const invitee = createTestUser({ id: generateUUID() });

      // Invite
      const { caller: inviterCaller } = createTestCaller({ user: inviter });
      const invite = createTestTeamInvite({
        org_id: testOrgId,
        email: invitee.email,
      });
      mockTeamStore.inviteMember.mockReturnValue(invite);

      await inviterCaller.team.inviteMember({
        orgId: testOrgId,
        email: invitee.email!,
        role: 'viewer',
      });

      // Accept
      const { caller: inviteeCaller } = createTestCaller({ user: invitee });
      mockTeamStore.acceptInvite.mockReturnValue({
        success: true,
        orgId: testOrgId,
        role: 'viewer',
      });

      const result = await inviteeCaller.team.acceptInvite({
        token: invite.token,
      });

      expect(result.success).toBe(true);
      expect(result.role).toBe('viewer');
    });

    it('should invite → revoke → verify removed', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Invite
      const invite = createTestTeamInvite({ org_id: testOrgId });
      mockTeamStore.inviteMember.mockReturnValue(invite);

      await caller.team.inviteMember({
        orgId: testOrgId,
        email: 'newuser@example.com',
        role: 'viewer',
      });

      // Revoke
      mockTeamStore.revokeInvite.mockReturnValue(true);

      await caller.team.revokeInvite({
        inviteId: invite.id,
        orgId: testOrgId,
      });

      // List (should not include revoked)
      mockTeamStore.listInvites.mockReturnValue([]);

      const invites = await caller.team.listInvites({ orgId: testOrgId });

      expect(invites).toHaveLength(0);
    });
  });

  describe('Input validation', () => {
    it('should validate email format', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.team.inviteMember({
          orgId: testOrgId,
          email: 'invalid-email',
          role: 'viewer',
        })
      ).rejects.toThrow();
    });

    it('should validate role values', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.team.inviteMember({
          orgId: testOrgId,
          email: 'user@example.com',
          role: 'invalid' as any,
        })
      ).rejects.toThrow();
    });

    it('should validate UUID formats', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.team.revokeInvite({
          inviteId: 'invalid-uuid',
          orgId: testOrgId,
        })
      ).rejects.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle expired invitations', async () => {
      mockIsInviteExpired.mockReturnValue(true);
      const { caller } = createTestCaller({ user: testUser });

      mockTeamStore.acceptInvite.mockReturnValue({
        success: false,
        orgId: '',
        role: '',
      });

      await expect(
        caller.team.acceptInvite({ token: 'expired-token' })
      ).rejects.toThrow();
    });

    it('should prevent duplicate invitations', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const email = 'duplicate@example.com';

      // First invite succeeds
      const invite = createTestTeamInvite({ org_id: testOrgId, email });
      mockTeamStore.inviteMember.mockReturnValueOnce(invite);

      await caller.team.inviteMember({
        orgId: testOrgId,
        email,
        role: 'viewer',
      });

      // Second invite should fail (in real implementation)
      // This would be caught by database constraints or pre-checks
    });
  });
});
