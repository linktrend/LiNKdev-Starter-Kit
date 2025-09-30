import { z } from 'zod';

// Core Audit Log Types
export interface AuditLog {
  id: string;
  org_id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Entity Types
export type AuditEntityType = 
  | 'org' 
  | 'record' 
  | 'reminder' 
  | 'subscription' 
  | 'member' 
  | 'invite'
  | 'schedule'
  | 'automation';

// Common Actions
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
  | 'succeeded';

// tRPC Input Schemas
export const AppendAuditLogInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  action: z.string().min(1, 'Action is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  metadata: z.record(z.any()).optional().default({}),
});

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
});

export const AuditStatsInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  window: z.enum(['hour', 'day', 'week', 'month']).default('day'),
});

export const ExportAuditLogsInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  q: z.string().optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
  actorId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// Response Types
export interface AuditLogsResponse {
  logs: AuditLog[];
  has_more: boolean;
  next_cursor?: string;
  total: number;
}

export interface AuditStatsResponse {
  by_action: Record<string, number>;
  by_entity_type: Record<string, number>;
  by_actor: Record<string, number>;
  total: number;
  window: string;
}

// Analytics Events
export type AuditAnalyticsEvent = 
  | 'audit.appended'
  | 'audit.viewed'
  | 'audit.filtered'
  | 'audit.exported';

export interface AuditAnalyticsPayload {
  org_id: string;
  action?: string;
  entity_type?: string;
  actor_id?: string;
  metadata?: Record<string, any>;
}

// Helper Types for Integration
export interface AuditContext {
  orgId: string;
  actorId: string;
  supabase?: any;
}

export interface AuditEventData {
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: Record<string, any>;
}
