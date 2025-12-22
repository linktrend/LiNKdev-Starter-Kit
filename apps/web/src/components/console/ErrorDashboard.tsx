import { AlertCircle, Activity, BarChart3, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Severity } from '@/app/actions/errors';

export type ErrorStatsView = {
  totals: { last24h: number; last7d: number; last30d: number };
  bySeverity: Record<Severity, number>;
  trend: { date: string; count: number }[];
  topErrors: { grouping_hash: string; message: string | null; count: number; severity: Severity; last_seen: string }[];
  affectedUsers: number;
};

type Props = {
  stats?: ErrorStatsView;
  loading?: boolean;
  onRefresh?: () => void;
};

export function ErrorDashboard({ stats, loading, onRefresh }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Errors (24h)</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '–' : stats?.totals.last24h ?? 0}</div>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Errors (7d)</CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '–' : stats?.totals.last7d ?? 0}</div>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Affected Users</CardTitle>
          <Users className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '–' : stats?.affectedUsers ?? 0}</div>
          <p className="text-xs text-muted-foreground">Unique users last 30d</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Severity breakdown</CardTitle>
          {onRefresh ? (
            <button className="text-xs text-muted-foreground hover:underline" onClick={onRefresh}>
              Refresh
            </button>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {(['critical', 'error', 'warning', 'info'] as Severity[]).map((sev) => (
            <Badge key={sev} variant="outline" className="flex items-center gap-2">
              <span className="capitalize">{sev}</span>
              <span className="font-semibold">{loading ? '–' : stats?.bySeverity?.[sev] ?? 0}</span>
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trend (30d)</CardTitle>
          <Activity className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-24">
            {(stats?.trend ?? []).slice(-14).map((point) => (
              <div
                key={point.date}
                className="flex-1 bg-primary/20 rounded"
                style={{ height: `${Math.min(100, Math.max(6, point.count * 6))}%` }}
                title={`${point.date}: ${point.count}`}
              />
            ))}
            {(stats?.trend?.length ?? 0) === 0 && <span className="text-xs text-muted-foreground">No data</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top recurring errors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(stats?.topErrors ?? []).map((err) => (
            <div key={err.grouping_hash} className="flex items-center justify-between border rounded-md px-3 py-2">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium">{err.message ?? 'Unknown error'}</div>
                <div className="text-xs text-muted-foreground">
                  Last seen {new Date(err.last_seen).toLocaleString()} • {err.count} occurrences
                </div>
              </div>
              <Badge variant="outline" className="capitalize">{err.severity}</Badge>
            </div>
          ))}
          {(stats?.topErrors?.length ?? 0) === 0 && (
            <p className="text-xs text-muted-foreground">No recurring errors yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
