'use server'

import { requireAdmin } from '@/lib/auth/server'
import {
  runAllChecks,
  type HealthCheckResult,
  type HealthStatus,
  type ServiceId,
} from '@/lib/health/checks'

const CACHE_MS = 30_000
const HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000

type HistoryEntry = {
  serviceId: ServiceId
  status: HealthStatus
  responseTime: number
  timestamp: number
}

export type ServiceHealthWithUptime = HealthCheckResult & {
  uptime24h: number
}

export interface HealthResponse {
  services: ServiceHealthWithUptime[]
  overallStatus: HealthStatus
  overallUptime24h: number
  checkedAt: string
  fromCache: boolean
  cacheExpiresAt: string
  history: HistoryEntry[]
}

let cachedResult: { data: HealthResponse; timestamp: number } | null = null
let history: HistoryEntry[] = []

function computeStatus(services: HealthCheckResult[]): HealthStatus {
  if (services.some((s) => s.status === 'down')) return 'down'
  if (services.some((s) => s.status === 'degraded')) return 'degraded'
  return 'operational'
}

function pruneHistory(now: number) {
  history = history.filter((entry) => now - entry.timestamp <= HISTORY_WINDOW_MS)
}

function computeUptime(now: number): Record<ServiceId, number> {
  pruneHistory(now)

  const grouped = history.reduce<Record<ServiceId, { up: number; total: number }>>((acc, entry) => {
    if (!acc[entry.serviceId]) acc[entry.serviceId] = { up: 0, total: 0 }
    acc[entry.serviceId].total += 1
    if (entry.status !== 'down') acc[entry.serviceId].up += 1
    return acc
  }, {} as Record<ServiceId, { up: number; total: number }>)

  const allServiceIds: ServiceId[] = ['supabase-auth', 'supabase-db', 'supabase-storage', 'api', 'edge-functions']
  const uptime: Record<ServiceId, number> = {} as Record<ServiceId, number>

  allServiceIds.forEach((id) => {
    const stats = grouped[id]
    uptime[id] = stats && stats.total > 0 ? Math.round((stats.up / stats.total) * 10000) / 100 : 100
  })

  return uptime
}

export async function getHealthStatus(): Promise<HealthResponse> {
  await requireAdmin()

  const now = Date.now()
  const isCached = cachedResult && now - cachedResult.timestamp < CACHE_MS
  if (isCached && cachedResult) {
    return {
      ...cachedResult.data,
      fromCache: true,
    }
  }

  const edgeHealthUrl = process.env.EDGE_HEALTH_URL ?? process.env.NEXT_PUBLIC_EDGE_HEALTH_URL
  const services = await runAllChecks(edgeHealthUrl)

  services.forEach((service) => {
    history.push({
      serviceId: service.serviceId,
      status: service.status,
      responseTime: service.responseTime,
      timestamp: now,
    })
  })

  const uptimeByService = computeUptime(now)
  const servicesWithUptime: ServiceHealthWithUptime[] = services.map((service) => ({
    ...service,
    uptime24h: uptimeByService[service.serviceId] ?? 100,
  }))

  const overallStatus = computeStatus(services)
  const overallUptimeValues = Object.values(uptimeByService)
  const overallUptime24h =
    overallUptimeValues.length > 0
      ? Math.round(
          (overallUptimeValues.reduce((sum, value) => sum + value, 0) / overallUptimeValues.length) * 100
        ) / 100
      : 100

  const data: HealthResponse = {
    services: servicesWithUptime,
    overallStatus,
    overallUptime24h,
    checkedAt: new Date(now).toISOString(),
    fromCache: false,
    cacheExpiresAt: new Date(now + CACHE_MS).toISOString(),
    history: history.slice(-100),
  }

  cachedResult = { data, timestamp: now }

  return data
}
