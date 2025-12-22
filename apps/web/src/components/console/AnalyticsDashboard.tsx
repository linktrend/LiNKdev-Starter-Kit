'use client';

import { DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { DateRangeSelector } from './DateRangeSelector';
import { AnalyticsMetricCard } from './AnalyticsMetricCard';
import { AnalyticsChart } from './AnalyticsChart';
import { formatBytes, formatDuration } from '@/lib/analytics/formatters';

export function AnalyticsDashboard({ orgId }: { orgId?: string }) {
  const {
    dateRange,
    setDateRange,
    loading,
    summary,
    apiMetrics,
    userMetrics,
    featureMetrics,
    refresh,
    exportData,
  } = useAnalytics(orgId); // Passing orgId scopes analytics to the selected organization

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <DateRangeSelector dateRange={dateRange} onChange={setDateRange} />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCwIcon className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('json')}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsMetricCard
          title="Total API Calls"
          value={summary?.totalApiCalls || 0}
          loading={loading}
          description="Total API requests in period"
        />
        <AnalyticsMetricCard
          title="Active Users"
          value={summary?.activeUsers || 0}
          loading={loading}
          description="Unique active users"
        />
        <AnalyticsMetricCard
          title="Total Events"
          value={summary?.totalEvents || 0}
          loading={loading}
          description="Usage events tracked"
        />
        <AnalyticsMetricCard
          title="Storage Used"
          value={formatBytes(summary?.storageUsed || 0)}
          loading={loading}
          description="Total storage across system"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AnalyticsChart
          title="User Growth"
          description="Active vs New Users over time"
          data={userMetrics}
          type="area"
          loading={loading}
          xAxisKey="date"
          config={[
            { dataKey: 'activeUsers', label: 'Active Users', color: 'hsl(var(--primary))' },
            { dataKey: 'newUsers', label: 'New Users', color: 'hsl(var(--success))' },
          ]}
        />
        <AnalyticsChart
          title="Top Features"
          description="Most used features by event count"
          data={featureMetrics.slice(0, 10)}
          type="bar"
          loading={loading}
          xAxisKey="feature"
          config={[
            { dataKey: 'usageCount', label: 'Usage Count', color: 'hsl(var(--primary))' },
          ]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <AnalyticsChart
          title="API Performance"
          description="Calls and Errors by Endpoint"
          data={apiMetrics.slice(0, 15)}
          type="bar"
          loading={loading}
          xAxisKey="endpoint"
          height={400}
          config={[
            { dataKey: 'calls', label: 'Calls', color: 'hsl(var(--success))' },
            { dataKey: 'errors', label: 'Errors', color: 'hsl(var(--danger))' },
          ]}
          tooltipFormatter={(value, name) => [
             value.toLocaleString(),
             name
          ]}
        />
      </div>
    </div>
  );
}
