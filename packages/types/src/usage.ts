/**
 * Shared usage tracking types
 */

export type UsageEventType =
  | 'record_created'
  | 'api_call'
  | 'automation_run'
  | 'storage_used'
  | 'schedule_executed'
  | 'ai_tokens_used'
  | 'user_active';

export interface UsageLogPayload {
  userId: string;
  orgId?: string | null;
  eventType: UsageEventType;
  quantity?: number;
  metadata?: Record<string, any>;
}

export interface UsageAggregationRecord {
  id: string;
  user_id: string | null;
  org_id: string | null;
  period_type: 'daily' | 'monthly';
  period_start: string;
  period_end: string;
  metric_type: UsageEventType | string;
  total_quantity: number;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}
