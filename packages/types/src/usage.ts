import type { Tables } from './db'

/**
 * Enumerated usage events enforced by `public.usage_events.event_type`.
 */
export type UsageEventType =
  | 'record_created'
  | 'api_call'
  | 'automation_run'
  | 'storage_used'
  | 'schedule_executed'
  | 'ai_tokens_used'
  | 'user_active'

/**
 * Raw event row from `public.usage_events`.
 */
export type UsageEvent = Tables<'usage_events'>

/**
 * Payload for logging usage activity through the service layer.
 */
export interface UsageLogPayload {
  userId: string
  orgId?: string | null
  eventType: UsageEventType
  quantity?: number
  metadata?: Record<string, any>
}

/**
 * Aggregated usage rollup from `public.usage_aggregations`.
 */
export type UsageAggregationRecord = Tables<'usage_aggregations'>
