'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  CalendarClock
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';

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
  const [activeTab, setActiveTab] = useState<'templates' | 'generated' | 'scheduled'>('templates');
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
      completed: { variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', icon: CheckCircle2 },
      failed: { variant: 'destructive', className: '', icon: AlertCircle },
    };

    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={cn(config.className, 'flex items-center gap-1')}>
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

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and download comprehensive reports for your application
          </p>
        </div>
        <Button onClick={() => { setSelectedTemplate(null); setShowGenerateDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Custom Report
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="generated">Generated Reports</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-4 mt-0">
              {/* Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search report templates..."
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
              </div>

              {/* Report Templates Grid */}
              <div className="space-y-6">
                {Object.entries(groupedTemplates).map(([category, templates]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates.map((template) => {
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
                ))}
              </div>
            </TabsContent>

            {/* Generated Reports Tab */}
            <TabsContent value="generated" className="space-y-4 mt-0">
              {/* Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
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
                    <SelectItem value="generating">Generating</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generated Reports Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead className="hidden md:table-cell">Type</TableHead>
                      <TableHead className="hidden lg:table-cell">Format</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Created</TableHead>
                      <TableHead className="hidden lg:table-cell">Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => {
                        const Icon = getReportTypeIcon(report.type);
                        return (
                          <TableRow key={report.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{report.name}</p>
                                  <p className="text-xs text-muted-foreground sm:hidden capitalize">
                                    {report.type} • {getFormatName(report.format)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="outline" className="capitalize">
                                {report.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-2">
                                {getFormatIcon(report.format)}
                                <span className="text-sm">{getFormatName(report.format)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getStatusBadge(report.status)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                              {report.createdAt.toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                              {report.size || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {report.status === 'completed' && report.downloadUrl && (
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
                                )}
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
                                        <Trash2 className="h-4 w-4" />
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
              </div>
            </TabsContent>

            {/* Scheduled Reports Tab */}
            <TabsContent value="scheduled" className="space-y-4 mt-0">
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <CalendarClock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Scheduled Reports</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Schedule automatic report generation and delivery
                    </p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
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

