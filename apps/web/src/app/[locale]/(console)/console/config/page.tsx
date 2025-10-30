'use client';

import { useState, useMemo, Fragment } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConsoleFlagsPage } from '@/components/console/ConsoleFlagsPage';
import { DevelopmentTasksSection } from '@/components/console/DevelopmentTasksSection';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Settings,
  Terminal,
  Server,
  Flag,
  Rocket,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  ExternalLink,
  Clock,
  Activity,
  Database,
  Zap,
  HardDrive,
  Gauge,
  Shield,
  Globe,
  Building2,
  Key,
  Lock,
  Cloud,
  GitBranch,
  Play,
  History,
  RotateCcw,
  CheckCircle,
  BriefcaseBusiness,
  XCircle,
  Pause,
  Search as SearchIcon,
  Filter,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Workflow,
  Webhook,
  Plug,
  Link2,
  DollarSign,
  BarChart3,
  Mail,
} from 'lucide-react';
import { formatDateTimeExact } from '@/utils/formatDateTime';

// Mock data for environment variables
const mockEnvVars = [
  { key: 'DATABASE_URL', value: 'postgresql://...', environment: 'production', type: 'secret', lastUpdated: '2025-01-27 10:23:15' },
  { key: 'API_KEY', value: 'sk_live_...', environment: 'production', type: 'secret', lastUpdated: '2025-01-27 09:15:42' },
  { key: 'STRIPE_SECRET_KEY', value: 'sk_live_...', environment: 'production', type: 'secret', lastUpdated: '2025-01-27 09:15:42' },
  { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.example.com', environment: 'production', type: 'public', lastUpdated: '2025-01-27 08:45:30' },
  { key: 'REDIS_URL', value: 'redis://...', environment: 'production', type: 'secret', lastUpdated: '2025-01-26 16:20:10' },
  { key: 'LOG_LEVEL', value: 'info', environment: 'production', type: 'public', lastUpdated: '2025-01-25 14:32:55' },
  { key: 'SENTRY_DSN', value: 'https://...', environment: 'production', type: 'secret', lastUpdated: '2025-01-24 11:10:20' },
];

// Mock data for deployment history
const mockDeployments = [
  { id: 1, version: 'v2.1.0', environment: 'production', status: 'success', deployedAt: '2025-01-27 14:30:15', duration: '2m 34s', commit: 'a3f9b2c', branch: 'main', deployedBy: 'Sarah Johnson' },
  { id: 2, version: 'v2.0.9', environment: 'staging', status: 'success', deployedAt: '2025-01-27 12:15:42', duration: '1m 52s', commit: 'd7e8f1a', branch: 'develop', deployedBy: 'John Doe' },
  { id: 3, version: 'v2.0.8', environment: 'production', status: 'success', deployedAt: '2025-01-26 18:45:20', duration: '2m 10s', commit: 'f5a6b3c', branch: 'main', deployedBy: 'Sarah Johnson' },
  { id: 4, version: 'v2.0.7', environment: 'production', status: 'failed', deployedAt: '2025-01-26 16:20:55', duration: '45s', commit: 'e4d5c2b', branch: 'main', deployedBy: 'John Doe' },
];

// Jobs/Queue types and data
type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
type QueueType = 'email' | 'notification' | 'export' | 'cleanup' | 'sync' | 'analytics' | 'all';

interface Job {
  id: string;
  name: string;
  queue: QueueType;
  status: JobStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  progress: number;
  attempts: number;
  maxAttempts: number;
  error?: string;
  metadata?: Record<string, any>;
  workerId?: string;
}

interface QueueStats {
  name: string;
  queued: number;
  running: number;
  completed: number;
  failed: number;
  total: number;
}

const generateMockJobs = (count: number): Job[] => {
  const statuses: JobStatus[] = ['queued', 'running', 'completed', 'failed', 'cancelled', 'paused'];
  const queues: QueueType[] = ['email', 'notification', 'export', 'cleanup', 'sync', 'analytics'];
  const priorities: ('low' | 'normal' | 'high' | 'urgent')[] = ['low', 'normal', 'high', 'urgent'];
  const jobNames = [
    'Send Welcome Email',
    'Process Payment Notification',
    'Generate Monthly Report',
    'Cleanup Old Logs',
    'Sync User Data',
    'Calculate Analytics',
    'Backup Database',
    'Send Password Reset',
    'Update Cache',
    'Process Webhook'
  ];

  const jobs: Job[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const queue = queues[Math.floor(Math.random() * queues.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const createdAt = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    const startedAt = status !== 'queued' ? new Date(createdAt.getTime() + Math.random() * 60000) : undefined;
    const completedAt = status === 'completed' || status === 'failed' 
      ? new Date((startedAt || createdAt).getTime() + Math.random() * 300000)
      : undefined;
    const duration = completedAt && startedAt ? completedAt.getTime() - startedAt.getTime() : undefined;

    jobs.push({
      id: `job-${i + 1}`,
      name: jobNames[Math.floor(Math.random() * jobNames.length)],
      queue,
      status,
      priority,
      createdAt,
      startedAt,
      completedAt,
      duration,
      progress: status === 'running' 
        ? Math.floor(Math.random() * 100) 
        : status === 'completed' 
        ? 100 
        : 0,
      attempts: status === 'failed' ? Math.floor(Math.random() * 3) + 1 : 1,
      maxAttempts: 3,
      error: status === 'failed' ? 'Connection timeout after 30 seconds' : undefined,
      metadata: {
        userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
        orgId: Math.random() > 0.7 ? `org-${Math.floor(Math.random() * 100)}` : undefined,
      },
      workerId: status === 'running' ? `worker-${Math.floor(Math.random() * 10) + 1}` : undefined,
    });
  }

  return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

const generateQueueStats = (jobs: Job[]): QueueStats[] => {
  const queueTypes: QueueType[] = ['email', 'notification', 'export', 'cleanup', 'sync', 'analytics'];
  
  return queueTypes.map(queueType => {
    const queueJobs = jobs.filter(j => j.queue === queueType);
    return {
      name: queueType,
      queued: queueJobs.filter(j => j.status === 'queued').length,
      running: queueJobs.filter(j => j.status === 'running').length,
      completed: queueJobs.filter(j => j.status === 'completed').length,
      failed: queueJobs.filter(j => j.status === 'failed').length,
      total: queueJobs.length,
    };
  });
};

export default function ConsoleConfigPage() {
  const [activeTab, setActiveTab] = useState<'application' | 'environment' | 'system' | 'external-api' | 'automations' | 'integrations'>('application');
  const [applicationSubTab, setApplicationSubTab] = useState<'settings' | 'feature-flags' | 'jobs' | 'deployment'>('settings');
  const [externalApiSubTab, setExternalApiSubTab] = useState<'api-keys' | 'webhooks-outbound'>('api-keys');
  const [automationsSubTab, setAutomationsSubTab] = useState<'workflow-status' | 'execution-history' | 'webhooks-inbound'>('workflow-status');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [appConfig, setAppConfig] = useState({
    appName: 'LTM Starter Kit',
    appVersion: '2.1.0',
    description: 'Enterprise SaaS application platform',
    timezone: 'America/New_York',
    locale: 'en-US',
    enableRateLimiting: true,
    rateLimitPerMinute: 60,
    sessionTimeout: 3600,
    maxSessionDuration: 86400,
    enableAPILogging: true,
    enableAuditLogs: true,
  });

  const [systemConfig, setSystemConfig] = useState({
    databaseHost: 'db.example.com',
    databasePort: 5432,
    databaseName: 'ltm_starter',
    cacheEnabled: true,
    cacheTTL: 3600,
    logLevel: 'info',
    enableMetrics: true,
    maxConnections: 100,
    workerThreads: 4,
    memoryLimit: 2048,
  });

  const [deploymentConfig, setDeploymentConfig] = useState({
    buildCommand: 'pnpm build',
    startCommand: 'pnpm start',
    nodeVersion: '18.x',
    autoDeploy: true,
    enableRollback: true,
    healthCheckUrl: '/api/health',
    deploymentTimeout: 600,
  });

  // Jobs/Queue state
  const [jobsTab, setJobsTab] = useState<'overview' | 'active' | 'history'>('overview');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [queueFilter, setQueueFilter] = useState<QueueType>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'normal' | 'high' | 'urgent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLive, setIsLive] = useState(true);

  // Generate mock data for Jobs
  const allJobs = useMemo(() => generateMockJobs(200), []);
  const queueStats = useMemo(() => generateQueueStats(allJobs), [allJobs]);

  // Calculate overview metrics
  const jobsMetrics = useMemo(() => {
    const total = allJobs.length;
    const queued = allJobs.filter(j => j.status === 'queued').length;
    const running = allJobs.filter(j => j.status === 'running').length;
    const completed = allJobs.filter(j => j.status === 'completed').length;
    const failed = allJobs.filter(j => j.status === 'failed').length;
    const successRate = total > 0 ? ((completed / (completed + failed)) * 100).toFixed(1) : '100.0';

    return {
      total,
      queued,
      running,
      completed,
      failed,
      successRate: parseFloat(successRate),
    };
  }, [allJobs]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let filtered = allJobs;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(j => j.status === statusFilter);
    }

    if (queueFilter !== 'all') {
      filtered = filtered.filter(j => j.queue === queueFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(j => j.priority === priorityFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(j => 
        j.name.toLowerCase().includes(query) ||
        j.id.toLowerCase().includes(query) ||
        j.queue.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allJobs, statusFilter, queueFilter, priorityFilter, searchQuery]);

  // Active jobs (running, queued, paused)
  const activeJobs = useMemo(() => 
    filteredJobs.filter(j => ['running', 'queued', 'paused'].includes(j.status)),
    [filteredJobs]
  );

  // History jobs (completed, failed, cancelled)
  const historyJobs = useMemo(() => 
    filteredJobs.filter(j => ['completed', 'failed', 'cancelled'].includes(j.status)),
    [filteredJobs]
  );

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Jobs helper functions
  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const variants: Record<JobStatus, { variant: any; className: string }> = {
      queued: { variant: 'secondary', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
      running: { variant: 'secondary', className: 'bg-primary/10 text-primary' },
      completed: { variant: 'outline', className: 'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300' },
      failed: { variant: 'destructive', className: '' },
      cancelled: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      paused: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={cn(config.className, 'font-normal')}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Job['priority']) => {
    const variants: Record<Job['priority'], { className: string }> = {
      low: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      normal: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
      high: { className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' },
      urgent: { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
    };

    const config = variants[priority];
    return (
      <Badge variant="secondary" className={config.className}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const formatQueueName = (queue: QueueType) => {
    return queue.charAt(0).toUpperCase() + queue.slice(1);
  };

  const formatDateTimeExact = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2">
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="w-full flex-wrap gap-1 justify-start sm:w-auto">
                <TabsTrigger value="application" className="flex-1 sm:flex-initial">
                  <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                  Application
                </TabsTrigger>
                <TabsTrigger value="environment" className="flex-1 sm:flex-initial">
                  <Terminal className="h-4 w-4 mr-1 sm:mr-2" />
                  Environment
                </TabsTrigger>
                <TabsTrigger value="system" className="flex-1 sm:flex-initial">
                  <Server className="h-4 w-4 mr-1 sm:mr-2" />
                  System
                </TabsTrigger>
                <TabsTrigger value="external-api" className="flex-1 sm:flex-initial">
                  <Key className="h-4 w-4 mr-1 sm:mr-2" />
                  External API & Keys
                </TabsTrigger>
                <TabsTrigger value="automations" className="flex-1 sm:flex-initial">
                  <Workflow className="h-4 w-4 mr-1 sm:mr-2" />
                  Automations
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex-1 sm:flex-initial">
                  <Plug className="h-4 w-4 mr-1 sm:mr-2" />
                  Integrations
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            {/* Application Tab */}
            <TabsContent value="application" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
              <Tabs value={applicationSubTab} onValueChange={(v) => setApplicationSubTab(v as typeof applicationSubTab)}>
                <TabsList className="mb-4 sm:mb-6 flex-wrap gap-1 justify-start">
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="feature-flags">
                    <Flag className="h-4 w-4 mr-2" />
                    Feature Flags
                  </TabsTrigger>
                  <TabsTrigger value="jobs">
                    <BriefcaseBusiness className="h-4 w-4 mr-2" />
                    Jobs/Queue
                  </TabsTrigger>
                  <TabsTrigger value="deployment">
                    <Rocket className="h-4 w-4 mr-2" />
                    Deployment
                  </TabsTrigger>
                </TabsList>

                {/* Application Settings Sub-tab */}
                <TabsContent value="settings" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>Core application settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="appName">Application Name</Label>
                      <Input
                        id="appName"
                        value={appConfig.appName}
                        onChange={(e) => setAppConfig({ ...appConfig, appName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appVersion">Version</Label>
                      <Input
                        id="appVersion"
                        value={appConfig.appVersion}
                        onChange={(e) => setAppConfig({ ...appConfig, appVersion: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={appConfig.description}
                        onChange={(e) => setAppConfig({ ...appConfig, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Localization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-emerald-500" />
                      Localization
                    </CardTitle>
                    <CardDescription>Language and regional settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={appConfig.timezone}
                        onValueChange={(value) => setAppConfig({ ...appConfig, timezone: value })}
                      >
                        <SelectTrigger id="timezone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                          <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locale">Locale</Label>
                      <Select
                        value={appConfig.locale}
                        onValueChange={(value) => setAppConfig({ ...appConfig, locale: value })}
                      >
                        <SelectTrigger id="locale">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                          <SelectItem value="es-MX">Spanish (Mexico)</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                          <SelectItem value="ja-JP">Japanese</SelectItem>
                          <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* API Rate Limiting */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-amber-500" />
                      API Rate Limiting
                    </CardTitle>
                    <CardDescription>Control API request limits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Rate Limiting</Label>
                        <p className="text-sm text-muted-foreground">Limit API requests per minute</p>
                      </div>
                      <Switch
                        checked={appConfig.enableRateLimiting}
                        onCheckedChange={(checked) => setAppConfig({ ...appConfig, enableRateLimiting: checked })}
                      />
                    </div>
                    {appConfig.enableRateLimiting && (
                      <div className="space-y-2">
                        <Label htmlFor="rateLimit">Requests per Minute</Label>
                        <Input
                          id="rateLimit"
                          type="number"
                          value={appConfig.rateLimitPerMinute}
                          onChange={(e) => setAppConfig({ ...appConfig, rateLimitPerMinute: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Session Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-500" />
                      Session Management
                    </CardTitle>
                    <CardDescription>User session configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={appConfig.sessionTimeout}
                        onChange={(e) => setAppConfig({ ...appConfig, sessionTimeout: parseInt(e.target.value) || 0 })}
                      />
                      <p className="text-xs text-muted-foreground">Time before session expires due to inactivity</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxSessionDuration">Max Session Duration (seconds)</Label>
                      <Input
                        id="maxSessionDuration"
                        type="number"
                        value={appConfig.maxSessionDuration}
                        onChange={(e) => setAppConfig({ ...appConfig, maxSessionDuration: parseInt(e.target.value) || 0 })}
                      />
                      <p className="text-xs text-muted-foreground">Maximum session lifetime regardless of activity</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Logging & Audit */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-rose-500" />
                      Logging & Audit
                    </CardTitle>
                    <CardDescription>Configure application logging and audit trails</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>API Logging</Label>
                          <p className="text-sm text-muted-foreground">Log all API requests and responses</p>
                        </div>
                        <Switch
                          checked={appConfig.enableAPILogging}
                          onCheckedChange={(checked) => setAppConfig({ ...appConfig, enableAPILogging: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Audit Logs</Label>
                          <p className="text-sm text-muted-foreground">Track all user actions and changes</p>
                        </div>
                        <Switch
                          checked={appConfig.enableAuditLogs}
                          onCheckedChange={(checked) => setAppConfig({ ...appConfig, enableAuditLogs: checked })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </TabsContent>

                {/* Feature Flags Sub-tab */}
                <TabsContent value="feature-flags" className="space-y-4 mt-0">
                  <ConsoleFlagsPage />
                </TabsContent>

                {/* Jobs/Queue Sub-tab - Development Tasks */}
                <TabsContent value="jobs" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  {/* Note: orgId should be provided from org context. For now, using placeholder. */}
                  <DevelopmentTasksSection orgId={process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || ''} />
                </TabsContent>

                {/* Deployment Sub-tab */}
                <TabsContent value="deployment" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    {/* Build Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cloud className="h-5 w-5" />
                          Build Configuration
                        </CardTitle>
                        <CardDescription>Build and deployment commands</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="buildCommand">Build Command</Label>
                          <Input
                            id="buildCommand"
                            value={deploymentConfig.buildCommand}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, buildCommand: e.target.value })}
                            placeholder="pnpm build"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startCommand">Start Command</Label>
                          <Input
                            id="startCommand"
                            value={deploymentConfig.startCommand}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, startCommand: e.target.value })}
                            placeholder="pnpm start"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nodeVersion">Node Version</Label>
                          <Input
                            id="nodeVersion"
                            value={deploymentConfig.nodeVersion}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, nodeVersion: e.target.value })}
                            placeholder="18.x"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="healthCheckUrl">Health Check URL</Label>
                          <Input
                            id="healthCheckUrl"
                            value={deploymentConfig.healthCheckUrl}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, healthCheckUrl: e.target.value })}
                            placeholder="/api/health"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autoDeploy">Auto Deploy</Label>
                            <p className="text-xs text-muted-foreground">Automatically deploy on push</p>
                          </div>
                          <Switch
                            id="autoDeploy"
                            checked={deploymentConfig.autoDeploy}
                            onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, autoDeploy: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enableRollback">Enable Rollback</Label>
                            <p className="text-xs text-muted-foreground">Allow rolling back deployments</p>
                          </div>
                          <Switch
                            id="enableRollback"
                            checked={deploymentConfig.enableRollback}
                            onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, enableRollback: checked })}
                          />
                        </div>
                        <Button className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Save Configuration
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {jobsMetrics.queued + jobsMetrics.running}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {jobsMetrics.queued} queued, {jobsMetrics.running} running
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{jobsMetrics.successRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {jobsMetrics.completed.toLocaleString()} completed
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{jobsMetrics.failed}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Queue Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Queue Statistics</CardTitle>
                      <CardDescription>Overview of jobs across all queues</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {queueStats.map((stat) => (
                          <div
                            key={stat.name}
                            className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold capitalize">{formatQueueName(stat.name)}</h4>
                              <Badge variant="outline">{stat.total}</Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Queued:</span>
                                <span className="font-medium text-blue-600">{stat.queued}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Running:</span>
                                <span className="font-medium text-primary">{stat.running}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Completed:</span>
                                <span className="font-medium text-green-600">{stat.completed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Failed:</span>
                                <span className="font-medium text-red-600">{stat.failed}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Main Content Tabs */}
                  <Card>
                    <CardHeader>
                      <Tabs value={jobsTab} onValueChange={(v) => setJobsTab(v as typeof jobsTab)}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="active">Active Jobs</TabsTrigger>
                          <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={jobsTab} onValueChange={(v) => setJobsTab(v as typeof jobsTab)}>
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Queue Status Overview */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Queue Status</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {queueStats.map((stat) => (
                                    <div key={stat.name}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium capitalize">{formatQueueName(stat.name)}</span>
                                        <span className="text-sm text-muted-foreground">{stat.total} total</span>
                                      </div>
                                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full flex">
                                          {stat.queued > 0 && (
                                            <div 
                                              className="bg-blue-500" 
                                              style={{ width: `${(stat.queued / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.running > 0 && (
                                            <div 
                                              className="bg-primary" 
                                              style={{ width: `${(stat.running / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.completed > 0 && (
                                            <div 
                                              className="bg-green-500" 
                                              style={{ width: `${(stat.completed / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.failed > 0 && (
                                            <div 
                                              className="bg-red-500" 
                                              style={{ width: `${(stat.failed / stat.total) * 100}%` }}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Recent Jobs */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Recent Jobs</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {allJobs.slice(0, 5).map((job) => (
                                    <div
                                      key={job.id}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {getStatusIcon(job.status)}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{job.name}</p>
                                          <p className="text-xs text-muted-foreground truncate">
                                            {formatQueueName(job.queue)} • {job.createdAt.toLocaleTimeString()}
                                          </p>
                                        </div>
                                      </div>
                                      {getStatusBadge(job.status)}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        {/* Active Jobs Tab */}
                        <TabsContent value="active" className="space-y-4 mt-0">
                          {/* Filters */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search jobs..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="queued">Queued</SelectItem>
                                <SelectItem value="running">Running</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={queueFilter} onValueChange={(v) => setQueueFilter(v as typeof queueFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Queue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Queues</SelectItem>
                                {['email', 'notification', 'export', 'cleanup', 'sync', 'analytics'].map((q) => (
                                  <SelectItem key={q} value={q}>{formatQueueName(q as QueueType)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Active Jobs Table */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Job</TableHead>
                                  <TableHead className="hidden sm:table-cell">Queue</TableHead>
                                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                                  <TableHead className="hidden lg:table-cell">Progress</TableHead>
                                  <TableHead className="hidden md:table-cell">Started</TableHead>
                                  <TableHead className="text-center w-[96px]">Status</TableHead>
                                  <TableHead className="text-center w-[96px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {activeJobs.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                      No active jobs found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  activeJobs.map((job) => (
                                    <Fragment key={job.id}>
                                      <TableRow>
                                        <TableCell>
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(job.status)}
                                              <span className="font-medium">{job.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap sm:hidden text-xs text-muted-foreground">
                                              <span className="capitalize">{formatQueueName(job.queue)}</span>
                                              {getPriorityBadge(job.priority)}
                                              {job.status === 'running' && job.progress > 0 && (
                                                <span>{job.progress}%</span>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono">{job.id}</p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                          <Badge variant="outline" className="capitalize">
                                            {formatQueueName(job.queue)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                          {getPriorityBadge(job.priority)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                          {job.status === 'running' && job.progress > 0 ? (
                                            <div className="w-32">
                                              <Progress value={job.progress} className="h-2" />
                                              <span className="text-xs text-muted-foreground mt-1">{job.progress}%</span>
                                            </div>
                                          ) : (
                                            <span className="text-sm text-muted-foreground">-</span>
                                          )}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                          {job.startedAt ? job.startedAt.toLocaleTimeString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                          {getStatusBadge(job.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedJob(job)}
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Details</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            {job.status === 'running' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <Pause className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Pause</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                            {job.status === 'queued' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <Play className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Start Now</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Cancel</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    </Fragment>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="space-y-4 mt-0">
                          {/* Filters */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search jobs..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={queueFilter} onValueChange={(v) => setQueueFilter(v as typeof queueFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Queue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Queues</SelectItem>
                                {['email', 'notification', 'export', 'cleanup', 'sync', 'analytics'].map((q) => (
                                  <SelectItem key={q} value={q}>{formatQueueName(q as QueueType)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* History Table */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Job</TableHead>
                                  <TableHead className="hidden sm:table-cell">Queue</TableHead>
                                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                                  <TableHead className="hidden lg:table-cell">Duration</TableHead>
                                  <TableHead className="hidden md:table-cell">Completed</TableHead>
                                  <TableHead className="text-center w-[96px]">Status</TableHead>
                                  <TableHead className="text-center w-[96px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {historyJobs.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                      No history found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  historyJobs.map((job) => (
                                    <Fragment key={job.id}>
                                      <TableRow>
                                        <TableCell>
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(job.status)}
                                              <span className="font-medium">{job.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap sm:hidden text-xs text-muted-foreground">
                                              <span className="capitalize">{formatQueueName(job.queue)}</span>
                                              {getPriorityBadge(job.priority)}
                                              {job.duration && <span>{formatDuration(job.duration)}</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono">{job.id}</p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                          <Badge variant="outline" className="capitalize">
                                            {formatQueueName(job.queue)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                          {getPriorityBadge(job.priority)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">
                                          {formatDuration(job.duration)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                          {job.completedAt ? job.completedAt.toLocaleString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                          {getStatusBadge(job.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedJob(job)}
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Details</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            {job.status === 'failed' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Retry</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                      {expandedJobs.has(job.id) && job.error && (
                                        <TableRow>
                                          <TableCell colSpan={7} className="bg-muted/50">
                                            <div className="p-4 space-y-2">
                                              <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                                <div>
                                                  <p className="font-medium text-sm">Error Details</p>
                                                  <p className="text-sm text-muted-foreground mt-1">{job.error}</p>
                                                </div>
                                              </div>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </Fragment>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* Job Details Dialog */}
                  <Dialog open={selectedJob !== null} onOpenChange={(open) => !open && setSelectedJob(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedJob?.name}</DialogTitle>
                        <DialogDescription>
                          Job ID: {selectedJob?.id}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedJob && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Status</p>
                              {getStatusBadge(selectedJob.status)}
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Queue</p>
                              <Badge variant="outline" className="capitalize">
                                {formatQueueName(selectedJob.queue)}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Priority</p>
                              {getPriorityBadge(selectedJob.priority)}
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Attempts</p>
                              <p className="text-sm">
                                {selectedJob.attempts} / {selectedJob.maxAttempts}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Created At</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedJob.createdAt.toLocaleString()}
                              </p>
                            </div>
                            {selectedJob.startedAt && (
                              <div>
                                <p className="text-sm font-medium mb-1">Started At</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedJob.startedAt.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {selectedJob.completedAt && (
                              <div>
                                <p className="text-sm font-medium mb-1">Completed At</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedJob.completedAt.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {selectedJob.duration && (
                              <div>
                                <p className="text-sm font-medium mb-1">Duration</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDuration(selectedJob.duration)}
                                </p>
                              </div>
                            )}
                            {selectedJob.workerId && (
                              <div>
                                <p className="text-sm font-medium mb-1">Worker</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {selectedJob.workerId}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {selectedJob.status === 'running' && selectedJob.progress > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium">Progress</p>
                                <span className="text-sm text-muted-foreground">{selectedJob.progress}%</span>
                              </div>
                              <Progress value={selectedJob.progress} />
                            </div>
                          )}

                          {selectedJob.error && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                <div>
                                  <p className="font-medium text-red-800 dark:text-red-200">Error</p>
                                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {selectedJob.error}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedJob.metadata && Object.keys(selectedJob.metadata).length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Metadata</p>
                              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                                {JSON.stringify(selectedJob.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TabsContent>

                {/* Deployment Sub-tab */}
                <TabsContent value="deployment" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    {/* Build Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cloud className="h-5 w-5" />
                          Build Configuration
                        </CardTitle>
                        <CardDescription>Build and deployment commands</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="buildCommand">Build Command</Label>
                          <Input
                            id="buildCommand"
                            value={deploymentConfig.buildCommand}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, buildCommand: e.target.value })}
                            placeholder="pnpm build"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startCommand">Start Command</Label>
                          <Input
                            id="startCommand"
                            value={deploymentConfig.startCommand}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, startCommand: e.target.value })}
                            placeholder="pnpm start"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nodeVersion">Node Version</Label>
                          <Input
                            id="nodeVersion"
                            value={deploymentConfig.nodeVersion}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, nodeVersion: e.target.value })}
                            placeholder="18.x"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="healthCheckUrl">Health Check URL</Label>
                          <Input
                            id="healthCheckUrl"
                            value={deploymentConfig.healthCheckUrl}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, healthCheckUrl: e.target.value })}
                            placeholder="/api/health"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autoDeploy">Auto Deploy</Label>
                            <p className="text-xs text-muted-foreground">Automatically deploy on push</p>
                          </div>
                          <Switch
                            id="autoDeploy"
                            checked={deploymentConfig.autoDeploy}
                            onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, autoDeploy: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enableRollback">Enable Rollback</Label>
                            <p className="text-xs text-muted-foreground">Allow rolling back deployments</p>
                          </div>
                          <Switch
                            id="enableRollback"
                            checked={deploymentConfig.enableRollback}
                            onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, enableRollback: checked })}
                          />
                        </div>
                        <Button className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Save Configuration
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {jobsMetrics.queued + jobsMetrics.running}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {jobsMetrics.queued} queued, {jobsMetrics.running} running
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{jobsMetrics.successRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {jobsMetrics.completed.toLocaleString()} completed
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{jobsMetrics.failed}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Queue Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Queue Statistics</CardTitle>
                      <CardDescription>Overview of jobs across all queues</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {queueStats.map((stat) => (
                          <div
                            key={stat.name}
                            className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold capitalize">{formatQueueName(stat.name)}</h4>
                              <Badge variant="outline">{stat.total}</Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Queued:</span>
                                <span className="font-medium text-blue-600">{stat.queued}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Running:</span>
                                <span className="font-medium text-primary">{stat.running}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Completed:</span>
                                <span className="font-medium text-green-600">{stat.completed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Failed:</span>
                                <span className="font-medium text-red-600">{stat.failed}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Main Content Tabs */}
                  <Card>
                    <CardHeader>
                      <Tabs value={jobsTab} onValueChange={(v) => setJobsTab(v as typeof jobsTab)}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="active">Active Jobs</TabsTrigger>
                          <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={jobsTab} onValueChange={(v) => setJobsTab(v as typeof jobsTab)}>
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Queue Status Overview */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Queue Status</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {queueStats.map((stat) => (
                                    <div key={stat.name}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium capitalize">{formatQueueName(stat.name)}</span>
                                        <span className="text-sm text-muted-foreground">{stat.total} total</span>
                                      </div>
                                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full flex">
                                          {stat.queued > 0 && (
                                            <div 
                                              className="bg-blue-500" 
                                              style={{ width: `${(stat.queued / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.running > 0 && (
                                            <div 
                                              className="bg-primary" 
                                              style={{ width: `${(stat.running / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.completed > 0 && (
                                            <div 
                                              className="bg-green-500" 
                                              style={{ width: `${(stat.completed / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.failed > 0 && (
                                            <div 
                                              className="bg-red-500" 
                                              style={{ width: `${(stat.failed / stat.total) * 100}%` }}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Recent Jobs */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Recent Jobs</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {allJobs.slice(0, 5).map((job) => (
                                    <div
                                      key={job.id}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {getStatusIcon(job.status)}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{job.name}</p>
                                          <p className="text-xs text-muted-foreground truncate">
                                            {formatQueueName(job.queue)} • {job.createdAt.toLocaleTimeString()}
                                          </p>
                                        </div>
                                      </div>
                                      {getStatusBadge(job.status)}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        {/* Active Jobs Tab */}
                        <TabsContent value="active" className="space-y-4 mt-0">
                          {/* Filters */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search jobs..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="queued">Queued</SelectItem>
                                <SelectItem value="running">Running</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={queueFilter} onValueChange={(v) => setQueueFilter(v as typeof queueFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Queue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Queues</SelectItem>
                                {['email', 'notification', 'export', 'cleanup', 'sync', 'analytics'].map((q) => (
                                  <SelectItem key={q} value={q}>{formatQueueName(q as QueueType)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Active Jobs Table */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Job</TableHead>
                                  <TableHead className="hidden sm:table-cell">Queue</TableHead>
                                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                                  <TableHead className="hidden lg:table-cell">Progress</TableHead>
                                  <TableHead className="hidden md:table-cell">Started</TableHead>
                                  <TableHead className="text-center w-[96px]">Status</TableHead>
                                  <TableHead className="text-center w-[96px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {activeJobs.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                      No active jobs found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  activeJobs.map((job) => (
                                    <Fragment key={job.id}>
                                      <TableRow>
                                        <TableCell>
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(job.status)}
                                              <span className="font-medium">{job.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap sm:hidden text-xs text-muted-foreground">
                                              <span className="capitalize">{formatQueueName(job.queue)}</span>
                                              {getPriorityBadge(job.priority)}
                                              {job.status === 'running' && job.progress > 0 && (
                                                <span>{job.progress}%</span>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono">{job.id}</p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                          <Badge variant="outline" className="capitalize">
                                            {formatQueueName(job.queue)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                          {getPriorityBadge(job.priority)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                          {job.status === 'running' && job.progress > 0 ? (
                                            <div className="w-32">
                                              <Progress value={job.progress} className="h-2" />
                                              <span className="text-xs text-muted-foreground mt-1">{job.progress}%</span>
                                            </div>
                                          ) : (
                                            <span className="text-sm text-muted-foreground">-</span>
                                          )}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                          {job.startedAt ? job.startedAt.toLocaleTimeString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                          {getStatusBadge(job.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedJob(job)}
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Details</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            {job.status === 'running' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <Pause className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Pause</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                            {job.status === 'queued' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <Play className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Start Now</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Cancel</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    </Fragment>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="space-y-4 mt-0">
                          {/* Filters */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search jobs..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={queueFilter} onValueChange={(v) => setQueueFilter(v as typeof queueFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Queue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Queues</SelectItem>
                                {['email', 'notification', 'export', 'cleanup', 'sync', 'analytics'].map((q) => (
                                  <SelectItem key={q} value={q}>{formatQueueName(q as QueueType)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* History Table */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Job</TableHead>
                                  <TableHead className="hidden sm:table-cell">Queue</TableHead>
                                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                                  <TableHead className="hidden lg:table-cell">Duration</TableHead>
                                  <TableHead className="hidden md:table-cell">Completed</TableHead>
                                  <TableHead className="text-center w-[96px]">Status</TableHead>
                                  <TableHead className="text-center w-[96px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {historyJobs.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                      No history found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  historyJobs.map((job) => (
                                    <Fragment key={job.id}>
                                      <TableRow>
                                        <TableCell>
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(job.status)}
                                              <span className="font-medium">{job.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap sm:hidden text-xs text-muted-foreground">
                                              <span className="capitalize">{formatQueueName(job.queue)}</span>
                                              {getPriorityBadge(job.priority)}
                                              {job.duration && <span>{formatDuration(job.duration)}</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono">{job.id}</p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                          <Badge variant="outline" className="capitalize">
                                            {formatQueueName(job.queue)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                          {getPriorityBadge(job.priority)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">
                                          {formatDuration(job.duration)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                          {job.completedAt ? job.completedAt.toLocaleString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                          {getStatusBadge(job.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedJob(job)}
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Details</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            {job.status === 'failed' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Retry</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                      {expandedJobs.has(job.id) && job.error && (
                                        <TableRow>
                                          <TableCell colSpan={7} className="bg-muted/50">
                                            <div className="p-4 space-y-2">
                                              <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                                <div>
                                                  <p className="font-medium text-sm">Error Details</p>
                                                  <p className="text-sm text-muted-foreground mt-1">{job.error}</p>
                                                </div>
                                              </div>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </Fragment>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* Job Details Dialog */}
                  <Dialog open={selectedJob !== null} onOpenChange={(open) => !open && setSelectedJob(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedJob?.name}</DialogTitle>
                        <DialogDescription>
                          Job ID: {selectedJob?.id}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedJob && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Status</p>
                              {getStatusBadge(selectedJob.status)}
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Queue</p>
                              <Badge variant="outline" className="capitalize">
                                {formatQueueName(selectedJob.queue)}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Priority</p>
                              {getPriorityBadge(selectedJob.priority)}
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Attempts</p>
                              <p className="text-sm">
                                {selectedJob.attempts} / {selectedJob.maxAttempts}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Created At</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedJob.createdAt.toLocaleString()}
                              </p>
                            </div>
                            {selectedJob.startedAt && (
                              <div>
                                <p className="text-sm font-medium mb-1">Started At</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedJob.startedAt.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {selectedJob.completedAt && (
                              <div>
                                <p className="text-sm font-medium mb-1">Completed At</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedJob.completedAt.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {selectedJob.duration && (
                              <div>
                                <p className="text-sm font-medium mb-1">Duration</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDuration(selectedJob.duration)}
                                </p>
                              </div>
                            )}
                            {selectedJob.workerId && (
                              <div>
                                <p className="text-sm font-medium mb-1">Worker</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {selectedJob.workerId}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {selectedJob.status === 'running' && selectedJob.progress > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium">Progress</p>
                                <span className="text-sm text-muted-foreground">{selectedJob.progress}%</span>
                              </div>
                              <Progress value={selectedJob.progress} />
                            </div>
                          )}

                          {selectedJob.error && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                <div>
                                  <p className="font-medium text-red-800 dark:text-red-200">Error</p>
                                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {selectedJob.error}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedJob.metadata && Object.keys(selectedJob.metadata).length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Metadata</p>
                              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                                {JSON.stringify(selectedJob.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TabsContent>

                {/* Deployment Sub-tab */}
                <TabsContent value="deployment" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    {/* Build Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cloud className="h-5 w-5" />
                          Build Configuration
                        </CardTitle>
                        <CardDescription>Build and deployment commands</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="buildCommand">Build Command</Label>
                          <Input
                            id="buildCommand"
                            value={deploymentConfig.buildCommand}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, buildCommand: e.target.value })}
                            placeholder="pnpm build"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startCommand">Start Command</Label>
                          <Input
                            id="startCommand"
                            value={deploymentConfig.startCommand}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, startCommand: e.target.value })}
                            placeholder="pnpm start"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nodeVersion">Node Version</Label>
                          <Input
                            id="nodeVersion"
                            value={deploymentConfig.nodeVersion}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, nodeVersion: e.target.value })}
                            placeholder="18.x"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="healthCheckUrl">Health Check URL</Label>
                          <Input
                            id="healthCheckUrl"
                            value={deploymentConfig.healthCheckUrl}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, healthCheckUrl: e.target.value })}
                            placeholder="/api/health"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autoDeploy">Auto Deploy</Label>
                            <p className="text-xs text-muted-foreground">Automatically deploy on push</p>
                          </div>
                          <Switch
                            id="autoDeploy"
                            checked={deploymentConfig.autoDeploy}
                            onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, autoDeploy: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enableRollback">Enable Rollback</Label>
                            <p className="text-xs text-muted-foreground">Allow rolling back deployments</p>
                          </div>
                          <Switch
                            id="enableRollback"
                            checked={deploymentConfig.enableRollback}
                            onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, enableRollback: checked })}
                          />
                        </div>
                        <Button className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Save Configuration
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {jobsMetrics.queued + jobsMetrics.running}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {jobsMetrics.queued} queued, {jobsMetrics.running} running
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{jobsMetrics.successRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {jobsMetrics.completed.toLocaleString()} completed
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{jobsMetrics.failed}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Queue Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Queue Statistics</CardTitle>
                      <CardDescription>Overview of jobs across all queues</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {queueStats.map((stat) => (
                          <div
                            key={stat.name}
                            className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold capitalize">{formatQueueName(stat.name)}</h4>
                              <Badge variant="outline">{stat.total}</Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Queued:</span>
                                <span className="font-medium text-blue-600">{stat.queued}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Running:</span>
                                <span className="font-medium text-primary">{stat.running}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Completed:</span>
                                <span className="font-medium text-green-600">{stat.completed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Failed:</span>
                                <span className="font-medium text-red-600">{stat.failed}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Main Content Tabs */}
                  <Card>
                    <CardHeader>
                      <Tabs value={jobsTab} onValueChange={(v) => setJobsTab(v as typeof jobsTab)}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="active">Active Jobs</TabsTrigger>
                          <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={jobsTab} onValueChange={(v) => setJobsTab(v as typeof jobsTab)}>
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Queue Status Overview */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Queue Status</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {queueStats.map((stat) => (
                                    <div key={stat.name}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium capitalize">{formatQueueName(stat.name)}</span>
                                        <span className="text-sm text-muted-foreground">{stat.total} total</span>
                                      </div>
                                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full flex">
                                          {stat.queued > 0 && (
                                            <div 
                                              className="bg-blue-500" 
                                              style={{ width: `${(stat.queued / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.running > 0 && (
                                            <div 
                                              className="bg-primary" 
                                              style={{ width: `${(stat.running / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.completed > 0 && (
                                            <div 
                                              className="bg-green-500" 
                                              style={{ width: `${(stat.completed / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.failed > 0 && (
                                            <div 
                                              className="bg-red-500" 
                                              style={{ width: `${(stat.failed / stat.total) * 100}%` }}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Recent Jobs */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Recent Jobs</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {allJobs.slice(0, 5).map((job) => (
                                    <div
                                      key={job.id}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {getStatusIcon(job.status)}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{job.name}</p>
                                          <p className="text-xs text-muted-foreground truncate">
                                            {formatQueueName(job.queue)} • {job.createdAt.toLocaleTimeString()}
                                          </p>
                                        </div>
                                      </div>
                                      {getStatusBadge(job.status)}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        {/* Active Jobs Tab */}
                        <TabsContent value="active" className="space-y-4 mt-0">
                          {/* Filters */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search jobs..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="queued">Queued</SelectItem>
                                <SelectItem value="running">Running</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={queueFilter} onValueChange={(v) => setQueueFilter(v as typeof queueFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Queue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Queues</SelectItem>
                                {['email', 'notification', 'export', 'cleanup', 'sync', 'analytics'].map((q) => (
                                  <SelectItem key={q} value={q}>{formatQueueName(q as QueueType)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Active Jobs Table */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Job</TableHead>
                                  <TableHead className="hidden sm:table-cell">Queue</TableHead>
                                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                                  <TableHead className="hidden lg:table-cell">Progress</TableHead>
                                  <TableHead className="hidden md:table-cell">Started</TableHead>
                                  <TableHead className="text-center w-[96px]">Status</TableHead>
                                  <TableHead className="text-center w-[96px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {activeJobs.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                      No active jobs found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  activeJobs.map((job) => (
                                    <Fragment key={job.id}>
                                      <TableRow>
                                        <TableCell>
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(job.status)}
                                              <span className="font-medium">{job.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap sm:hidden text-xs text-muted-foreground">
                                              <span className="capitalize">{formatQueueName(job.queue)}</span>
                                              {getPriorityBadge(job.priority)}
                                              {job.status === 'running' && job.progress > 0 && (
                                                <span>{job.progress}%</span>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono">{job.id}</p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                          <Badge variant="outline" className="capitalize">
                                            {formatQueueName(job.queue)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                          {getPriorityBadge(job.priority)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                          {job.status === 'running' && job.progress > 0 ? (
                                            <div className="w-32">
                                              <Progress value={job.progress} className="h-2" />
                                              <span className="text-xs text-muted-foreground mt-1">{job.progress}%</span>
                                            </div>
                                          ) : (
                                            <span className="text-sm text-muted-foreground">-</span>
                                          )}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                          {job.startedAt ? job.startedAt.toLocaleTimeString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                          {getStatusBadge(job.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedJob(job)}
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Details</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            {job.status === 'running' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <Pause className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Pause</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                            {job.status === 'queued' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <Play className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Start Now</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Cancel</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    </Fragment>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="space-y-4 mt-0">
                          {/* Filters */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search jobs..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={queueFilter} onValueChange={(v) => setQueueFilter(v as typeof queueFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Queue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Queues</SelectItem>
                                {['email', 'notification', 'export', 'cleanup', 'sync', 'analytics'].map((q) => (
                                  <SelectItem key={q} value={q}>{formatQueueName(q as QueueType)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* History Table */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Job</TableHead>
                                  <TableHead className="hidden sm:table-cell">Queue</TableHead>
                                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                                  <TableHead className="hidden lg:table-cell">Duration</TableHead>
                                  <TableHead className="hidden md:table-cell">Completed</TableHead>
                                  <TableHead className="text-center w-[96px]">Status</TableHead>
                                  <TableHead className="text-center w-[96px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {historyJobs.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                      No history found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  historyJobs.map((job) => (
                                    <Fragment key={job.id}>
                                      <TableRow>
                                        <TableCell>
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(job.status)}
                                              <span className="font-medium">{job.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap sm:hidden text-xs text-muted-foreground">
                                              <span className="capitalize">{formatQueueName(job.queue)}</span>
                                              {getPriorityBadge(job.priority)}
                                              {job.duration && <span>{formatDuration(job.duration)}</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono">{job.id}</p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                          <Badge variant="outline" className="capitalize">
                                            {formatQueueName(job.queue)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                          {getPriorityBadge(job.priority)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">
                                          {formatDuration(job.duration)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                          {job.completedAt ? job.completedAt.toLocaleString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                          {getStatusBadge(job.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedJob(job)}
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Details</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            {job.status === 'failed' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Retry</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                      {expandedJobs.has(job.id) && job.error && (
                                        <TableRow>
                                          <TableCell colSpan={7} className="bg-muted/50">
                                            <div className="p-4 space-y-2">
                                              <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                                <div>
                                                  <p className="font-medium text-sm">Error Details</p>
                                                  <p className="text-sm text-muted-foreground mt-1">{job.error}</p>
                                                </div>
                                              </div>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </Fragment>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* Job Details Dialog */}
                  <Dialog open={selectedJob !== null} onOpenChange={(open) => !open && setSelectedJob(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedJob?.name}</DialogTitle>
                        <DialogDescription>
                          Job ID: {selectedJob?.id}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedJob && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Status</p>
                              {getStatusBadge(selectedJob.status)}
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Queue</p>
                              <Badge variant="outline" className="capitalize">
                                {formatQueueName(selectedJob.queue)}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Priority</p>
                              {getPriorityBadge(selectedJob.priority)}
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Attempts</p>
                              <p className="text-sm">
                                {selectedJob.attempts} / {selectedJob.maxAttempts}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Created At</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedJob.createdAt.toLocaleString()}
                              </p>
                            </div>
                            {selectedJob.startedAt && (
                              <div>
                                <p className="text-sm font-medium mb-1">Started At</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedJob.startedAt.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {selectedJob.completedAt && (
                              <div>
                                <p className="text-sm font-medium mb-1">Completed At</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedJob.completedAt.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {selectedJob.duration && (
                              <div>
                                <p className="text-sm font-medium mb-1">Duration</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDuration(selectedJob.duration)}
                                </p>
                              </div>
                            )}
                            {selectedJob.workerId && (
                              <div>
                                <p className="text-sm font-medium mb-1">Worker</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {selectedJob.workerId}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {selectedJob.status === 'running' && selectedJob.progress > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium">Progress</p>
                                <span className="text-sm text-muted-foreground">{selectedJob.progress}%</span>
                              </div>
                              <Progress value={selectedJob.progress} />
                            </div>
                          )}

                          {selectedJob.error && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                <div>
                                  <p className="font-medium text-red-800 dark:text-red-200">Error</p>
                                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {selectedJob.error}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedJob.metadata && Object.keys(selectedJob.metadata).length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Metadata</p>
                              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                                {JSON.stringify(selectedJob.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TabsContent>

                {/* Deployment Sub-tab */}
                <TabsContent value="deployment" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    {/* Build Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cloud className="h-5 w-5" />
                          Build Configuration
                        </CardTitle>
                        <CardDescription>Build and deployment commands</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="buildCommand">Build Command</Label>
                          <Input
                            id="buildCommand"
                            value={deploymentConfig.buildCommand}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, buildCommand: e.target.value })}
                            placeholder="pnpm build"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startCommand">Start Command</Label>
                          <Input
                            id="startCommand"
                            value={deploymentConfig.startCommand}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, startCommand: e.target.value })}
                            placeholder="pnpm start"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nodeVersion">Node Version</Label>
                          <Input
                            id="nodeVersion"
                            value={deploymentConfig.nodeVersion}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, nodeVersion: e.target.value })}
                            placeholder="18.x"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="healthCheckUrl">Health Check URL</Label>
                          <Input
                            id="healthCheckUrl"
                            value={deploymentConfig.healthCheckUrl}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, healthCheckUrl: e.target.value })}
                            placeholder="/api/health"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autoDeploy">Auto Deploy</Label>
                            <p className="text-xs text-muted-foreground">Automatically deploy on push</p>
                          </div>
                          <Switch
                            id="autoDeploy"
                            checked={deploymentConfig.autoDeploy}
                            onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, autoDeploy: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enableRollback">Enable Rollback</Label>
                            <p className="text-xs text-muted-foreground">Allow rolling back deployments</p>
                          </div>
                          <Switch
                            id="enableRollback"
                            checked={deploymentConfig.enableRollback}
                            onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, enableRollback: checked })}
                          />
                        </div>
                        <Button className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Save Configuration
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {jobsMetrics.queued + jobsMetrics.running}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {jobsMetrics.queued} queued, {jobsMetrics.running} running
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{jobsMetrics.successRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {jobsMetrics.completed.toLocaleString()} completed
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{jobsMetrics.failed}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Queue Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Queue Statistics</CardTitle>
                      <CardDescription>Overview of jobs across all queues</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {queueStats.map((stat) => (
                          <div
                            key={stat.name}
                            className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold capitalize">{formatQueueName(stat.name)}</h4>
                              <Badge variant="outline">{stat.total}</Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Queued:</span>
                                <span className="font-medium text-blue-600">{stat.queued}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Running:</span>
                                <span className="font-medium text-primary">{stat.running}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Completed:</span>
                                <span className="font-medium text-green-600">{stat.completed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Failed:</span>
                                <span className="font-medium text-red-600">{stat.failed}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Main Content Tabs */}
                  <Card>
                    <CardHeader>
                      <Tabs value={jobsTab} onValueChange={(v) => setJobsTab(v as typeof jobsTab)}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="active">Active Jobs</TabsTrigger>
                          <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={jobsTab} onValueChange={(v) => setJobsTab(v as typeof jobsTab)}>
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Queue Status Overview */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Queue Status</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {queueStats.map((stat) => (
                                    <div key={stat.name}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium capitalize">{formatQueueName(stat.name)}</span>
                                        <span className="text-sm text-muted-foreground">{stat.total} total</span>
                                      </div>
                                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full flex">
                                          {stat.queued > 0 && (
                                            <div 
                                              className="bg-blue-500" 
                                              style={{ width: `${(stat.queued / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.running > 0 && (
                                            <div 
                                              className="bg-primary" 
                                              style={{ width: `${(stat.running / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.completed > 0 && (
                                            <div 
                                              className="bg-green-500" 
                                              style={{ width: `${(stat.completed / stat.total) * 100}%` }}
                                            />
                                          )}
                                          {stat.failed > 0 && (
                                            <div 
                                              className="bg-red-500" 
                                              style={{ width: `${(stat.failed / stat.total) * 100}%` }}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Recent Jobs */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Recent Jobs</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {allJobs.slice(0, 5).map((job) => (
                                    <div
                                      key={job.id}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {getStatusIcon(job.status)}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{job.name}</p>
                                          <p className="text-xs text-muted-foreground truncate">
                                            {formatQueueName(job.queue)} • {job.createdAt.toLocaleTimeString()}
                                          </p>
                                        </div>
                                      </div>
                                      {getStatusBadge(job.status)}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        {/* Active Jobs Tab */}
                        <TabsContent value="active" className="space-y-4 mt-0">
                          {/* Filters */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search jobs..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="queued">Queued</SelectItem>
                                <SelectItem value="running">Running</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={queueFilter} onValueChange={(v) => setQueueFilter(v as typeof queueFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Queue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Queues</SelectItem>
                                {['email', 'notification', 'export', 'cleanup', 'sync', 'analytics'].map((q) => (
                                  <SelectItem key={q} value={q}>{formatQueueName(q as QueueType)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Active Jobs Table */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Job</TableHead>
                                  <TableHead className="hidden sm:table-cell">Queue</TableHead>
                                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                                  <TableHead className="hidden lg:table-cell">Progress</TableHead>
                                  <TableHead className="hidden md:table-cell">Started</TableHead>
                                  <TableHead className="text-center w-[96px]">Status</TableHead>
                                  <TableHead className="text-center w-[96px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {activeJobs.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                      No active jobs found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  activeJobs.map((job) => (
                                    <Fragment key={job.id}>
                                      <TableRow>
                                        <TableCell>
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(job.status)}
                                              <span className="font-medium">{job.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap sm:hidden text-xs text-muted-foreground">
                                              <span className="capitalize">{formatQueueName(job.queue)}</span>
                                              {getPriorityBadge(job.priority)}
                                              {job.status === 'running' && job.progress > 0 && (
                                                <span>{job.progress}%</span>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono">{job.id}</p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                          <Badge variant="outline" className="capitalize">
                                            {formatQueueName(job.queue)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                          {getPriorityBadge(job.priority)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                          {job.status === 'running' && job.progress > 0 ? (
                                            <div className="w-32">
                                              <Progress value={job.progress} className="h-2" />
                                              <span className="text-xs text-muted-foreground mt-1">{job.progress}%</span>
                                            </div>
                                          ) : (
                                            <span className="text-sm text-muted-foreground">-</span>
                                          )}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                          {job.startedAt ? job.startedAt.toLocaleTimeString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                          {getStatusBadge(job.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedJob(job)}
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Details</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            {job.status === 'running' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <Pause className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Pause</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                            {job.status === 'queued' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <Play className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Start Now</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Cancel</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    </Fragment>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="space-y-4 mt-0">
                          {/* Filters */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search jobs..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={queueFilter} onValueChange={(v) => setQueueFilter(v as typeof queueFilter)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Queue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Queues</SelectItem>
                                {['email', 'notification', 'export', 'cleanup', 'sync', 'analytics'].map((q) => (
                                  <SelectItem key={q} value={q}>{formatQueueName(q as QueueType)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* History Table */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Job</TableHead>
                                  <TableHead className="hidden sm:table-cell">Queue</TableHead>
                                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                                  <TableHead className="hidden lg:table-cell">Duration</TableHead>
                                  <TableHead className="hidden md:table-cell">Completed</TableHead>
                                  <TableHead className="text-center w-[96px]">Status</TableHead>
                                  <TableHead className="text-center w-[96px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {historyJobs.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                      No history found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  historyJobs.map((job) => (
                                    <Fragment key={job.id}>
                                      <TableRow>
                                        <TableCell>
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(job.status)}
                                              <span className="font-medium">{job.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap sm:hidden text-xs text-muted-foreground">
                                              <span className="capitalize">{formatQueueName(job.queue)}</span>
                                              {getPriorityBadge(job.priority)}
                                              {job.duration && <span>{formatDuration(job.duration)}</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono">{job.id}</p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                          <Badge variant="outline" className="capitalize">
                                            {formatQueueName(job.queue)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                          {getPriorityBadge(job.priority)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">
                                          {formatDuration(job.duration)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                          {job.completedAt ? job.completedAt.toLocaleString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                          {getStatusBadge(job.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedJob(job)}
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Details</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            {job.status === 'failed' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                      <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>Retry</TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                      {expandedJobs.has(job.id) && job.error && (
                                        <TableRow>
                                          <TableCell colSpan={7} className="bg-muted/50">
                                            <div className="p-4 space-y-2">
                                              <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                                <div>
                                                  <p className="font-medium text-sm">Error Details</p>
                                                  <p className="text-sm text-muted-foreground mt-1">{job.error}</p>
                                                </div>
                                              </div>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </Fragment>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* Job Details Dialog */}
                  <Dialog open={selectedJob !== null} onOpenChange={(open) => !open && setSelectedJob(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedJob?.name}</DialogTitle>
                        <DialogDescription>
                          Job ID: {selectedJob?.id}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedJob && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Status</p>
                              {getStatusBadge(selectedJob.status)}
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Queue</p>
                              <Badge variant="outline" className="capitalize">
                                {formatQueueName(selectedJob.queue)}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Priority</p>
                              {getPriorityBadge(selectedJob.priority)}
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Attempts</p>
                              <p className="text-sm">
                                {selectedJob.attempts} / {selectedJob.maxAttempts}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Created At</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedJob.createdAt.toLocaleString()}
                              </p>
                            </div>
                            {selectedJob.startedAt && (
                              <div>
                                <p className="text-sm font-medium mb-1">Started At</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedJob.startedAt.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {selectedJob.completedAt && (
                              <div>
                                <p className="text-sm font-medium mb-1">Completed At</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedJob.completedAt.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {selectedJob.duration && (
                              <div>
                                <p className="text-sm font-medium mb-1">Duration</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDuration(selectedJob.duration)}
                                </p>
                              </div>
                            )}
                            {selectedJob.workerId && (
                              <div>
                                <p className="text-sm font-medium mb-1">Worker</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {selectedJob.workerId}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {selectedJob.status === 'running' && selectedJob.progress > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium">Progress</p>
                                <span className="text-sm text-muted-foreground">{selectedJob.progress}%</span>
                              </div>
                              <Progress value={selectedJob.progress} />
                            </div>
                          )}

                          {selectedJob.error && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                <div>
                                  <p className="font-medium text-red-800 dark:text-red-200">Error</p>
                                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {selectedJob.error}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedJob.metadata && Object.keys(selectedJob.metadata).length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Metadata</p>
                              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                                {JSON.stringify(selectedJob.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TabsContent>

                {/* Deployment Sub-tab */}
                <TabsContent value="deployment" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    {/* Build Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cloud className="h-5 w-5" />
                          Build Configuration
                        </CardTitle>
                        <CardDescription>Build and deployment commands</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="buildCommand">Build Command</Label>
                          <Input
                            id="buildCommand"
                            value={deploymentConfig.buildCommand}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, buildCommand: e.target.value })}
                            className="font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startCommand">Start Command</Label>
                          <Input
                            id="startCommand"
                            value={deploymentConfig.startCommand}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, startCommand: e.target.value })}
                            className="font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nodeVersion">Node.js Version</Label>
                          <Select
                            value={deploymentConfig.nodeVersion}
                            onValueChange={(value) => setDeploymentConfig({ ...deploymentConfig, nodeVersion: value })}
                          >
                            <SelectTrigger id="nodeVersion">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="16.x">16.x</SelectItem>
                              <SelectItem value="18.x">18.x</SelectItem>
                              <SelectItem value="20.x">20.x</SelectItem>
                              <SelectItem value="22.x">22.x</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Deployment Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GitBranch className="h-5 w-5" />
                          Deployment Settings
                        </CardTitle>
                        <CardDescription>Deployment automation and options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Auto Deploy</Label>
                            <p className="text-sm text-muted-foreground">Automatically deploy on push to main</p>
                          </div>
                          <Switch
                            checked={deploymentConfig.autoDeploy}
                            onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, autoDeploy: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Enable Rollback</Label>
                            <p className="text-sm text-muted-foreground">Allow rolling back to previous versions</p>
                          </div>
                          <Switch
                            checked={deploymentConfig.enableRollback}
                            onCheckedChange={(checked) => setDeploymentConfig({ ...deploymentConfig, enableRollback: checked })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="healthCheckUrl">Health Check URL</Label>
                          <Input
                            id="healthCheckUrl"
                            value={deploymentConfig.healthCheckUrl}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, healthCheckUrl: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deploymentTimeout">Deployment Timeout (seconds)</Label>
                          <Input
                            id="deploymentTimeout"
                            type="number"
                            value={deploymentConfig.deploymentTimeout}
                            onChange={(e) => setDeploymentConfig({ ...deploymentConfig, deploymentTimeout: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Deployment History */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Deployment History
                          </CardTitle>
                          <CardDescription>Recent deployments and their status</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Version</TableHead>
                            <TableHead className="hidden md:table-cell">Environment</TableHead>
                            <TableHead className="hidden lg:table-cell">Commit</TableHead>
                            <TableHead className="hidden lg:table-cell">Branch</TableHead>
                            <TableHead className="hidden md:table-cell">Deployed At</TableHead>
                            <TableHead className="hidden lg:table-cell">Duration</TableHead>
                                  <TableHead className="text-center w-[96px]">Status</TableHead>
                                  <TableHead className="text-center w-[96px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockDeployments.map((deployment) => (
                            <TableRow key={deployment.id}>
                              <TableCell className="font-medium">{deployment.version}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="secondary">{deployment.environment}</Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell font-mono text-sm">
                                {deployment.commit}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                  <GitBranch className="h-3 w-3" />
                                  {deployment.branch}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                {deployment.deployedAt}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell text-sm">
                                {deployment.duration}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={deployment.status === 'success' ? 'default' : 'destructive'}
                                  className={deployment.status === 'success' ? 'bg-green-600' : ''}
                                >
                                  {deployment.status === 'success' ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {deployment.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  {deployment.status === 'success' && deploymentConfig.enableRollback && (
                                    <Button variant="ghost" size="sm" className="h-8">
                                      <RotateCcw className="h-3 w-3 mr-1" />
                                      Rollback
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Deploy, test, or manage releases</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button>
                          <Play className="h-4 w-4 mr-2" />
                          Deploy to Staging
                        </Button>
                        <Button variant="outline">
                          <Cloud className="h-4 w-4 mr-2" />
                          Deploy to Production
                        </Button>
                        <Button variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Trigger Build
                        </Button>
                        <Button variant="outline">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Run Health Check
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Environment Tab */}
            <TabsContent value="environment" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Environment Variables</h3>
                  <p className="text-sm text-muted-foreground">Manage environment-specific configuration</p>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="production">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead className="hidden md:table-cell">Value</TableHead>
                        <TableHead className="hidden lg:table-cell">Environment</TableHead>
                        <TableHead className="hidden lg:table-cell">Type</TableHead>
                        <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockEnvVars.map((envVar) => (
                        <TableRow key={envVar.key}>
                          <TableCell className="font-medium font-mono">{envVar.key}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2 max-w-md">
                              <code className="text-sm truncate">
                                {envVar.type === 'secret' && !showSecrets[envVar.key]
                                  ? '••••••••••••'
                                  : envVar.value}
                              </code>
                              {envVar.type === 'secret' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => toggleSecretVisibility(envVar.key)}
                                >
                                  {showSecrets[envVar.key] ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm">{envVar.environment}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant={envVar.type === 'secret' ? 'secondary' : 'destructive'} className="gap-0">
                              {envVar.type === 'secret' ? 'Secret' : 'Public'}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell w-[160px]">
                            {formatDateTimeExact(envVar.lastUpdated.replace(' ', 'T'))}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => copyToClipboard(envVar.value)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Environment Health Check */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Environment Health
                  </CardTitle>
                  <CardDescription>Status of environment-specific services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Production</p>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Staging</p>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">Development</p>
                        <p className="text-xs text-muted-foreground">1 service warning</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {/* Database Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Database
                    </CardTitle>
                    <CardDescription>Database connection settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dbHost">Host</Label>
                      <Input
                        id="dbHost"
                        value={systemConfig.databaseHost}
                        onChange={(e) => setSystemConfig({ ...systemConfig, databaseHost: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dbPort">Port</Label>
                        <Input
                          id="dbPort"
                          type="number"
                          value={systemConfig.databasePort}
                          onChange={(e) => setSystemConfig({ ...systemConfig, databasePort: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dbName">Database Name</Label>
                        <Input
                          id="dbName"
                          value={systemConfig.databaseName}
                          onChange={(e) => setSystemConfig({ ...systemConfig, databaseName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxConnections">Max Connections</Label>
                      <Input
                        id="maxConnections"
                        type="number"
                        value={systemConfig.maxConnections}
                        onChange={(e) => setSystemConfig({ ...systemConfig, maxConnections: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Cache Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Cache
                    </CardTitle>
                    <CardDescription>Cache and performance settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Cache</Label>
                        <p className="text-sm text-muted-foreground">Use Redis for caching</p>
                      </div>
                      <Switch
                        checked={systemConfig.cacheEnabled}
                        onCheckedChange={(checked) => setSystemConfig({ ...systemConfig, cacheEnabled: checked })}
                      />
                    </div>
                    {systemConfig.cacheEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="cacheTTL">Cache TTL (seconds)</Label>
                        <Input
                          id="cacheTTL"
                          type="number"
                          value={systemConfig.cacheTTL}
                          onChange={(e) => setSystemConfig({ ...systemConfig, cacheTTL: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Logging Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Logging
                    </CardTitle>
                    <CardDescription>System logging configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="logLevel">Log Level</Label>
                      <Select
                        value={systemConfig.logLevel}
                        onValueChange={(value) => setSystemConfig({ ...systemConfig, logLevel: value })}
                      >
                        <SelectTrigger id="logLevel">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debug">Debug</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warn">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Metrics</Label>
                        <p className="text-sm text-muted-foreground">Collect system performance metrics</p>
                      </div>
                      <Switch
                        checked={systemConfig.enableMetrics}
                        onCheckedChange={(checked) => setSystemConfig({ ...systemConfig, enableMetrics: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Resource Limits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5" />
                      Resource Limits
                    </CardTitle>
                    <CardDescription>System resource constraints</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="workerThreads">Worker Threads</Label>
                      <Input
                        id="workerThreads"
                        type="number"
                        value={systemConfig.workerThreads}
                        onChange={(e) => setSystemConfig({ ...systemConfig, workerThreads: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memoryLimit">Memory Limit (MB)</Label>
                      <Input
                        id="memoryLimit"
                        type="number"
                        value={systemConfig.memoryLimit}
                        onChange={(e) => setSystemConfig({ ...systemConfig, memoryLimit: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    System Status
                  </CardTitle>
                  <CardDescription>Current system resource usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">CPU Usage</span>
                        <span className="font-medium">24%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '24%' }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Memory</span>
                        <span className="font-medium">1.2GB / 2GB</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '60%' }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Database Connections</span>
                        <span className="font-medium">23 / 100</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-600" style={{ width: '23%' }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Disk Usage</span>
                        <span className="font-medium">45GB / 100GB</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '45%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </TabsContent>

            {/* External API & Keys Tab */}
            <TabsContent value="external-api" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
              <Tabs value={externalApiSubTab} onValueChange={(v) => setExternalApiSubTab(v as typeof externalApiSubTab)}>
                <TabsList className="mb-4 sm:mb-6">
                  <TabsTrigger value="api-keys">
                    <Key className="h-4 w-4 mr-2" />
                    API Keys
                  </TabsTrigger>
                  <TabsTrigger value="webhooks-outbound">
                    <Webhook className="h-4 w-4 mr-2" />
                    Webhooks (Outbound)
                  </TabsTrigger>
                </TabsList>

                {/* API Keys Sub-tab */}
                <TabsContent value="api-keys" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">API Keys</h3>
                      <p className="text-sm text-muted-foreground">Keys issued to developers for accessing your API</p>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Key
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Active API Keys</CardTitle>
                      <CardDescription>Keys that can access your API endpoints</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Key Name</TableHead>
                            <TableHead className="hidden md:table-cell">Key Prefix</TableHead>
                            <TableHead className="hidden lg:table-cell">Created</TableHead>
                            <TableHead className="hidden lg:table-cell">Last Used</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Production API Key</TableCell>
                            <TableCell className="hidden md:table-cell font-mono text-sm">sk_live_...</TableCell>
                            <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell w-[160px]">{formatDateTimeExact('2025-01-15T00:00:00')}</TableCell>
                            <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell w-[160px]">{formatDateTimeExact(new Date(Date.now() - 2 * 60 * 60 * 1000))}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Development API Key</TableCell>
                            <TableCell className="hidden md:table-cell font-mono text-sm">sk_test_...</TableCell>
                            <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell w-[160px]">{formatDateTimeExact('2025-01-20T00:00:00')}</TableCell>
                            <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell w-[160px]">{formatDateTimeExact(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Webhooks (Outbound) Sub-tab */}
                <TabsContent value="webhooks-outbound" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Webhooks (Outbound)</h3>
                      <p className="text-sm text-muted-foreground">Configure webhooks your app sends to external services</p>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Webhook
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Active Webhooks</CardTitle>
                      <CardDescription>Endpoints that receive outbound webhook notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Webhook Name</TableHead>
                            <TableHead className="hidden md:table-cell">URL</TableHead>
                            <TableHead className="hidden lg:table-cell">Events</TableHead>
                            <TableHead className="hidden lg:table-cell">Last Sent</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Stripe Payment Webhook</TableCell>
                            <TableCell className="hidden md:table-cell font-mono text-sm">https://api.stripe.com/...</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="outline" className="text-xs">payment.created</Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">5 minutes ago</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Automations Tab */}
            <TabsContent value="automations" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
              <Tabs value={automationsSubTab} onValueChange={(v) => setAutomationsSubTab(v as typeof automationsSubTab)}>
                <TabsList className="mb-4 sm:mb-6">
                  <TabsTrigger value="workflow-status">
                    <Activity className="h-4 w-4 mr-2" />
                    Workflow Status
                  </TabsTrigger>
                  <TabsTrigger value="execution-history">
                    <History className="h-4 w-4 mr-2" />
                    Execution History
                  </TabsTrigger>
                  <TabsTrigger value="webhooks-inbound">
                    <Webhook className="h-4 w-4 mr-2" />
                    Webhooks (Inbound)
                  </TabsTrigger>
                </TabsList>

                {/* Workflow Status Sub-tab */}
                <TabsContent value="workflow-status" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Workflow Status</h3>
                      <p className="text-sm text-muted-foreground">Monitor n8n workflows configured in your n8n instance</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                        <Workflow className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently running</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">48</div>
                        <p className="text-xs text-muted-foreground mt-1">Configured in n8n</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">98.5%</div>
                        <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Failed Runs</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">3</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Workflow Overview</CardTitle>
                      <CardDescription>Recent workflow executions and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Workflow Name</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead className="hidden lg:table-cell">Last Run</TableHead>
                            <TableHead className="hidden lg:table-cell">Next Run</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Email Notification Workflow</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Running
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">5 minutes ago</TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">In 55 minutes</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-8">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View in n8n
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Data Sync Workflow</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">2 hours ago</TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">Daily at 3:00 AM</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-8">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View in n8n
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Execution History Sub-tab */}
                <TabsContent value="execution-history" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Execution History</h3>
                      <p className="text-sm text-muted-foreground">View n8n workflow execution logs</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Executions</CardTitle>
                      <CardDescription>Workflow execution history from n8n</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Workflow</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead className="hidden lg:table-cell">Started</TableHead>
                            <TableHead className="hidden lg:table-cell">Duration</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Email Notification Workflow</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Success
                              </Badge>
                            </TableCell>
                            <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell w-[160px]">{formatDateTimeExact('2025-01-27T14:30:15')}</TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">2.3s</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-8">
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Data Sync Workflow</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Failed
                              </Badge>
                            </TableCell>
                            <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell w-[160px]">{formatDateTimeExact('2025-01-27T12:15:42')}</TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">45s</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-8">
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Webhooks (Inbound) Sub-tab */}
                <TabsContent value="webhooks-inbound" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Webhooks (Inbound)</h3>
                      <p className="text-sm text-muted-foreground">Webhooks FROM n8n TO your app</p>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Webhook Endpoint
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Webhook Endpoints</CardTitle>
                      <CardDescription>Configure endpoints to receive webhooks from n8n workflows</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Endpoint Name</TableHead>
                            <TableHead className="hidden md:table-cell">URL Path</TableHead>
                            <TableHead className="hidden lg:table-cell">Method</TableHead>
                            <TableHead className="hidden lg:table-cell">Last Received</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center w-[96px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Order Processing Webhook</TableCell>
                            <TableCell className="hidden md:table-cell font-mono text-sm">/api/webhooks/n8n/orders</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge className={getBadgeClasses('http.post')}>POST</Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">10 minutes ago</TableCell>
                            <TableCell>
                              <Badge className={getBadgeClasses('security.active')}>Active</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Integrations</h3>
                  <p className="text-sm text-muted-foreground">Manage third-party service connections</p>
                </div>
              </div>

              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Stripe
                      </CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <CardDescription>Payment processing and subscription management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last synced:</span>
                        <span className="font-medium">2 minutes ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Workflow className="h-5 w-5" />
                        n8n
                      </CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <CardDescription>Workflow automation and integration platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Workflows:</span>
                        <span className="font-medium">48 active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Email Service
                      </CardTitle>
                      <Badge variant="outline">Not Configured</Badge>
                    </div>
                    <CardDescription>Email delivery and template management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
              <div className="space-y-6">
                <div>
                  <CardTitle className="mb-2">Third-Party Integrations</CardTitle>
                  <CardDescription>
                    Connect and manage third-party services for your application
                  </CardDescription>
                </div>

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Stripe Integration */}
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">Stripe</CardTitle>
                          <CardDescription className="text-xs">Payment processing</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Connected
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Mode</span>
                          <Badge variant="outline">Live</Badge>
                        </div>
                        <Button variant="outline" className="w-full mt-2">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Email Integration */}
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">Email Service</CardTitle>
                          <CardDescription className="text-xs">Transactional emails</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Connected
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Provider</span>
                          <Badge variant="outline">SendGrid</Badge>
                        </div>
                        <Button variant="outline" className="w-full mt-2">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analytics Integration */}
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">Analytics</CardTitle>
                          <CardDescription className="text-xs">Usage analytics</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            Not Connected
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Provider</span>
                          <Badge variant="outline">Google Analytics</Badge>
                        </div>
                        <Button variant="outline" className="w-full mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Integration Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Integration Settings</CardTitle>
                    <CardDescription>Global settings for all integrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-sync Integration Data</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically synchronize data with connected services
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Webhook Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable webhook notifications for integration events
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Error Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Send alerts when integration errors occur
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
