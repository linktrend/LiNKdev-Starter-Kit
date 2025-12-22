'use client';

import { AnalyticsDashboard } from '@/components/console/AnalyticsDashboard';
import { Spinner } from '@/components/ui/spinner';
import { useOrg } from '@/contexts/OrgContext';

export function AnalyticsPageClient() {
  const { currentOrgId, isLoading } = useOrg();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12 text-muted-foreground">
        <Spinner />
        <span className="ml-3">Loading organization context…</span>
      </div>
    );
  }

  if (!currentOrgId) {
    return (
      <div className="rounded-lg border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Select an organization to view analytics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Real-time overview of system usage, user activity, and performance metrics.
        </p>
      </div>
      <AnalyticsDashboard orgId={currentOrgId} />
    </div>
  );
}
