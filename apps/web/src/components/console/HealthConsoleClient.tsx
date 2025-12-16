'use client'

import { useEffect, useMemo, useState } from 'react'
import '@/app/[locale]/(console)/console/health/health-scrollbar.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertCircle, CheckCircle2, RefreshCw, TriangleAlert, XCircle } from 'lucide-react'

import type { HealthResponse, ServiceHealthWithUptime } from '@/app/actions/health'
import { HealthChart } from '@/components/console/HealthChart'
import { HealthStatusCard } from '@/components/console/HealthStatusCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function getStatusBadge(status: ServiceHealthWithUptime['status']) {
  if (status === 'operational') return <Badge className="bg-green-100 text-green-700">Operational</Badge>
  if (status === 'degraded') return <Badge className="bg-amber-100 text-amber-700">Degraded</Badge>
  return <Badge className="bg-red-100 text-red-700">Down</Badge>
}

export function HealthConsoleClient() {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true)

  const fetchHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      if (!res.ok) {
        throw new Error(`Health request failed with status ${res.status}`)
      }
      const json = (await res.json()) as HealthResponse
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch health data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(fetchHealth, 30_000)
    return () => clearInterval(id)
  }, [autoRefresh])

  const services = data?.services ?? []
  const overallStatus = data?.overallStatus ?? 'degraded'
  const lastChecked = data?.checkedAt ? new Date(data.checkedAt).toLocaleTimeString() : '—'

  const counts = useMemo(() => {
    return services.reduce(
      (acc, service) => {
        if (service.status === 'operational') acc.healthy += 1
        else if (service.status === 'degraded') acc.degraded += 1
        else acc.down += 1
        return acc
      },
      { healthy: 0, degraded: 0, down: 0 }
    )
  }, [services])

  const recentHistory = useMemo(() => {
    if (!data) return []
    return [...data.history]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20)
      .map((entry, idx) => ({
        ...entry,
        id: `${entry.serviceId}-${entry.timestamp}-${idx}`,
        label: services.find((s) => s.serviceId === entry.serviceId)?.label ?? entry.serviceId,
      }))
  }, [data, services])

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Console Health</h1>
          <p className="text-sm text-muted-foreground">Live service checks with 30s refresh and 24h uptime.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh((prev) => !prev)}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
          </Button>
          <Button size="sm" onClick={fetchHealth} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh now'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <TriangleAlert className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            {overallStatus === 'operational' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : overallStatus === 'degraded' ? (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{overallStatus}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {counts.healthy} healthy · {counts.degraded} degraded · {counts.down} down
            </p>
            <p className="text-xs text-muted-foreground mt-2">Last check: {lastChecked}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Uptime (24h)</CardTitle>
            <Badge variant="outline">{data?.overallUptime24h?.toFixed(2) ?? '—'}%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overallUptime24h?.toFixed(2) ?? '—'}%</div>
            <p className="text-xs text-muted-foreground mt-1">Based on recorded checks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache</CardTitle>
            <Badge variant="secondary">{data?.fromCache ? 'Cached' : 'Fresh'}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">30s window</p>
            <p className="text-xs text-muted-foreground">
              Expires at {data?.cacheExpiresAt ? new Date(data.cacheExpiresAt).toLocaleTimeString() : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Badge variant="outline">{services.length || 0} monitored</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">Supabase, API, Storage, Edge</p>
            <p className="text-xs text-muted-foreground">Auto-refresh every 30 seconds</p>
          </CardContent>
        </Card>
      </div>

      <HealthChart services={services} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {services.map((service) => (
          <HealthStatusCard key={service.serviceId} service={service} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Service Status Table</CardTitle>
          <CardDescription>Latest response time and 24h uptime</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Uptime (24h)</TableHead>
                    <TableHead>Last Check</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.serviceId}>
                      <TableCell className="font-medium">{service.label}</TableCell>
                      <TableCell>{getStatusBadge(service.status)}</TableCell>
                      <TableCell>{service.responseTime} ms</TableCell>
                      <TableCell>{service.uptime24h.toFixed(2)}%</TableCell>
                      <TableCell>{new Date(service.checkedAt).toLocaleTimeString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Recent Health Checks</CardTitle>
          <CardDescription>Last 20 recorded checks across services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {recentHistory.length === 0 && <p className="text-sm text-muted-foreground">No history yet.</p>}
          {recentHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <div className="flex items-center gap-3">
                {item.status === 'operational' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : item.status === 'degraded' ? (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()} · {item.responseTime} ms
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {item.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />
      <p className="text-xs text-muted-foreground">
        Admin-only view. Errors are sanitized to avoid exposing sensitive details.
      </p>
    </div>
  )
}
