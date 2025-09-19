'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { AuditTable } from '@/components/audit/AuditTable';
import { AuditFilters } from '@/components/audit/AuditFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart3, Users, Clock } from 'lucide-react';

interface AuditFiltersState {
  q?: string;
  entityType?: string;
  action?: string;
  actorId?: string;
  from?: string;
  to?: string;
}

export default function AuditPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const [filters, setFilters] = useState<AuditFiltersState>({});
  const [cursor, setCursor] = useState<string | undefined>();

  const { data: logsData, isLoading: logsLoading } = api.audit.list.useQuery(
    {
      orgId,
      ...filters,
      cursor,
      limit: 50,
    },
    { enabled: !!orgId }
  );

  const { data: statsData, isLoading: statsLoading } = api.audit.stats.useQuery(
    {
      orgId,
      window: 'day',
    },
    { enabled: !!orgId }
  );

  const exportCsv = api.audit.exportCsv.useMutation();

  const handleFiltersChange = (newFilters: Partial<AuditFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCursor(undefined); // Reset cursor when filters change
  };

  const handleLoadMore = () => {
    if (logsData?.next_cursor) {
      setCursor(logsData.next_cursor);
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportCsv.mutateAsync({
        orgId,
        ...filters,
      });
      
      // Download CSV
      const blob = new Blob([result.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!orgId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">
          <p>No organization selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">
          Track and monitor all activity within your organization.
        </p>
      </div>

      {/* Statistics Cards */}
      {statsData && !statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.total}</div>
              <p className="text-xs text-muted-foreground">
                Last {statsData.window}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Action</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.entries(statsData.by_action).length > 0
                  ? Object.entries(statsData.by_action).sort(([,a], [,b]) => b - a)[0][0]
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Most frequent action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(statsData.by_entity_type).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Different types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actors</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(statsData.by_actor).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active users
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {(AuditFilters as any)({
        filters,
        onFiltersChange: handleFiltersChange,
        onExport: handleExport,
        isLoading: exportCsv.isPending
      })}

      {/* Audit Table */}
      <AuditTable
        logs={logsData?.logs || []}
        isLoading={logsLoading}
        onLoadMore={handleLoadMore}
        hasMore={logsData?.has_more || false}
      />

      {/* Offline Mode Notice */}
      {logsData && 'offline' in logsData && logsData.offline && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">
                Offline Mode: Audit data is simulated for template development.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
