/**
 * Role-Based Access Control (RBAC) utilities for tRPC procedures
 * Provides role hierarchy, permission checking, and access control middleware
 */

import { TRPCError } from '@trpc/server';
import { OrgRole } from '@starter/types';

// Role hierarchy with numeric values for comparison
export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
} as const;

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  owner: ['manage_org', 'manage_members', 'manage_invites', 'manage_billing', 'view_content', 'edit_content'],
  admin: ['manage_members', 'manage_invites', 'manage_billing', 'view_content', 'edit_content'],
  editor: ['view_content', 'edit_content'],
  viewer: ['view_content'],
} as const;

/**
 * Check if a user's role is sufficient for a required role
 * Uses hierarchy where higher numbers have more permissions
 */
export function roleIsSufficient(requiredRole: OrgRole, userRole: OrgRole | null): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: OrgRole | null, permission: string): boolean {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission as never);
}

/**
 * Check if one role is higher than another
 */
export function isRoleHigher(role1: OrgRole, role2: OrgRole): boolean {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
}

/**
 * Check if user can manage members (owner or admin)
 */
export function canManageMembers(userRole: OrgRole | null): boolean {
  return userRole === 'owner' || userRole === 'admin';
}

/**
 * Check if user can manage invites (owner or admin)
 */
export function canManageInvites(userRole: OrgRole | null): boolean {
  return userRole === 'owner' || userRole === 'admin';
}

/**
 * Check if user can manage organization settings (owner only)
 */
export function canManageOrg(userRole: OrgRole | null): boolean {
  return userRole === 'owner';
}

/**
 * Check if user can manage billing (owner or admin)
 */
export function canManageBilling(userRole: OrgRole | null): boolean {
  return userRole === 'owner' || userRole === 'admin';
}

/**
 * Check if user can change roles
 */
export function canChangeRole(fromRole: OrgRole, toRole: OrgRole, actorRole: OrgRole | null): boolean {
  if (!actorRole) return false;
  if (actorRole !== 'owner') return false;

  if (fromRole === 'owner') return false;
  if (toRole === 'owner' && actorRole !== 'owner') return false;

  if (!isRoleHigher(actorRole, fromRole)) return false;

  return true;
}

/**
 * Get user's role in a specific organization
 * This function should be implemented by the consuming application
 * to fetch the role from the database
 */
export async function getUserOrgRole(
  orgId: string, 
  userId: string, 
  supabase: any
): Promise<OrgRole | null> {
  try {
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .single();

    if (error || !membership) {
      return null;
    }

    return membership.role as OrgRole;
  } catch (error) {
    console.error('Error fetching user org role:', error);
    return null;
  }
}

/**
 * Create a standardized RBAC error
 */
export function createRBACError(message: string = 'Insufficient permissions'): TRPCError {
  return new TRPCError({
    code: 'FORBIDDEN',
    message,
  });
}
