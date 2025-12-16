'use client';

/**
 * Database Console Page
 * Provides SQL query editor and database insights for admin users
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Database as DatabaseIcon, RefreshCw, TableIcon, Zap } from 'lucide-react';
import { SqlEditor } from '@/components/console/SqlEditor';
import { QueryResults } from '@/components/console/QueryResults';
import { TableBrowser } from '@/components/console/TableBrowser';
import { DatabaseStatsDashboard } from '@/components/console/DatabaseStats';
import { useQueryHistory } from '@/hooks/useQueryHistory';
import {
  executeQuery,
  getDatabaseStats,
  getTables,
  type QueryResult,
} from '@/app/actions/database';
import type { DatabaseStats, TableInfo } from '@/lib/database/stats';
import { useOrg } from '@/contexts/OrgContext';
import { Spinner } from '@/components/ui/spinner';

export default function ConsoleDatabasePage() {
  const { currentOrgId, isLoading: orgLoading } = useOrg();
  const [activeTab, setActiveTab] = useState<'query' | 'tables'>('query');
  const [queryText, setQueryText] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const { addToHistory } = useQueryHistory();

  // Load initial data
  useEffect(() => {
    loadDatabaseStats();
    loadTables();
  }, []);

  const loadDatabaseStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getDatabaseStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading database stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadTables = async () => {
    setLoadingTables(true);
    try {
      const data = await getTables();
      setTables(data);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!queryText.trim()) return;

    setIsExecuting(true);
    setQueryResult(null);

    const startTime = Date.now();

    try {
      const result = await executeQuery(queryText);
      const duration = Date.now() - startTime;

      setQueryResult(result);

      // Add to history
      addToHistory({
        query: queryText,
        duration,
        rowCount: result.rowCount || 0,
        status: result.success ? 'success' : 'error',
        error: result.error,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      setQueryResult({
        success: false,
        error: errorMessage,
      });

      addToHistory({
        query: queryText,
        duration,
        rowCount: 0,
        status: 'error',
        error: errorMessage,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleViewTableData = (tableName: string) => {
    setQueryText(`SELECT * FROM ${tableName} LIMIT 100;`);
    setActiveTab('query');
  };

  const handleRefresh = () => {
    loadDatabaseStats();
    loadTables();
  };

  const totalRows = tables.reduce((sum, table) => sum + table.rows, 0);

  if (orgLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12 text-muted-foreground">
        <Spinner />
        <span className="ml-3">Loading organization context…</span>
      </div>
    );
  }

  if (!currentOrgId) {
    return (
      <div className="rounded-lg border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Select an organization to use the database console.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Database Console</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loadingStats}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Metrics */}
      {stats && <DatabaseStatsDashboard stats={stats} totalRows={totalRows} />}

      {/* Main Content Tabs */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="query" className="flex-1 sm:flex-initial">
                <Zap className="h-4 w-4 mr-1 sm:mr-2" />
                Query Editor
              </TabsTrigger>
              <TabsTrigger value="tables" className="flex-1 sm:flex-initial">
                <TableIcon className="h-4 w-4 mr-1 sm:mr-2" />
                Tables
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            {/* Query Editor Tab */}
            <TabsContent value="query" className="space-y-4 mt-0">
              <div className="space-y-4">
                <SqlEditor
                  value={queryText}
                  onChange={setQueryText}
                  onExecute={handleExecuteQuery}
                  isExecuting={isExecuting}
                />

                {/* Error Display */}
                {queryResult && !queryResult.success && queryResult.error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-200">Query Error</p>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {queryResult.error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Results */}
                {queryResult && queryResult.success && queryResult.data && queryResult.columns && (
                  <QueryResults
                    data={queryResult.data}
                    columns={queryResult.columns}
                    rowCount={queryResult.rowCount || 0}
                    executionTime={queryResult.executionTime || 0}
                  />
                )}

                {/* Empty State */}
                {!queryResult && !isExecuting && (
                  <div className="rounded-md bg-muted p-8 text-center">
                    <DatabaseIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Enter a SQL query and click &quot;Execute Query&quot; to see results
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Only SELECT queries are allowed for security reasons
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tables Tab */}
            <TabsContent value="tables" className="space-y-4 mt-0">
              <TableBrowser
                tables={tables}
                onViewData={handleViewTableData}
                onRefresh={loadTables}
                isLoading={loadingTables}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
