'use server'

import { createClient } from '@supabase/supabase-js'

import { env } from '@/env'
import type { Database } from '@/types/database.types'
import type { UsageAggregationRecord, UsageLogPayload } from '@starter/types'

type PeriodType = 'daily' | 'monthly'

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

let serviceClient: any = null

function getServiceClient() {
  if (!serviceClient) {
    serviceClient = createClient<Database>(supabaseUrl!, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return serviceClient
}

/**
 * Log a usage event (non-blocking, best effort)
 */
export async function logUsage(params: UsageLogPayload) {
  const client = getServiceClient()

  try {
    const { error } = await client.from('usage_events').insert({
      user_id: params.userId,
      org_id: params.orgId ?? null,
      event_type: params.eventType,
      quantity: params.quantity ?? 1,
      event_data: params.metadata ?? {},
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error logging usage event:', error)
    }
  } catch (error) {
    console.error('Failed to log usage event:', error)
  }
}

/**
 * Get usage summary for a user/org within a period
 */
export async function getUsageSummary(params: {
  userId?: string
  orgId?: string
  periodStart: Date
  periodEnd: Date
}) {
  if (!params.userId && !params.orgId) {
    throw new Error('Either userId or orgId must be provided to fetch usage summary')
  }

  const client = getServiceClient()
  const filterColumn = params.orgId ? 'org_id' : 'user_id'
  const filterValue = params.orgId ?? params.userId!

  const { data, error } = await client
    .from('usage_events')
    .select('event_type, quantity')
    .gte('created_at', params.periodStart.toISOString())
    .lte('created_at', params.periodEnd.toISOString())
    .eq(filterColumn, filterValue)

  if (error) {
    console.error('Error fetching usage summary:', error)
    return {}
  }

  return (data ?? []).reduce((acc: Record<string, number>, event: any) => {
    const key = event.event_type as string
    const quantity = Number(event.quantity) || 1
    acc[key] = (acc[key] ?? 0) + quantity
    return acc
  }, {} as Record<string, number>)
}

/**
 * Get aggregated usage across a time range
 */
export async function getAggregatedUsage(params: {
  userId?: string
  orgId?: string
  periodType: PeriodType
  periodStart: Date
  periodEnd?: Date
}) {
  if (!params.userId && !params.orgId) {
    throw new Error('Either userId or orgId must be provided to fetch aggregated usage')
  }

  const client = getServiceClient()
  const filterColumn = params.orgId ? 'org_id' : 'user_id'
  const filterValue = params.orgId ?? params.userId!
  const from = params.periodStart.toISOString()
  const to = (params.periodEnd ?? new Date()).toISOString()

  const { data, error } = await client
    .from('usage_aggregations')
    .select('*')
    .eq('period_type', params.periodType)
    .gte('period_start', from)
    .lte('period_start', to)
    .eq(filterColumn, filterValue)
    .order('period_start', { ascending: true })

  if (error) {
    console.error('Error fetching aggregated usage:', error)
    return []
  }

  return (data ?? []) as UsageAggregationRecord[]
}

/**
 * Trigger manual aggregation (for cron/testing)
 */
export async function triggerUsageAggregation(params: {
  periodType: PeriodType
  periodStart: Date
  periodEnd: Date
}) {
  const client = getServiceClient()
  const { error } = await client.rpc('aggregate_usage', {
    p_period_type: params.periodType,
    p_period_start: params.periodStart.toISOString(),
    p_period_end: params.periodEnd.toISOString(),
  })

  if (error) {
    console.error('Error triggering usage aggregation:', error)
    throw error
  }

  return { success: true }
}
