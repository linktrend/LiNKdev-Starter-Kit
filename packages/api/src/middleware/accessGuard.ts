/**
 * tRPC middleware for Role-Based Access Control (RBAC)
 * Provides reusable access control for tRPC procedures
 */

import { TRPCError } from '@trpc/server';
import { OrgRole } from '@starter/types';
import { roleIsSufficient, getUserOrgRole, createRBACError } from '../rbac';

/**
 * Context interface that includes organization information
 */
export interface RBACContext {
  user: { id: string };
  supabase: any;
  orgId?: string;
}

/**
 * Access guard middleware factory
 * Creates a middleware that checks if the user has sufficient role for the required action
 * 
 * @param requiredRole - The minimum role required to access the procedure
 * @param options - Additional options for the access guard
 */
export function createAccessGuard(
  requiredRole: OrgRole,
  options: {
    orgIdSource?: 'input' | 'context' | 'param';
    orgIdField?: string;
    customRoleResolver?: (ctx: RBACContext, input?: any) => Promise<OrgRole | null>;
  } = {}
) {
  const { orgIdSource = 'input', orgIdField = 'orgId', customRoleResolver } = options;

  return async ({ ctx, input, next }: any) => {
    try {
      // Get organization ID from the specified source
      let orgId: string | undefined;
      
      if (orgIdSource === 'input' && input) {
        orgId = input[orgIdField];
      } else if (orgIdSource === 'context' && ctx.orgId) {
        orgId = ctx.orgId;
      } else if (orgIdSource === 'param' && ctx.params?.orgId) {
        orgId = ctx.params.orgId;
      }

      if (!orgId) {
        throw createRBACError('Organization ID is required for this operation');
      }

      // Get user's role in the organization
      let userRole: OrgRole | null = null;
      
      if (customRoleResolver) {
        userRole = await customRoleResolver(ctx, input);
      } else {
        userRole = await getUserOrgRole(orgId, ctx.user.id, ctx.supabase);
      }

      // Check if user has sufficient role
      if (!roleIsSufficient(requiredRole, userRole)) {
        throw createRBACError(
          `This operation requires ${requiredRole} role or higher. Your role: ${userRole || 'none'}`
        );
      }

      // Add role information to context for use in the procedure
      const enhancedCtx = {
        ...ctx,
        userRole,
        orgId,
      };

      return next({
        ctx: enhancedCtx,
        input,
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      console.error('Access guard error:', error);
      throw createRBACError('Failed to verify permissions');
    }
  };
}

/**
 * Convenience function for manager-level access (owner or member)
 */
export function requireAdmin(options?: Parameters<typeof createAccessGuard>[1]) {
  return createAccessGuard('member', options);
}

/**
 * Convenience function for basic membership access (any role)
 */
export function requireMember(options?: Parameters<typeof createAccessGuard>[1]) {
  return createAccessGuard('viewer', options);
}

/**
 * Convenience function for owner-level access
 */
export function requireOwner(options?: Parameters<typeof createAccessGuard>[1]) {
  return createAccessGuard('owner', options);
}
