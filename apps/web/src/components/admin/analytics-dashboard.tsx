import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UsageSummaryRow {
  metric_type: string
  total_quantity: number
}

interface AdminAnalyticsDashboardProps {
  totalUsers: number
  totalOrgs: number
  activeSubscriptions: number
  usageSummary: UsageSummaryRow[]
}

const metricLabels: Record<string, string> = {
  record_created: 'Records',
  api_call: 'API Calls',
  automation_run: 'Automations',
  storage_used: 'Storage (bytes)',
  schedule_executed: 'Schedules',
  ai_tokens_used: 'AI Tokens',
  user_active: 'Active Users',
}

export default function AdminAnalyticsDashboard({
  totalUsers,
  totalOrgs,
  activeSubscriptions,
  usageSummary,
}: AdminAnalyticsDashboardProps) {
  const topUsage = [...usageSummary].sort((a, b) => Number(b.total_quantity) - Number(a.total_quantity)).slice(0, 5)

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>All registered accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>Active organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrgs.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>Billing status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeSubscriptions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Breakdown</CardTitle>
          <CardDescription>Aggregated metrics for the current month</CardDescription>
        </CardHeader>
        <CardContent>
          {topUsage.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage data available.</p>
          ) : (
            <div className="space-y-3">
              {topUsage.map((metric) => (
                <div key={metric.metric_type} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {metricLabels[metric.metric_type] ?? metric.metric_type}
                    </p>
                    <p className="text-xs text-muted-foreground">{metric.metric_type}</p>
                  </div>
                  <div className="text-lg font-semibold">{Number(metric.total_quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
