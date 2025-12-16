import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { createCaller } from '@starter/api'

import { env } from '@/env'
import type { Database } from '@/types/database.types'
import { createTRPCContext } from '@/server/api/trpc'

export type HealthStatus = 'operational' | 'degraded' | 'down'

export type ServiceId =
  | 'supabase-auth'
  | 'supabase-db'
  | 'supabase-storage'
  | 'api'
  | 'edge-functions'

export interface HealthCheckResult {
  serviceId: ServiceId
  label: string
  status: HealthStatus
  responseTime: number
  checkedAt: string
  error?: string
  details?: Record<string, unknown>
}

const TIMEOUT_MS = 5_000
const DEGRADED_MS = 1_000
const GOOD_MS = 200

let cachedAnonClient: SupabaseClient<Database> | null = null
let cachedServiceClient: SupabaseClient<Database> | null = null

function getAnonClient() {
  if (!cachedAnonClient) {
    cachedAnonClient = createSupabaseClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )
  }
  return cachedAnonClient
}

function getServiceClient() {
  if (!cachedServiceClient) {
    cachedServiceClient = createSupabaseClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )
  }
  return cachedServiceClient
}

function sanitizeError(error: unknown) {
  if (!error) return undefined
  if (typeof error === 'string') return error.slice(0, 200)
  if (error instanceof Error) return error.message.slice(0, 200)
  try {
    return JSON.stringify(error).slice(0, 200)
  } catch {
    return 'Unknown error'
  }
}

function mapStatus(responseTime: number, error?: unknown): HealthStatus {
  if (error) return 'down'
  if (responseTime > DEGRADED_MS) return 'down'
  if (responseTime > GOOD_MS) return 'degraded'
  return 'operational'
}

async function withTimeout<T>(fn: () => Promise<T>): Promise<{ data?: T; duration: number; error?: unknown }> {
  const start = Date.now()
  let timeoutHandle: NodeJS.Timeout | undefined
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error('Health check timed out')), TIMEOUT_MS)
    })
    const data = await Promise.race([fn(), timeoutPromise])
    const duration = Date.now() - start
    return { data, duration }
  } catch (error) {
    const duration = Date.now() - start
    return { error, duration }
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  }
}

export async function checkSupabaseAuth(): Promise<HealthCheckResult> {
  const client = getAnonClient()
  const { duration, error } = await withTimeout(async () => {
    return client.auth.getSession()
  })

  return {
    serviceId: 'supabase-auth',
    label: 'Supabase Auth',
    status: mapStatus(duration, error),
    responseTime: duration,
    checkedAt: new Date().toISOString(),
    error: sanitizeError(error),
  }
}

export async function checkSupabaseDb(): Promise<HealthCheckResult> {
  const client = getServiceClient()
  const { duration, error } = await withTimeout(async () => {
    // Lightweight head-only query that exercises PostgREST / connection
    return client.from('users').select('id', { head: true, count: 'exact' }).limit(1)
  })

  return {
    serviceId: 'supabase-db',
    label: 'Supabase Database',
    status: mapStatus(duration, error),
    responseTime: duration,
    checkedAt: new Date().toISOString(),
    error: sanitizeError(error),
    details: { connection: error ? 'unavailable' : 'ok' },
  }
}

export async function checkSupabaseStorage(): Promise<HealthCheckResult> {
  const client = getServiceClient()
  const { duration, error } = await withTimeout(async () => client.storage.listBuckets())

  return {
    serviceId: 'supabase-storage',
    label: 'Supabase Storage',
    status: mapStatus(duration, error),
    responseTime: duration,
    checkedAt: new Date().toISOString(),
    error: sanitizeError(error),
  }
}

export async function checkApi(): Promise<HealthCheckResult> {
  const { duration, error } = await withTimeout(async () => {
    const caller = createCaller(await createTRPCContext({ headers: new Headers({ 'x-trpc-source': 'health-check' }) }))
    return caller.status()
  })

  return {
    serviceId: 'api',
    label: 'tRPC API',
    status: mapStatus(duration, error),
    responseTime: duration,
    checkedAt: new Date().toISOString(),
    error: sanitizeError(error),
  }
}

export async function checkEdgeFunctions(edgeUrl?: string): Promise<HealthCheckResult> {
  // If not configured, report degraded with context
  if (!edgeUrl) {
    return {
      serviceId: 'edge-functions',
      label: 'Edge Functions',
      status: 'degraded',
      responseTime: 0,
      checkedAt: new Date().toISOString(),
      error: 'No edge functions configured',
    }
  }

  const { duration, error } = await withTimeout(async () => {
    const res = await fetch(edgeUrl, { method: 'GET', cache: 'no-store' })
    if (!res.ok) throw new Error(`Edge function responded with ${res.status}`)
    return res.text()
  })

  return {
    serviceId: 'edge-functions',
    label: 'Edge Functions',
    status: mapStatus(duration, error),
    responseTime: duration,
    checkedAt: new Date().toISOString(),
    error: sanitizeError(error),
  }
}

export async function runAllChecks(edgeUrl?: string): Promise<HealthCheckResult[]> {
  return Promise.all([
    checkSupabaseAuth(),
    checkSupabaseDb(),
    checkSupabaseStorage(),
    checkApi(),
    checkEdgeFunctions(edgeUrl),
  ])
}
