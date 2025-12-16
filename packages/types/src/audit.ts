import { z } from 'zod'

/**
 * Audit log entry representing an action taken within an organization.
 * Mirrors the expected `audit_logs` structure (org-scoped, actor/action/entity metadata).
 */
export interface AuditLog {
  id: string
  org_id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string
  metadata: Record<string, any>
  created_at: string
}

/**
 * Enumerates common entity types that appear in audit metadata.
 */
export type AuditEntityType =
  | 'org'
  | 'record'
  | 'reminder'
  | 'subscription'
  | 'member'
  | 'invite'
  | 'schedule'
  | 'automation'

/**
 * Enumerates core audit actions for consistency across services.
 */
export type AuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'completed'
  | 'snoozed'
  | 'cancelled'
  | 'invited'
  | 'accepted'
  | 'rejected'
  | 'role_changed'
  | 'removed'
  | 'started'
  | 'stopped'
  | 'failed'
  | 'succeeded'

/**
 * tRPC input schema for appending a new audit log entry.
 */
export const AppendAuditLogInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  action: z.string().min(1, 'Action is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  metadata: z.record(z.any()).optional().default({}),
})

/**
 * tRPC input schema for listing audit logs with filters and pagination.
 */
export const ListAuditLogsInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  q: z.string().optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
  actorId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
})

/**
 * tRPC input schema for aggregating audit statistics.
 */
export const AuditStatsInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  window: z.enum(['hour', 'day', 'week', 'month']).default('day'),
})

/**
 * tRPC input schema for exporting audit logs.
 */
export const ExportAuditLogsInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  q: z.string().optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
  actorId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

/**
 * tRPC input schema for getting a single audit log by ID.
 */
export const GetAuditLogByIdInput = z.object({
  logId: z.string().uuid('Invalid log ID'),
  orgId: z.string().uuid('Invalid organization ID'),
})

/**
 * tRPC input schema for searching audit logs.
 */
export const SearchAuditLogsInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  query: z.string().min(1, 'Search query is required'),
  entityType: z.string().optional(),
  action: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
})

/**
 * tRPC input schema for getting activity summary.
 */
export const GetActivitySummaryInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  groupBy: z.enum(['hour', 'day', 'week']).default('day'),
})

/**
 * Paged audit log response payload.
 */
export interface AuditLogsResponse {
  logs: AuditLog[]
  has_more: boolean
  next_cursor?: string
  total: number
}

/**
 * Aggregate audit statistics grouped by action/entity/actor.
 */
export interface AuditStatsResponse {
  by_action: Record<string, number>
  by_entity_type: Record<string, number>
  by_actor: Record<string, number>
  total: number
  window: string
}

/**
 * Activity summary response with timeline and breakdowns.
 */
export interface ActivitySummaryResponse {
  timeline: Array<{
    timestamp: string
    count: number
  }>
  by_action: Record<string, number>
  by_entity_type: Record<string, number>
  top_actors: Array<{
    actor_id: string
    count: number
  }>
  total: number
  period: {
    from: string
    to: string
  }
}

/**
 * Analytics events emitted by audit log experiences.
 */
export type AuditAnalyticsEvent = 'audit.appended' | 'audit.viewed' | 'audit.filtered' | 'audit.exported'

/**
 * Payload describing an audit analytics event.
 */
export interface AuditAnalyticsPayload {
  org_id: string
  action?: string
  entity_type?: string
  actor_id?: string
  metadata?: Record<string, any>
}

/**
 * Context used by audit logging helpers to identify org/user.
 */
export interface AuditContext {
  orgId: string
  actorId: string
  supabase?: any
}

/**
 * Data required to append an audit log programmatically.
 */
export interface AuditEventData {
  action: string
  entityType: AuditEntityType
  entityId: string
  metadata?: Record<string, any>
}
