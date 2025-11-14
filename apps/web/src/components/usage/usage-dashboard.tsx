'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { UsageIndicator } from '@/components/features/usage-indicator'
import type { UsageAggregationRecord } from '@starter/types'

interface UsageDashboardProps {
  summary: Record<string, number>
  aggregated: UsageAggregationRecord[]
  period: 'week' | 'month' | 'year'
  orgId?: string
  locale: string
  exportFrom: string
  exportTo: string
}

const metricCards = [
  {
    key: 'record_created',
    title: 'Records',
    description: 'Records created',
    featureKey: 'max_records',
  },
  {
    key: 'api_call',
    title: 'API Calls',
    description: 'API requests',
    featureKey: 'max_api_calls_per_month',
  },
  {
    key: 'automation_run',
    title: 'Automations',
    description: 'Automation executions',
    featureKey: 'max_automations',
  },
  {
    key: 'storage_used',
    title: 'Storage',
    description: 'Storage used (GB)',
    featureKey: 'max_storage_gb',
    formatter: (value: number) => (value / 1024 / 1024 / 1024).toFixed(2),
    valueTransform: (value: number) => value / 1024 / 1024 / 1024,
  },
  {
    key: 'ai_tokens_used',
    title: 'AI Tokens',
    description: 'Tokens consumed',
    featureKey: 'max_ai_tokens_per_month',
  },
  {
    key: 'user_active',
    title: 'Active Users',
    description: 'Logins this period',
    featureKey: 'max_mau',
  },
]

const periodOptions: Array<{ value: UsageDashboardProps['period']; label: string }> = [
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'Year to Date' },
]

export function UsageDashboard({
  summary,
  aggregated,
  period,
  orgId,
  locale,
  exportFrom,
  exportTo,
}: UsageDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const chartData = useMemo(() => {
    const grouped = new Map<string, Record<string, number | string>>()

    aggregated.forEach((entry) => {
      const date = new Date(entry.period_start)
      const label = date.toLocaleDateString()
      const existing = grouped.get(label) ?? { date: label }
      existing[entry.metric_type] = Number(entry.total_quantity ?? 0)
      grouped.set(label, existing)
    })

    return Array.from(grouped.values())
  }, [aggregated])

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams({
      from: exportFrom,
      to: exportTo,
    })
    if (orgId) {
      params.set('orgId', orgId)
    }
    return `/api/usage/export?${params.toString()}`
  }, [exportFrom, exportTo, orgId])

  const handlePeriodChange = (next: UsageDashboardProps['period']) => {
    const params = new URLSearchParams(searchParams)
    params.set('period', next)
    if (orgId) {
      params.set('org', orgId)
    }
    router.push(`/${locale}/usage?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Current period</p>
          <h2 className="text-2xl font-semibold">
            {periodOptions.find((option) => option.value === period)?.label}
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={period} onValueChange={(value) => handlePeriodChange(value as UsageDashboardProps['period'])}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <a href={exportUrl} className="inline-flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((metric) => {
          const rawValue = summary[metric.key] || 0
          const displayValue = metric.formatter ? metric.formatter(rawValue) : rawValue
          const indicatorValue =
            typeof metric.valueTransform === 'function' ? metric.valueTransform(rawValue) : rawValue

          return (
            <Card key={metric.key}>
              <CardHeader>
                <CardTitle>{metric.title}</CardTitle>
                <CardDescription>{metric.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold">{displayValue}</div>
                <UsageIndicator
                  featureKey={metric.featureKey}
                  currentUsage={indicatorValue}
                  orgId={orgId}
                  label={metric.title}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>Aggregated usage over time</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage data available for this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="record_created"
                  stackId="a"
                  fill="hsl(var(--chart-1))"
                  name="Records"
                  radius={[4, 4, 0, 0]}
                />
                <Bar dataKey="api_call" stackId="a" fill="hsl(var(--chart-2))" name="API Calls" />
                <Bar dataKey="automation_run" stackId="a" fill="hsl(var(--chart-3))" name="Automations" />
                <Bar dataKey="ai_tokens_used" stackId="b" fill="hsl(var(--chart-4))" name="AI Tokens" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
