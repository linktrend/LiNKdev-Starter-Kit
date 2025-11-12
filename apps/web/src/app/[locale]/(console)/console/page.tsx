'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Database,
  ExternalLink,
  FileWarning,
  LifeBuoy,
  LineChart,
  ShieldHalf,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/utils/cn';
import { buildLocalePath } from '@/lib/locale';
import {
  overviewMockData,
  type ApiStatus,
  type BillingSnapshot,
  type DatabaseStatus,
  type ErrorItem,
  type HealthCheck,
  type KpiStat,
  type OverviewMockData,
  type SecuritySnapshot,
} from './__mocks__/overview';

const severityAccent: Record<ErrorItem['severity'], string> = {
  critical:
    'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/30',
  warning:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30',
  info:
    'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30',
};

const healthStatusBadge: Record<HealthCheck['status'], string> = {
  pass: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30',
  warn: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30',
  fail: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/30',
};

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });

export default function ConsoleOverviewPage() {
  const [data, setData] = useState<OverviewMockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';
  const buildPath = useCallback(
    (path: string = '/') => buildLocalePath(locale, path),
    [locale]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData(overviewMockData);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, []);

  const kpis = data?.kpis ?? overviewMockData.kpis;
  const errorSparkline = useMemo(() => [12, 18, 16, 20, 14, 12, 10, 8, 11, 9, 7, 5], []);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <section aria-labelledby="overview-kpis">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 id="overview-kpis" className="text-lg font-semibold">
              Operational Snapshot
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor adoption, infrastructure health, and revenue signals at a glance.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={buildPath('/console/profile')}>
              Manage Profile
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
          {kpis.map((card) =>
            isLoading ? (
              <Card key={card.id} className="bg-card/80">
                <CardHeader className="pb-2">
                  <Skeleton className="h-3 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </CardContent>
              </Card>
            ) : (
              <KpiCard key={card.id} stat={card} />
            )
          )}
        </div>
      </section>

      <section aria-labelledby="operational-health">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="operational-health" className="text-base font-semibold">
              Operational Health
            </h2>
            <p className="text-sm text-muted-foreground">
              High-level pulse on infrastructure, services, and databases.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href={buildPath('/console/health')}>
              View Full Health Report
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <LifeBuoy className="h-4 w-4 text-primary" />
                Health Checks
              </CardTitle>
              <CardDescription>Service probes in the last five minutes</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {(data?.healthChecks ?? overviewMockData.healthChecks).map((check) => (
                <div key={check.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{check.label}</p>
                    <p className="text-xs text-muted-foreground">Last probe {check.lastProbe}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'border text-xs capitalize min-w-[96px] justify-center text-center',
                      healthStatusBadge[check.status]
                    )}
                  >
                    {check.status === 'pass'
                      ? 'Operational'
                      : check.status === 'warn'
                      ? 'Degraded'
                      : 'Down'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-emerald-600" />
                Database Status
              </CardTitle>
              <CardDescription>Primary cluster metrics</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 text-sm">
              <DatabaseStatusList status={data?.database ?? overviewMockData.database} />
            </CardContent>
            <CardContent className="pt-0">
              <Button asChild variant="ghost" size="sm" className="h-8 w-full justify-center text-xs">
                <Link href={buildPath('/console/database')}>
                  Go to Database
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-sky-600" />
                API Status
              </CardTitle>
              <CardDescription>Realtime request performance</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 text-sm">
              <ApiStatusList status={data?.api ?? overviewMockData.api} />
            </CardContent>
            <CardContent className="pt-0">
              <Button asChild variant="ghost" size="sm" className="h-8 w-full justify-center text-xs">
                <Link href={buildPath('/console/errors?service=api')}>
                  Inspect API Logs
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="system-activity">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="system-activity" className="text-base font-semibold">
              System Activity &amp; Logs
            </h2>
            <p className="text-sm text-muted-foreground">
              Highlights from the error pipeline and log ingestion.
            </p>
          </div>
          <div className="flex gap-2">
            {['All', 'Critical', 'Warnings'].map((filter) => (
              <Button
                key={filter}
                variant={filter === 'All' ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-xs"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileWarning className="h-4 w-4 text-destructive" />
                Recent Errors
              </CardTitle>
              <CardDescription>Top 5 events across services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-center">Severity</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.errors ?? overviewMockData.errors).map((error) => (
                    <TableRow key={error.id} className="cursor-pointer hover:bg-muted/60">
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{error.service}</TableCell>
                      <TableCell className="text-sm text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            'inline-flex min-w-[96px] justify-center border text-xs capitalize',
                            severityAccent[error.severity]
                          )}
                        >
                          {error.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <Link href={buildPath(error.link)} className="line-clamp-1 hover:underline">
                          {error.message}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="flex flex-col lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <LineChart className="h-4 w-4 text-primary" />
                Log Activity Trend
              </CardTitle>
              <CardDescription>Last 24 hours • aggregated</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex h-28 items-end gap-1 rounded-md bg-muted/60 p-3">
                {errorSparkline.map((value, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-t bg-primary/70"
                    style={{ height: `${Math.max(10, value * 3)}%` }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="text-lg font-semibold text-foreground">
                    {(errorSparkline.reduce((acc, cur) => acc + cur, 0) / errorSparkline.length).toFixed(1)}
                  </span>
                  <p className="text-xs">Avg logs / min</p>
                </div>
                <Separator orientation="vertical" className="hidden h-10 lg:block" />
                <p className="text-xs">
                  Peaks correspond to deploy windows and intake bursts.
                </p>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 w-full justify-center text-xs"
              >
                <Link href={buildPath('/console/errors')}>
                  Open Logs
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="user-security" className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              User &amp; Security Snapshot
            </CardTitle>
            <CardDescription>Engagement signals and access alerts</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 text-sm">
            <UserSecurityContent snapshot={data?.security ?? overviewMockData.security} />
          </CardContent>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm" className="h-8 flex-1 justify-center">
                <Link href={buildPath('/console/security')}>
                  Open Audit Trail
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="h-8 flex-1 justify-center">
                <Link href={buildPath('/console/profile')}>Manage Sessions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-sky-600" />
              Business &amp; Billing Snapshot
            </CardTitle>
            <CardDescription>Revenue and conversion performance</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 text-sm">
            <BillingContent billing={data?.billing ?? overviewMockData.billing} buildPath={buildPath} />
          </CardContent>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm" className="h-8 flex-1 justify-center">
                <Link href={buildPath('/console/billing')}>
                  Billing &amp; Subscriptions
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="h-8 flex-1 justify-center">
                <Link href={buildPath('/console/config')}>Configuration</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function KpiCard({ stat }: { stat: KpiStat }) {
  const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
  const max = Math.max(...stat.sparkline);

  return (
    <Card className="bg-card/95 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
            {stat.label}
          </CardDescription>
          <Badge variant="outline" className="h-6 px-2 text-[10px] font-medium">
            {stat.periodLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <TrendIcon
            className={cn(
              'h-4 w-4',
              stat.trend === 'up' ? 'text-emerald-600' : 'text-amber-600'
            )}
          />
          <span
            className={cn(
              stat.trend === 'up' ? 'text-emerald-600' : 'text-amber-600'
            )}
          >
            {stat.delta}
          </span>
        </div>
        <CardTitle className="text-2xl font-semibold">{stat.value}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{stat.description}</p>
        <div className="flex h-12 items-end gap-[3px] rounded-md bg-muted/60 p-2">
          {stat.sparkline.map((value, idx) => (
            <div
              key={idx}
              className={cn(
                'flex-1 rounded-t bg-primary/70',
                stat.trend === 'down' && 'bg-amber-500/80'
              )}
              style={{ height: `${(value / max) * 100 || 0}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DatabaseStatusList({ status }: { status: DatabaseStatus }) {
  return (
    <dl className="space-y-2">
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">Latency</dt>
        <dd className="font-medium">{status.latencyMs} ms</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">Query success</dt>
        <dd className="font-medium">{status.successRate}%</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">Storage</dt>
        <dd className="font-medium">
          {status.storageUsedGb} GB / {status.storageTotalGb} GB
        </dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">Replication lag</dt>
        <dd className="font-medium">{status.replicationLagMs} ms</dd>
      </div>
    </dl>
  );
}

function ApiStatusList({ status }: { status: ApiStatus }) {
  return (
    <dl className="space-y-2">
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">Requests / sec</dt>
        <dd className="font-medium">{status.requestsPerSecond}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">Success ratio</dt>
        <dd className="font-medium">{status.successRatio}%</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">P95 latency</dt>
        <dd className="font-medium">{status.p95LatencyMs} ms</dd>
      </div>
    </dl>
  );
}

function UserSecurityContent({ snapshot }: { snapshot: SecuritySnapshot }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="text-xs uppercase text-muted-foreground">New signups (7d)</p>
          <p className="text-2xl font-semibold">{snapshot.signups7d}</p>
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              snapshot.signupTrend === 'up' ? 'text-emerald-600' : 'text-amber-600'
            )}
          >
            {snapshot.signupTrend === 'up' ? '+6.8%' : '-4.1%'} vs prior week
          </p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="text-xs uppercase text-muted-foreground">Active sessions</p>
          <p className="text-2xl font-semibold">{snapshot.sessionsActive}</p>
          <p className="mt-1 text-xs text-muted-foreground">Across all environments</p>
        </div>
      </div>
      <Separator />
      <div className="space-y-2">
        <p className="text-xs uppercase text-muted-foreground">Access alerts (24h)</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-md bg-amber-50 p-3 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
            <p className="text-xs">Failed logins</p>
            <p className="text-xl font-semibold">{snapshot.accessAlerts.failedLogins}</p>
          </div>
          <div className="rounded-md bg-blue-50 p-3 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
            <p className="text-xs">Admin invites</p>
            <p className="text-xl font-semibold">{snapshot.accessAlerts.newAdminInvites}</p>
          </div>
          <div className="rounded-md bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
            <p className="text-xs">MFA coverage</p>
            <p className="text-xl font-semibold">
              {snapshot.accessAlerts.mfaCoverage}
              <span className="text-sm font-medium">%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingContent({ billing, buildPath }: { billing: BillingSnapshot; buildPath: (path?: string) => string }) {
  const fmt = currencyFormatter(billing.currency);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="text-xs uppercase text-muted-foreground">MRR</p>
          <p className="text-xl font-semibold">{fmt.format(billing.mrr)}</p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="text-xs uppercase text-muted-foreground">ARR</p>
          <p className="text-xl font-semibold">{fmt.format(billing.arr)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="text-xs uppercase text-muted-foreground">Churn rate (30d)</p>
          <p className="text-xl font-semibold">{billing.churnRate}%</p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="text-xs uppercase text-muted-foreground">Trial conversions</p>
          <p className="text-xl font-semibold">{billing.trialConversions}</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border bg-destructive/10 p-4 text-sm text-destructive">
        <div>
          <p className="text-xs uppercase">Failed payments (7d)</p>
          <p className="text-xl font-semibold">{billing.failedPayments}</p>
        </div>
        <Button asChild size="sm" variant="destructive" className="h-8 px-3">
          <Link href={buildPath('/console/billing?filter=failed')}>View</Link>
        </Button>
      </div>
    </div>
  );
}
