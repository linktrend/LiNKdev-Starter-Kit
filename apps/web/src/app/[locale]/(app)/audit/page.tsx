'use client';

import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { AuditTable } from '@/components/audit/AuditTable';
import { AuditFilters } from '@/components/audit/AuditFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@starter/ui';
import { Badge } from '@starter/ui';
import { Activity, BarChart3, Users, Clock, Wifi, WifiOff } from 'lucide-react';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Database } from '@starter/types';

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
  const [newLogs, setNewLogs] = useState<Database['public']['Tables']['audit_logs']['Row'][]>([]);

  const { data: logsData, isLoading: logsLoading, refetch } = api.audit.list.useQuery(
    {
      orgId,
      ...filters,
      cursor,
      limit: 50,
    },
    {
      enabled: !!orgId,
    }
  );

  // Real-time subscription for new audit logs
  const { isConnected, error: realtimeError } = useRealtimeSubscription({
    table: 'audit_logs',
    orgId,
    enabled: !!orgId,
    onInsert: useCallback((payload: RealtimePostgresChangesPayload<Database['public']['Tables']['audit_logs']['Row']>) => {
      console.log('New audit log received:', payload);
      if (payload.new) {
        setNewLogs(prev => [payload.new as Database['public']['Tables']['audit_logs']['Row'], ...prev]);
        // Refetch the main data to get updated stats
        refetch();
      }
    }, [refetch]),
  });

  const { data: statsData, isLoading: statsLoading } = api.audit.stats.useQuery(
    {
      orgId,
      window: 'day',
    },
    {
      enabled: !!orgId,
    }
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

  // Combine existing logs with new real-time logs
  const allLogs = [...(logsData?.logs || []), ...newLogs];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-2">
            Track and monitor all activity within your organization.
          </p>
        </div>
        
        {/* Real-time status indicator */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">Offline</span>
            </div>
          )}
          {realtimeError && (
            <Badge variant="destructive" className="text-xs">
              {realtimeError}
            </Badge>
          )}
        </div>
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
                  ? Object.entries(statsData.by_action).sort(([,a], [,b]) => (b as number) - (a as number))[0][0]
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
        logs={allLogs}
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
