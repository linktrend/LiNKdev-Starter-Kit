/**
 * Audit Middleware
 * 
 * Automatic audit logging middleware for tRPC procedures.
 * Captures user actions, entity changes, and metadata for compliance and analytics.
 */

import type { AuditAction, AuditEntityType } from '@starter/types';
import { sanitizeMetadata, extractIpAddress, extractUserAgent } from '../lib/usage-tracker';

/**
 * Configuration for audit middleware
 */
export interface AuditMiddlewareConfig {
  /** The action being performed (e.g., 'created', 'updated', 'deleted') */
  action: AuditAction;
  
  /** The type of entity being acted upon (e.g., 'org', 'record', 'member') */
  entityType: AuditEntityType;
  
  /** Field name in input that contains the entity ID (defaults to 'id') */
  entityIdField?: string;
  
  /** Field name in input that contains the org ID (defaults to 'orgId') */
  orgIdField?: string;
  
  /** Function to extract entity ID from result (for create operations) */
  entityIdFromResult?: (result: any) => string;
  
  /** Function to capture custom metadata */
  captureMetadata?: (input: any, result?: any) => Record<string, any>;
  
  /** Whether to capture before state for updates (requires entityId in input) */
  captureBeforeState?: boolean;
  
  /** Function to fetch before state (if captureBeforeState is true) */
  fetchBeforeState?: (ctx: any, entityId: string) => Promise<any>;
}

/**
 * Create audit logging middleware for tRPC procedures
 * 
 * This middleware automatically logs actions to the audit_logs table.
 * It runs asynchronously after the procedure completes to not block the response.
 * 
 * @param config - Audit middleware configuration
 * @returns tRPC middleware function
 * 
 * @example
 * ```typescript
 * updateUser: protectedProcedure
 *   .use(createAuditMiddleware({
 *     action: 'updated',
 *     entityType: 'user',
 *     entityIdField: 'userId',
 *     captureBeforeState: true
 *   }))
 *   .mutation(async ({ input, ctx }) => {
 *     // ... mutation logic
 *   })
 * ```
 */
export function createAuditMiddleware(config: AuditMiddlewareConfig) {
  const {
    action,
    entityType,
    entityIdField = 'id',
    orgIdField = 'orgId',
    entityIdFromResult,
    captureMetadata,
    captureBeforeState = false,
    fetchBeforeState,
  } = config;

  return async ({ ctx, input, next }: any) => {
    // Get entity ID from input or prepare to get from result
    let entityId: string | null = input?.[entityIdField] || null;
    const orgId: string | null = input?.[orgIdField] || ctx.orgId || null;

    // Capture before state if requested
    let beforeState: any = null;
    if (captureBeforeState && entityId && fetchBeforeState) {
      try {
        beforeState = await fetchBeforeState(ctx, entityId);
      } catch (error) {
        console.error('Failed to fetch before state for audit:', error);
      }
    }

    // Execute the procedure
    const result = await next();

    // Get entity ID from result if not in input (for create operations)
    if (!entityId && entityIdFromResult) {
      try {
        entityId = entityIdFromResult(result);
      } catch (error) {
        console.error('Failed to extract entity ID from result:', error);
      }
    }

    // If we still don't have entity ID or org ID, skip audit logging
    if (!entityId || !orgId) {
      console.warn('Skipping audit log: missing entity ID or org ID', {
        entityId,
        orgId,
        action,
        entityType,
      });
      return result;
    }

    // Log audit entry asynchronously (don't block response)
    logAuditEntry({
      ctx,
      orgId,
      entityId,
      action,
      entityType,
      input,
      result,
      beforeState,
      captureMetadata,
    }).catch(error => {
      console.error('Failed to log audit entry:', error);
    });

    return result;
  };
}

/**
 * Internal function to log audit entry
 */
async function logAuditEntry({
  ctx,
  orgId,
  entityId,
  action,
  entityType,
  input,
  result,
  beforeState,
  captureMetadata,
}: {
  ctx: any;
  orgId: string;
  entityId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  input: any;
  result: any;
  beforeState?: any;
  captureMetadata?: (input: any, result?: any) => Record<string, any>;
}): Promise<void> {
  try {
    // Build metadata
    let metadata: Record<string, any> = {};

    // Add custom metadata if provided
    if (captureMetadata) {
      try {
        metadata = captureMetadata(input, result);
      } catch (error) {
        console.error('Error capturing custom metadata:', error);
      }
    }

    // Add before/after state for updates
    if (action === 'updated' && beforeState) {
      metadata.before = beforeState;
      metadata.after = result;
    }

    // Add request context
    if (ctx.headers) {
      const ipAddress = extractIpAddress(ctx.headers);
      const userAgent = extractUserAgent(ctx.headers);

      if (ipAddress) {
        metadata.ip_address = ipAddress;
      }
      if (userAgent) {
        metadata.user_agent = userAgent;
      }
    }

    // Sanitize metadata to remove sensitive data
    metadata = sanitizeMetadata(metadata);

    // Insert audit log
    const { error } = await ctx.supabase
      .from('audit_logs')
      .insert({
        org_id: orgId,
        actor_id: ctx.user?.id || null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata,
      });

    if (error) {
      console.error('Failed to insert audit log:', error);
    }

    // Emit analytics event if posthog is available
    if (ctx.posthog && ctx.user?.id) {
      ctx.posthog.capture({
        distinctId: ctx.user.id,
        event: `audit.${action}`,
        properties: {
          org_id: orgId,
          entity_type: entityType,
          entity_id: entityId,
          action,
        },
      });
    }
  } catch (error) {
    console.error('Exception in logAuditEntry:', error);
  }
}

/**
 * Convenience function for create operations
 * 
 * @example
 * ```typescript
 * createOrg: protectedProcedure
 *   .use(auditCreate('org', (result) => result.id))
 *   .mutation(...)
 * ```
 */
export function auditCreate(
  entityType: AuditEntityType,
  entityIdFromResult: (result: any) => string,
  options?: Partial<AuditMiddlewareConfig>
) {
  return createAuditMiddleware({
    action: 'created',
    entityType,
    entityIdFromResult,
    ...options,
  });
}

/**
 * Convenience function for update operations
 * 
 * @example
 * ```typescript
 * updateOrg: protectedProcedure
 *   .use(auditUpdate('org', 'orgId'))
 *   .mutation(...)
 * ```
 */
export function auditUpdate(
  entityType: AuditEntityType,
  entityIdField?: string,
  options?: Partial<AuditMiddlewareConfig>
) {
  return createAuditMiddleware({
    action: 'updated',
    entityType,
    entityIdField,
    captureBeforeState: true,
    ...options,
  });
}

/**
 * Convenience function for delete operations
 * 
 * @example
 * ```typescript
 * deleteOrg: protectedProcedure
 *   .use(auditDelete('org', 'orgId'))
 *   .mutation(...)
 * ```
 */
export function auditDelete(
  entityType: AuditEntityType,
  entityIdField?: string,
  options?: Partial<AuditMiddlewareConfig>
) {
  return createAuditMiddleware({
    action: 'deleted',
    entityType,
    entityIdField,
    captureBeforeState: true,
    ...options,
  });
}

/**
 * Convenience function for role change operations
 * 
 * @example
 * ```typescript
 * updateMemberRole: protectedProcedure
 *   .use(auditRoleChange('member', 'userId'))
 *   .mutation(...)
 * ```
 */
export function auditRoleChange(
  entityType: AuditEntityType,
  entityIdField?: string,
  options?: Partial<AuditMiddlewareConfig>
) {
  return createAuditMiddleware({
    action: 'role_changed',
    entityType,
    entityIdField,
    captureMetadata: (input) => ({
      old_role: input.oldRole,
      new_role: input.role || input.newRole,
    }),
    ...options,
  });
}

/**
 * Convenience function for invite operations
 * 
 * @example
 * ```typescript
 * inviteMember: protectedProcedure
 *   .use(auditInvite('invite', (result) => result.id))
 *   .mutation(...)
 * ```
 */
export function auditInvite(
  entityType: AuditEntityType,
  entityIdFromResult: (result: any) => string,
  options?: Partial<AuditMiddlewareConfig>
) {
  return createAuditMiddleware({
    action: 'invited',
    entityType,
    entityIdFromResult,
    captureMetadata: (input) => ({
      email: input.email,
      role: input.role,
    }),
    ...options,
  });
}
