import { OrgRole } from '@starter/types';

export const ORG_ROLES: OrgRole[] = ['owner', 'member', 'viewer'];

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  member: 1,
  viewer: 1,
};

export const ROLE_PERMISSIONS = {
  owner: ['manage_org', 'manage_members', 'manage_invites', 'view_content'],
  admin: ['manage_members', 'manage_invites', 'view_content'],
  editor: ['view_content', 'edit_content'],
  member: ['manage_members', 'manage_invites', 'view_content'],
  viewer: ['view_content'],
} as const;

export function canManageMembers(userRole: OrgRole): boolean {
  return userRole === 'owner' || userRole === 'member';
}

export function canManageInvites(userRole: OrgRole): boolean {
  return userRole === 'owner' || userRole === 'member';
}

export function canManageOrg(userRole: OrgRole): boolean {
  return userRole === 'owner';
}

export function hasPermission(userRole: OrgRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission as any);
}

export function isRoleHigher(role1: OrgRole, role2: OrgRole): boolean {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
}

export function canChangeRole(fromRole: OrgRole, toRole: OrgRole, actorRole: OrgRole): boolean {
  // Only owners can change roles
  if (actorRole !== 'owner') return false;

  // Cannot change owner role
  if (fromRole === 'owner') return false;

  // Cannot promote to owner
  if (toRole === 'owner') return false;

  return true;
}

export function generateInviteToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isInviteExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

export function getInviteExpiryDate(days: number = 7): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
