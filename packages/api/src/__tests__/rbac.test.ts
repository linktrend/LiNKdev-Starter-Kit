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
      expect(roleIsSufficient('viewer', 'editor')).toBe(true);
      expect(roleIsSufficient('viewer', 'viewer')).toBe(true);
      expect(roleIsSufficient('editor', 'owner')).toBe(true);
      expect(roleIsSufficient('admin', 'owner')).toBe(true);
    });

    it('should return false when user role is insufficient', () => {
      expect(roleIsSufficient('admin', 'editor')).toBe(false);
      expect(roleIsSufficient('owner', 'admin')).toBe(false);
    });

    it('should return false when user role is null', () => {
      expect(roleIsSufficient('viewer', null)).toBe(false);
      expect(roleIsSufficient('admin', null)).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', () => {
      expect(hasPermission('owner', 'manage_org')).toBe(true);
      expect(hasPermission('admin', 'manage_members')).toBe(true);
      expect(hasPermission('admin', 'manage_invites')).toBe(true);
      expect(hasPermission('editor', 'edit_content')).toBe(true);
      expect(hasPermission('viewer', 'view_content')).toBe(true);
    });

    it('should return false when user lacks permission', () => {
      expect(hasPermission('editor', 'manage_org')).toBe(false);
      expect(hasPermission('viewer', 'manage_members')).toBe(false);
      expect(hasPermission('viewer', 'edit_content')).toBe(false);
    });

    it('should return false when user role is null', () => {
      expect(hasPermission(null, 'view_content')).toBe(false);
    });
  });

  describe('isRoleHigher', () => {
    it('should correctly compare role hierarchy', () => {
      expect(isRoleHigher('owner', 'admin')).toBe(true);
      expect(isRoleHigher('admin', 'editor')).toBe(true);
      expect(isRoleHigher('editor', 'viewer')).toBe(true);
      expect(isRoleHigher('owner', 'viewer')).toBe(true);
    });

    it('should return false for equal or lower roles', () => {
      expect(isRoleHigher('admin', 'admin')).toBe(false);
      expect(isRoleHigher('editor', 'owner')).toBe(false);
      expect(isRoleHigher('viewer', 'admin')).toBe(false);
    });
  });

  describe('canManageMembers', () => {
    it('should return true for owner and admin', () => {
      expect(canManageMembers('owner')).toBe(true);
      expect(canManageMembers('admin')).toBe(true);
    });

    it('should return false for viewer', () => {
      expect(canManageMembers('viewer')).toBe(false);
    });

    it('should return false for null role', () => {
      expect(canManageMembers(null)).toBe(false);
    });
  });

  describe('canManageInvites', () => {
    it('should return true for owner and admin', () => {
      expect(canManageInvites('owner')).toBe(true);
      expect(canManageInvites('admin')).toBe(true);
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
    it('should return true for owner and admin', () => {
      expect(canManageBilling('owner')).toBe(true);
      expect(canManageBilling('admin')).toBe(true);
    });

    it('should return false for editor and viewer', () => {
      expect(canManageBilling('editor')).toBe(false);
      expect(canManageBilling('viewer')).toBe(false);
    });
  });

  describe('canChangeRole', () => {
    it('should allow owner to change non-owner roles', () => {
      expect(canChangeRole('admin', 'viewer', 'owner')).toBe(true);
      expect(canChangeRole('editor', 'admin', 'owner')).toBe(true);
      expect(canChangeRole('owner', 'member', 'owner')).toBe(false);
    });

    it('should not allow members or viewers to change roles', () => {
      expect(canChangeRole('viewer', 'admin', 'admin' as OrgRole)).toBe(false);
      expect(canChangeRole('editor', 'admin', 'admin' as OrgRole)).toBe(false);
    });

    it('should return false for null actor role', () => {
      expect(canChangeRole('viewer', 'admin', null)).toBe(false);
    });
  });

  describe('Role Hierarchy Constants', () => {
    it('should have correct hierarchy values', () => {
      expect(ROLE_HIERARCHY.owner).toBe(4);
      expect(ROLE_HIERARCHY.admin).toBe(3);
      expect(ROLE_HIERARCHY.editor).toBe(2);
      expect(ROLE_HIERARCHY.viewer).toBe(1);
    });
  });

  describe('Role Permissions Constants', () => {
    it('should have correct permissions for each role', () => {
      expect(ROLE_PERMISSIONS.owner).toContain('manage_org');
      expect(ROLE_PERMISSIONS.owner).toContain('manage_members');
      expect(ROLE_PERMISSIONS.owner).toContain('manage_invites');
      expect(ROLE_PERMISSIONS.owner).toContain('manage_billing');

      expect(ROLE_PERMISSIONS.admin).toContain('manage_members');
      expect(ROLE_PERMISSIONS.admin).toContain('manage_invites');
      expect(ROLE_PERMISSIONS.admin).toContain('manage_billing');
      expect(ROLE_PERMISSIONS.admin).not.toContain('manage_org');

      expect(ROLE_PERMISSIONS.editor).toContain('edit_content');
      expect(ROLE_PERMISSIONS.viewer).toContain('view_content');
      expect(ROLE_PERMISSIONS.viewer).not.toContain('edit_content');
    });
  });
});
