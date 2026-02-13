import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  isRoleHigher,
  roleIsSufficient,
  canManageSecurity,
  canViewAudit,
  canManageSessions,
  canManageMembers,
  canManageInvites,
  canManageOrg,
  canChangeRole,
  canRemoveMember,
  canRevokeSession,
  canAssignRole,
  validateRoleTransition,
  getRolePermissions,
  getRoleDisplayName,
  getRoleDescription,
  getAssignableRoles,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
} from '@/lib/security/permissions';
import type { OrgRole } from '@starter/types';

describe('Permission System', () => {
  describe('hasPermission', () => {
    it('should return true for valid role permissions', () => {
      expect(hasPermission('owner', 'manage_org')).toBe(true);
      expect(hasPermission('admin', 'manage_members')).toBe(true);
      expect(hasPermission('editor', 'edit_content')).toBe(true);
      expect(hasPermission('viewer', 'view_content')).toBe(true);
    });

    it('should return false for invalid role permissions', () => {
      expect(hasPermission('viewer', 'manage_org')).toBe(false);
      expect(hasPermission('editor', 'manage_members')).toBe(false);
      expect(hasPermission('admin', 'manage_org')).toBe(false);
    });

    it('should return false for null role', () => {
      expect(hasPermission(null, 'manage_org')).toBe(false);
    });
  });

  describe('Role Hierarchy', () => {
    it('should correctly compare role hierarchy', () => {
      expect(isRoleHigher('owner', 'admin')).toBe(true);
      expect(isRoleHigher('admin', 'editor')).toBe(true);
      expect(isRoleHigher('editor', 'viewer')).toBe(true);
      expect(isRoleHigher('viewer', 'owner')).toBe(false);
    });

    it('should check if role is sufficient', () => {
      expect(roleIsSufficient('viewer', 'owner')).toBe(true);
      expect(roleIsSufficient('admin', 'owner')).toBe(true);
      expect(roleIsSufficient('owner', 'admin')).toBe(false);
      expect(roleIsSufficient('editor', 'viewer')).toBe(false);
    });

    it('should return false for null role in roleIsSufficient', () => {
      expect(roleIsSufficient('viewer', null)).toBe(false);
    });
  });

  describe('Security Management Permissions', () => {
    it('should only allow owners to manage security', () => {
      expect(canManageSecurity('owner')).toBe(true);
      expect(canManageSecurity('admin')).toBe(false);
      expect(canManageSecurity('editor')).toBe(false);
      expect(canManageSecurity('viewer')).toBe(false);
      expect(canManageSecurity(null)).toBe(false);
    });

    it('should allow owners and admins to view audit', () => {
      expect(canViewAudit('owner')).toBe(true);
      expect(canViewAudit('admin')).toBe(true);
      expect(canViewAudit('editor')).toBe(false);
      expect(canViewAudit('viewer')).toBe(false);
    });

    it('should allow owners and admins to manage sessions', () => {
      expect(canManageSessions('owner')).toBe(true);
      expect(canManageSessions('admin')).toBe(true);
      expect(canManageSessions('editor')).toBe(false);
      expect(canManageSessions('viewer')).toBe(false);
    });

    it('should allow owners and admins to manage members', () => {
      expect(canManageMembers('owner')).toBe(true);
      expect(canManageMembers('admin')).toBe(true);
      expect(canManageMembers('editor')).toBe(false);
      expect(canManageMembers('viewer')).toBe(false);
    });

    it('should allow owners and admins to manage invites', () => {
      expect(canManageInvites('owner')).toBe(true);
      expect(canManageInvites('admin')).toBe(true);
      expect(canManageInvites('editor')).toBe(false);
      expect(canManageInvites('viewer')).toBe(false);
    });

    it('should only allow owners to manage org', () => {
      expect(canManageOrg('owner')).toBe(true);
      expect(canManageOrg('admin')).toBe(false);
      expect(canManageOrg('editor')).toBe(false);
      expect(canManageOrg('viewer')).toBe(false);
    });
  });

  describe('Role Change Permissions', () => {
    it('should only allow owners to change roles', () => {
      expect(canChangeRole('owner', 'admin', 'editor')).toBe(true);
      expect(canChangeRole('admin', 'editor', 'viewer')).toBe(false);
      expect(canChangeRole('editor', 'viewer', 'editor')).toBe(false);
      expect(canChangeRole(null, 'viewer', 'editor')).toBe(false);
    });

    it('should not allow changing owner role', () => {
      expect(canChangeRole('owner', 'owner', 'admin')).toBe(false);
    });

    it('should not allow promoting to owner', () => {
      expect(canChangeRole('owner', 'admin', 'owner')).toBe(false);
    });
  });

  describe('Member Removal Permissions', () => {
    it('should allow owners to remove non-owners', () => {
      expect(canRemoveMember('owner', 'admin')).toBe(true);
      expect(canRemoveMember('owner', 'editor')).toBe(true);
      expect(canRemoveMember('owner', 'viewer')).toBe(true);
    });

    it('should not allow owners to remove other owners', () => {
      expect(canRemoveMember('owner', 'owner')).toBe(false);
    });

    it('should allow admins to remove editors and viewers', () => {
      expect(canRemoveMember('admin', 'editor')).toBe(true);
      expect(canRemoveMember('admin', 'viewer')).toBe(true);
    });

    it('should not allow admins to remove owners or other admins', () => {
      expect(canRemoveMember('admin', 'owner')).toBe(false);
      expect(canRemoveMember('admin', 'admin')).toBe(false);
    });

    it('should not allow editors or viewers to remove anyone', () => {
      expect(canRemoveMember('editor', 'viewer')).toBe(false);
      expect(canRemoveMember('viewer', 'viewer')).toBe(false);
    });
  });

  describe('Session Revocation Permissions', () => {
    const userId1 = 'user-1';
    const userId2 = 'user-2';

    it('should allow users to revoke their own sessions', () => {
      expect(canRevokeSession('viewer', userId1, userId1)).toBe(true);
      expect(canRevokeSession('editor', userId1, userId1)).toBe(true);
    });

    it('should allow owners and admins to revoke any session', () => {
      expect(canRevokeSession('owner', userId2, userId1)).toBe(true);
      expect(canRevokeSession('admin', userId2, userId1)).toBe(true);
    });

    it('should not allow editors and viewers to revoke other sessions', () => {
      expect(canRevokeSession('editor', userId2, userId1)).toBe(false);
      expect(canRevokeSession('viewer', userId2, userId1)).toBe(false);
    });
  });

  describe('Role Assignment Permissions', () => {
    it('should only allow owners to assign roles', () => {
      expect(canAssignRole('owner', 'admin')).toBe(true);
      expect(canAssignRole('owner', 'editor')).toBe(true);
      expect(canAssignRole('admin', 'editor')).toBe(false);
    });

    it('should not allow assigning owner role', () => {
      expect(canAssignRole('owner', 'owner')).toBe(false);
    });
  });

  describe('Role Transition Validation', () => {
    it('should validate valid role transitions', () => {
      expect(validateRoleTransition('owner', 'admin', 'editor', false)).toBeNull();
      expect(validateRoleTransition('owner', 'editor', 'admin', false)).toBeNull();
      expect(validateRoleTransition('owner', 'viewer', 'editor', false)).toBeNull();
    });

    it('should reject transitions from non-owners', () => {
      expect(validateRoleTransition('admin', 'editor', 'viewer', false)).toBe(
        'Only owners can change member roles'
      );
    });

    it('should reject changing last owner', () => {
      expect(validateRoleTransition('owner', 'owner', 'admin', true)).toBe(
        'Cannot change the role of the last owner'
      );
    });

    it('should reject changing owner role', () => {
      expect(validateRoleTransition('owner', 'owner', 'admin', false)).toBe(
        'Cannot change owner role directly. Use ownership transfer instead.'
      );
    });

    it('should reject promoting to owner', () => {
      expect(validateRoleTransition('owner', 'admin', 'owner', false)).toBe(
        'Cannot promote to owner directly. Use ownership transfer instead.'
      );
    });

    it('should reject null actor role', () => {
      expect(validateRoleTransition(null, 'admin', 'editor', false)).toBe(
        'You must be logged in to change roles'
      );
    });
  });

  describe('Role Information', () => {
    it('should return correct role permissions', () => {
      const ownerPerms = getRolePermissions('owner');
      expect(ownerPerms).toContain('manage_org');
      expect(ownerPerms).toContain('manage_members');
      expect(ownerPerms).toContain('manage_security');

      const viewerPerms = getRolePermissions('viewer');
      expect(viewerPerms).toContain('view_content');
      expect(viewerPerms).not.toContain('manage_org');
    });

    it('should return correct role display names', () => {
      expect(getRoleDisplayName('owner')).toBe('Owner');
      expect(getRoleDisplayName('admin')).toBe('Admin');
      expect(getRoleDisplayName('editor')).toBe('Editor');
      expect(getRoleDisplayName('viewer')).toBe('Viewer');
    });

    it('should return correct role descriptions', () => {
      expect(getRoleDescription('owner')).toContain('Full control');
      expect(getRoleDescription('admin')).toContain('manage members');
      expect(getRoleDescription('editor')).toContain('edit');
      expect(getRoleDescription('viewer')).toContain('view');
    });

    it('should return assignable roles excluding owner', () => {
      const assignable = getAssignableRoles();
      expect(assignable).toContain('admin');
      expect(assignable).toContain('editor');
      expect(assignable).toContain('viewer');
      expect(assignable).not.toContain('owner');
    });
  });

  describe('Permission Constants', () => {
    it('should have correct role hierarchy values', () => {
      expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.admin);
      expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.editor);
      expect(ROLE_HIERARCHY.editor).toBeGreaterThan(ROLE_HIERARCHY.viewer);
    });

    it('should have permissions defined for all roles', () => {
      expect(ROLE_PERMISSIONS.owner).toBeDefined();
      expect(ROLE_PERMISSIONS.admin).toBeDefined();
      expect(ROLE_PERMISSIONS.editor).toBeDefined();
      expect(ROLE_PERMISSIONS.viewer).toBeDefined();
    });

    it('should have owner with most permissions', () => {
      expect(ROLE_PERMISSIONS.owner.length).toBeGreaterThan(ROLE_PERMISSIONS.admin.length);
      expect(ROLE_PERMISSIONS.admin.length).toBeGreaterThan(ROLE_PERMISSIONS.editor.length);
      expect(ROLE_PERMISSIONS.editor.length).toBeGreaterThan(ROLE_PERMISSIONS.viewer.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined permissions gracefully', () => {
      expect(hasPermission('owner', 'nonexistent_permission')).toBe(false);
    });

    it('should handle same role comparisons', () => {
      expect(isRoleHigher('admin', 'admin')).toBe(false);
      expect(roleIsSufficient('admin', 'admin')).toBe(true);
    });

    it('should handle all null role scenarios', () => {
      expect(canManageSecurity(null)).toBe(false);
      expect(canViewAudit(null)).toBe(false);
      expect(canManageSessions(null)).toBe(false);
      expect(canManageMembers(null)).toBe(false);
      expect(canManageInvites(null)).toBe(false);
      expect(canManageOrg(null)).toBe(false);
      expect(canRemoveMember(null, 'viewer')).toBe(false);
    });
  });
});
