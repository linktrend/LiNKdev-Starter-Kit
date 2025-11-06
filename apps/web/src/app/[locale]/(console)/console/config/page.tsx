'use client';

import { useState, useMemo, useRef, Fragment } from 'react';
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
import { DeploymentDashboard } from '@/components/console/DeploymentDashboard';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
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

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'Connected' | 'Not Connected';
  provider?: string;
}

export default function ConsoleConfigPage() {
  const [activeTab, setActiveTab] = useState<'application' | 'environment' | 'system' | 'external-api' | 'automations' | 'integrations'>('application');
  const [applicationSubTab, setApplicationSubTab] = useState<'settings' | 'feature-flags' | 'jobs' | 'deployment'>('settings');
  const [externalApiSubTab, setExternalApiSubTab] = useState<'api-keys' | 'webhooks-outbound'>('api-keys');
  const [automationsSubTab, setAutomationsSubTab] = useState<'workflow-status' | 'execution-history' | 'webhooks-inbound'>('workflow-status');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isAddIntegrationModalOpen, setIsAddIntegrationModalOpen] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Stripe',
      description: 'Payment processing',
      icon: DollarSign,
      status: 'Connected',
      provider: 'Live',
    },
    {
      id: '2',
      name: 'Email Service',
      description: 'Transactional emails',
      icon: Mail,
      status: 'Connected',
      provider: 'SendGrid',
    },
    {
      id: '3',
      name: 'Analytics',
      description: 'Usage analytics',
      icon: BarChart3,
      status: 'Not Connected',
      provider: 'Google Analytics',
    },
  ]);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    description: '',
    provider: '',
    iconType: 'Link2' as 'DollarSign' | 'Mail' | 'BarChart3' | 'Workflow' | 'Link2' | 'Zap' | 'Cloud' | 'Database',
  });

  // Helper function to get icon component from iconType
  const getIconComponent = (iconType: string): React.ComponentType<{ className?: string }> => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      DollarSign,
      Mail,
      BarChart3,
      Workflow,
      Link2,
      Zap,
      Cloud,
      Database,
    };
    return iconMap[iconType] || Link2;
  };

  // Handler to add new integration
  const handleAddIntegration = () => {
    if (!newIntegration.name.trim()) return;

    const integration: Integration = {
      id: Date.now().toString(),
      name: newIntegration.name,
      description: newIntegration.description,
      icon: getIconComponent(newIntegration.iconType),
      status: 'Not Connected',
      provider: newIntegration.provider || undefined,
    };

    setIntegrations([...integrations, integration]);
    setNewIntegration({
      name: '',
      description: '',
      provider: '',
      iconType: 'Link2',
    });
    setIsAddIntegrationModalOpen(false);
  };

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

  // Initial snapshots and dirty-state per configuration group
  const initialAppConfigRef = useRef(appConfig);
  const initialSystemConfigRef = useRef(systemConfig);

  const isAppDirty = useMemo(() => {
    try {
      return JSON.stringify(appConfig) !== JSON.stringify(initialAppConfigRef.current);
    } catch {
      return false;
    }
  }, [appConfig]);

  const isSystemDirty = useMemo(() => {
    try {
      return JSON.stringify(systemConfig) !== JSON.stringify(initialSystemConfigRef.current);
    } catch {
      return false;
    }
  }, [systemConfig]);

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
                    <Button
                      variant="outline"
                      onClick={() => setAppConfig(initialAppConfigRef.current)}
                      disabled={!isAppDirty}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button disabled={!isAppDirty}>
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
                  <DevelopmentTasksSection orgId={process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || ''} />
                </TabsContent>

                {/* Deployment Sub-tab */}
                <TabsContent value="deployment" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
                  <DeploymentDashboard variant="embedded" />
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Environment Tab */}
            <TabsContent value="environment" className="space-y-4 sm:space-y-6 lg:space-y-8 mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Cloud className="h-4 w-4 text-primary" />
                    Environment Variables
                  </CardTitle>
                  <CardDescription>Manage environment-specific configuration</CardDescription>
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
                  <Table className="font-sans not-prose [&_th]:font-sans [&_td]:font-sans [&_code]:font-sans">
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
                          <TableCell className="font-medium font-sans">{envVar.key}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2 max-w-md">
                              <code className="text-sm truncate font-sans">
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
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
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
                                size="icon"
                                className="p-0"
                                onClick={() => copyToClipboard(envVar.value)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="p-0"
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
                <Button
                  variant="outline"
                  onClick={() => setSystemConfig(initialSystemConfigRef.current)}
                  disabled={!isSystemDirty}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button disabled={!isSystemDirty}>
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
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Key className="h-4 w-4 text-primary" />
                        API Keys
                      </CardTitle>
                      <CardDescription>Keys issued to developers for accessing your API</CardDescription>
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
                      <Table className="font-sans not-prose [&_th]:font-sans [&_td]:font-sans [&_code]:font-sans">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-0">Key Name</TableHead>
                            <TableHead className="hidden md:table-cell w-36">Key Prefix</TableHead>
                            <TableHead className="hidden lg:table-cell w-40">Created</TableHead>
                            <TableHead className="hidden lg:table-cell w-40">Last Used</TableHead>
                            <TableHead className="text-center w-36">Status</TableHead>
                            <TableHead className="text-center w-36">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium font-sans min-w-0">Production API Key</TableCell>
                            <TableCell className="hidden md:table-cell text-sm font-sans w-36">sk_live_...</TableCell>
                            <TableCell className="hidden lg:table-cell w-40">{formatDateTimeExact('2025-01-15T00:00:00')}</TableCell>
                            <TableCell className="hidden lg:table-cell w-40">{formatDateTimeExact(new Date(Date.now() - 2 * 60 * 60 * 1000))}</TableCell>
                            <TableCell className="text-center w-36">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center w-36">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="p-0">
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="p-0">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium font-sans min-w-0">Development API Key</TableCell>
                            <TableCell className="hidden md:table-cell text-sm font-sans w-36">sk_test_...</TableCell>
                            <TableCell className="hidden lg:table-cell w-40">{formatDateTimeExact('2025-01-20T00:00:00')}</TableCell>
                            <TableCell className="hidden lg:table-cell w-40">{formatDateTimeExact(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))}</TableCell>
                            <TableCell className="text-center w-36">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center w-36">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="p-0">
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="p-0">
                                  <Trash2 className="h-4 w-4" />
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
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Webhook className="h-4 w-4 text-primary" />
                        Webhooks (Outbound)
                      </CardTitle>
                      <CardDescription>Configure webhooks your app sends to external services</CardDescription>
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
                      <Table className="font-sans not-prose [&_th]:font-sans [&_td]:font-sans [&_code]:font-sans">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-0">Webhook Name</TableHead>
                            <TableHead className="hidden md:table-cell w-40">URL</TableHead>
                            <TableHead className="hidden lg:table-cell w-36">Events</TableHead>
                            <TableHead className="hidden lg:table-cell w-40">Last Sent</TableHead>
                            <TableHead className="text-center w-36">Status</TableHead>
                            <TableHead className="text-center w-36">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium font-sans min-w-0">Stripe Payment Webhook</TableCell>
                            <TableCell className="hidden md:table-cell text-sm font-sans w-40">https://api.stripe.com/...</TableCell>
                            <TableCell className="hidden lg:table-cell w-36">
                              <Badge variant="outline" className="text-xs">payment.created</Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm w-40">5 minutes ago</TableCell>
                            <TableCell className="text-center w-36">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center w-36">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="p-0">
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="p-0">
                                  <Trash2 className="h-4 w-4" />
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
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Workflow className="h-4 w-4 text-primary" />
                        Workflow Status
                      </CardTitle>
                      <CardDescription>Monitor n8n workflows configured in your n8n instance</CardDescription>
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
                            <TableHead className="min-w-0">Workflow Name</TableHead>
                            <TableHead className="hidden md:table-cell text-center w-36">Status</TableHead>
                            <TableHead className="hidden lg:table-cell w-40">Last Run</TableHead>
                            <TableHead className="hidden lg:table-cell w-40">Next Run</TableHead>
                            <TableHead className="w-24 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium min-w-0">Email Notification Workflow</TableCell>
                            <TableCell className="hidden md:table-cell text-center w-36">
                              <Badge
                                className={cn(
                                  getBadgeClasses('deployment.success'),
                                  'min-w-[112px] justify-center'
                                )}
                              >
                                Running
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm w-40">5 minutes ago</TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm w-40">In 55 minutes</TableCell>
                            <TableCell className="w-24 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="mx-auto"
                                aria-label="View workflow in n8n"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium min-w-0">Data Sync Workflow</TableCell>
                            <TableCell className="hidden md:table-cell text-center w-36">
                              <Badge
                                className={cn(
                                  getBadgeClasses('deployment.in_progress'),
                                  'min-w-[112px] justify-center'
                                )}
                              >
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm w-40">2 hours ago</TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm w-40">Daily at 3:00 AM</TableCell>
                            <TableCell className="w-24 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="mx-auto"
                                aria-label="View workflow in n8n"
                              >
                                <ExternalLink className="h-4 w-4" />
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
                      <CardTitle className="flex items-center gap-2 text-base">
                        <History className="h-4 w-4 text-primary" />
                        Execution History
                      </CardTitle>
                      <CardDescription>View n8n workflow execution logs</CardDescription>
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
                            <TableHead className="hidden md:table-cell text-center">Status</TableHead>
                            <TableHead className="hidden lg:table-cell">Started</TableHead>
                            <TableHead className="hidden lg:table-cell">Duration</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Email Notification Workflow</TableCell>
                            <TableCell className="hidden md:table-cell text-center">
                              <Badge
                                className={cn(
                                  getBadgeClasses('deployment.success'),
                                  'min-w-[88px] justify-center'
                                )}
                              >
                                Success
                              </Badge>
                            </TableCell>
                            <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell w-[160px]">{formatDateTimeExact('2025-01-27T14:30:15')}</TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">2.3s</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="mx-auto"
                                aria-label="View execution details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Data Sync Workflow</TableCell>
                            <TableCell className="hidden md:table-cell text-center">
                              <Badge
                                className={cn(
                                  getBadgeClasses('deployment.failed'),
                                  'min-w-[88px] justify-center'
                                )}
                              >
                                Failed
                              </Badge>
                            </TableCell>
                            <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell w-[160px]">{formatDateTimeExact('2025-01-27T12:15:42')}</TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">45s</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="mx-auto"
                                aria-label="View execution details"
                              >
                                <Eye className="h-4 w-4" />
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
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Webhook className="h-4 w-4 text-primary" />
                        Webhooks (Inbound)
                      </CardTitle>
                      <CardDescription>Webhooks FROM n8n TO your app</CardDescription>
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
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center w-[96px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium font-sans">Order Processing Webhook</TableCell>
                            <TableCell className="hidden md:table-cell text-sm font-sans">/api/webhooks/n8n/orders</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge className={getBadgeClasses('http.post')}>POST</Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">10 minutes ago</TableCell>
                            <TableCell className="text-center">
                              <Badge
                                className={cn(
                                  getBadgeClasses('security.active'),
                                  'min-w-[88px] justify-center'
                                )}
                              >
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="p-0">
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="p-0">
                                  <Trash2 className="h-4 w-4" />
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
              <div className="space-y-6">
                {/* Header with Add Integration Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Plug className="h-4 w-4 text-primary" />
                      Integrations
                    </CardTitle>
                    <CardDescription>Manage third-party service connections</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddIntegrationModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                </div>

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrations.map((integration) => {
                    const Icon = integration.icon;
                    return (
                      <Card key={integration.id} className="cursor-pointer hover:border-primary transition-colors">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base">{integration.name}</CardTitle>
                              <CardDescription className="text-xs">{integration.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Status</span>
                              <Badge 
                                variant="outline" 
                                className={
                                  integration.status === 'Connected'
                                    ? "border-green-500 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900 dark:text-green-100"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                }
                              >
                                {integration.status}
                              </Badge>
                            </div>
                            {integration.provider && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Provider</span>
                                <span className="text-sm text-muted-foreground">{integration.provider}</span>
                              </div>
                            )}
                            <Button className="w-full">
                              {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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

      {/* Add Integration Modal */}
      <Dialog open={isAddIntegrationModalOpen} onOpenChange={setIsAddIntegrationModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Integration</DialogTitle>
            <DialogDescription>
              Add a new third-party integration to your application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="integration-name">Integration Name *</Label>
              <Input
                id="integration-name"
                value={newIntegration.name}
                onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                placeholder="e.g., Slack, GitHub, AWS"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="integration-description">Description</Label>
              <Textarea
                id="integration-description"
                value={newIntegration.description}
                onChange={(e) => setNewIntegration({ ...newIntegration, description: e.target.value })}
                placeholder="Brief description of the integration"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="integration-provider">Provider</Label>
              <Input
                id="integration-provider"
                value={newIntegration.provider}
                onChange={(e) => setNewIntegration({ ...newIntegration, provider: e.target.value })}
                placeholder="e.g., AWS, Google Cloud"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="integration-icon">Icon</Label>
              <Select
                value={newIntegration.iconType}
                onValueChange={(value) => setNewIntegration({ ...newIntegration, iconType: value as typeof newIntegration.iconType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DollarSign">Payment</SelectItem>
                  <SelectItem value="Mail">Email</SelectItem>
                  <SelectItem value="BarChart3">Analytics</SelectItem>
                  <SelectItem value="Workflow">Automation</SelectItem>
                  <SelectItem value="Link2">Link</SelectItem>
                  <SelectItem value="Zap">Lightning</SelectItem>
                  <SelectItem value="Cloud">Cloud</SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsAddIntegrationModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddIntegration} disabled={!newIntegration.name.trim()}>
                Add Integration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
