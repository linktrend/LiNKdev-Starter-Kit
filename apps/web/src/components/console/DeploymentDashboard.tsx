'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DateTimeCell } from '@/components/ui/table-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Edit2,
  FileText,
  Layers,
  LineChart,
  ListChecks,
  Play,
  Plus,
  RefreshCw,
  Terminal,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/utils/cn';

type TrendDirection = 'up' | 'down';
type StageStatus = 'idle' | 'deploying' | 'succeeded' | 'failed';
type DeploymentStatus = 'success' | 'failed' | 'running';
type BuildStatus = 'success' | 'failed' | 'running';
type EnvScope = 'development' | 'staging' | 'production';

interface SummaryCardData {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: TrendDirection;
  subtext: string;
}

interface PipelineStage {
  id: string;
  name: string;
  status: StageStatus;
  lastDeployment: string;
  description: string;
  manualTrigger: boolean;
}

interface DeploymentRecord {
  id: string;
  timestamp: string;
  commit: string;
  branch: string;
  environment: EnvScope;
  actor: string;
  status: DeploymentStatus;
  duration: string;
  logs: string[];
  metadata: {
    services: number;
    artifacts: number;
  };
}

interface BuildRecord {
  id: string;
  triggeredBy: string;
  commit: string;
  branch: string;
  duration: string;
  status: BuildStatus;
  progress?: number;
  logs: string[];
}

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  scope: EnvScope;
  updatedAt: string;
  isSecret: boolean;
}

type SheetPayload =
  | { type: 'deployment'; record: DeploymentRecord }
  | { type: 'build'; record: BuildRecord };

const summaryCards: SummaryCardData[] = [
  {
    id: 'builds',
    label: 'Builds Today',
    value: '32',
    delta: '+12%',
    trend: 'up',
    subtext: 'vs yesterday',
  },
  {
    id: 'avg-time',
    label: 'Average Build Time',
    value: '2m 18s',
    delta: '-14s',
    trend: 'down',
    subtext: 'p95: 4m 05s',
  },
  {
    id: 'success-rate',
    label: 'Success Rate',
    value: '96.4%',
    delta: '+2.1%',
    trend: 'up',
    subtext: 'last 7 days',
  },
  {
    id: 'last-deployment',
    label: 'Last Deployment',
    value: '14:32 UTC',
    delta: '+0.2%',
    trend: 'up',
    subtext: 'deploy-48920',
  },
];

const pipelineStages: PipelineStage[] = [
  {
    id: 'development',
    name: 'Development',
    status: 'deploying',
    lastDeployment: '12 minutes ago',
    description: 'Preview builds & integration tests',
    manualTrigger: true,
  },
  {
    id: 'staging',
    name: 'Staging',
    status: 'succeeded',
    lastDeployment: 'Today · 09:45 UTC',
    description: 'Release candidate validation',
    manualTrigger: true,
  },
  {
    id: 'production',
    name: 'Production',
    status: 'succeeded',
    lastDeployment: 'Today · 14:32 UTC',
    description: 'Global traffic · 6 regions',
    manualTrigger: false,
  },
];

const deploymentHistory: DeploymentRecord[] = [
  {
    id: 'deploy-48920',
    timestamp: '2025-01-28T14:32:00Z',
    commit: 'a3f9b2c',
    branch: 'main',
    environment: 'production',
    actor: 'Sarah Johnson',
    status: 'success',
    duration: '2m 14s',
    logs: [
      '✅ Build succeeded in 128s',
      '✅ Applied database migrations',
      '✅ Traffic shifted to new revision',
    ],
    metadata: { services: 8, artifacts: 4 },
  },
  {
    id: 'deploy-48919',
    timestamp: '2025-01-28T12:08:00Z',
    commit: 'd7e8f1a',
    branch: 'release/2.5.0',
    environment: 'staging',
    actor: 'Automated Pipeline',
    status: 'success',
    duration: '1m 49s',
    logs: ['✅ Health checks passed', '⚙️ Running regression pack', '✅ Canary stable after 5m'],
    metadata: { services: 6, artifacts: 3 },
  },
  {
    id: 'deploy-48918',
    timestamp: '2025-01-27T23:42:00Z',
    commit: 'e4d5c2b',
    branch: 'main',
    environment: 'production',
    actor: 'John Doe',
    status: 'failed',
    duration: '58s',
    logs: ['⚠️ Preflight detected schema drift', '❌ Deployment rolled back automatically'],
    metadata: { services: 8, artifacts: 4 },
  },
];

const buildHistory: BuildRecord[] = [
  {
    id: 'build-9812',
    triggeredBy: 'Auto (PR #2841)',
    commit: '58b43c1',
    branch: 'feature/ltm-audit',
    duration: 'Running · 65%',
    status: 'running',
    progress: 65,
    logs: ['⬆️ Uploading artifacts…', '⏳ Awaiting integration tests'],
  },
  {
    id: 'build-9811',
    triggeredBy: 'Michael Chen',
    commit: 'f3c9120',
    branch: 'main',
    duration: '1m 54s',
    status: 'success',
    logs: ['✅ Tests complete', '✅ Bundle size 412kb'],
  },
  {
    id: 'build-9810',
    triggeredBy: 'Scheduled (nightly)',
    commit: '7b1290a',
    branch: 'develop',
    duration: '3m 12s',
    status: 'failed',
    logs: ['❌ Unit tests timed out after 180s'],
  },
];

const initialEnvVars: EnvironmentVariable[] = [
  {
    id: 'env-1',
    key: 'API_BASE_URL',
    value: 'https://api.internal.example.com',
    scope: 'development',
    updatedAt: '2025-01-27T18:02:00Z',
    isSecret: false,
  },
  {
    id: 'env-2',
    key: 'STRIPE_SECRET',
    value: 'sk_live_*******************',
    scope: 'production',
    updatedAt: '2025-01-26T10:45:00Z',
    isSecret: true,
  },
  {
    id: 'env-3',
    key: 'SENTRY_DSN',
    value: 'https://public@sentry.io/123',
    scope: 'staging',
    updatedAt: '2025-01-25T07:12:00Z',
    isSecret: false,
  },
];

const stageBadgePresets: Record<StageStatus, Parameters<typeof getBadgeClasses>[0]> = {
  idle: 'status.pending',
  deploying: 'deployment.in_progress',
  succeeded: 'deployment.success',
  failed: 'deployment.failed',
};

const deploymentStatusPresets: Record<DeploymentStatus, Parameters<typeof getBadgeClasses>[0]> = {
  success: 'deployment.success',
  failed: 'deployment.failed',
  running: 'deployment.in_progress',
};

const buildStatusPresets: Record<BuildStatus, Parameters<typeof getBadgeClasses>[0]> = {
  success: 'deployment.success',
  failed: 'deployment.failed',
  running: 'deployment.in_progress',
};

const scopeBadges: Record<EnvScope, Parameters<typeof getBadgeClasses>[0]> = {
  development: 'env.development',
  staging: 'env.staging',
  production: 'env.production',
};

const summaryTrendIcon: Record<TrendDirection, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
};

const statusLabel: Record<StageStatus | DeploymentStatus | BuildStatus, string> = {
  idle: 'Idle',
  deploying: 'Deploying',
  succeeded: 'Succeeded',
  failed: 'Failed',
  success: 'Success',
  running: 'Running',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function formatDate(value: string) {
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatRelative(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  const minutes = Math.round(diff / (1000 * 60));

  if (Math.abs(minutes) < 60) {
    return relativeFormatter.format(minutes, 'minute');
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return relativeFormatter.format(hours, 'hour');
  }

  const days = Math.round(hours / 24);
  return relativeFormatter.format(days, 'day');
}

interface DeploymentDashboardProps {
  variant?: 'page' | 'embedded';
}

export function DeploymentDashboard({ variant = 'page' }: DeploymentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'deployments' | 'builds' | 'env'>('deployments');
  const [detailSheet, setDetailSheet] = useState<SheetPayload | null>(null);
  const [envVariables, setEnvVariables] = useState<EnvironmentVariable[]>(initialEnvVars);
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [envModalMode, setEnvModalMode] = useState<'create' | 'edit'>('create');
  const [envEditing, setEnvEditing] = useState<EnvironmentVariable | null>(null);
  const [envForm, setEnvForm] = useState({
    key: '',
    value: '',
    scope: 'development' as EnvScope,
    isSecret: true,
  });

  const openDetailSheet = (payload: SheetPayload) => setDetailSheet(payload);
  const closeDetailSheet = () => setDetailSheet(null);

  const handleOpenEnvModal = (mode: 'create' | 'edit', variable?: EnvironmentVariable) => {
    setEnvModalMode(mode);
    setEnvEditing(variable ?? null);
    setEnvForm(
      variable
        ? { key: variable.key, value: variable.value, scope: variable.scope, isSecret: variable.isSecret }
        : { key: '', value: '', scope: 'development', isSecret: true }
    );
    setEnvModalOpen(true);
  };

  const handleSaveEnvVar = () => {
    if (!envForm.key.trim()) return;

    if (envModalMode === 'create') {
      setEnvVariables((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          key: envForm.key.trim().toUpperCase(),
          value: envForm.value,
          scope: envForm.scope,
          updatedAt: new Date().toISOString(),
          isSecret: envForm.isSecret,
        },
      ]);
    } else if (envEditing) {
      setEnvVariables((prev) =>
        prev.map((envVar) =>
          envVar.id === envEditing.id
            ? {
                ...envVar,
                key: envForm.key.trim().toUpperCase(),
                value: envForm.value,
                scope: envForm.scope,
                updatedAt: new Date().toISOString(),
                isSecret: envForm.isSecret,
              }
            : envVar
        )
      );
    }

    setEnvModalOpen(false);
  };

  const summaryCardsView = useMemo(
    () =>
      summaryCards.map((card) => {
        const TrendIcon = summaryTrendIcon[card.trend];
        const trendColor = card.trend === 'up' ? 'text-emerald-600' : 'text-amber-600';

        return (
          <Card key={card.id} className="bg-card/95 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                {card.label}
              </CardDescription>
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <span className={cn(trendColor)}>{card.delta}</span>
                {card.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              </div>
              <CardTitle className="text-2xl font-semibold">{card.value}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{card.subtext}</span>
              <TrendIcon className={cn('h-4 w-4', trendColor)} />
            </CardContent>
          </Card>
        );
      }),
    []
  );

  const renderPipelineStage = (stage: PipelineStage, index: number) => (
    <Card key={stage.id} className="flex-1 min-w-[240px]">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{stage.name}</CardTitle>
          <Badge className={cn(getBadgeClasses(stageBadgePresets[stage.status]), 'capitalize')}>
            {statusLabel[stage.status]}
          </Badge>
        </div>
        <CardDescription className="text-sm">{stage.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 mt-0.5" />
          <div className="text-sm leading-tight">
            <p className="font-medium text-xs text-muted-foreground">Last Deployment</p>
            <p>{stage.lastDeployment}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {stage.manualTrigger && (
            <Button size="sm" variant="default">
              <Play className="mr-2 h-4 w-4" />
              Deploy
            </Button>
          )}
          <Button size="sm" variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderDeploymentRow = (deployment: DeploymentRecord) => (
    <TableRow
      key={deployment.id}
      className="cursor-pointer hover:bg-muted/60"
      onClick={() => openDetailSheet({ type: 'deployment', record: deployment })}
    >
      <TableCell className="whitespace-nowrap align-top">
        <DateTimeCell date={deployment.timestamp} />
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1 min-w-[160px]">
          <span className="font-mono text-sm truncate">{deployment.commit}</span>
          <span className="text-xs text-muted-foreground truncate">{deployment.branch}</span>
        </div>
      </TableCell>
      <TableCell className="capitalize">{deployment.environment}</TableCell>
      <TableCell>{deployment.actor}</TableCell>
      <TableCell className="w-[10%] text-center">
        <Badge className={cn(getBadgeClasses(deploymentStatusPresets[deployment.status]), 'min-w-[84px] justify-center')}>
          {statusLabel[deployment.status]}
        </Badge>
      </TableCell>
      <TableCell>{deployment.duration}</TableCell>
      <TableCell onClick={(event) => event.stopPropagation()} className="text-center">
        <div className="flex justify-center gap-2">
          <Button size="icon" variant="ghost" aria-label="View logs">
            <FileText className="h-4 w-4" />
          </Button>
          {deployment.status === 'success' && (
            <Button size="icon" variant="ghost" aria-label="Rollback">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  const renderBuildRow = (build: BuildRecord) => (
    <TableRow
      key={build.id}
      className="cursor-pointer hover:bg-muted/60"
      onClick={() => openDetailSheet({ type: 'build', record: build })}
    >
      <TableCell className="font-mono text-sm">{build.id}</TableCell>
      <TableCell>{build.triggeredBy}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1 min-w-[160px]">
          <span className="font-mono text-sm truncate">{build.commit}</span>
          <span className="text-xs text-muted-foreground truncate">{build.branch}</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">{build.duration}</TableCell>
      <TableCell className="text-center">
        <div className="space-y-1">
          <Badge className={cn(getBadgeClasses(buildStatusPresets[build.status]), 'min-w-[90px] justify-center')}>
            {statusLabel[build.status]}
          </Badge>
          {build.status === 'running' && typeof build.progress === 'number' && (
            <Progress
              value={build.progress}
              className="h-1.5 bg-sky-100"
              indicatorClassName="bg-sky-500"
            />
          )}
        </div>
      </TableCell>
      <TableCell onClick={(event) => event.stopPropagation()} className="text-center">
        <div className="flex justify-center gap-2">
          <Button size="icon" variant="ghost" aria-label="View logs">
            <FileText className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" aria-label="Rebuild">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const renderEnvRow = (variable: EnvironmentVariable) => (
    <TableRow key={variable.id}>
      <TableCell className="font-mono text-sm">{variable.key}</TableCell>
      <TableCell className="w-[45%]">
        <p className="truncate font-mono text-xs">
          {variable.isSecret ? '••••••••••••••••' : variable.value}
        </p>
        <p className="text-xs text-muted-foreground">Updated {formatRelative(variable.updatedAt)}</p>
      </TableCell>
      <TableCell className="w-[15%] text-center">
        <Badge className={cn(getBadgeClasses(scopeBadges[variable.scope]), 'capitalize')}>
          {variable.scope}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Button
          size="icon"
          variant="ghost"
          aria-label={`Edit ${variable.key}`}
          onClick={() => handleOpenEnvModal('edit', variable)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );

  const containerClasses =
    variant === 'page'
      ? 'space-y-8 p-4 sm:p-6 lg:p-8'
      : 'space-y-8';

  return (
    <div className={containerClasses}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">Deployment &amp; Build Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Monitor pipelines, inspect histories, and tune runtime configuration.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{summaryCardsView}</div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <LineChart className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Pipeline Overview</h2>
        </div>
        <div className="flex flex-wrap gap-4">{pipelineStages.map(renderPipelineStage)}</div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">History &amp; Configuration</h2>
        </div>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
            <TabsTrigger value="deployments">Deployment History</TabsTrigger>
            <TabsTrigger value="builds">Build History</TabsTrigger>
            <TabsTrigger value="env">Environment Variables</TabsTrigger>
          </TabsList>

          <TabsContent value="deployments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Deployments</CardTitle>
                <CardDescription>Track rollouts across environments and audit outcomes.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Timestamp</TableHead>
                      <TableHead>Commit / Branch</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Deployed By</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{deploymentHistory.map(renderDeploymentRow)}</TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Build History</CardTitle>
                <CardDescription>Inspect build provenance, durations, and test gate results.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Build ID</TableHead>
                      <TableHead>Triggered By</TableHead>
                      <TableHead>Commit / Branch</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-center">Result</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{buildHistory.map(renderBuildRow)}</TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="env" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-base">Environment Variables</CardTitle>
                  <CardDescription>Scope-sensitive values with masking for secrets.</CardDescription>
                </div>
                <Button size="sm" onClick={() => handleOpenEnvModal('create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variable
                </Button>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Variable</TableHead>
                      <TableHead className="w-[45%]">Value</TableHead>
                      <TableHead className="w-[15%] text-center">Scope</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {envVariables.map(renderEnvRow)}
                    {envVariables.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                          No variables configured yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Sheet open={Boolean(detailSheet)} onOpenChange={(open) => !open && closeDetailSheet()}>
        <SheetContent className="w-full overflow-y-auto sm:w-[520px]">
          {detailSheet && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {detailSheet.type === 'deployment' ? (
                    <>
                      <Layers className="h-4 w-4 text-primary" />
                      Deployment {detailSheet.record.id}
                    </>
                  ) : (
                    <>
                      <Terminal className="h-4 w-4 text-primary" />
                      Build {detailSheet.record.id}
                    </>
                  )}
                </SheetTitle>
                <SheetDescription>
                  {detailSheet.type === 'deployment'
                    ? `${detailSheet.record.environment.toUpperCase()} • ${detailSheet.record.branch}@${detailSheet.record.commit}`
                    : `${detailSheet.record.branch}@${detailSheet.record.commit}`}
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="mt-6 h-[calc(100vh-10rem)] pr-4">
                <div className="space-y-6 text-sm">
                  {detailSheet.type === 'deployment' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Triggered By</CardDescription>
                            <CardTitle className="text-base">{detailSheet.record.actor}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-muted-foreground">{formatDate(detailSheet.record.timestamp)}</CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Duration</CardDescription>
                            <CardTitle className="text-base">{detailSheet.record.duration}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-muted-foreground">
                            {detailSheet.record.metadata.services} services · {detailSheet.record.metadata.artifacts} artifacts
                          </CardContent>
                        </Card>
                      </div>
                      <div>
                        <h3 className="mb-2 text-sm font-semibold">Logs</h3>
                        <div className="rounded-lg border bg-muted/50 p-4 font-mono text-xs text-muted-foreground space-y-2">
                          {detailSheet.record.logs.map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <FileText className="mr-2 h-4 w-4" />
                          View Full Logs
                        </Button>
                        <Button className="flex-1" variant="outline">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Rollback
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Triggered By</CardDescription>
                            <CardTitle className="text-base">{detailSheet.record.triggeredBy}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-muted-foreground">commit {detailSheet.record.commit}</CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Status</CardDescription>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Badge className={cn(getBadgeClasses(buildStatusPresets[detailSheet.record.status]), 'capitalize')}>
                                {statusLabel[detailSheet.record.status]}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-muted-foreground">{detailSheet.record.duration}</CardContent>
                        </Card>
                      </div>
                      <div>
                        <h3 className="mb-2 text-sm font-semibold">Logs</h3>
                        <div className="rounded-lg border bg-muted/50 p-4 font-mono text-xs text-muted-foreground space-y-2">
                          {detailSheet.record.logs.map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <FileText className="mr-2 h-4 w-4" />
                          View Logs
                        </Button>
                        <Button className="flex-1" variant="outline">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Rebuild
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={envModalOpen} onOpenChange={setEnvModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{envModalMode === 'create' ? 'Add Environment Variable' : `Edit ${envEditing?.key}`}</DialogTitle>
            <DialogDescription>Values are scoped per environment and secrets stay masked.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="env-key">Variable name</Label>
              <Input
                id="env-key"
                placeholder="SERVICE_TOKEN"
                value={envForm.key}
                onChange={(event) => setEnvForm((prev) => ({ ...prev, key: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="env-value">Value</Label>
              <Input
                id="env-value"
                type={envForm.isSecret ? 'password' : 'text'}
                placeholder="Value"
                value={envForm.value}
                onChange={(event) => setEnvForm((prev) => ({ ...prev, value: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Scope</Label>
              <Select value={envForm.scope} onValueChange={(value: EnvScope) => setEnvForm((prev) => ({ ...prev, scope: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Mark as secret</p>
                <p className="text-sm text-muted-foreground">Enable masking &amp; copy protections.</p>
              </div>
              <Switch checked={envForm.isSecret} onCheckedChange={(checked) => setEnvForm((prev) => ({ ...prev, isSecret: checked }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnvModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEnvVar}>{envModalMode === 'create' ? 'Add Variable' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
