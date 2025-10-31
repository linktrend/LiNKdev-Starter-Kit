'use client';

import { useState, Fragment, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBadgeClasses } from '@/components/ui/badge.presets';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import { DateTimeCell, DetailsLink, ExpandedRowCell } from '@/components/ui/table-utils';
import { TableHeadAction, TableCellAction } from '@/components/ui/table-columns';
import { TableHeadText, TableHeadNumeric, TableHeadStatus, TableCellText, TableCellNumeric, TableCellStatus, ActionIconsCell } from '@/components/ui/table-cells';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Database, 
  Activity, 
  Search, 
  Table as TableIcon, 
  Play, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  BarChart3,
  Zap,
  HardDrive,
  Users,
  TrendingUp,
  Eye,
  X,
  XCircle,
  ChevronUp,
  ChevronDown,
  Copy
} from 'lucide-react';

// Mock data
const mockTables = [
  { name: 'users', rows: 1247, size: '2.4 MB', rls: true, description: 'User accounts and authentication data' },
  { name: 'organizations', rows: 342, size: '1.8 MB', rls: true, description: 'Organization entities and metadata' },
  { name: 'organization_members', rows: 2156, size: '3.2 MB', rls: true, description: 'Organization membership records' },
  { name: 'records', rows: 15234, size: '28.5 MB', rls: true, description: 'Generic records system' },
  { name: 'record_types', rows: 12, size: '0.1 MB', rls: true, description: 'Record type definitions' },
  { name: 'subscriptions', rows: 456, size: '1.2 MB', rls: true, description: 'User subscription data' },
  { name: 'products', rows: 23, size: '0.3 MB', rls: true, description: 'Product catalog' },
  { name: 'prices', rows: 67, size: '0.5 MB', rls: true, description: 'Pricing information' },
  { name: 'posts', rows: 89, size: '0.9 MB', rls: true, description: 'Blog posts and content' },
  { name: 'audit_logs', rows: 15432, size: '45.2 MB', rls: true, description: 'Audit trail records' },
  { name: 'invites', rows: 234, size: '0.6 MB', rls: true, description: 'Organization invitations' },
  { name: 'schedules', rows: 567, size: '1.4 MB', rls: true, description: 'Scheduled events' },
  { name: 'temp_cache', rows: 23, size: '0.1 MB', rls: false, description: 'Temporary cache data without RLS' },
];

const mockQueryHistory = [
  { id: 1, query: 'SELECT * FROM users LIMIT 10', executedAt: '2025-01-27 14:32:15', duration: '45ms', rows: 10, status: 'success' },
  { id: 2, query: 'SELECT COUNT(*) FROM organizations', executedAt: '2025-01-27 14:28:42', duration: '12ms', rows: 1, status: 'success' },
  { id: 3, query: 'UPDATE users SET last_login = NOW()', executedAt: '2025-01-27 14:25:18', duration: '234ms', rows: 1247, status: 'success' },
  { id: 4, query: 'SELECT * FROM nonexistent_table', executedAt: '2025-01-27 14:20:05', duration: '8ms', rows: 0, status: 'error' },
  { id: 5, query: 'SELECT org.name, COUNT(m.id) FROM organizations org JOIN organization_members m ON org.id = m.org_id GROUP BY org.id', executedAt: '2025-01-27 14:15:33', duration: '156ms', rows: 342, status: 'success' },
];

const mockSchema = {
  users: [
    { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', description: 'Primary key' },
    { name: 'email', type: 'text', nullable: false, default: null, description: 'User email address' },
    { name: 'full_name', type: 'text', nullable: true, default: null, description: 'User full name' },
    { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()', description: 'Creation timestamp' },
    { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()', description: 'Last update timestamp' },
  ],
  organizations: [
    { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', description: 'Primary key' },
    { name: 'name', type: 'text', nullable: false, default: null, description: 'Organization name' },
    { name: 'slug', type: 'text', nullable: true, default: null, description: 'URL-friendly identifier' },
    { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()', description: 'Creation timestamp' },
  ],
};

export default function ConsoleDatabasePage() {
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'schema' | 'performance' | 'history'>('tables');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [queryText, setQueryText] = useState('');
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewTableDialog, setViewTableDialog] = useState<string | null>(null);
  const [expandedQueries, setExpandedQueries] = useState<Set<number>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleExecuteQuery = () => {
    if (!queryText.trim()) return;
    
    setIsExecuting(true);
    setQueryError(null);
    setQueryResults(null);

    // Simulate query execution
    setTimeout(() => {
      if (queryText.toLowerCase().includes('error') || queryText.toLowerCase().includes('nonexistent')) {
        setQueryError('Error: Table does not exist');
        setQueryResults(null);
      } else {
        setQueryResults([
          { id: 1, name: 'Example Result 1', value: 'Data point 1' },
          { id: 2, name: 'Example Result 2', value: 'Data point 2' },
        ]);
        setQueryError(null);
      }
      setIsExecuting(false);
    }, 1000);
  };

  const filteredTables = mockTables.filter(table => 
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRows = mockTables.reduce((sum, table) => sum + table.rows, 0);
  const totalSize = mockTables.reduce((sum, table) => {
    const size = parseFloat(table.size);
    return sum + size;
  }, 0);

  const toggleQueryExpanded = (queryId: number) => {
    const newExpanded = new Set(expandedQueries);
    if (newExpanded.has(queryId)) {
      newExpanded.delete(queryId);
    } else {
      newExpanded.add(queryId);
    }
    setExpandedQueries(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Calculate max badge width for Status column
  const statusBadgeWidth = useMemo(() => {
    const statuses = mockQueryHistory.map(q => q.status === 'success' ? 'Success' : 'Error');
    const maxLength = Math.max(...statuses.map(s => s.length));
    // Approximate width: ~0.6rem per character + padding (px-2.5 = 10px on each side = 20px total)
    // Base on text-xs and approximate character width
    return `${Math.max(maxLength * 8 + 20, 64)}px`; // Minimum 64px, scale with text length
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

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <TableIcon className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTables.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRows.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 !flex-row">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSize.toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground mt-1">Total storage used</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="tables" className="flex-1 sm:flex-initial">
                  <TableIcon className="h-4 w-4 mr-1 sm:mr-2" />
                  Tables
                </TabsTrigger>
                <TabsTrigger value="query" className="flex-1 sm:flex-initial">
                  <Zap className="h-4 w-4 mr-1 sm:mr-2" />
                  Query Editor
                </TabsTrigger>
                <TabsTrigger value="schema" className="flex-1 sm:flex-initial">
                  <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                  Schema Browser
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex-1 sm:flex-initial">
                  <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 sm:flex-initial">
                  <Clock className="h-4 w-4 mr-1 sm:mr-2" />
                  Query History
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            {/* Tables Tab */}
            <TabsContent value="tables" className="space-y-4 mt-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tables..."
                      className="pl-9 w-full sm:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHeadText className="w-[25%]">Table Name</TableHeadText>
                        <TableHeadText className="hidden sm:table-cell w-24">Rows</TableHeadText>
                        <TableHeadText className="hidden md:table-cell w-28">Size</TableHeadText>
                        <TableHeadText className="hidden lg:table-cell w-[50%]">Description</TableHeadText>
                        <TableHeadStatus className="hidden lg:table-cell w-16">RLS</TableHeadStatus>
                        <TableHeadAction className="w-20">Actions</TableHeadAction>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTables.map((table) => (
                        <TableRow key={table.name}>
                          <TableCellText className="font-medium w-[25%]">
                            <div className="flex flex-col gap-1">
                              <div>{table.name}</div>
                              <div className="text-xs text-muted-foreground sm:hidden">
                                <span className="mr-4">Rows: {table.rows.toLocaleString()}</span>
                                <span>Size: {table.size}</span>
                              </div>
                              <div className="text-xs text-muted-foreground lg:hidden">
                                {table.description}
                              </div>
                            </div>
                          </TableCellText>
                          <TableCellText className="hidden sm:table-cell w-24">{table.rows.toLocaleString()}</TableCellText>
                          <TableCellText className="hidden md:table-cell w-28">{table.size}</TableCellText>
                          <TableCellText className="hidden lg:table-cell text-muted-foreground w-[50%]">{table.description}</TableCellText>
                          <TableCellStatus className="hidden lg:table-cell w-16">
                            {table.rls ? (
                              <div className="flex items-center justify-center cursor-help">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                              </div>
                            )}
                          </TableCellStatus>
                          <TableCellAction className="w-20">
                            <ActionIconsCell>
                              <button
                                onClick={() => setViewTableDialog(table.name)}
                                className="p-2 hover:bg-accent rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </ActionIconsCell>
                          </TableCellAction>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </div>
              {filteredTables.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tables found matching "{searchTerm}"
                </div>
              )}
            </TabsContent>

            {/* Query Editor Tab */}
            <TabsContent value="query" className="space-y-4 mt-0">
              <div className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="SELECT * FROM users LIMIT 10;"
                  className="font-mono min-h-[200px] text-sm"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Write your SQL query here. Results will appear below.
                  </p>
                  <Button 
                    onClick={handleExecuteQuery} 
                    disabled={!queryText.trim() || isExecuting}
                    className="w-full sm:w-auto"
                  >
                    {isExecuting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Query
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {queryError && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">Query Error</p>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{queryError}</p>
                    </div>
                  </div>
                </div>
              )}

              {queryResults && (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm font-medium">Results ({queryResults.length} rows)</p>
                  </div>
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {queryResults.length > 0 && Object.keys(queryResults[0]).map((key) => (
                            <TableHead key={key}>{key}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queryResults.map((row, idx) => (
                          <TableRow key={idx}>
                            {Object.values(row).map((value: any, cellIdx) => (
                              <TableCell key={cellIdx} className="font-mono text-sm">
                                {String(value)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {!queryResults && !queryError && (
                <div className="rounded-md bg-muted p-8 text-center">
                  <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Enter a SQL query and click "Execute Query" to see results
                  </p>
                </div>
              )}
              </div>
            </TabsContent>

            {/* Schema Browser Tab */}
            <TabsContent value="schema" className="space-y-4 mt-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Schema Browser</CardTitle>
                  <CardDescription>Explore table structures and column definitions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Select a table..."
                    value={selectedTable || ''}
                    onChange={(e) => setSelectedTable(e.target.value || null)}
                    className="w-full sm:w-64"
                  />
                </div>
              </div>
              {selectedTable && mockSchema[selectedTable as keyof typeof mockSchema] ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedTable}</h3>
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Column Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="hidden md:table-cell">Nullable</TableHead>
                              <TableHead className="hidden lg:table-cell">Default</TableHead>
                              <TableHead className="hidden lg:table-cell">Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockSchema[selectedTable as keyof typeof mockSchema].map((column) => (
                              <TableRow key={column.name}>
                                <TableCell className="font-medium font-mono">{column.name}</TableCell>
                                <TableCell className="font-mono text-sm break-all">{column.type}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {column.nullable ? (
                                    <Badge className={getBadgeClasses('boolean.yes')}>Yes</Badge>
                                  ) : (
                                    <Badge className={getBadgeClasses('boolean.no')}>No</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell font-mono text-sm text-muted-foreground break-all">
                                  {column.default || '-'}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-muted-foreground">{column.description}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {mockTables.map((table) => (
                      <Card 
                        key={table.name} 
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setSelectedTable(table.name)}
                      >
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <TableIcon className="h-4 w-4" />
                            {table.name}
                          </CardTitle>
                          <CardDescription>{table.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Rows: </span>
                              <span className="font-medium">{table.rows.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Size: </span>
                              <span className="font-medium">{table.size}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    Select a table to view its schema
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Connection Pool</CardTitle>
                <CardDescription>Active database connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Connections</span>
                    <span className="text-2xl font-bold">23</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '58%' }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>Max: 40</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
                <CardDescription>Average query execution time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Response Time</span>
                    <span className="text-2xl font-bold">45ms</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: '22%' }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Excellent</span>
                    <span>&lt; 200ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

      <Card>
        <CardHeader>
                <CardTitle>Cache Hit Ratio</CardTitle>
                <CardDescription>PostgreSQL cache performance</CardDescription>
        </CardHeader>
        <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
                    <span className="text-2xl font-bold">98.2%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: '98%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    High cache hit ratio indicates efficient query performance
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Size Growth</CardTitle>
                <CardDescription>Storage usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Size</span>
                    <span className="text-2xl font-bold">{totalSize.toFixed(1)} MB</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '35%' }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Growing steadily</span>
                    <span>+12% this month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Slow Queries</CardTitle>
              <CardDescription>Queries taking longer than 100ms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHeadText className="min-w-0">Query</TableHeadText>
                      <TableHeadNumeric className="w-24">Duration</TableHeadNumeric>
                      <TableHeadNumeric className="hidden sm:table-cell w-20">Calls</TableHeadNumeric>
                            <TableHeadStatus className="w-20">Status</TableHeadStatus>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCellText className="font-mono text-xs sm:text-sm break-all min-w-0">
                          SELECT * FROM audit_logs WHERE created_at &gt; NOW() - INTERVAL '1 day'
                        </TableCellText>
                        <TableCellNumeric className="w-24">234ms</TableCellNumeric>
                        <TableCellNumeric className="hidden sm:table-cell w-20">156</TableCellNumeric>
                        <TableCellStatus className="w-20">
                          <Badge className={getBadgeClasses('warning.soft')}>Slow</Badge>
                        </TableCellStatus>
                      </TableRow>
                      <TableRow>
                        <TableCellText className="font-mono text-xs sm:text-sm break-all min-w-0">
                          SELECT COUNT(*) FROM records WHERE org_id = $1
                        </TableCellText>
                        <TableCellNumeric className="w-24">189ms</TableCellNumeric>
                        <TableCellNumeric className="hidden sm:table-cell w-20">89</TableCellNumeric>
                        <TableCellStatus className="w-20">
                          <Badge className={getBadgeClasses('warning.soft')}>Slow</Badge>
                        </TableCellStatus>
                      </TableRow>
                    </TableBody>
                  </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

            {/* Query History Tab */}
            <TabsContent value="history" className="space-y-4 mt-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Query History</h3>
                  <p className="text-sm text-muted-foreground">Recently executed SQL queries</p>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <TableContainer id="database-query-history-table" height="lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeadText className="hidden md:table-cell w-44">Executed At</TableHeadText>
                      <TableHeadText className="min-w-0">Query</TableHeadText>
                      <TableHeadNumeric className="w-24">Duration</TableHeadNumeric>
                      <TableHeadNumeric className="hidden sm:table-cell w-20">Rows</TableHeadNumeric>
                      <TableHeadStatus className="w-28">Status</TableHeadStatus>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                      {mockQueryHistory.map((query) => {
                        // Parse executedAt string to Date for formatting
                        const executedDate = new Date(query.executedAt.replace(' ', 'T'));
                        const isValidDate = !isNaN(executedDate.getTime());
                        
                        return (
                          <Fragment key={query.id}>
                            <TableRow>
                              <TableCellText className="hidden md:table-cell w-44">
                                {isValidDate ? (
                                  <DateTimeCell date={executedDate} />
                                ) : (
                                  <div className="flex flex-col">
                                    <span className="text-sm">{query.executedAt.split(' ')[0]}</span>
                                    <span className="text-xs text-muted-foreground">{query.executedAt.split(' ')[1] || ''}</span>
                                  </div>
                                )}
                              </TableCellText>
                              <TableCellText className="min-w-0">
                                <div className="min-w-0">
                                  <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium break-words line-clamp-2">{query.query}</p>
                                    <DetailsLink
                                      isExpanded={expandedQueries.has(query.id)}
                                      onToggle={() => toggleQueryExpanded(query.id)}
                                    />
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:hidden">
                                      <span>{isValidDate ? executedDate.toLocaleDateString() : query.executedAt.split(' ')[0]}</span>
                                      <span>•</span>
                                      <span>{isValidDate ? executedDate.toLocaleTimeString() : query.executedAt.split(' ')[1] || ''}</span>
                                    </div>
                                  </div>
                                </div>
                              </TableCellText>
                              <TableCellNumeric className="w-24">{query.duration}</TableCellNumeric>
                              <TableCellNumeric className="hidden sm:table-cell w-20">{query.rows.toLocaleString()}</TableCellNumeric>
                              <TableCellStatus className="w-28">
                                {query.status === 'success' ? (
                                  <Badge 
                                    className={`${getBadgeClasses('success.soft')} flex justify-center items-center`}
                                    style={{ width: statusBadgeWidth, minWidth: '64px' }}
                                  >
                                    Success
                                  </Badge>
                                ) : (
                                  <Badge 
                                    className={`${getBadgeClasses('danger.soft')} flex justify-center items-center`}
                                    style={{ width: statusBadgeWidth, minWidth: '64px' }}
                                  >
                                    Error
                                  </Badge>
                                )}
                              </TableCellStatus>
                            </TableRow>
                            {expandedQueries.has(query.id) && (
                              <TableRow>
                                <ExpandedRowCell colSpan={5}>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Executed At</h4>
                                        <p className="text-sm text-muted-foreground font-mono">{query.executedAt}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">Duration</h4>
                                        <p className="text-sm text-muted-foreground font-mono">{query.duration}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">Rows Returned</h4>
                                        <p className="text-sm text-muted-foreground font-mono">{query.rows.toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">Status</h4>
                                        {query.status === 'success' ? (
                                          <Badge 
                                            className={`${getBadgeClasses('success.soft')} flex justify-center items-center`}
                                            style={{ width: statusBadgeWidth, minWidth: '64px' }}
                                          >
                                            Success
                                          </Badge>
                                        ) : (
                                          <Badge 
                                            className={`${getBadgeClasses('danger.soft')} flex justify-center items-center`}
                                            style={{ width: statusBadgeWidth, minWidth: '64px' }}
                                          >
                                            Error
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {query.query && query.query.length > 100 && (
                                      <div>
                                        <h4 className="font-medium mb-2 flex items-center gap-2">
                                          <Database className="h-4 w-4" />
                                          Full Query
                                        </h4>
                                        <div className="relative">
                                          <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-48 font-mono">
                                            {query.query}
                                          </pre>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={() => copyToClipboard(query.query)}
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </ExpandedRowCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
              </TableContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Table Dialog */}
      <Dialog open={viewTableDialog !== null} onOpenChange={(open) => !open && setViewTableDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Table: {viewTableDialog}</DialogTitle>
            <DialogDescription>
              Viewing details for table {viewTableDialog}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewTableDialog && (
              <>
                {mockTables.find(t => t.name === viewTableDialog) && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">Rows:</span>
                        <span className="ml-2 text-sm">{mockTables.find(t => t.name === viewTableDialog)?.rows.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Size:</span>
                        <span className="ml-2 text-sm">{mockTables.find(t => t.name === viewTableDialog)?.size}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-medium">Description:</span>
                        <span className="ml-2 text-sm text-muted-foreground">{mockTables.find(t => t.name === viewTableDialog)?.description}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">RLS:</span>
                        <span className="ml-2 text-sm">
                          {mockTables.find(t => t.name === viewTableDialog)?.rls ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {mockSchema[viewTableDialog as keyof typeof mockSchema] && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Schema</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Column Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Nullable</TableHead>
                            <TableHead>Default</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockSchema[viewTableDialog as keyof typeof mockSchema].map((column) => (
                            <TableRow key={column.name}>
                              <TableCell className="font-medium font-mono">{column.name}</TableCell>
                              <TableCell className="font-mono text-sm">{column.type}</TableCell>
                              <TableCell>
                                {column.nullable ? (
                                  <Badge className={getBadgeClasses('boolean.yes')}>Yes</Badge>
                                ) : (
                                  <Badge className={getBadgeClasses('boolean.no')}>No</Badge>
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-sm text-muted-foreground">{column.default || '-'}</TableCell>
                              <TableCell className="text-muted-foreground">{column.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}