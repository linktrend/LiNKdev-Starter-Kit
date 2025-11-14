import { unstable_cache } from 'next/cache'

import { requireAuth, createClient } from '@/lib/auth/server'
import { UsageDashboard } from '@/components/usage/usage-dashboard'
import { getAggregatedUsage, getUsageSummary } from '@/lib/usage/server'

const cachedUsageSummary = unstable_cache(
  async (params: Parameters<typeof getUsageSummary>[0]) => getUsageSummary(params),
  ['usage-summary'],
  { revalidate: 60 }
)

const cachedAggregatedUsage = unstable_cache(
  async (params: Parameters<typeof getAggregatedUsage>[0]) => getAggregatedUsage(params),
  ['usage-aggregated'],
  { revalidate: 300 }
)

type UsagePageProps = {
  params: { locale: string }
  searchParams: { org?: string; period?: string }
}

const allowedPeriods = ['week', 'month', 'year'] as const
type AllowedPeriod = (typeof allowedPeriods)[number]

function resolvePeriod(period?: string): AllowedPeriod {
  if (allowedPeriods.includes(period as AllowedPeriod)) {
    return period as AllowedPeriod
  }
  return 'month'
}

function getPeriodRange(period: AllowedPeriod) {
  const now = new Date()
  const end = new Date(now)
  let start: Date

  switch (period) {
    case 'week': {
      start = new Date(now)
      start.setDate(start.getDate() - 7)
      break
    }
    case 'year': {
      start = new Date(now.getFullYear(), 0, 1)
      break
    }
    case 'month':
    default: {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    }
  }

  return { start, end }
}

function getAggregationPeriod(period: AllowedPeriod) {
  return period === 'year' ? 'monthly' : 'daily'
}

async function assertOrgMembership(userId: string, orgId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('organization_members')
    .select('id')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!data) {
    throw new Error('You do not have access to this organization')
  }
}

export default async function UsagePage({ params, searchParams }: UsagePageProps) {
  const user = await requireAuth()
  const orgId = searchParams.org || undefined
  const period = resolvePeriod(searchParams.period)

  if (orgId) {
    await assertOrgMembership(user.id, orgId)
  }

  const { start, end } = getPeriodRange(period)
  const aggregationPeriod = getAggregationPeriod(period)

  const [summary, aggregated] = await Promise.all([
    cachedUsageSummary({
      userId: orgId ? undefined : user.id,
      orgId,
      periodStart: start,
      periodEnd: end,
    }),
    cachedAggregatedUsage({
      userId: orgId ? undefined : user.id,
      orgId,
      periodType: aggregationPeriod,
      periodStart: start,
      periodEnd: end,
    }),
  ])

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Usage &amp; Analytics</h1>
        <p className="text-muted-foreground">Monitor your consumption, plan limits, and historical trends.</p>
      </div>
      <UsageDashboard
        summary={summary}
        aggregated={aggregated}
        period={period}
        orgId={orgId}
        locale={params.locale}
        exportFrom={start.toISOString()}
        exportTo={end.toISOString()}
      />
    </div>
  )
}
