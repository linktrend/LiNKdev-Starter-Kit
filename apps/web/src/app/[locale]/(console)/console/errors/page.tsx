'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import { DateTimeCell, DetailsLink, ExpandedRowCell } from '@/components/ui/table-utils';
import { TableColgroup, TableHeadAction, TableCellAction } from '@/components/ui/table-columns';
import { TableHeadText, TableHeadStatus, TableCellText, TableCellStatus, ActionIconsCell } from '@/components/ui/table-cells';
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
  Shield,
  Globe,
  ChevronRight,
  ExternalLink,
  Copy,
  XCircle,
  AlertCircle,
  Info,
  Circle
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { AuditTable } from '@/components/audit/AuditTable';
import { mockAuditLogs } from '@/data/mock-audit-logs';
import { mockSystemLogs, SystemLog } from '@/data/mock-system-logs';

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
  const [activeTab, setActiveTab] = useState<'error-tracking' | 'application-logs' | 'audit-logs' | 'system-logs'>('error-tracking');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [severityFilter, setSeverityFilter] = useState<ErrorSeverity | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [expandedSystemLogs, setExpandedSystemLogs] = useState<Set<string>>(new Set());
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
    const timeRanges: Record<string, number> = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 7 * 24,
      '30d': 30 * 24,
      'all': Infinity,
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
    const timeRanges: Record<string, number> = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 7 * 24,
      '30d': 30 * 24,
      'all': Infinity,
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

  const toggleSystemLogExpanded = (logId: string) => {
    const newExpanded = new Set(expandedSystemLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedSystemLogs(newExpanded);
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
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="w-full sm:w-auto grid grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="error-tracking" className="flex-1">
                  <Bug className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Error Tracking</span>
                  <span className="sm:hidden">Errors</span>
                  <span className="hidden md:inline ml-1">({filteredErrors.length})</span>
                </TabsTrigger>
                <TabsTrigger value="application-logs" className="flex-1">
                  <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Application</span>
                  <span className="sm:hidden">App</span>
                  <span className="hidden md:inline ml-1">({filteredLogs.length})</span>
                </TabsTrigger>
                <TabsTrigger value="audit-logs" className="flex-1">
                  <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Audit</span>
                  <span className="sm:hidden">Audit</span>
                </TabsTrigger>
                <TabsTrigger value="system-logs" className="flex-1">
                  <Server className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">System</span>
                  <span className="sm:hidden">Sys</span>
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
            {activeTab === 'error-tracking' ? (
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
                <Server className="h-4 w-4 mr-2 text-primary" />
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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            {/* Error Tracking Tab */}
            <TabsContent value="error-tracking" className="space-y-0">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-rose-500" />
                    Error Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <TableContainer
                    id="errors-error-tracking-table"
                    height="lg"
                    className="-mr-0"
                  >
                    <Table className="min-w-[960px]">
                      <TableHeader>
                        <TableRow>
                          <TableHeadText className="hidden md:table-cell min-w-[160px] max-w-[200px]">
                            Date/Time
                          </TableHeadText>
                          <TableHeadText className="min-w-[280px] max-w-[420px]">
                            Message
                          </TableHeadText>
                          <TableHeadText className="hidden lg:table-cell min-w-[200px] max-w-[260px]">
                            Source
                          </TableHeadText>
                          <TableHeadStatus className="hidden sm:table-cell min-w-[120px] max-w-[140px]">
                            Priority
                          </TableHeadStatus>
                          <TableHeadText className="hidden xl:table-cell min-w-[120px] max-w-[140px]">
                            Occurrences
                          </TableHeadText>
                          <TableHeadStatus className="hidden lg:table-cell min-w-[140px] max-w-[160px]">
                            Status
                          </TableHeadStatus>
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
                              <TableCellText className="hidden md:table-cell min-w-[160px] max-w-[200px]">
                                <div className="flex flex-col">
                                  <span className="text-sm">
                                    {error.timestamp.toLocaleDateString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {error.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                              </TableCellText>
                              <TableCellText className="min-w-[280px] max-w-[420px]">
                                <div className="min-w-0">
                                  <div className="flex flex-col gap-2 md:whitespace-normal whitespace-nowrap md:pr-2">
                                    <p className="text-sm font-medium break-words">
                                      {error.message}
                                    </p>
                                    <DetailsLink
                                      isExpanded={expandedErrors.has(error.id)}
                                      onToggle={() => toggleErrorExpanded(error.id)}
                                      label="Details"
                                    />
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground lg:hidden">
                                      <span className="truncate">{error.id}</span>
                                      <span className="hidden sm:inline md:hidden">•</span>
                                      <span className="md:hidden">
                                        {error.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 lg:hidden">
                                      {error.source && (
                                        <Badge className={getBadgeClasses('outline')}>{error.source}</Badge>
                                      )}
                                      <span className="text-xs">{error.count}</span>
                                      {getErrorResolved(error) ? (
                                        <Badge className={getBadgeClasses('danger.soft')}>Closed</Badge>
                                      ) : (
                                        <Badge className={getBadgeClasses('success.soft')}>Open</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCellText>
                              <TableCellText className="hidden lg:table-cell min-w-[200px] max-w-[260px]">
                                <div className="text-sm break-words leading-tight md:whitespace-normal whitespace-nowrap">
                                  {error.source}
                                </div>
                              </TableCellText>
                              <TableCellStatus className="hidden sm:table-cell min-w-[120px] max-w-[140px]">
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
                              </TableCellStatus>
                              <TableCellText className="hidden xl:table-cell min-w-[120px] max-w-[140px]">
                                <span className="text-sm">{error.count}</span>
                              </TableCellText>
                              <TableCellStatus className="hidden lg:table-cell min-w-[140px] max-w-[160px]">
                                {getErrorResolved(error) ? (
                                  <Badge 
                                    className={cn(getBadgeClasses('danger.soft'), 'w-16 flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity')}
                                    onClick={() => toggleErrorStatus(error.id, getErrorResolved(error))}
                                  >
                                    Closed
                                  </Badge>
                                ) : (
                                  <Badge 
                                    className={cn(getBadgeClasses('success.soft'), 'w-16 flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity')}
                                    onClick={() => toggleErrorStatus(error.id, getErrorResolved(error))}
                                  >
                                    Open
                                  </Badge>
                                )}
                              </TableCellStatus>
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
                                        <Badge className={getBadgeClasses('danger.soft')}>Closed</Badge>
                                      ) : (
                                        <Badge className={getBadgeClasses('success.soft')}>Open</Badge>
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
                  </TableContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Application Logs Tab */}
            <TabsContent value="application-logs" className="space-y-0">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Application Logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <TableContainer
                    id="errors-application-logs-table"
                    height="lg"
                    className="-mr-0"
                  >
                    <Table className="min-w-[960px]">
                      <TableHeader>
                        <TableRow>
                          <TableHeadText className="hidden md:table-cell min-w-[160px] max-w-[200px]">
                            Date/Time
                          </TableHeadText>
                          <TableHeadText className="min-w-[280px] max-w-[420px]">
                            Message
                          </TableHeadText>
                          <TableHeadText className="hidden sm:table-cell min-w-[120px] max-w-[140px]">
                            Level
                          </TableHeadText>
                          <TableHeadText className="hidden lg:table-cell min-w-[200px] max-w-[240px]">
                            Service
                          </TableHeadText>
                          <TableHeadText className="hidden xl:table-cell min-w-[200px] max-w-[240px]">
                            Source
                          </TableHeadText>
                          <TableHeadText className="hidden xl:table-cell min-w-[120px] max-w-[140px]">
                            Occurrences
                          </TableHeadText>
                          <TableHeadStatus className="hidden lg:table-cell min-w-[140px] max-w-[160px]">
                            Status
                          </TableHeadStatus>
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
                              <TableCellText className="hidden md:table-cell min-w-[160px] max-w-[200px]">
                                <DateTimeCell date={log.timestamp} />
                              </TableCellText>
                              <TableCellText className="min-w-[280px] max-w-[420px]">
                                <div className="min-w-0">
                                  <div className="flex flex-col gap-2 md:whitespace-normal whitespace-nowrap md:pr-2">
                                    <p className="text-sm font-medium break-words">
                                      {log.message}
                                    </p>
                                    <DetailsLink
                                      isExpanded={expandedLogs.has(log.id)}
                                      onToggle={() => toggleLogExpanded(log.id)}
                                      label="Details"
                                    />
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground lg:hidden">
                                      <span className="md:hidden">
                                        {log.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 lg:hidden">
                                      {log.service && (
                                        <Badge className={getBadgeClasses('service')}>{log.service}</Badge>
                                      )}
                                      {log.source && (
                                        <Badge className={getBadgeClasses('source')}>{log.source}</Badge>
                                      )}
                                      <span className="text-xs">1</span>
                                      {getLogResolved(log) ? (
                                        <Badge className={getBadgeClasses('danger.soft')}>Closed</Badge>
                                      ) : (
                                        <Badge className={getBadgeClasses('success.soft')}>Open</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCellText>
                              <TableCellText className="hidden sm:table-cell min-w-[120px] max-w-[140px]">
                                <span className="text-sm capitalize md:whitespace-normal whitespace-nowrap">
                                  {log.level}
                                </span>
                              </TableCellText>
                              <TableCellText className="hidden lg:table-cell min-w-[200px] max-w-[240px]">
                                <div className="text-sm break-words leading-tight md:whitespace-normal whitespace-nowrap">
                                  {log.service}
                                </div>
                              </TableCellText>
                              <TableCellText className="hidden xl:table-cell min-w-[200px] max-w-[240px]">
                                <div className="text-sm break-words leading-tight md:whitespace-normal whitespace-nowrap">
                                  {log.source}
                                </div>
                              </TableCellText>
                              <TableCellText className="hidden xl:table-cell min-w-[120px] max-w-[140px]">
                                <span className="text-sm">1</span>
                              </TableCellText>
                              <TableCellStatus className="hidden lg:table-cell min-w-[140px] max-w-[160px]">
                                {getLogResolved(log) ? (
                                  <Badge 
                                    className={cn(getBadgeClasses('danger.soft'), 'w-16 flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity')}
                                    onClick={() => toggleLogStatus(log.id, getLogResolved(log))}
                                  >
                                    Closed
                                  </Badge>
                                ) : (
                                  <Badge 
                                    className={cn(getBadgeClasses('success.soft'), 'w-16 flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity')}
                                    onClick={() => toggleLogStatus(log.id, getLogResolved(log))}
                                  >
                                    Open
                                  </Badge>
                                )}
                              </TableCellStatus>
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
                                        <Badge className={getBadgeClasses('danger.soft')}>Closed</Badge>
                                      ) : (
                                        <Badge className={getBadgeClasses('success.soft')}>Open</Badge>
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
                  </TableContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="audit-logs" className="space-y-0">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Audit Logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <AuditTable logs={mockAuditLogs} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Logs Tab */}
            <TabsContent value="system-logs" className="space-y-0">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-emerald-500" />
                    System Logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
          <TableContainer id="errors-system-logs-table" height="lg">
                    <Table className="min-w-[760px]">
                      <TableHeader>
                        <TableRow>
                          <TableHeadText className="hidden md:table-cell min-w-[160px] max-w-[200px]">
                            Timestamp
                          </TableHeadText>
                          <TableHeadText className="min-w-[200px] max-w-[260px]">
                            Source
                          </TableHeadText>
                          <TableHeadText className="min-w-[280px] max-w-[420px]">
                            Message
                          </TableHeadText>
                          <TableHeadStatus className="min-w-[140px] max-w-[160px]">
                            Level
                          </TableHeadStatus>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockSystemLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-12">
                              <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                              <p className="text-muted-foreground">No system logs available</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          mockSystemLogs.map((log) => (
                            <React.Fragment key={log.id}>
                              <TableRow>
                              <TableCellText className="hidden md:table-cell min-w-[160px] max-w-[200px]">
                                  <DateTimeCell date={new Date(log.timestamp)} />
                                </TableCellText>
                                <TableCellText className="min-w-[200px] max-w-[260px]">
                                  <div className="flex flex-col gap-2 md:whitespace-normal whitespace-nowrap md:pr-2">
                                    <span className="text-sm capitalize">{log.source.replace('-', ' ')}</span>
                                    <DetailsLink
                                      isExpanded={expandedSystemLogs.has(log.id)}
                                      onToggle={() => toggleSystemLogExpanded(log.id)}
                                      label="Details"
                                    />
                                  </div>
                                </TableCellText>
                                <TableCellText className="min-w-[280px] max-w-[420px]">
                                  <p className="text-sm font-medium break-words md:whitespace-normal whitespace-nowrap">
                                    {log.message}
                                  </p>
                                </TableCellText>
                                <TableCellStatus className="min-w-[140px] max-w-[160px]">
                                  <span className="text-sm capitalize text-muted-foreground">
                                    {log.level}
                                  </span>
                                </TableCellStatus>
                              </TableRow>
                              {expandedSystemLogs.has(log.id) && log.metadata && (
                                <TableRow>
                                  <ExpandedRowCell colSpan={4}>
                                    <div className="p-4 space-y-3">
                                      {(log.metadata?.duration_ms || log.metadata?.status_code) && (
                                        <div>
                                          <h4 className="font-medium mb-2 text-sm">Performance</h4>
                                          <div className="flex items-center gap-3">
                                            {log.metadata?.duration_ms && (
                                              <div>
                                                <span className="text-xs text-muted-foreground">Duration: </span>
                                                <span className="text-sm font-medium">{log.metadata.duration_ms}ms</span>
                                              </div>
                                            )}
                                            {log.metadata?.status_code && (
                                              <div>
                                                <span className="text-xs text-muted-foreground">Status: </span>
                                                <Badge variant="outline" className="ml-1">
                                                  {log.metadata.status_code}
                                                </Badge>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      <div>
                                        <h4 className="font-medium mb-2 text-sm">Metadata</h4>
                                        <pre className="text-xs bg-background p-2 rounded border overflow-auto font-mono">
                                          {JSON.stringify(log.metadata, null, 2)}
                                        </pre>
                                      </div>
                                    </div>
                                  </ExpandedRowCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
