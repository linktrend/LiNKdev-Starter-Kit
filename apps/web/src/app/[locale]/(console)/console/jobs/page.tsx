'use client';

import { useState, useMemo, Fragment } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BriefcaseBusiness,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Eye,
  Search,
  Filter,
  Zap,
  Loader2,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/utils/cn';

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
  duration?: number; // in milliseconds
  progress: number; // 0-100
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

// Mock data generators
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

export default function ConsoleJobsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'history'>('overview');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [queueFilter, setQueueFilter] = useState<QueueType>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'normal' | 'high' | 'urgent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLive, setIsLive] = useState(true);

  // Generate mock data
  const allJobs = useMemo(() => generateMockJobs(200), []);
  const queueStats = useMemo(() => generateQueueStats(allJobs), [allJobs]);

  // Calculate overview metrics
  const metrics = useMemo(() => {
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

  const toggleJobExpanded = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

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
      completed: { variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
      failed: { variant: 'destructive', className: '' },
      cancelled: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      paused: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.className}>
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

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className={cn("h-2 w-2 rounded-full", isLive ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
          <span>{isLive ? 'Live monitoring' : 'Paused'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", autoRefresh && "animate-spin")} />
            {autoRefresh ? 'Auto-refresh' : 'Manual'}
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <BriefcaseBusiness className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.queued + metrics.running}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.queued} queued, {metrics.running} running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.completed.toLocaleString()} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.failed}</div>
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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="active">Active Jobs</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
              {/* Filters - same as active tab */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
    </div>
  );
}
