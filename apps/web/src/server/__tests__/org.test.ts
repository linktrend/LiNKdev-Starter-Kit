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
import { OrgRole } from '@/types/org';

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
      const org = {
        id: 'org-1',
        name: 'Test Org',
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
      };

      const createdOrg = orgStore.createOrg(org, 'user-1');
      
      expect(createdOrg).toEqual(org);
      expect(orgStore.getOrg('org-1')).toEqual(org);
      expect(orgStore.isUserMember('org-1', 'user-1')).toBe(true);
      expect(orgStore.getUserRole('org-1', 'user-1')).toBe('owner');
    });

    it('should list user organizations', () => {
      const org1 = {
        id: 'org-1',
        name: 'Test Org 1',
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
      };
      const org2 = {
        id: 'org-2',
        name: 'Test Org 2',
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
      };

      orgStore.createOrg(org1, 'user-1');
      orgStore.createOrg(org2, 'user-1');
      orgStore.addMember('org-1', 'user-2', 'editor');

      const user1Orgs = orgStore.listUserOrgs('user-1');
      const user2Orgs = orgStore.listUserOrgs('user-2');

      expect(user1Orgs).toHaveLength(2);
      expect(user2Orgs).toHaveLength(1);
      expect(user2Orgs[0].id).toBe('org-1');
    });

    it('should set and get current organization', () => {
      const org = {
        id: 'org-1',
        name: 'Test Org',
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
      };

      orgStore.createOrg(org, 'user-1');
      orgStore.setCurrentOrg('org-1');
      
      expect(orgStore.getCurrentOrg()).toEqual(org);
    });
  });

  describe('Member Management', () => {
    beforeEach(() => {
      const org = {
        id: 'org-1',
        name: 'Test Org',
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
      };
      orgStore.createOrg(org, 'user-1');
    });

    it('should add and list members', () => {
      orgStore.addMember('org-1', 'user-2', 'admin');
      orgStore.addMember('org-1', 'user-3', 'editor');

      const members = orgStore.listOrgMembers('org-1');
      expect(members).toHaveLength(3); // owner + 2 added members
      expect(members.some(m => m.user_id === 'user-2' && m.role === 'admin')).toBe(true);
    });

    it('should update member role', () => {
      orgStore.addMember('org-1', 'user-2', 'editor');
      
      const updated = orgStore.updateMemberRole('org-1', 'user-2', 'admin');
      expect(updated?.role).toBe('admin');
      expect(orgStore.getUserRole('org-1', 'user-2')).toBe('admin');
    });

    it('should remove member', () => {
      orgStore.addMember('org-1', 'user-2', 'editor');
      expect(orgStore.isUserMember('org-1', 'user-2')).toBe(true);
      
      const removed = orgStore.removeMember('org-1', 'user-2');
      expect(removed).toBe(true);
      expect(orgStore.isUserMember('org-1', 'user-2')).toBe(false);
    });
  });

  describe('Invitation System', () => {
    beforeEach(() => {
      const org = {
        id: 'org-1',
        name: 'Test Org',
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
      };
      orgStore.createOrg(org, 'user-1');
    });

    it('should create and list invites', () => {
      const invite = {
        id: 'invite-1',
        org_id: 'org-1',
        email: 'test@example.com',
        role: 'editor' as OrgRole,
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
        role: 'editor' as OrgRole,
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
      expect(result.role).toBe('editor');
      expect(orgStore.isUserMember('org-1', 'user-2')).toBe(true);
    });

    it('should revoke invite', () => {
      const invite = {
        id: 'invite-1',
        org_id: 'org-1',
        email: 'test@example.com',
        role: 'editor' as OrgRole,
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
      expect(canManageMembers('admin')).toBe(true);
      expect(canManageMembers('editor')).toBe(false);
      expect(canManageMembers('viewer')).toBe(false);
    });

    it('should check invite management permissions', () => {
      expect(canManageInvites('owner')).toBe(true);
      expect(canManageInvites('admin')).toBe(true);
      expect(canManageInvites('editor')).toBe(false);
      expect(canManageInvites('viewer')).toBe(false);
    });

    it('should check role hierarchy', () => {
      expect(isRoleHigher('owner', 'admin')).toBe(true);
      expect(isRoleHigher('admin', 'editor')).toBe(true);
      expect(isRoleHigher('editor', 'viewer')).toBe(true);
      expect(isRoleHigher('viewer', 'owner')).toBe(false);
      expect(isRoleHigher('admin', 'admin')).toBe(false);
    });

    it('should check role change permissions', () => {
      // Owner can change any role except owner
      expect(canChangeRole('admin', 'editor', 'owner')).toBe(true);
      expect(canChangeRole('editor', 'admin', 'owner')).toBe(true);
      expect(canChangeRole('owner', 'admin', 'owner')).toBe(false);
      
      // Admin can change editor/viewer roles
      expect(canChangeRole('editor', 'viewer', 'admin')).toBe(true);
      expect(canChangeRole('viewer', 'editor', 'admin')).toBe(true);
      expect(canChangeRole('admin', 'editor', 'admin')).toBe(false);
      
      // Editor cannot change roles
      expect(canChangeRole('viewer', 'editor', 'editor')).toBe(false);
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
