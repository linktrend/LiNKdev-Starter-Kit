/**
 * Tests for Role-Based Access Control (RBAC) utilities
 */

import { describe, it, expect } from 'vitest';
import {
  roleIsSufficient,
  hasPermission,
  isRoleHigher,
  canManageMembers,
  canManageInvites,
  canManageOrg,
  canManageBilling,
  canChangeRole,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
} from '../rbac';
import { OrgRole } from '@starter/types';

describe('RBAC Utilities', () => {
  describe('roleIsSufficient', () => {
    it('should return true when user role is sufficient', () => {
      expect(roleIsSufficient('viewer', 'owner')).toBe(true);
      expect(roleIsSufficient('viewer', 'member')).toBe(true);
      expect(roleIsSufficient('viewer', 'viewer')).toBe(true);
      expect(roleIsSufficient('member', 'owner')).toBe(true);
      expect(roleIsSufficient('member', 'member')).toBe(true);
    });

    it('should return false when user role is insufficient', () => {
      expect(roleIsSufficient('member', 'viewer')).toBe(false);
      expect(roleIsSufficient('owner', 'member')).toBe(false);
    });

    it('should return false when user role is null', () => {
      expect(roleIsSufficient('viewer', null)).toBe(false);
      expect(roleIsSufficient('member', null)).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', () => {
      expect(hasPermission('owner', 'manage_org')).toBe(true);
      expect(hasPermission('member', 'manage_members')).toBe(true);
      expect(hasPermission('member', 'edit_content')).toBe(true);
      expect(hasPermission('viewer', 'view_content')).toBe(true);
    });

    it('should return false when user lacks permission', () => {
      expect(hasPermission('member', 'manage_org')).toBe(false);
      expect(hasPermission('viewer', 'manage_members')).toBe(false);
      expect(hasPermission('viewer', 'edit_content')).toBe(false);
    });

    it('should return false when user role is null', () => {
      expect(hasPermission(null, 'view_content')).toBe(false);
    });
  });

  describe('isRoleHigher', () => {
    it('should correctly compare role hierarchy', () => {
      expect(isRoleHigher('owner', 'member')).toBe(true);
      expect(isRoleHigher('member', 'viewer')).toBe(true);
      expect(isRoleHigher('owner', 'viewer')).toBe(true);
    });

    it('should return false for equal or lower roles', () => {
      expect(isRoleHigher('member', 'member')).toBe(false);
      expect(isRoleHigher('member', 'owner')).toBe(false);
      expect(isRoleHigher('viewer', 'member')).toBe(false);
    });
  });

  describe('canManageMembers', () => {
    it('should return true for owner and member', () => {
      expect(canManageMembers('owner')).toBe(true);
      expect(canManageMembers('member')).toBe(true);
    });

    it('should return false for viewer', () => {
      expect(canManageMembers('viewer')).toBe(false);
    });

    it('should return false for null role', () => {
      expect(canManageMembers(null)).toBe(false);
    });
  });

  describe('canManageInvites', () => {
    it('should return true for owner and member', () => {
      expect(canManageInvites('owner')).toBe(true);
      expect(canManageInvites('member')).toBe(true);
    });

    it('should return false for viewer', () => {
      expect(canManageInvites('viewer')).toBe(false);
    });
  });

  describe('canManageOrg', () => {
    it('should return true only for owner', () => {
      expect(canManageOrg('owner')).toBe(true);
    });

    it('should return false for other roles', () => {
      expect(canManageOrg('member')).toBe(false);
      expect(canManageOrg('viewer')).toBe(false);
      expect(canManageOrg(null)).toBe(false);
    });
  });

  describe('canManageBilling', () => {
    it('should return true only for owner', () => {
      expect(canManageBilling('owner')).toBe(true);
    });

    it('should return false for member and viewer', () => {
      expect(canManageBilling('member')).toBe(false);
      expect(canManageBilling('viewer')).toBe(false);
    });
  });

  describe('canChangeRole', () => {
    it('should allow owner to change non-owner roles', () => {
      expect(canChangeRole('member', 'viewer', 'owner')).toBe(true);
      expect(canChangeRole('viewer', 'member', 'owner')).toBe(true);
      expect(canChangeRole('owner', 'member', 'owner')).toBe(false);
    });

    it('should not allow members or viewers to change roles', () => {
      expect(canChangeRole('viewer', 'member', 'member')).toBe(false);
      expect(canChangeRole('viewer', 'member', 'viewer')).toBe(false);
    });

    it('should return false for null actor role', () => {
      expect(canChangeRole('viewer', 'member', null)).toBe(false);
    });
  });

  describe('Role Hierarchy Constants', () => {
    it('should have correct hierarchy values', () => {
      expect(ROLE_HIERARCHY.owner).toBe(3);
      expect(ROLE_HIERARCHY.member).toBe(2);
      expect(ROLE_HIERARCHY.viewer).toBe(1);
    });
  });

  describe('Role Permissions Constants', () => {
    it('should have correct permissions for each role', () => {
      expect(ROLE_PERMISSIONS.owner).toContain('manage_org');
      expect(ROLE_PERMISSIONS.owner).toContain('manage_members');
      expect(ROLE_PERMISSIONS.owner).toContain('manage_invites');
      expect(ROLE_PERMISSIONS.owner).toContain('manage_billing');

      expect(ROLE_PERMISSIONS.member).toContain('manage_members');
      expect(ROLE_PERMISSIONS.member).toContain('manage_invites');
      expect(ROLE_PERMISSIONS.member).not.toContain('manage_org');

      expect(ROLE_PERMISSIONS.viewer).toContain('view_content');
      expect(ROLE_PERMISSIONS.viewer).not.toContain('edit_content');
    });
  });
});
