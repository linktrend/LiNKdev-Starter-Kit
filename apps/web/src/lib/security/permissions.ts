import type { OrgRole } from '@starter/types';

/**
 * Permission definitions by role
 * Defines what actions each role can perform in the system
 */
export const ROLE_PERMISSIONS = {
  owner: [
    'manage_org',
    'manage_members',
    'manage_roles',
    'manage_security',
    'view_audit',
    'manage_sessions',
    'view_content',
    'edit_content',
    'delete_content',
    'manage_billing',
    'manage_invites',
  ],
  admin: [
    'manage_members',
    'manage_invites',
    'view_audit',
    'manage_sessions',
    'view_content',
    'edit_content',
    'delete_content',
  ],
  editor: [
    'view_content',
    'edit_content',
  ],
  member: [
    'view_content',
  ],
  viewer: [
    'view_content',
  ],
} as const;

/**
 * Role hierarchy for comparison
 * Higher numbers indicate more permissions
 */
export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  member: 1,
  viewer: 1,
} as const;

/**
 * Permission descriptions for UI display
 */
export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  manage_org: 'Manage organization settings and configuration',
  manage_members: 'Add, remove, and manage organization members',
  manage_roles: 'Change member roles and permissions',
  manage_security: 'Configure security settings, 2FA, and password policies',
  view_audit: 'View audit logs and security events',
  manage_sessions: 'View and revoke user sessions',
  view_content: 'View organization content and data',
  edit_content: 'Create and edit organization content',
  delete_content: 'Delete organization content',
  manage_billing: 'Manage billing and subscriptions',
  manage_invites: 'Invite new members to the organization',
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: OrgRole | null, permission: string): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission as never);
}

/**
 * Check if one role is higher than another in the hierarchy
 */
export function isRoleHigher(role1: OrgRole, role2: OrgRole): boolean {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
}

/**
 * Check if a role is sufficient for a required role
 */
export function roleIsSufficient(requiredRole: OrgRole, userRole: OrgRole | null): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can manage security settings (owner only)
 */
export function canManageSecurity(role: OrgRole | null): boolean {
  return role === 'owner';
}

/**
 * Check if user can view audit logs (owner/admin)
 */
export function canViewAudit(role: OrgRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Check if user can manage sessions (owner/admin)
 */
export function canManageSessions(role: OrgRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Check if user can manage members (owner/admin)
 */
export function canManageMembers(role: OrgRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Check if user can manage invites (owner/admin)
 */
export function canManageInvites(role: OrgRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Check if user can manage organization settings (owner only)
 */
export function canManageOrg(role: OrgRole | null): boolean {
  return role === 'owner';
}

/**
 * Check if actor can change a member's role
 * @param actorRole - Role of the user performing the action
 * @param targetRole - Current role of the target member
 * @param newRole - New role to assign
 */
export function canChangeRole(
  actorRole: OrgRole | null,
  targetRole: OrgRole,
  newRole: OrgRole
): boolean {
  // Only owners can change roles
  if (actorRole !== 'owner') return false;

  // Cannot change owner role (must be done through ownership transfer)
  if (targetRole === 'owner') return false;

  // Cannot promote to owner (must be done through ownership transfer)
  if (newRole === 'owner') return false;

  return true;
}

/**
 * Check if actor can remove a member
 * @param actorRole - Role of the user performing the action
 * @param targetRole - Role of the member to remove
 */
export function canRemoveMember(actorRole: OrgRole | null, targetRole: OrgRole): boolean {
  if (!actorRole) return false;

  // Owners can remove anyone except other owners
  if (actorRole === 'owner') {
    return targetRole !== 'owner';
  }

  // Admins can remove editors and viewers
  if (actorRole === 'admin') {
    return targetRole === 'editor' || targetRole === 'viewer';
  }

  return false;
}

/**
 * Check if actor can revoke a user's session
 * @param actorRole - Role of the user performing the action
 * @param targetUserId - ID of the user whose session to revoke
 * @param actorUserId - ID of the user performing the action
 */
export function canRevokeSession(
  actorRole: OrgRole | null,
  targetUserId: string,
  actorUserId: string
): boolean {
  // Users can always revoke their own sessions
  if (actorUserId === targetUserId) return true;

  // Owners and admins can revoke any session
  return actorRole === 'owner' || actorRole === 'admin';
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: OrgRole): readonly string[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: OrgRole): string {
  const names: Record<OrgRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Editor',
    member: 'Member',
    viewer: 'Viewer',
  };
  return names[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: OrgRole): string {
  const descriptions: Record<OrgRole, string> = {
    owner: 'Full control over the organization, including security and billing',
    admin: 'Can manage members and view audit logs',
    editor: 'Can view and edit organization content',
    member: 'Can view organization content',
    viewer: 'Can view organization content only',
  };
  return descriptions[role];
}

/**
 * Get all available roles for assignment
 * (excludes owner as it requires special transfer process)
 */
export function getAssignableRoles(): OrgRole[] {
  return ['admin', 'editor', 'viewer'];
}

/**
 * Check if a role can be assigned by the actor
 */
export function canAssignRole(actorRole: OrgRole | null, roleToAssign: OrgRole): boolean {
  // Only owners can assign roles
  if (actorRole !== 'owner') return false;

  // Cannot assign owner role (requires special transfer)
  if (roleToAssign === 'owner') return false;

  return true;
}

/**
 * Validate role transition
 * Returns error message if transition is invalid, null if valid
 */
export function validateRoleTransition(
  actorRole: OrgRole | null,
  currentRole: OrgRole,
  newRole: OrgRole,
  isLastOwner: boolean = false
): string | null {
  if (!actorRole) {
    return 'You must be logged in to change roles';
  }

  if (actorRole !== 'owner') {
    return 'Only owners can change member roles';
  }

  if (currentRole === 'owner' && isLastOwner) {
    return 'Cannot change the role of the last owner';
  }

  if (currentRole === 'owner') {
    return 'Cannot change owner role directly. Use ownership transfer instead.';
  }

  if (newRole === 'owner') {
    return 'Cannot promote to owner directly. Use ownership transfer instead.';
  }

  return null;
}
