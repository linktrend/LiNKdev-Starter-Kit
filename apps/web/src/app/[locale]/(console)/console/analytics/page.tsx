import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

import { requireAdmin } from '@/lib/auth/server'
import { env } from '@/env'
import type { Database } from '@/types/database.types'
import AdminAnalyticsDashboard from '@/components/admin/analytics-dashboard'

export const metadata: Metadata = {
  title: 'Console - Analytics',
}

function getAdminClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase configuration missing for admin analytics')
  }

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export default async function ConsoleAnalyticsPage() {
  await requireAdmin()
  const supabase = getAdminClient() as any
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [usersCount, orgsCount, subsCount, usageAggregate] = await Promise.all([
    supabase.from('users').select('id', { head: true, count: 'exact' }),
    supabase.from('organizations').select('id', { head: true, count: 'exact' }),
    supabase
      .from('org_subscriptions')
      .select('id', { head: true, count: 'exact' })
      .eq('status', 'active'),
    supabase
      .from('usage_aggregations')
      .select('metric_type, total_quantity')
      .eq('period_type', 'monthly')
      .gte('period_start', monthStart),
  ])

  const usageSummary = (usageAggregate.data ?? []) as any

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">
          High-level overview of user growth, subscriptions, and platform usage.
        </p>
      </div>
      <AdminAnalyticsDashboard
        totalUsers={usersCount.count ?? 0}
        totalOrgs={orgsCount.count ?? 0}
        activeSubscriptions={subsCount.count ?? 0}
        usageSummary={usageSummary}
      />
    </div>
  )
}
