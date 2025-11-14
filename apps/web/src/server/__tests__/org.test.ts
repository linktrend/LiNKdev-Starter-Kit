import { describe, it, expect, beforeEach, vi } from 'vitest';
import { orgStore } from '../mocks/org.store';
import { 
  canManageMembers, 
  canManageInvites, 
  canChangeRole, 
  isRoleHigher,
  generateInviteToken,
  isInviteExpired,
  getInviteExpiryDate
} from '@/utils/org';
import { Organization, OrgRole } from '@starter/types';

const buildOrg = (overrides: Partial<Organization> = {}): Organization => ({
  id: 'org-1',
  name: 'Test Org',
  slug: 'test-org',
  org_type: 'business',
  description: null,
  avatar_url: null,
  is_personal: false,
  owner_id: 'user-1',
  settings: {},
  created_at: new Date().toISOString(),
  updated_at: null,
  ...overrides,
});

describe('Organization Store (Offline Mode)', () => {
  beforeEach(() => {
    // Reset store state
    orgStore['store'] = {
      organizations: new Map(),
      members: new Map(),
      invites: new Map(),
      currentOrgId: null,
    };
  });

  describe('Organization Management', () => {
    it('should create organization and add owner as member', () => {
      const org = buildOrg();
      const createdOrg = orgStore.createOrg(org, 'user-1');
      
      expect(createdOrg).toEqual(org);
      expect(orgStore.getOrg('org-1')).toEqual(org);
      expect(orgStore.isUserMember('org-1', 'user-1')).toBe(true);
      expect(orgStore.getUserRole('org-1', 'user-1')).toBe('owner');
    });

    it('should list user organizations', () => {
      const org1 = buildOrg({ id: 'org-1', name: 'Test Org 1', slug: 'test-org-1' });
      const org2 = buildOrg({ id: 'org-2', name: 'Test Org 2', slug: 'test-org-2' });

      orgStore.createOrg(org1, 'user-1');
      orgStore.createOrg(org2, 'user-1');
      orgStore.addMember('org-1', 'user-2', 'viewer');

      const user1Orgs = orgStore.listUserOrgs('user-1');
      const user2Orgs = orgStore.listUserOrgs('user-2');

      expect(user1Orgs).toHaveLength(2);
      expect(user2Orgs).toHaveLength(1);
      expect(user2Orgs[0].id).toBe('org-1');
    });

    it('should set and get current organization', () => {
      const org = buildOrg();

      orgStore.createOrg(org, 'user-1');
      orgStore.setCurrentOrg('org-1');
      
      expect(orgStore.getCurrentOrg()).toEqual(org);
    });
  });

  describe('Member Management', () => {
    beforeEach(() => {
      const org = buildOrg();
      orgStore.createOrg(org, 'user-1');
    });

    it('should add and list members', () => {
      orgStore.addMember('org-1', 'user-2', 'member');
      orgStore.addMember('org-1', 'user-3', 'viewer');

      const members = orgStore.listOrgMembers('org-1');
      expect(members).toHaveLength(3); // owner + 2 added members
      expect(members.some(m => m.user_id === 'user-2' && m.role === 'member')).toBe(true);
    });

    it('should update member role', () => {
      orgStore.addMember('org-1', 'user-2', 'viewer');
      
      const updated = orgStore.updateMemberRole('org-1', 'user-2', 'member');
      expect(updated?.role).toBe('member');
      expect(orgStore.getUserRole('org-1', 'user-2')).toBe('member');
    });

    it('should remove member', () => {
      orgStore.addMember('org-1', 'user-2', 'viewer');
      expect(orgStore.isUserMember('org-1', 'user-2')).toBe(true);
      
      const removed = orgStore.removeMember('org-1', 'user-2');
      expect(removed).toBe(true);
      expect(orgStore.isUserMember('org-1', 'user-2')).toBe(false);
    });
  });

  describe('Invitation System', () => {
    beforeEach(() => {
      const org = buildOrg();
      orgStore.createOrg(org, 'user-1');
    });

    it('should create and list invites', () => {
      const invite = {
        id: 'invite-1',
        org_id: 'org-1',
        email: 'test@example.com',
        role: 'viewer' as OrgRole,
        token: 'test-token',
        status: 'pending' as const,
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      orgStore.createInvite(invite);
      const invites = orgStore.listOrgInvites('org-1');
      
      expect(invites).toHaveLength(1);
      expect(invites[0]).toEqual(invite);
    });

    it('should accept invite and add member', () => {
      const invite = {
        id: 'invite-1',
        org_id: 'org-1',
        email: 'test@example.com',
        role: 'viewer' as OrgRole,
        token: 'test-token',
        status: 'pending' as const,
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      orgStore.createInvite(invite);
      
      const result = orgStore.acceptInvite('test-token', 'user-2');
      expect(result.success).toBe(true);
      expect(result.orgId).toBe('org-1');
      expect(result.role).toBe('viewer');
      expect(orgStore.isUserMember('org-1', 'user-2')).toBe(true);
    });

    it('should revoke invite', () => {
      const invite = {
        id: 'invite-1',
        org_id: 'org-1',
        email: 'test@example.com',
        role: 'viewer' as OrgRole,
        token: 'test-token',
        status: 'pending' as const,
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      orgStore.createInvite(invite);
      expect(orgStore.listOrgInvites('org-1')).toHaveLength(1);
      
      const revoked = orgStore.revokeInvite('invite-1');
      expect(revoked).toBe(true);
      expect(orgStore.listOrgInvites('org-1')).toHaveLength(0);
    });
  });
});

describe('Organization Utilities', () => {
  describe('Role Permissions', () => {
    it('should check member management permissions', () => {
      expect(canManageMembers('owner')).toBe(true);
      expect(canManageMembers('member')).toBe(true);
      expect(canManageMembers('viewer')).toBe(false);
    });

    it('should check invite management permissions', () => {
      expect(canManageInvites('owner')).toBe(true);
      expect(canManageInvites('member')).toBe(true);
      expect(canManageInvites('viewer')).toBe(false);
    });

    it('should check role hierarchy', () => {
      expect(isRoleHigher('owner', 'member')).toBe(true);
      expect(isRoleHigher('member', 'viewer')).toBe(true);
      expect(isRoleHigher('viewer', 'owner')).toBe(false);
      expect(isRoleHigher('member', 'member')).toBe(false);
    });

    it('should check role change permissions', () => {
      // Owner can change any non-owner role
      expect(canChangeRole('member', 'viewer', 'owner')).toBe(true);
      expect(canChangeRole('viewer', 'member', 'owner')).toBe(true);
      expect(canChangeRole('owner', 'member', 'owner')).toBe(false);
      
      // Non-owners cannot manage roles
      expect(canChangeRole('viewer', 'member', 'member')).toBe(false);
      expect(canChangeRole('viewer', 'member', 'viewer')).toBe(false);
    });
  });

  describe('Invite Utilities', () => {
    it('should generate invite token', () => {
      const token = generateInviteToken();
      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should check invite expiry', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      expect(isInviteExpired(futureDate)).toBe(false);
      expect(isInviteExpired(pastDate)).toBe(true);
    });

    it('should generate invite expiry date', () => {
      const expiryDate = getInviteExpiryDate(7);
      const expectedDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      // Allow 1 second difference for execution time
      expect(Math.abs(new Date(expiryDate).getTime() - expectedDate.getTime())).toBeLessThan(1000);
    });
  });
});
