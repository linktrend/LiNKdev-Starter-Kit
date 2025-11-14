# Phase 2.7: Usage Tracking & Dashboard

## 📋 Project Rules & Guardrails

**Before starting implementation, review these project rule files:**

1. **`.cursor/01-foundation.mdc`** - Monorepo structure, TypeScript config, package management, commit hygiene
2. **`.cursor/02-web-nextjs.mdc`** - Next.js App Router conventions, styling, data fetching, auth integration
3. **`.cursor/04-supabase.mdc`** - Database migrations, RLS policies, auth, edge functions, typed queries
4. **`.cursor/06-quality.mdc`** - Type-checking, linting, formatting, build verification requirements
5. **`.cursor/07-testing.mdc`** - Testing workflow, unit/integration/E2E test requirements
6. **`.cursor/12-mcp-rules.mdc`** - MCP server usage for database inspection and verification

---

## 🔒 Critical Guardrails

**Key Requirements:**
- ✅ Log usage events asynchronously
- ✅ Don't block user actions with logging
- ✅ Aggregate data for performance
- ✅ Implement proper error handling
- ✅ Cache dashboard queries
- ✅ Test aggregation functions

---

## 🎯 Phase Overview

**Goal:** Implement comprehensive usage tracking for billing, feature gating, and admin analytics with real-time dashboards.

**Scope:**
1. Create usage event logging utilities
2. Implement event tracking throughout the app
3. Build aggregation cron jobs (daily/monthly)
4. Create usage dashboard for users
5. Create admin analytics dashboard
6. Add usage export functionality
7. Test usage tracking end-to-end

**Dependencies:**
- All previous phases (2.1-2.6) complete
- `usage_events` and `usage_aggregations` tables exist
- `aggregate_usage()` database function exists

---

## 📝 Implementation Steps

### Step 1: Create Usage Tracking Utilities

**File to create:** `apps/web/lib/usage/server.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// Use service role for usage logging (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type UsageEventType =
  | 'record_created'
  | 'api_call'
  | 'automation_run'
  | 'storage_used'
  | 'schedule_executed'
  | 'ai_tokens_used'
  | 'user_active'

export interface LogUsageParams {
  userId: string
  orgId?: string
  eventType: UsageEventType
  quantity?: number
  metadata?: Record<string, any>
}

/**
 * Log a usage event (non-blocking, best effort)
 */
export async function logUsage(params: LogUsageParams) {
  try {
    const { error } = await supabase.from('usage_events').insert({
      user_id: params.userId,
      org_id: params.orgId || null,
      event_type: params.eventType,
      quantity: params.quantity || 1,
      event_data: params.metadata || {},
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error logging usage:', error)
      // Don't throw - usage logging should never block user actions
    }
  } catch (error) {
    console.error('Failed to log usage:', error)
  }
}

/**
 * Get usage summary for a user/org
 */
export async function getUsageSummary(params: {
  userId?: string
  orgId?: string
  periodStart: Date
  periodEnd: Date
}) {
  const { data, error } = await supabase
    .from('usage_events')
    .select('event_type, quantity')
    .gte('created_at', params.periodStart.toISOString())
    .lte('created_at', params.periodEnd.toISOString())
    .eq(params.orgId ? 'org_id' : 'user_id', params.orgId || params.userId!)

  if (error) {
    console.error('Error fetching usage summary:', error)
    return []
  }

  // Aggregate by event type
  const summary = data.reduce(
    (acc, event) => {
      const type = event.event_type
      if (!acc[type]) {
        acc[type] = 0
      }
      acc[type] += event.quantity || 1
      return acc
    },
    {} as Record<string, number>
  )

  return summary
}

/**
 * Get aggregated usage (from pre-computed aggregations)
 */
export async function getAggregatedUsage(params: {
  userId?: string
  orgId?: string
  periodType: 'daily' | 'monthly'
  periodStart: Date
}) {
  const { data, error } = await supabase
    .from('usage_aggregations')
    .select('*')
    .eq('period_type', params.periodType)
    .gte('period_start', params.periodStart.toISOString())
    .eq(params.orgId ? 'org_id' : 'user_id', params.orgId || params.userId!)
    .order('period_start', { ascending: false })

  if (error) {
    console.error('Error fetching aggregated usage:', error)
    return []
  }

  return data
}

/**
 * Trigger manual aggregation (for testing or manual runs)
 */
export async function triggerUsageAggregation(params: {
  periodType: 'daily' | 'monthly'
  periodStart: Date
  periodEnd: Date
}) {
  const { error } = await supabase.rpc('aggregate_usage', {
    p_period_type: params.periodType,
    p_period_start: params.periodStart.toISOString(),
    p_period_end: params.periodEnd.toISOString(),
  })

  if (error) {
    console.error('Error triggering aggregation:', error)
    throw error
  }

  return { success: true }
}
```

---

### Step 2: Add Usage Tracking to App Actions

**Example: Track record creation**

```typescript
// In apps/web/app/actions/records.ts (or wherever records are created)
import { logUsage } from '@/lib/usage/server'
import { requireAuth } from '@/lib/auth/server'

export async function createRecord(formData: FormData) {
  const user = await requireAuth()
  const supabase = createClient()

  // ... validation ...

  // Create record
  const { data: record, error } = await supabase
    .from('records')
    .insert({
      // ... record data
    })
    .select()
    .single()

  if (error) {
    return { error: 'Failed to create record' }
  }

  // Log usage (non-blocking)
  logUsage({
    userId: user.id,
    orgId: formData.get('org_id') as string | undefined,
    eventType: 'record_created',
    quantity: 1,
    metadata: {
      record_id: record.id,
      record_type: record.type,
    },
  }).catch(() => {}) // Silently fail, don't block user

  return { success: true, record }
}
```

**Add to key actions:**
- Record creation → `record_created`
- API calls → `api_call`
- Automation runs → `automation_run`
- File uploads → `storage_used`
- Schedule execution → `schedule_executed`
- AI API calls → `ai_tokens_used`
- User login → `user_active`

---

### Step 3: Create Usage Dashboard Page

**File to create:** `apps/web/app/[locale]/usage/page.tsx`

```typescript
import { requireAuth } from '@/lib/auth/server'
import { getUsageSummary, getAggregatedUsage } from '@/lib/usage/server'
import UsageDashboard from '@/components/usage/usage-dashboard'

export default async function UsagePage({
  searchParams,
}: {
  searchParams: { org?: string; period?: string }
}) {
  const user = await requireAuth()
  const orgId = searchParams.org
  const period = searchParams.period || 'month'

  // Get date range
  const now = new Date()
  const periodStart =
    period === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)

  // Fetch usage data
  const summary = await getUsageSummary({
    userId: orgId ? undefined : user.id,
    orgId: orgId || undefined,
    periodStart,
    periodEnd: now,
  })

  const aggregated = await getAggregatedUsage({
    userId: orgId ? undefined : user.id,
    orgId: orgId || undefined,
    periodType: period === 'month' ? 'monthly' : 'daily',
    periodStart,
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Usage & Analytics</h1>
      <UsageDashboard
        summary={summary}
        aggregated={aggregated}
        period={period}
        orgId={orgId}
      />
    </div>
  )
}
```

**File to create:** `apps/web/components/usage/usage-dashboard.tsx`

```typescript
'use client'

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
import { useRouter, useSearchParams } from 'next/navigation'
import { UsageIndicator } from '@/components/features/usage-indicator'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface UsageDashboardProps {
  summary: Record<string, number>
  aggregated: any[]
  period: string
  orgId?: string
}

export default function UsageDashboard({
  summary,
  aggregated,
  period,
  orgId,
}: UsageDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePeriodChange = (newPeriod: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('period', newPeriod)
    if (orgId) params.set('org', orgId)
    router.push(`/en/usage?${params.toString()}`)
  }

  // Format data for chart
  const chartData = aggregated.map((agg) => ({
    date: new Date(agg.period_start).toLocaleDateString(),
    [agg.metric_type]: agg.total_quantity,
  }))

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Current Period</h2>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Usage metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
            <CardDescription>Total records created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary['record_created'] || 0}
            </div>
            <UsageIndicator
              featureKey="max_records"
              currentUsage={summary['record_created'] || 0}
              orgId={orgId}
              label="Records"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Calls</CardTitle>
            <CardDescription>Total API requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary['api_call'] || 0}
            </div>
            <UsageIndicator
              featureKey="max_api_calls_per_month"
              currentUsage={summary['api_call'] || 0}
              orgId={orgId}
              label="API Calls"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automations</CardTitle>
            <CardDescription>Automation runs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary['automation_run'] || 0}
            </div>
            <UsageIndicator
              featureKey="max_automations"
              currentUsage={summary['automation_run'] || 0}
              orgId={orgId}
              label="Automations"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage</CardTitle>
            <CardDescription>GB used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((summary['storage_used'] || 0) / 1024 / 1024 / 1024).toFixed(2)} GB
            </div>
            <UsageIndicator
              featureKey="max_storage_gb"
              currentUsage={(summary['storage_used'] || 0) / 1024 / 1024 / 1024}
              orgId={orgId}
              label="Storage (GB)"
            />
          </CardContent>
        </Card>
      </div>

      {/* Usage chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>Activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="record_created" fill="#8884d8" name="Records" />
              <Bar dataKey="api_call" fill="#82ca9d" name="API Calls" />
              <Bar dataKey="automation_run" fill="#ffc658" name="Automations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### Step 4: Create Admin Analytics Dashboard

**File to create:** `apps/web/app/[locale]/console/analytics/page.tsx`

```typescript
import { requireAdmin } from '@/lib/auth/server'
import { createClient } from '@supabase/supabase-js'
import AdminAnalyticsDashboard from '@/components/admin/analytics-dashboard'

// Use service role for admin analytics
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  // Fetch platform-wide metrics
  const [
    totalUsers,
    totalOrgs,
    activeSubscriptions,
    usageSummary,
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('org_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('usage_aggregations').select('metric_type, total_quantity').eq('period_type', 'monthly'),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Platform Analytics</h1>
      <AdminAnalyticsDashboard
        totalUsers={totalUsers.count || 0}
        totalOrgs={totalOrgs.count || 0}
        activeSubscriptions={activeSubscriptions.count || 0}
        usageSummary={usageSummary.data || []}
      />
    </div>
  )
}
```

---

### Step 5: Create Aggregation Cron Job

**File to create:** `apps/web/app/api/cron/aggregate-usage/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { triggerUsageAggregation } from '@/lib/usage/server'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()

    // Run daily aggregation for yesterday
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const dayEnd = new Date(yesterday)
    dayEnd.setHours(23, 59, 59, 999)

    await triggerUsageAggregation({
      periodType: 'daily',
      periodStart: yesterday,
      periodEnd: dayEnd,
    })

    // If first day of month, run monthly aggregation for last month
    if (now.getDate() === 1) {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

      await triggerUsageAggregation({
        periodType: 'monthly',
        periodStart: lastMonth,
        periodEnd: lastMonthEnd,
      })
    }

    return NextResponse.json({ success: true, timestamp: now.toISOString() })
  } catch (error) {
    console.error('Aggregation cron error:', error)
    return NextResponse.json(
      { error: 'Aggregation failed' },
      { status: 500 }
    )
  }
}
```

**Add to `vercel.json` or equivalent:**

```json
{
  "crons": [
    {
      "path": "/api/cron/aggregate-usage",
      "schedule": "0 1 * * *"
    }
  ]
}
```

---

## ✅ Acceptance Criteria

- [ ] Usage event logging utilities created
- [ ] Usage tracking added to all key actions
- [ ] Logging is non-blocking (never blocks user actions)
- [ ] Usage dashboard displays current period metrics
- [ ] Usage trends chart shows historical data
- [ ] Admin analytics dashboard shows platform-wide metrics
- [ ] Aggregation cron job runs daily
- [ ] Monthly aggregation runs on first of month
- [ ] Usage indicators show real-time limits
- [ ] Export functionality works
- [ ] Integration tests pass
- [ ] E2E tests pass

---

## ✅ Definition of Done Checklist

- [ ] All acceptance criteria met
- [ ] TypeScript strict mode - zero errors
- [ ] ESLint + Prettier pass
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Cron job configured and tested
- [ ] Usage logging never blocks user actions
- [ ] Aggregations improve query performance
- [ ] Admin dashboard secure (admin-only access)
- [ ] MCP verification performed

---

## 🔍 Verification Commands

```bash
cd apps/web && pnpm typecheck && pnpm lint && pnpm test && pnpm e2e && pnpm build

# Verify usage events via MCP
call SupabaseMCP.select {"table": "usage_events", "select": "user_id,org_id,event_type,quantity,created_at", "limit": 20}

# Verify aggregations via MCP
call SupabaseMCP.select {"table": "usage_aggregations", "select": "period_type,period_start,metric_type,total_quantity", "limit": 20}

# Trigger manual aggregation for testing
call SupabaseMCP.executeSQL {"query": "SELECT aggregate_usage('daily', '2025-01-01', '2025-01-02')"}
```

---

## 🎉 Phase 2 Complete!

All application code implementation phases are now complete. The system is ready for production deployment with:

✅ Full authentication & role-based access control  
✅ Complete profile management  
✅ Multi-organization support  
✅ API routes & real-time validation  
✅ Stripe billing integration  
✅ Plan-based feature gating  
✅ Comprehensive usage tracking & analytics  

**Next Steps:**
1. Deploy to staging environment
2. Run full E2E test suite
3. Performance testing & optimization
4. Security audit
5. Production deployment


