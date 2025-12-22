'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  FileText,
  Download,
  FileSpreadsheet,
  File,
  Calendar as CalendarIcon,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  DownloadCloud,
  BarChart3,
  Users,
  DollarSign,
  Activity,
  Shield,
  Database,
  Mail,
  Settings,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  PieChart,
  LineChart
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { DateTimeCell } from '@/components/ui/table-utils';

type ReportType = 
  | 'audit' 
  | 'analytics' 
  | 'users' 
  | 'billing' 
  | 'activity' 
  | 'security' 
  | 'database' 
  | 'email' 
  | 'custom';
type ExportFormat = 'csv' | 'excel' | 'pdf';
type ReportStatus = 'draft' | 'generating' | 'completed' | 'failed';

interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  icon: any;
  category: string;
}

interface GeneratedReport {
  id: string;
  name: string;
  type: ReportType;
  format: ExportFormat;
  status: ReportStatus;
  createdAt: Date;
  completedAt?: Date;
  size?: string;
  recordCount?: number;
  downloadUrl?: string;
}

interface ReportFilter {
  dateRange: {
    from?: Date;
    to?: Date;
  };
  orgId?: string;
  userId?: string;
  status?: string;
  customFilters?: Record<string, any>;
}

// Mock data
const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Audit Log Report',
    type: 'audit',
    description: 'Comprehensive audit trail of all system actions and changes',
    icon: Shield,
    category: 'Security & Compliance'
  },
  {
    id: '2',
    name: 'User Analytics Report',
    type: 'analytics',
    description: 'User engagement metrics, activity patterns, and growth statistics',
    icon: BarChart3,
    category: 'Analytics'
  },
  {
    id: '3',
    name: 'User Directory',
    type: 'users',
    description: 'Complete list of users with roles, permissions, and activity status',
    icon: Users,
    category: 'User Management'
  },
  {
    id: '4',
    name: 'Billing & Revenue Report',
    type: 'billing',
    description: 'Financial data, transactions, subscriptions, and revenue analytics',
    icon: DollarSign,
    category: 'Finance'
  },
  {
    id: '5',
    name: 'Activity Log Report',
    type: 'activity',
    description: 'Detailed activity logs across all system modules',
    icon: Activity,
    category: 'Operations'
  },
  {
    id: '6',
    name: 'Security Events Report',
    type: 'security',
    description: 'Security incidents, login attempts, and access control events',
    icon: Shield,
    category: 'Security & Compliance'
  },
  {
    id: '7',
    name: 'Database Performance Report',
    type: 'database',
    description: 'Database queries, performance metrics, and optimization insights',
    icon: Database,
    category: 'Performance'
  },
  {
    id: '8',
    name: 'Email Campaign Report',
    type: 'email',
    description: 'Email delivery statistics, open rates, and engagement metrics',
    icon: Mail,
    category: 'Communications'
  },
];

const mockGeneratedReports: GeneratedReport[] = [
  {
    id: 'rpt-1',
    name: 'Audit Log Report - Jan 2025',
    type: 'audit',
    format: 'pdf',
    status: 'completed',
    createdAt: new Date('2025-01-25T10:00:00Z'),
    completedAt: new Date('2025-01-25T10:02:30Z'),
    size: '2.4 MB',
    recordCount: 15432,
    downloadUrl: '#'
  },
  {
    id: 'rpt-2',
    name: 'User Analytics - Q4 2024',
    type: 'analytics',
    format: 'excel',
    status: 'completed',
    createdAt: new Date('2025-01-20T14:30:00Z'),
    completedAt: new Date('2025-01-20T14:35:15Z'),
    size: '8.7 MB',
    recordCount: 45234,
    downloadUrl: '#'
  },
  {
    id: 'rpt-3',
    name: 'Billing Report - December 2024',
    type: 'billing',
    format: 'csv',
    status: 'completed',
    createdAt: new Date('2025-01-15T09:15:00Z'),
    completedAt: new Date('2025-01-15T09:16:45Z'),
    size: '456 KB',
    recordCount: 1234,
    downloadUrl: '#'
  },
  {
    id: 'rpt-4',
    name: 'Security Events - Weekly',
    type: 'security',
    format: 'pdf',
    status: 'generating',
    createdAt: new Date('2025-01-27T08:00:00Z'),
    size: undefined,
    recordCount: undefined,
    downloadUrl: undefined
  },
  {
    id: 'rpt-5',
    name: 'User Directory Export',
    type: 'users',
    format: 'csv',
    status: 'completed',
    createdAt: new Date('2025-01-26T16:45:00Z'),
    completedAt: new Date('2025-01-26T16:46:20Z'),
    size: '1.2 MB',
    recordCount: 2345,
    downloadUrl: '#'
  },
];

export default function ConsoleReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'exports'>('overview');
  const [exportsSubTab, setExportsSubTab] = useState<'templates' | 'generated' | 'scheduled'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [reportFilters, setReportFilters] = useState<ReportFilter>({
    dateRange: {},
    customFilters: {}
  });
  const [reportName, setReportName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Analytics: time range and filters
  const timeRanges = [7, 30, 90, 180, 365] as const;
  type TimeRange = typeof timeRanges[number];
  const [analyticsRange, setAnalyticsRange] = useState<TimeRange>(90);
  const [analyticsPlan, setAnalyticsPlan] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
  const [analyticsSegment, setAnalyticsSegment] = useState<'all' | 'sm' | 'mid' | 'enterprise'>('all');

  // Analytics mock data generation
  type SeriesPoint = { date: string; value: number };
  const generateSeries = useCallback((days: number, base: number, variance: number, trend: number = 0): SeriesPoint[] => {
    const today = new Date();
    const series: SeriesPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const noise = (Math.random() - 0.5) * variance * 2;
      const val = Math.max(0, Math.round(base + noise + trend * (days - i)));
      series.push({ date: d.toISOString().slice(0, 10), value: val });
    }
    return series;
  }, []);

  const analyticsData = useMemo(() => {
    const days = analyticsRange;
    // Product usage
    const dau = generateSeries(days, 220, 40, 0.1);
    const wau = generateSeries(days, 900, 120, 0.5);
    const mau = generateSeries(days, 3200, 300, 1);
    const activeOrgs = generateSeries(days, 75, 10, 0.1);
    const sessions = generateSeries(days, 1800, 250, 2);

    // Growth & retention
    const signups = generateSeries(days, 35, 8, 0.1);
    const churnRate = generateSeries(days, 4, 1, 0); // percent basis points
    const retention = generateSeries(days, 62, 5, 0.05);

    // Feature usage
    const featureAdoption = generateSeries(days, 45, 10, 0.2);

    // Funnels (mock steps counts)
    const funnel = {
      signup: Math.max(1000, 1200 + Math.round((Math.random() - 0.5) * 200)),
      activation: Math.max(600, 700 + Math.round((Math.random() - 0.5) * 140)),
      paid: Math.max(200, 260 + Math.round((Math.random() - 0.5) * 60))
    };

    // Performance
    const latencyP95 = generateSeries(days, 420, 60, -0.2);
    const errorRate = generateSeries(days, 1.2, 0.5, 0);
    const apiVolume = generateSeries(days, 5200, 800, 3);

    // Revenue
    const mrr = generateSeries(days, 18000, 1200, 30);
    const planMix = [
      { plan: 'Free', pct: 54 },
      { plan: 'Pro', pct: 34 },
      { plan: 'Enterprise', pct: 12 },
    ];

    return { dau, wau, mau, activeOrgs, sessions, signups, churnRate, retention, featureAdoption, funnel, latencyP95, errorRate, apiVolume, mrr, planMix };
  }, [analyticsRange, generateSeries]);

  function sumSeries(series: SeriesPoint[]) {
    return series.reduce((s, p) => s + p.value, 0);
  }

  function latest(series: SeriesPoint[]) {
    return series[series.length - 1]?.value ?? 0;
  }

  function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => String(r[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = reportTemplates;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [typeFilter, searchQuery]);

  // Filter generated reports
  const filteredReports = useMemo(() => {
    let filtered = mockGeneratedReports;

    // Ensure only completed reports show in the table so Size is always present
    filtered = filtered.filter(r => r.status === 'completed');

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [statusFilter, searchQuery]);

  const handleGenerateReport = () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setShowGenerateDialog(false);
      setSelectedTemplate(null);
      // In real implementation, this would trigger actual report generation
    }, 2000);
  };

  const getReportTypeIcon = (type: ReportType) => {
    const template = reportTemplates.find(t => t.type === type);
    return template?.icon || FileText;
  };

  const getStatusBadge = (status: ReportStatus) => {
    const variants: Record<ReportStatus, { variant: any; className: string; icon: any }> = {
      draft: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: FileText },
      generating: { variant: 'secondary', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: RefreshCw },
      completed: { variant: 'outline', className: 'border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/30', icon: CheckCircle2 },
      failed: { variant: 'destructive', className: '', icon: AlertCircle },
    };

    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={cn(config.className, 'flex items-center gap-1 font-normal')}>
        {status === 'generating' && <Icon className="h-3 w-3 animate-spin" />}
        {status !== 'generating' && <Icon className="h-3 w-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf':
        return <File className="h-4 w-4" />;
    }
  };

  const getFormatName = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return 'CSV';
      case 'excel':
        return 'Excel';
      case 'pdf':
        return 'PDF';
    }
  };

  const groupedTemplates = useMemo(() => {
    const groups: Record<string, ReportTemplate[]> = {};
    filteredTemplates.forEach(template => {
      if (!groups[template.category]) {
        groups[template.category] = [];
      }
      groups[template.category].push(template);
    });
    return groups;
  }, [filteredTemplates]);

  // Calculate stats for Overview
  const reportStats = useMemo(() => {
    const totalGenerated = mockGeneratedReports.length;
    const completed = mockGeneratedReports.filter(r => r.status === 'completed').length;
    const generating = mockGeneratedReports.filter(r => r.status === 'generating').length;
    const totalSize = mockGeneratedReports.reduce((sum, r) => {
      if (r.size) {
        const size = parseFloat(r.size.replace(' MB', '').replace(' KB', ''));
        return sum + (r.size.includes('MB') ? size : size / 1000);
      }
      return sum;
    }, 0);
    
    return { totalGenerated, completed, generating, totalSize };
  }, []);

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

      

      {/* Main Content Tabs */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="overview" className="flex-1 sm:flex-initial">
                  <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex-1 sm:flex-initial">
                  <TrendingUp className="h-4 w-4 mr-1 sm:mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="exports" className="flex-1 sm:flex-initial">
                  <DownloadCloud className="h-4 w-4 mr-1 sm:mr-2" />
                  Exports
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Overview Stats Cards - moved under tabs header */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportStats.totalGenerated}</div>
                  <p className="text-xs text-muted-foreground mt-1">Generated reports</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{reportStats.completed}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready for download</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <CardTitle className="text-sm font-medium">Generating</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{reportStats.generating}</div>
                  <p className="text-xs text-muted-foreground mt-1">In progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !flex-row">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary flex-shrink-0" />
                    <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportStats.totalSize.toFixed(1)} MB</div>
                  <p className="text-xs text-muted-foreground mt-1">Data exported</p>
                </CardContent>
              </Card>
            </div>
          )}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-0">
              <div className="space-y-6">
                {/* Key Metrics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Report Generation Trends</CardTitle>
                      <CardDescription>Reports created over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Today</span>
                          <span className="text-sm font-medium">2 reports</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '15%' }} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Last 7 days: 8 reports</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            +12%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Report Types Distribution</CardTitle>
                      <CardDescription>Breakdown by report category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { type: 'Audit', count: 5, color: 'bg-blue-500' },
                          { type: 'Analytics', count: 3, color: 'bg-purple-500' },
                          { type: 'Billing', count: 2, color: 'bg-green-500' },
                          { type: 'Users', count: 1, color: 'bg-orange-500' },
                        ].map((item) => (
                          <div key={item.type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${item.color}`} />
                              <span className="text-sm">{item.type}</span>
                            </div>
                            <span className="text-sm font-medium">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Reports */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Reports</CardTitle>
                    <CardDescription>Latest generated reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockGeneratedReports.slice(0, 5).map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getFormatIcon(report.format)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{report.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(report.createdAt, 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                            {getStatusBadge(report.status)}
                            {report.status === 'completed' && (
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                    <CardDescription>Common report generation tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: 'Audit Log Report', icon: Shield, type: 'audit' },
                        { name: 'User Analytics Report', icon: BarChart3, type: 'analytics' },
                        { name: 'Billing Report', icon: DollarSign, type: 'billing' },
                      ].map((template) => {
                        const Icon = template.icon;
                        const templateData = reportTemplates.find(t => t.type === template.type);
                          const colorClass =
                            template.type === 'audit'
                              ? 'text-blue-600'
                              : template.type === 'analytics'
                              ? 'text-purple-600'
                              : template.type === 'billing'
                              ? 'text-green-600'
                              : 'text-primary';
                        return (
                          <Button
                            key={template.type}
                            variant="outline"
                            className="h-auto flex-col items-start p-4 gap-2"
                            onClick={() => {
                              if (templateData) {
                                setSelectedTemplate(templateData);
                                setReportName(`${templateData.name} - ${format(new Date(), 'MMM dd, yyyy')}`);
                                setShowGenerateDialog(true);
                              }
                            }}
                            >
                            <Icon className={`h-5 w-5 ${colorClass}`} />
                            <span className="text-sm font-medium">{template.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4 mt-0">
              <div className="space-y-6">
                {/* Controls for analytics */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={String(analyticsRange)} onValueChange={(v) => setAnalyticsRange(Number(v) as TimeRange)}>
                      <SelectTrigger className="w-full sm:w-36">
                        <SelectValue placeholder="Range" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeRanges.map((d) => (
                          <SelectItem key={d} value={String(d)}>{d}d</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={analyticsPlan} onValueChange={(v) => setAnalyticsPlan(v as typeof analyticsPlan)}>
                      <SelectTrigger className="w-full sm:w-36">
                        <SelectValue placeholder="Plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All plans</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={analyticsSegment} onValueChange={(v) => setAnalyticsSegment(v as typeof analyticsSegment)}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All orgs</SelectItem>
                        <SelectItem value="sm">SMB</SelectItem>
                        <SelectItem value="mid">Mid-market</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 1) Product Usage */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Product Usage</CardTitle>
                        <CardDescription>DAU/WAU/MAU, active orgs, sessions</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => downloadCsv('product-usage.csv', analyticsData.dau.map((p, i) => ({ date: p.date, dau: p.value, wau: analyticsData.wau[i]?.value ?? 0, mau: analyticsData.mau[i]?.value ?? 0, activeOrgs: analyticsData.activeOrgs[i]?.value ?? 0, sessions: analyticsData.sessions[i]?.value ?? 0 })))}>
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">DAU</div>
                        <div className="text-xl font-semibold">{latest(analyticsData.dau)}</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">WAU</div>
                        <div className="text-xl font-semibold">{latest(analyticsData.wau)}</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">MAU</div>
                        <div className="text-xl font-semibold">{latest(analyticsData.mau)}</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Active Orgs</div>
                        <div className="text-xl font-semibold">{latest(analyticsData.activeOrgs)}</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Sessions</div>
                        <div className="text-xl font-semibold">{sumSeries(analyticsData.sessions)}</div>
                      </div>
                    </div>
                    <div className="h-40 rounded-lg border bg-muted/30 overflow-hidden">
                      <div className="h-full w-full grid grid-cols-12 gap-1 p-2">
                        {analyticsData.dau.slice(-12).map((p, idx) => (
                          <div key={p.date} className="flex flex-col justify-end">
                            <div className="bg-primary/60" style={{ height: `${Math.min(100, (p.value / (Math.max(...analyticsData.dau.map(s=>s.value))||1)) * 100)}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <TableContainer id="reports-org-usage-table" height="md">
                      <Table className="min-w-[640px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[240px] max-w-[280px]">Org</TableHead>
                            <TableHead className="min-w-[180px] max-w-[200px]">Active Users</TableHead>
                            <TableHead className="min-w-[180px] max-w-[200px]">Sessions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { org: 'Acme Inc', users: 124, sessions: 980 },
                            { org: 'Globex', users: 88, sessions: 720 },
                            { org: 'Initech', users: 76, sessions: 610 },
                          ].map((r) => (
                            <TableRow key={r.org} className="hover:bg-accent">
                              <TableCell className="font-medium text-sm md:whitespace-normal whitespace-nowrap">{r.org}</TableCell>
                              <TableCell className="text-sm">{r.users}</TableCell>
                              <TableCell className="text-sm">{r.sessions}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* 2) Growth & Retention */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Growth & Retention</CardTitle>
                        <CardDescription>Signups, churn, cohorts</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => downloadCsv('growth-retention.csv', analyticsData.signups.map((p, i) => ({ date: p.date, signups: p.value, churnRate: analyticsData.churnRate[i]?.value ?? 0, retention: analyticsData.retention[i]?.value ?? 0 })))}>
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">New Signups</div>
                        <div className="text-xl font-semibold">{sumSeries(analyticsData.signups)}</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Churn Rate</div>
                        <div className="text-xl font-semibold">{latest(analyticsData.churnRate)}%</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Retention</div>
                        <div className="text-xl font-semibold">{latest(analyticsData.retention)}%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-40 rounded-lg border bg-muted/30 p-2">
                        <div className="text-xs mb-2 text-muted-foreground">Signups trend</div>
                        <div className="h-[120px] grid grid-cols-12 gap-1">
                          {analyticsData.signups.slice(-12).map((p) => (
                            <div key={p.date} className="bg-primary/60" style={{ height: `${Math.min(100, (p.value / (Math.max(...analyticsData.signups.map(s=>s.value))||1)) * 100)}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="h-40 rounded-lg border bg-muted/30 p-2">
                        <div className="text-xs mb-2 text-muted-foreground">Churn trend</div>
                        <div className="h-[120px] grid grid-cols-12 gap-1">
                          {analyticsData.churnRate.slice(-12).map((p) => (
                            <div key={p.date} className="bg-red-500/70" style={{ height: `${Math.min(100, (p.value / (Math.max(...analyticsData.churnRate.map(s=>s.value))||1)) * 100)}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <TableContainer id="reports-cohort-retention-table" height="md">
                      <Table className="min-w-[680px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px] max-w-[240px]">Cohort</TableHead>
                            <TableHead className="min-w-[120px] max-w-[140px]">W1</TableHead>
                            <TableHead className="min-w-[120px] max-w-[140px]">W2</TableHead>
                            <TableHead className="min-w-[120px] max-w-[140px]">W3</TableHead>
                            <TableHead className="min-w-[120px] max-w-[140px]">W4</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {['2025-09', '2025-10', '2025-11'].map((cohort) => (
                            <TableRow key={cohort} className="hover:bg-accent">
                              <TableCell className="font-medium text-sm md:whitespace-normal whitespace-nowrap">{cohort}</TableCell>
                              {[0,1,2,3].map((w) => (
                                <TableCell key={w}>
                                  <Badge variant="secondary">{60 - w*5 + Math.round(Math.random()*5)}%</Badge>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* 3) Feature Usage */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Feature Usage</CardTitle>
                        <CardDescription>Adoption and flag impact</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => downloadCsv('feature-usage.csv', [{ feature: 'Projects', adoption: 68, dailyActive: 340, flagImpact: '+5%' }, { feature: 'Integrations', adoption: 52, dailyActive: 220, flagImpact: '+2%' }, { feature: 'Automation', adoption: 34, dailyActive: 150, flagImpact: '+9%' }])}>
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Features/org (avg)</div>
                        <div className="text-xl font-semibold">7.2</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Top feature</div>
                        <div className="text-xl font-semibold">Projects</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Adoption trend</div>
                        <div className="text-xl font-semibold">+{latest(analyticsData.featureAdoption)}%</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Flag impact</div>
                        <div className="text-xl font-semibold">+5%</div>
                      </div>
                    </div>
                    <div className="h-40 rounded-lg border bg-muted/30 p-2">
                      <div className="text-xs mb-2 text-muted-foreground">Feature adoption</div>
                      <div className="h-[120px] grid grid-cols-12 gap-1">
                        {analyticsData.featureAdoption.slice(-12).map((p, i) => (
                          <div key={i} className="bg-primary/60" style={{ height: `${Math.min(100, (p.value / (Math.max(...analyticsData.featureAdoption.map(s=>s.value))||1)) * 100)}%` }} />
                        ))}
                      </div>
                    </div>
                    <TableContainer id="reports-feature-usage-table" height="md">
                      <Table className="min-w-[680px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[220px] max-w-[280px]">Feature</TableHead>
                            <TableHead className="min-w-[160px] max-w-[200px]">Adoption</TableHead>
                            <TableHead className="min-w-[160px] max-w-[200px]">Daily Active</TableHead>
                            <TableHead className="min-w-[200px] max-w-[240px]">Flag Impact</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { feature: 'Projects', adoption: '68%', daily: 340, impact: '+5% (flag on)' },
                            { feature: 'Integrations', adoption: '52%', daily: 220, impact: '+2% (flag on)' },
                            { feature: 'Automation', adoption: '34%', daily: 150, impact: '+9% (flag flip 10/10)' },
                          ].map((r) => (
                            <TableRow key={r.feature} className="hover:bg-accent">
                              <TableCell className="font-medium text-sm md:whitespace-normal whitespace-nowrap">{r.feature}</TableCell>
                              <TableCell className="text-sm">{r.adoption}</TableCell>
                              <TableCell className="text-sm">{r.daily}</TableCell>
                              <TableCell className="text-sm">{r.impact}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* 4) Funnels */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Funnels</CardTitle>
                        <CardDescription>Signup → Activation → Conversion</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => downloadCsv('funnels.csv', [{ step: 'Signup', count: analyticsData.funnel.signup }, { step: 'Activation', count: analyticsData.funnel.activation }, { step: 'Paid', count: analyticsData.funnel.paid }])}>
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Signup → Activation</div>
                        <div className="text-xl font-semibold">{Math.round((analyticsData.funnel.activation / analyticsData.funnel.signup) * 100)}%</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Activation → Paid</div>
                        <div className="text-xl font-semibold">{Math.round((analyticsData.funnel.paid / analyticsData.funnel.activation) * 100)}%</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Overall</div>
                        <div className="text-xl font-semibold">{Math.round((analyticsData.funnel.paid / analyticsData.funnel.signup) * 100)}%</div>
                      </div>
                    </div>
                    <div className="h-40 rounded-lg border bg-muted/30 p-4 flex items-end gap-4">
                      {[
                        { label: 'Signup', value: analyticsData.funnel.signup, color: 'bg-primary/70' },
                        { label: 'Activation', value: analyticsData.funnel.activation, color: 'bg-primary/60' },
                        { label: 'Paid', value: analyticsData.funnel.paid, color: 'bg-primary/50' },
                      ].map((s) => (
                        <div key={s.label} className="flex-1 flex flex-col items-center gap-2">
                          <div className={`w-8 ${s.color}`} style={{ height: `${(s.value / Math.max(analyticsData.funnel.signup, 1)) * 100}%` }} />
                          <div className="text-xs text-muted-foreground">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <TableContainer id="reports-funnel-table" height="md">
                      <Table className="min-w-[640px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[220px] max-w-[260px]">Plan</TableHead>
                            <TableHead className="min-w-[160px] max-w-[180px]">Signup</TableHead>
                            <TableHead className="min-w-[160px] max-w-[180px]">Activation</TableHead>
                            <TableHead className="min-w-[160px] max-w-[180px]">Paid</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { plan: 'Free', s: 900, a: 500, p: 120 },
                            { plan: 'Pro', s: 250, a: 180, p: 110 },
                            { plan: 'Enterprise', s: 80, a: 60, p: 30 },
                          ].map((r) => (
                            <TableRow key={r.plan} className="hover:bg-accent">
                              <TableCell className="font-medium text-sm md:whitespace-normal whitespace-nowrap">{r.plan}</TableCell>
                              <TableCell className="text-sm">{r.s}</TableCell>
                              <TableCell className="text-sm">{r.a}</TableCell>
                              <TableCell className="text-sm">{r.p}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* 5) Performance */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Performance (High-level)</CardTitle>
                        <CardDescription>Latency, error rates, API volume</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => downloadCsv('performance.csv', analyticsData.latencyP95.map((p, i) => ({ date: p.date, p95: p.value, errorPct: analyticsData.errorRate[i]?.value ?? 0, api: analyticsData.apiVolume[i]?.value ?? 0 })))}>
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">P95 Latency</div>
                        <div className="text-xl font-semibold">{latest(analyticsData.latencyP95)} ms</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Error Rate</div>
                        <div className="text-xl font-semibold">{latest(analyticsData.errorRate)}%</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">API Volume</div>
                        <div className="text-xl font-semibold">{sumSeries(analyticsData.apiVolume)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-40 rounded-lg border bg-muted/30 p-2">
                        <div className="text-xs mb-2 text-muted-foreground">Latency trend</div>
                        <div className="h-[120px] grid grid-cols-12 gap-1">
                          {analyticsData.latencyP95.slice(-12).map((p) => (
                            <div key={p.date} className="bg-primary/60" style={{ height: `${Math.min(100, (p.value / (Math.max(...analyticsData.latencyP95.map(s=>s.value))||1)) * 100)}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="h-40 rounded-lg border bg-muted/30 p-2">
                        <div className="text-xs mb-2 text-muted-foreground">Error rate trend</div>
                        <div className="h-[120px] grid grid-cols-12 gap-1">
                          {analyticsData.errorRate.slice(-12).map((p) => (
                            <div key={p.date} className="bg-red-500/70" style={{ height: `${Math.min(100, (p.value / (Math.max(...analyticsData.errorRate.map(s=>s.value))||1)) * 100)}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <TableContainer id="reports-api-performance-table" height="md">
                      <Table className="min-w-[720px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[260px] max-w-[320px]">Endpoint</TableHead>
                            <TableHead className="min-w-[160px] max-w-[180px]">Req/min</TableHead>
                            <TableHead className="min-w-[160px] max-w-[180px]">Error %</TableHead>
                            <TableHead className="min-w-[160px] max-w-[180px]">P95 (ms)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { path: 'POST /api/auth/login', rpm: 120, err: '0.4%', p95: 380 },
                            { path: 'GET /api/projects', rpm: 210, err: '0.9%', p95: 420 },
                            { path: 'POST /api/checkout', rpm: 60, err: '1.8%', p95: 520 },
                          ].map((r) => (
                            <TableRow key={r.path} className="hover:bg-accent">
                              <TableCell className="font-medium text-sm md:whitespace-normal whitespace-nowrap">{r.path}</TableCell>
                              <TableCell className="text-sm">{r.rpm}</TableCell>
                              <TableCell className="text-sm">{r.err}</TableCell>
                              <TableCell className="text-sm">{r.p95}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* 6) Revenue KPIs */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Revenue KPIs</CardTitle>
                        <CardDescription>Summary only (see Billing for details)</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => downloadCsv('revenue.csv', analyticsData.mrr.map((p) => ({ date: p.date, mrr: p.value })))}>
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">MRR</div>
                        <div className="text-xl font-semibold">${latest(analyticsData.mrr).toLocaleString()}</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">ARR</div>
                        <div className="text-xl font-semibold">${(latest(analyticsData.mrr) * 12).toLocaleString()}</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Revenue Churn</div>
                        <div className="text-xl font-semibold">{Math.max(0, 5 - Math.round(Math.random()*2))}%</div>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground">Trial → Paid</div>
                        <div className="text-xl font-semibold">{25 + Math.round(Math.random()*5)}%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-40 rounded-lg border bg-muted/30 p-2">
                        <div className="text-xs mb-2 text-muted-foreground">MRR trend</div>
                        <div className="h-[120px] grid grid-cols-12 gap-1">
                          {analyticsData.mrr.slice(-12).map((p) => (
                            <div key={p.date} className="bg-primary/60" style={{ height: `${Math.min(100, (p.value / (Math.max(...analyticsData.mrr.map(s=>s.value))||1)) * 100)}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="h-40 rounded-lg border bg-muted/30 p-4 flex items-center justify-center">
                        <div className="flex items-center gap-6">
                          {analyticsData.planMix.map((p) => (
                            <div key={p.plan} className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-primary" />
                              <span className="text-sm">{p.plan}</span>
                              <Badge variant="secondary">{p.pct}%</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Exports Tab */}
            <TabsContent value="exports" className="space-y-4 mt-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DownloadCloud className="h-4 w-4 text-primary" />
                    Exports
                  </CardTitle>
                  <CardDescription>View and download previously generated reports</CardDescription>
                </div>
                <Button onClick={() => { setSelectedTemplate(null); setShowGenerateDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4 sm:mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="generating">Generating</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Report Templates Grid */}
              <div className="mb-6">
                <h3 className="text-base font-semibold mb-4">Report Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setReportName(`${template.name} - ${format(new Date(), 'MMM dd, yyyy')}`);
                          setShowGenerateDialog(true);
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base">{template.name}</CardTitle>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Generated Reports Table */}
              <TableContainer id="reports-generated-reports-table" height="lg">
                <Table className="min-w-[860px] [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[260px] max-w-[320px]">Report Name</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[160px] max-w-[180px]">Type</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[140px] max-w-[160px]">Format</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[200px] max-w-[240px]">Created</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[140px] max-w-[160px]">Size</TableHead>
                      <TableHead className="text-center min-w-[160px] max-w-[180px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => {
                        return (
                          <TableRow key={report.id}>
                            <TableCell className="min-w-[260px] max-w-[320px]">
                              <div className="md:whitespace-normal whitespace-nowrap">
                                <p className="font-medium text-sm">{report.name}</p>
                                <p className="text-xs text-muted-foreground sm:hidden capitalize">
                                  {report.type} • {getFormatName(report.format)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell min-w-[160px] max-w-[180px]">
                              <span className="capitalize text-sm">{report.type}</span>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell min-w-[140px] max-w-[160px]">
                              <span className="text-sm">{getFormatName(report.format)}</span>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground min-w-[200px] max-w-[240px]">
                              <DateTimeCell date={report.createdAt} />
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground min-w-[140px] max-w-[160px]">
                              {report.size || '-'}
                            </TableCell>
                            <TableCell className="text-center min-w-[160px] max-w-[180px]">
                              <div className="flex justify-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View Details</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? `Generate ${selectedTemplate.name}` : 'Generate Custom Report'}
            </DialogTitle>
            <DialogDescription>
              Configure report parameters and select export format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Report Name */}
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name..."
              />
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['csv', 'excel', 'pdf'] as ExportFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 border rounded-lg transition-all",
                      selectedFormat === format
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    {getFormatIcon(format)}
                    <span className="text-sm font-medium">{getFormatName(format)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-2">
              <Label>Additional Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-metadata" />
                  <label htmlFor="include-metadata" className="text-sm font-medium leading-none cursor-pointer">
                    Include metadata
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-charts" />
                  <label htmlFor="include-charts" className="text-sm font-medium leading-none cursor-pointer">
                    Include charts and visualizations
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="compressed" />
                  <label htmlFor="compressed" className="text-sm font-medium leading-none cursor-pointer">
                    Compress file
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Filters (for specific report types) */}
            {selectedTemplate && (
              <div className="space-y-2">
                <Label>Additional Filters</Label>
                <Textarea
                  placeholder="Enter custom filter criteria (JSON format)..."
                  className="min-h-[100px] font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Provide JSON format filters for advanced customization
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateReport} disabled={!reportName || isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
