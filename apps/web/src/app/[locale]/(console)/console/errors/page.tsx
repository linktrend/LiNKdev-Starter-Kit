'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Wifi,
  WifiOff,
  Bug,
  FileText,
  Code,
  Server,
  Database,
  Globe,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ExternalLink,
  Copy,
  XCircle,
  AlertCircle,
  Info,
  Circle
} from 'lucide-react';
import { cn } from '@/utils/cn';

// Types
type ErrorSeverity = 'critical' | 'error' | 'warning';
type LogLevel = 'error' | 'warn' | 'info' | 'debug';
type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | 'all';

interface ErrorLog {
  id: string;
  timestamp: Date;
  severity: ErrorSeverity;
  message: string;
  source: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
  count: number;
  resolved: boolean;
  userId?: string;
}

interface ApplicationLog {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source: string;
  service: string;
  metadata?: Record<string, any>;
  resolved: boolean;
}

// Mock data generators
const generateMockErrors = (count: number): ErrorLog[] => {
  const severities: ErrorSeverity[] = ['critical', 'error', 'warning'];
  const sources = ['API', 'Frontend', 'Database', 'Background Jobs', 'External Service'];
  const messages = [
    'Database connection timeout',
    'Failed to process payment',
    'Invalid authentication token',
    'Rate limit exceeded',
    'Memory allocation error',
    'Network request failed',
    'File upload failed',
    'Queue processing error',
    'Cache miss on critical path',
    'Third-party API timeout'
  ];

  const errors: ErrorLog[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const hoursAgo = Math.random() * 48;
    errors.push({
      id: `err-${i + 1}`,
      timestamp: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      stackTrace: `Error at line ${Math.floor(Math.random() * 1000)}:${Math.floor(Math.random() * 50)}\n  at functionName (file.ts:123)\n  at async processRequest (handler.ts:456)`,
      metadata: {
        userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
        orgId: Math.random() > 0.7 ? `org-${Math.floor(Math.random() * 100)}` : undefined,
        requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
        requestPath: `/${['api', 'v1', 'users', 'records', 'billing'][Math.floor(Math.random() * 5)]}/${['create', 'update', 'delete', 'list'][Math.floor(Math.random() * 4)]}`,
        endpoint: `/api/v1/${['users', 'records', 'billing'][Math.floor(Math.random() * 3)]}`,
        duration: `${Math.floor(Math.random() * 1000) + 10}ms`,
        responseTime: `${(Math.random() * 500 + 50).toFixed(2)}ms`,
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Mozilla/5.0 (X11; Linux x86_64)'][Math.floor(Math.random() * 3)],
        environment: ['production', 'staging', 'development'][Math.floor(Math.random() * 3)],
      },
      count: Math.floor(Math.random() * 10) + 1,
      resolved: Math.random() > 0.7,
      userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
    });
  }

  return errors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const generateMockLogs = (count: number): ApplicationLog[] => {
  const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
  const sources = ['API', 'Frontend', 'Database', 'Background Jobs', 'External Service'];
  const services = ['auth-service', 'payment-service', 'notification-service', 'analytics-service', 'api-gateway'];
  const messages = [
    'User authenticated successfully',
    'Cache updated successfully',
    'Background job started',
    'Database query executed',
    'API request received',
    'File uploaded successfully',
    'Email sent successfully',
    'Webhook processed',
    'Rate limit check passed',
    'Configuration loaded'
  ];

  const logs: ApplicationLog[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const minutesAgo = Math.random() * 1440;
    logs.push({
      id: `log-${i + 1}`,
      timestamp: new Date(now.getTime() - minutesAgo * 60 * 1000),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      service: services[Math.floor(Math.random() * services.length)],
      resolved: Math.random() > 0.6,
      metadata: {
        duration: `${Math.floor(Math.random() * 1000)}ms`,
        statusCode: [200, 201, 400, 404, 500][Math.floor(Math.random() * 5)],
        requestSize: `${Math.floor(Math.random() * 1000)}KB`,
      },
    });
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export default function ConsoleErrorsPage() {
  const [activeTab, setActiveTab] = useState<'errors' | 'logs'>('errors');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [severityFilter, setSeverityFilter] = useState<ErrorSeverity | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [isLive, setIsLive] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Generate mock data
  const allErrors = useMemo(() => generateMockErrors(150), []);
  const allLogs = useMemo(() => generateMockLogs(200), []);
  
  // State for managing resolved status (for toggling)
  const [errorStatusMap, setErrorStatusMap] = useState<Map<string, boolean>>(new Map());
  const [logStatusMap, setLogStatusMap] = useState<Map<string, boolean>>(new Map());
  
  // Helper functions to get resolved status (use state if available, otherwise use data)
  const getErrorResolved = (error: ErrorLog) => errorStatusMap.get(error.id) ?? error.resolved;
  const getLogResolved = (log: ApplicationLog) => logStatusMap.get(log.id) ?? log.resolved;
  
  // Toggle functions
  const toggleErrorStatus = (errorId: string, currentStatus: boolean) => {
    setErrorStatusMap(prev => new Map(prev).set(errorId, !currentStatus));
  };
  
  const toggleLogStatus = (logId: string, currentStatus: boolean) => {
    setLogStatusMap(prev => new Map(prev).set(logId, !currentStatus));
  };

  // Filter errors
  const filteredErrors = useMemo(() => {
    let filtered = allErrors;

    if (severityFilter !== 'all') {
      filtered = filtered.filter(e => e.severity === severityFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(e => e.source === sourceFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.message.toLowerCase().includes(query) ||
        e.source.toLowerCase().includes(query) ||
        e.id.toLowerCase().includes(query)
      );
    }

    // Filter by time range
    const now = new Date();
    const timeRanges = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 7 * 24,
      '30d': 30 * 24,
    };
    const hours = timeRanges[timeRange] || Infinity;
    if (hours < Infinity) {
      filtered = filtered.filter(e => 
        (now.getTime() - e.timestamp.getTime()) / (1000 * 60 * 60) <= hours
      );
    }

    return filtered;
  }, [allErrors, severityFilter, sourceFilter, searchQuery, timeRange]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let filtered = allLogs;

    if (levelFilter !== 'all') {
      filtered = filtered.filter(l => l.level === levelFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(l => l.source === sourceFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        l.message.toLowerCase().includes(query) ||
        l.source.toLowerCase().includes(query) ||
        l.service.toLowerCase().includes(query) ||
        l.id.toLowerCase().includes(query)
      );
    }

    // Filter by time range
    const now = new Date();
    const timeRanges = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 7 * 24,
      '30d': 30 * 24,
    };
    const hours = timeRanges[timeRange] || Infinity;
    if (hours < Infinity) {
      filtered = filtered.filter(l => 
        (now.getTime() - l.timestamp.getTime()) / (1000 * 60 * 60) <= hours
      );
    }

    return filtered;
  }, [allLogs, levelFilter, sourceFilter, searchQuery, timeRange]);

  // Calculate statistics
  const errorStats = useMemo(() => {
    const critical = filteredErrors.filter(e => e.severity === 'critical').length;
    const errors = filteredErrors.filter(e => e.severity === 'error').length;
    const warnings = filteredErrors.filter(e => e.severity === 'warning').length;
    const total = filteredErrors.length;
    const resolved = filteredErrors.filter(e => getErrorResolved(e)).length;
    const unresolved = total - resolved;
    const avgCount = filteredErrors.length > 0 
      ? filteredErrors.reduce((sum, e) => sum + e.count, 0) / filteredErrors.length 
      : 0;

    return { critical, errors, warnings, total, resolved, unresolved, avgCount };
  }, [filteredErrors]);

  const logStats = useMemo(() => {
    const errors = filteredLogs.filter(l => l.level === 'error').length;
    const warns = filteredLogs.filter(l => l.level === 'warn').length;
    const infos = filteredLogs.filter(l => l.level === 'info').length;
    const debugs = filteredLogs.filter(l => l.level === 'debug').length;
    const total = filteredLogs.length;

    return { errors, warns, infos, debugs, total };
  }, [filteredLogs]);

  const toggleErrorExpanded = (id: string) => {
    const newSet = new Set(expandedErrors);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedErrors(newSet);
  };

  const toggleLogExpanded = (id: string) => {
    const newSet = new Set(expandedLogs);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedLogs(newSet);
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getLogLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return 'bg-red-500 text-white';
      case 'warn':
        return 'bg-yellow-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      case 'debug':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getLogLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'debug':
        return <Code className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const uniqueSources = useMemo(() => {
    const sources = new Set<string>();
    allErrors.forEach(e => sources.add(e.source));
    allLogs.forEach(l => sources.add(l.source));
    return Array.from(sources).sort();
  }, [allErrors, allLogs]);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Controls */}
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
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

      {/* Statistics Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 gap-2 !flex-row">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.total}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {errorStats.critical} critical
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {errorStats.errors} errors
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 gap-2 !flex-row">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorStats.unresolved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {errorStats.resolved} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 gap-2 !flex-row">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Avg Occurrences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errorStats.avgCount.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per error instance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 gap-2 !flex-row">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.total}</div>
            <div className="flex items-center gap-2 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-muted-foreground">
                Last 24 hours
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'errors' | 'logs')}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="errors" className="flex-1 sm:flex-initial">
                  <Bug className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden min-[375px]:inline">Errors</span>
                  <span className="min-[375px]:hidden">Errs</span>
                  <span className="hidden md:inline ml-1">({filteredErrors.length})</span>
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex-1 sm:flex-initial">
                  <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                  Logs
                  <span className="hidden md:inline ml-1">({filteredLogs.length})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Filters - Responsive */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative w-full sm:w-[180px] sm:flex-shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="6h">Last 6 hours</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            {activeTab === 'errors' ? (
              <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as ErrorSeverity | 'all')}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as LogLevel | 'all')}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Server className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'errors' | 'logs')}>
            {/* Errors Tab */}
            <TabsContent value="errors" className="space-y-0">
              <Card className="overflow-hidden">
                <CardContent className="p-0 pr-0">
                  <div className="overflow-x-auto -mr-0">
                    <div className="relative max-h-[600px] overflow-y-auto">
                      <Table className="w-full">
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="hidden md:table-cell w-[160px]">Date/Time</TableHead>
                            <TableHead className="min-w-[180px]">Message</TableHead>
                            <TableHead className="hidden lg:table-cell w-[120px]">Source</TableHead>
                            <TableHead className="hidden sm:table-cell">Priority</TableHead>
                            <TableHead className="hidden xl:table-cell">Occurrences</TableHead>
                            <TableHead className="hidden lg:table-cell w-[100px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                      {filteredErrors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Bug className="h-12 w-12 text-muted-foreground opacity-50" />
                              <p className="text-muted-foreground">No errors found</p>
                              <p className="text-sm text-muted-foreground">
                                Adjust your filters to see more results
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredErrors.map((error) => (
                          <React.Fragment key={error.id}>
                            <TableRow>
                              <TableCell className="hidden md:table-cell w-[160px]">
                                <div className="flex flex-col">
                                  <span className="text-sm">
                                    {error.timestamp.toLocaleDateString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {error.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="min-w-0">
                                  <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium break-words">
                                      {error.message}
                                    </p>
                                    <button
                                      onClick={() => toggleErrorExpanded(error.id)}
                                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
                                    >
                                      {expandedErrors.has(error.id) ? (
                                        <>
                                          <ChevronUp className="h-3 w-3" />
                                          <span>Details</span>
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="h-3 w-3" />
                                          <span>Details</span>
                                        </>
                                      )}
                                    </button>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground lg:hidden">
                                      <span className="truncate">{error.id}</span>
                                      <span className="hidden sm:inline md:hidden">•</span>
                                      <span className="md:hidden">
                                        {error.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 lg:hidden">
                                      {error.source && (
                                        <Badge variant="outline" className="text-xs">{error.source}</Badge>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <Activity className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs">{error.count}</span>
                                      </div>
                                      {getErrorResolved(error) ? (
                                        <Badge variant="secondary" className="text-xs">Closed</Badge>
                                      ) : (
                                        <Badge variant="destructive" className="text-xs">Open</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell w-[120px]">
                                <div className="text-sm break-words leading-tight">
                                  {error.source}
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <span 
                                  className="text-red-600 dark:text-red-400 font-bold text-lg cursor-help"
                                  title={
                                    error.severity === 'critical' 
                                      ? 'High Priority' 
                                      : error.severity === 'error' 
                                      ? 'Medium Priority' 
                                      : 'Low Priority'
                                  }
                                >
                                  {error.severity === 'critical' ? '!!!' : error.severity === 'error' ? '!!' : '!'}
                                </span>
                              </TableCell>
                              <TableCell className="hidden xl:table-cell">
                                <div className="flex items-center gap-1">
                                  <Activity className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{error.count}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell w-[100px]">
                                <div className="w-full flex justify-center">
                                  {getErrorResolved(error) ? (
                                    <Badge 
                                      variant="secondary" 
                                      className="w-[80px] flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => toggleErrorStatus(error.id, getErrorResolved(error))}
                                    >
                                      Closed
                                    </Badge>
                                  ) : (
                                    <Badge 
                                      variant="destructive" 
                                      className="w-[80px] flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => toggleErrorStatus(error.id, getErrorResolved(error))}
                                    >
                                      Open
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                            {expandedErrors.has(error.id) && (
                              <TableRow>
                                <TableCell colSpan={6} className="bg-muted/50 p-3 sm:p-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Error Code</h4>
                                      <p className="text-sm text-muted-foreground font-mono">{error.id}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Occurrences</h4>
                                        <p className="text-sm text-muted-foreground">{error.count}</p>
                                      </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Status</h4>
                                      {getErrorResolved(error) ? (
                                        <Badge variant="secondary">Closed</Badge>
                                      ) : (
                                        <Badge variant="destructive">Open</Badge>
                                      )}
                                    </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {(error.userId || error.metadata?.userId || error.metadata?.orgId) && (
                                        <div>
                                          <h4 className="font-medium mb-2">User / Organization ID</h4>
                                          <p className="text-sm text-muted-foreground font-mono">
                                            {error.userId || error.metadata?.userId || error.metadata?.orgId}
                                          </p>
                                        </div>
                                      )}
                                      {(error.metadata?.requestPath || error.metadata?.endpoint) && (
                                        <div>
                                          <h4 className="font-medium mb-2">Request Path / Endpoint</h4>
                                          <p className="text-sm text-muted-foreground font-mono break-all">
                                            {error.metadata?.requestPath || error.metadata?.endpoint}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {(error.metadata?.duration || error.metadata?.responseTime) && (
                                        <div>
                                          <h4 className="font-medium mb-2">Duration / Response Time</h4>
                                          <p className="text-sm text-muted-foreground font-mono">
                                            {error.metadata?.duration || error.metadata?.responseTime}
                                          </p>
                                        </div>
                                      )}
                                      {error.metadata?.ip && (
                                        <div>
                                          <h4 className="font-medium mb-2">IP Address</h4>
                                          <p className="text-sm text-muted-foreground font-mono">{error.metadata.ip}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {error.metadata?.userAgent && (
                                        <div>
                                          <h4 className="font-medium mb-2">User Agent</h4>
                                          <p className="text-sm text-muted-foreground font-mono break-all">{error.metadata.userAgent}</p>
                                        </div>
                                      )}
                                      {error.metadata?.environment && (
                                        <div>
                                          <h4 className="font-medium mb-2">Environment</h4>
                                          <p className="text-sm text-muted-foreground font-mono">{error.metadata.environment}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Code className="h-4 w-4" />
                                        Stack Trace
                                      </h4>
                                      <div className="relative">
                                        <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-48 font-mono">
                                          {error.stackTrace}
                                        </pre>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute top-2 right-2"
                                          onClick={() => copyToClipboard(error.stackTrace || '')}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    {error.metadata && (
                                      <div>
                                        <h4 className="font-medium mb-2 flex items-center gap-2">
                                          <Activity className="h-4 w-4" />
                                          Metadata
                                        </h4>
                                        <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-32 font-mono">
                                          {JSON.stringify(error.metadata, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))
                      )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-0">
              <Card className="overflow-hidden">
                <CardContent className="p-0 pr-0">
                  <div className="overflow-x-auto -mr-0">
                    <div className="relative max-h-[600px] overflow-y-auto">
                      <Table className="w-full">
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="hidden md:table-cell w-[160px]">Date/Time</TableHead>
                            <TableHead className="min-w-[180px]">Message</TableHead>
                            <TableHead className="hidden sm:table-cell">Level</TableHead>
                            <TableHead className="hidden lg:table-cell w-[150px]">Service</TableHead>
                            <TableHead className="hidden xl:table-cell w-[120px]">Source</TableHead>
                            <TableHead className="hidden xl:table-cell">Occurrences</TableHead>
                            <TableHead className="hidden lg:table-cell w-[100px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                      {filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                              <p className="text-muted-foreground">No logs found</p>
                              <p className="text-sm text-muted-foreground">
                                Adjust your filters to see more results
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log) => (
                          <React.Fragment key={log.id}>
                            <TableRow>
                              <TableCell className="hidden md:table-cell w-[160px]">
                                <div className="flex flex-col">
                                  <span className="text-sm">
                                    {log.timestamp.toLocaleDateString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {log.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="min-w-0">
                                  <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium break-words">
                                      {log.message}
                                    </p>
                                    <button
                                      onClick={() => toggleLogExpanded(log.id)}
                                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
                                    >
                                      {expandedLogs.has(log.id) ? (
                                        <>
                                          <ChevronUp className="h-3 w-3" />
                                          <span>Details</span>
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="h-3 w-3" />
                                          <span>Details</span>
                                        </>
                                      )}
                                    </button>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground lg:hidden">
                                      <span className="md:hidden">
                                        {log.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 lg:hidden">
                                      {log.service && (
                                        <Badge variant="outline" className="text-xs">{log.service}</Badge>
                                      )}
                                      {log.source && (
                                        <Badge variant="outline" className="text-xs">{log.source}</Badge>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <Activity className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs">1</span>
                                      </div>
                                      {getLogResolved(log) ? (
                                        <Badge variant="secondary" className="text-xs">Closed</Badge>
                                      ) : (
                                        <Badge variant="destructive" className="text-xs">Open</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <span className={cn(
                                  "text-sm",
                                  log.level === 'error' && "text-red-600 dark:text-red-400",
                                  log.level === 'warn' && "text-yellow-600 dark:text-yellow-400",
                                  log.level === 'info' && "text-blue-600 dark:text-blue-400",
                                  log.level === 'debug' && "text-muted-foreground"
                                )}>
                                  {log.level.toUpperCase()}
                                </span>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell w-[150px]">
                                <div className="text-sm break-words leading-tight">
                                  {log.service}
                                </div>
                              </TableCell>
                              <TableCell className="hidden xl:table-cell w-[120px]">
                                <div className="text-sm break-words leading-tight">
                                  {log.source}
                                </div>
                              </TableCell>
                              <TableCell className="hidden xl:table-cell">
                                <div className="flex items-center gap-1">
                                  <Activity className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">1</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell w-[100px]">
                                <div className="w-full flex justify-center">
                                  {getLogResolved(log) ? (
                                    <Badge 
                                      variant="secondary" 
                                      className="w-[80px] flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => toggleLogStatus(log.id, getLogResolved(log))}
                                    >
                                      Closed
                                    </Badge>
                                  ) : (
                                    <Badge 
                                      variant="destructive" 
                                      className="w-[80px] flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => toggleLogStatus(log.id, getLogResolved(log))}
                                    >
                                      Open
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                            {expandedLogs.has(log.id) && (
                              <TableRow>
                                <TableCell colSpan={7} className="bg-muted/50 p-3 sm:p-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Log ID</h4>
                                      <p className="text-sm text-muted-foreground font-mono">{log.id}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Occurrences</h4>
                                      <p className="text-sm text-muted-foreground">1</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Status</h4>
                                      {getLogResolved(log) ? (
                                        <Badge variant="secondary">Closed</Badge>
                                      ) : (
                                        <Badge variant="destructive">Open</Badge>
                                      )}
                                    </div>
                                    {log.metadata && (
                                      <div>
                                        <h4 className="font-medium mb-2 flex items-center gap-2">
                                          <Activity className="h-4 w-4" />
                                          Metadata
                                        </h4>
                                        <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-32 font-mono">
                                          {JSON.stringify(log.metadata, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))
                      )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
