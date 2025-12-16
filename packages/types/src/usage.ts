import { z } from 'zod'
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

/**
 * tRPC input schema for getting API usage metrics.
 */
export const GetApiUsageInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  endpoint: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
})

/**
 * tRPC input schema for getting feature usage metrics.
 */
export const GetFeatureUsageInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  eventType: z.string().optional(),
})

/**
 * tRPC input schema for getting active users metrics.
 */
export const GetActiveUsersInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  period: z.enum(['day', 'week', 'month']).default('day'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

/**
 * tRPC input schema for getting storage usage.
 */
export const GetStorageUsageInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
})

/**
 * tRPC input schema for getting usage limits.
 */
export const GetUsageLimitsInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
})

/**
 * tRPC input schema for recording a usage event.
 */
export const RecordUsageEventInput = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  eventType: z.enum([
    'record_created',
    'api_call',
    'automation_run',
    'storage_used',
    'schedule_executed',
    'ai_tokens_used',
    'user_active',
  ]),
  quantity: z.number().min(0).default(1),
  metadata: z.record(z.any()).optional(),
})

/**
 * API usage response with endpoint statistics.
 */
export interface ApiUsageResponse {
  endpoints: Array<{
    endpoint: string
    method: string
    call_count: number
    avg_response_time: number
    error_count: number
    error_rate: number
  }>
  total_calls: number
  avg_response_time: number
  error_rate: number
  period: {
    from: string
    to: string
  }
}

/**
 * Feature usage response with adoption metrics.
 */
export interface FeatureUsageResponse {
  features: Array<{
    event_type: string
    usage_count: number
    unique_users: number
    last_used: string
  }>
  total_events: number
  active_users: number
  period: {
    from: string
    to: string
  }
}

/**
 * Active users response with DAU/MAU/WAU metrics.
 */
export interface ActiveUsersResponse {
  active_users: number
  period_type: string
  period_start: string
  period_end: string
  daily_breakdown?: Array<{
    date: string
    count: number
  }>
}

/**
 * Storage usage response with breakdown.
 */
export interface StorageUsageResponse {
  total_bytes: number
  total_gb: number
  file_count: number
  last_updated: string | null
  breakdown_by_type?: Record<string, number>
}

/**
 * Usage limits response comparing current usage to plan limits.
 */
export interface UsageLimitsResponse {
  plan_name: string
  limits: {
    max_records: number
    max_api_calls_per_month: number
    max_automations: number
    max_storage_gb: number
    max_mau: number
    max_schedules: number
    max_ai_tokens_per_month: number
    max_seats: number
  }
  current_usage: {
    records: number
    api_calls: number
    automations: number
    storage_gb: number
    mau: number
    schedules: number
    ai_tokens: number
    seats: number
  }
  usage_percentage: {
    records: number
    api_calls: number
    automations: number
    storage_gb: number
    mau: number
    schedules: number
    ai_tokens: number
    seats: number
  }
  approaching_limits: string[]
  exceeded_limits: string[]
}
