import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/server';
import { AnalyticsDashboard } from '@/components/console/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Console - Analytics',
};

export default async function ConsoleAnalyticsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Real-time overview of system usage, user activity, and performance metrics.
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
