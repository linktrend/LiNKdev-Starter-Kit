'use client';

import { useState } from 'react';
import './health-scrollbar.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Server,
  Database,
  Globe,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Mail,
  HardDrive,
  RefreshCw,
  ListChecks,
  Info,
} from 'lucide-react';

interface ServiceHealth {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  endpoint?: string;
}

interface HealthMetric {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down';
  timestamp: string;
  message?: string;
}

interface HealthCheckHistory {
  id: string;
  timestamp: string;
  service: string;
  status: 'success' | 'failure' | 'warning';
  responseTime: number;
  message?: string;
}

// Mock data
const mockServices: ServiceHealth[] = [
  {
    id: '1',
    name: 'API Gateway',
    status: 'healthy',
    uptime: 99.98,
    responseTime: 45,
    lastCheck: '2 seconds ago',
    endpoint: 'https://api.example.com/health'
  },
  {
    id: '2',
    name: 'Database (Primary)',
    status: 'healthy',
    uptime: 99.95,
    responseTime: 12,
    lastCheck: '5 seconds ago',
    endpoint: 'postgres://primary.example.com'
  },
  {
    id: '3',
    name: 'Database (Replica)',
    status: 'healthy',
    uptime: 99.92,
    responseTime: 15,
    lastCheck: '5 seconds ago',
    endpoint: 'postgres://replica.example.com'
  },
  {
    id: '4',
    name: 'Redis Cache',
    status: 'healthy',
    uptime: 99.97,
    responseTime: 3,
    lastCheck: '3 seconds ago',
    endpoint: 'redis://cache.example.com'
  },
  {
    id: '5',
    name: 'Storage Service',
    status: 'healthy',
    uptime: 99.89,
    responseTime: 128,
    lastCheck: '10 seconds ago',
    endpoint: 'https://storage.example.com'
  },
  {
    id: '6',
    name: 'Email Service',
    status: 'degraded',
    uptime: 98.45,
    responseTime: 342,
    lastCheck: '1 minute ago',
    endpoint: 'https://email.example.com'
  },
  {
    id: '7',
    name: 'CDN',
    status: 'healthy',
    uptime: 99.99,
    responseTime: 28,
    lastCheck: '1 second ago',
    endpoint: 'https://cdn.example.com'
  },
  {
    id: '8',
    name: 'Authentication Service',
    status: 'healthy',
    uptime: 99.94,
    responseTime: 67,
    lastCheck: '4 seconds ago',
    endpoint: 'https://auth.example.com'
  }
];

const mockMetrics: HealthMetric[] = [
  {
    label: 'Overall System Uptime',
    value: '99.97%',
    status: 'good',
    trend: 'up',
    timestamp: '2024-01-15T14:23:50Z'
  },
  {
    label: 'Average Response Time',
    value: '67ms',
    status: 'good',
    trend: 'down',
    timestamp: '2024-01-15T14:23:48Z'
  },
  {
    label: 'Error Rate (24h)',
    value: '0.03%',
    status: 'good',
    trend: 'down',
    timestamp: '2024-01-15T14:23:45Z'
  },
  {
    label: 'Active Connections',
    value: '12,543',
    status: 'good',
    trend: 'up',
    timestamp: '2024-01-15T14:23:43Z'
  },
  {
    label: 'Requests per Second',
    value: '2,847',
    status: 'good',
    trend: 'up',
    timestamp: '2024-01-15T14:23:41Z'
  },
  {
    label: 'Cache Hit Rate',
    value: '87.3%',
    status: 'good',
    trend: 'up',
    timestamp: '2024-01-15T14:23:39Z',
    message: 'Below target threshold'
  },
  {
    label: 'Database Query Time',
    value: '12ms',
    status: 'good',
    trend: 'down',
    timestamp: '2024-01-15T14:23:37Z'
  },
  {
    label: 'Memory Usage',
    value: '6.2 GB',
    status: 'good',
    trend: 'down',
    timestamp: '2024-01-15T14:23:35Z'
  },
  {
    label: 'CPU Usage',
    value: '45%',
    status: 'good',
    trend: 'down',
    timestamp: '2024-01-15T14:23:33Z'
  },
  {
    label: 'Disk I/O',
    value: '125 MB/s',
    status: 'good',
    trend: 'up',
    timestamp: '2024-01-15T14:23:31Z'
  },
  {
    label: 'Network Throughput',
    value: '2.4 Gbps',
    status: 'good',
    trend: 'up',
    timestamp: '2024-01-15T14:23:29Z'
  },
  {
    label: 'Failed Requests',
    value: '0.02%',
    status: 'good',
    trend: 'down',
    timestamp: '2024-01-15T14:23:27Z'
  },
  {
    label: 'Session Duration',
    value: '14.5 min',
    status: 'good',
    trend: 'up',
    timestamp: '2024-01-15T14:23:25Z'
  }
];

const mockHistory: HealthCheckHistory[] = [
  {
    id: '1',
    timestamp: '2024-01-15T14:23:45Z',
    service: 'API Gateway',
    status: 'success',
    responseTime: 43
  },
  {
    id: '2',
    timestamp: '2024-01-15T14:23:42Z',
    service: 'Database (Primary)',
    status: 'success',
    responseTime: 11
  },
  {
    id: '3',
    timestamp: '2024-01-15T14:23:40Z',
    service: 'Email Service',
    status: 'warning',
    responseTime: 356,
    message: 'Response time above threshold'
  },
  {
    id: '4',
    timestamp: '2024-01-15T14:23:38Z',
    service: 'Redis Cache',
    status: 'success',
    responseTime: 2
  },
  {
    id: '5',
    timestamp: '2024-01-15T14:23:35Z',
    service: 'Storage Service',
    status: 'success',
    responseTime: 125
  },
  {
    id: '6',
    timestamp: '2024-01-15T14:23:32Z',
    service: 'CDN',
    status: 'success',
    responseTime: 27
  },
  {
    id: '7',
    timestamp: '2024-01-15T14:23:30Z',
    service: 'Authentication Service',
    status: 'success',
    responseTime: 65
  },
  {
    id: '8',
    timestamp: '2024-01-15T14:23:28Z',
    service: 'Database (Replica)',
    status: 'success',
    responseTime: 14
  }
];

function getStatusIcon(status: ServiceHealth['status']) {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'down':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'maintenance':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  }
}

function getStatusLabel(status: ServiceHealth['status']) {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'degraded':
      return 'Warning';
    case 'down':
      return 'Critical';
    case 'maintenance':
      return 'Warning';
  }
}

function getStatusTooltip(status: ServiceHealth['status']) {
  switch (status) {
    case 'healthy':
      return 'Service is operating normally and all checks are passing';
    case 'degraded':
      return 'Service is experiencing issues but still operational. Performance may be impacted';
    case 'down':
      return 'Service is down or critical errors detected. Immediate attention required';
    case 'maintenance':
      return 'Service is in maintenance mode. Performance may be impacted';
  }
}

function convertLastCheckToMs(lastCheck: string): string {
  // Parse strings like "2 seconds ago", "1 minute ago", "10 seconds ago"
  const match = lastCheck.match(/(\d+)\s+(second|minute|hour|day)s?\s+ago/i);
  if (!match) return '0 ms';
  
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  let milliseconds = 0;
  if (unit === 'second') {
    milliseconds = value * 1000;
  } else if (unit === 'minute') {
    milliseconds = value * 60 * 1000;
  } else if (unit === 'hour') {
    milliseconds = value * 60 * 60 * 1000;
  } else if (unit === 'day') {
    milliseconds = value * 24 * 60 * 60 * 1000;
  }
  
  return `${milliseconds.toLocaleString()} ms`;
}

function getStatusColor(status: 'success' | 'failure' | 'warning') {
  switch (status) {
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'failure':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
  }
}

function getServiceIcon(name: string) {
  if (name.includes('Database')) return <Database className="h-4 w-4" />;
  if (name.includes('API')) return <Globe className="h-4 w-4" />;
  if (name.includes('Redis') || name.includes('Cache')) return <Zap className="h-4 w-4" />;
  if (name.includes('Storage')) return <HardDrive className="h-4 w-4" />;
  if (name.includes('Email')) return <Mail className="h-4 w-4" />;
  if (name.includes('Auth')) return <Shield className="h-4 w-4" />;
  if (name.includes('CDN')) return <Activity className="h-4 w-4" />;
  return <Server className="h-4 w-4" />;
}

export default function ConsoleHealthPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const healthyServices = mockServices.filter(s => s.status === 'healthy').length;
  const degradedServices = mockServices.filter(s => s.status === 'degraded').length;
  const downServices = mockServices.filter(s => s.status === 'down').length;

  // Calculate overall health percentage
  const overallHealthPercentage = (healthyServices / mockServices.length) * 100;
  
  // Determine overall status based on health percentage
  const getOverallStatus = () => {
    if (overallHealthPercentage <= 40) {
      return { text: 'Critical', color: 'text-red-600', bgColor: 'bg-red-500' };
    } else if (overallHealthPercentage <= 80) {
      return { text: 'Warning', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    } else {
      return { text: 'Healthy', color: 'text-green-600', bgColor: 'bg-green-500' };
    }
  };

  const overallStatus = getOverallStatus();

  // Determine uptime status color
  const uptimePercentage = 99.97;
  const getUptimeStatusColor = () => {
    if (uptimePercentage <= 40) return 'bg-red-500';
    if (uptimePercentage <= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Response time trend data
  const responseTimeTrend = { percentage: 12, isFaster: true }; // 12% faster

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Controls */}
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live monitoring</span>
        </div>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          {autoRefresh ? 'Auto-refresh' : 'Manual'}
        </button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overallStatus.color}`}>{overallStatus.text}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {healthyServices} of {mockServices.length} services healthy
            </p>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-3">
              <div 
                className={`h-full ${overallStatus.bgColor}`} 
                style={{ width: `${overallHealthPercentage}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">Uptime (30d)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.97%</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-3">
              <div className={`h-full ${getUptimeStatusColor()}`} style={{ width: `${uptimePercentage}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67ms</div>
            <div className="mt-1">
              <p className={`text-xs ${responseTimeTrend.isFaster ? 'text-green-600' : 'text-red-600'}`}>
                {responseTimeTrend.percentage}% {responseTimeTrend.isFaster ? 'faster' : 'slower'}
              </p>
              <p className="text-xs text-muted-foreground">Than Last Week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <CardTitle className="text-sm font-medium">Issues</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {degradedServices + downServices > 0 ? `${degradedServices + downServices}` : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {degradedServices > 0 && `${degradedServices} degraded`}
              {degradedServices > 0 && downServices > 0 && ', '}
              {downServices > 0 && `${downServices} down`}
              {degradedServices === 0 && downServices === 0 && 'All systems operational'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Health Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            Service Status
          </CardTitle>
          <CardDescription>
            Real-time health status of all system services and dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <TooltipProvider>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="hidden sm:table-cell text-center w-[96px]">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Uptime</TableHead>
                    <TableHead className="hidden lg:table-cell">Response Time</TableHead>
                    <TableHead className="hidden xl:table-cell">Last Check</TableHead>
                    <TableHead className="hidden xl:table-cell">Endpoint</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {getServiceIcon(service.name)}
                            <span className="font-medium truncate">{service.name}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap sm:hidden">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 cursor-help">
                                  {getStatusIcon(service.status)}
                                  <span className="text-xs text-muted-foreground">{getStatusLabel(service.status)}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">{getStatusLabel(service.status)}</p>
                                <p className="text-xs mt-1">{getStatusTooltip(service.status)}</p>
                              </TooltipContent>
                            </Tooltip>
                            <span className="text-xs text-muted-foreground md:hidden">{service.uptime}%</span>
                            <span className="text-xs text-muted-foreground lg:hidden">{service.responseTime}ms</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center cursor-help">
                              {getStatusIcon(service.status)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="text-left">
                            <p className="font-medium">{getStatusLabel(service.status)}</p>
                            <p className="text-xs mt-1">{getStatusTooltip(service.status)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-medium">{service.uptime}%</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span>{service.responseTime}ms</span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {convertLastCheckToMs(service.lastCheck)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-xs text-muted-foreground font-mono truncate block max-w-[200px]">
                          {service.endpoint?.split('://')[1] || 'N/A'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Metrics and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="health-scroll-container space-y-3 max-h-96 overflow-y-scroll border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              {mockMetrics.map((metric, index) => (
                <div key={index} className="space-y-2 p-3 rounded-lg bg-muted hover:bg-accent transition-all min-h-[72px]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{metric.value}</span>
                      {metric.trend && (
                        <div className={metric.trend === 'up' ? 'text-green-600' : 'text-blue-600'}>
                          {metric.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </span>
                    {metric.message && (
                      <span className="text-xs text-yellow-600 truncate">• {metric.message}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Health Check History */}
        <Card>
          <CardHeader className="border-b-0 pb-0">
            <CardTitle>Recent Health Checks</CardTitle>
            <CardDescription>Latest health check results across all services</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="health-scroll-container space-y-3 max-h-96 overflow-y-scroll border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              {mockHistory.map((check) => (
                <div
                  key={check.id}
                  className="space-y-2 p-3 rounded-lg bg-muted hover:bg-accent transition-all min-h-[72px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {check.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : check.status === 'failure' ? (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">{check.service}</span>
                    </div>
                    <span className={`text-xs font-medium ${getStatusColor(check.status)}`}>
                      {check.responseTime}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(check.timestamp).toLocaleTimeString()}
                    </span>
                    {check.message && (
                      <span className="text-xs text-yellow-600 truncate">• {check.message}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Service Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Service Details
          </CardTitle>
          <CardDescription>
            Detailed health information and monitoring for individual services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Tabs defaultValue="api" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="api">API Services</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="storage">Storage</TabsTrigger>
                <TabsTrigger value="external">External Services</TabsTrigger>
              </TabsList>
              <TabsContent value="api" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {mockServices
                  .filter((s) => s.name.includes('API') || s.name.includes('Auth'))
                  .map((service) => (
                    <Card key={service.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            {getServiceIcon(service.name)}
                            {service.name}
                          </CardTitle>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                {getStatusIcon(service.status)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-left">
                              <p className="font-medium">{getStatusLabel(service.status)}</p>
                              <p className="text-xs mt-1">{getStatusTooltip(service.status)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Uptime:</span>
                          <span className="font-medium">{service.uptime}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span className="font-medium">{service.responseTime}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Last Check:</span>
                          <span className="font-medium">{service.lastCheck}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="database" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {mockServices
                  .filter((s) => s.name.includes('Database') || s.name.includes('Redis') || s.name.includes('Cache'))
                  .map((service) => (
                    <Card key={service.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            {getServiceIcon(service.name)}
                            {service.name}
                          </CardTitle>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                {getStatusIcon(service.status)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-left">
                              <p className="font-medium">{getStatusLabel(service.status)}</p>
                              <p className="text-xs mt-1">{getStatusTooltip(service.status)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Uptime:</span>
                          <span className="font-medium">{service.uptime}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span className="font-medium">{service.responseTime}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Last Check:</span>
                          <span className="font-medium">{service.lastCheck}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="storage" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {mockServices
                  .filter((s) => s.name.includes('Storage') || s.name.includes('CDN'))
                  .map((service) => (
                    <Card key={service.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            {getServiceIcon(service.name)}
                            {service.name}
                          </CardTitle>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                {getStatusIcon(service.status)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-left">
                              <p className="font-medium">{getStatusLabel(service.status)}</p>
                              <p className="text-xs mt-1">{getStatusTooltip(service.status)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Uptime:</span>
                          <span className="font-medium">{service.uptime}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span className="font-medium">{service.responseTime}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Last Check:</span>
                          <span className="font-medium">{service.lastCheck}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="external" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {mockServices
                  .filter((s) => s.name.includes('Email') || s.name.includes('External'))
                  .map((service) => (
                    <Card key={service.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            {getServiceIcon(service.name)}
                            {service.name}
                          </CardTitle>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                {getStatusIcon(service.status)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-left">
                              <p className="font-medium">{getStatusLabel(service.status)}</p>
                              <p className="text-xs mt-1">{getStatusTooltip(service.status)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Uptime:</span>
                          <span className="font-medium">{service.uptime}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span className="font-medium">{service.responseTime}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Last Check:</span>
                          <span className="font-medium">{service.lastCheck}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              </TabsContent>
            </Tabs>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
