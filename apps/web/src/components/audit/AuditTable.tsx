'use client';

import React from 'react';
import { AuditLog } from '@starter/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import { DateTimeCell, ExpandedRowCell } from '@/components/ui/table-utils';
import { TableHeadText, TableHeadStatus, TableCellText, TableCellStatus } from '@/components/ui/table-cells';
import { 
  Clock, 
  Activity, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';

interface AuditTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function AuditTable({ logs, isLoading, onLoadMore, hasMore }: AuditTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No audit logs found</p>
          <p className="text-sm">Activity will appear here as it happens.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TableContainer id="audit-logs-table" height="lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeadText className="hidden md:table-cell w-40">Time</TableHeadText>
              <TableHeadText className="min-w-0">Actor</TableHeadText>
              <TableHeadText className="w-28">Entity</TableHeadText>
              <TableHeadStatus className="w-24">Action</TableHeadStatus>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <TableRow>
                  <TableCellText className="hidden md:table-cell w-40">
                    <DateTimeCell 
                      date={log.created_at && typeof log.created_at === 'object' && 'getTime' in log.created_at
                        ? log.created_at as Date
                        : new Date(log.created_at as string)}
                    />
                  </TableCellText>
                  <TableCellText className="min-w-0">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm">
                        {log.actor_id ? `User ${log.actor_id.slice(0, 8)}` : 'System'}
                      </span>
                      <Button
                        variant="ghost"
                        onClick={() => toggleExpanded(log.id)}
                        aria-expanded={expandedRows.has(log.id)}
                        aria-label={expandedRows.has(log.id) ? 'Collapse details' : 'Expand details'}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors self-start h-auto p-0"
                      >
                        {expandedRows.has(log.id) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        Details
                      </Button>
                    </div>
                  </TableCellText>
                  <TableCellText className="w-28">
                    <span className="text-sm capitalize">{log.entity_type}</span>
                  </TableCellText>
                  <TableCellStatus className="w-24">
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCellStatus>
                </TableRow>
                {expandedRows.has(log.id) && (
                  <TableRow>
                    <ExpandedRowCell colSpan={4}>
                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="font-medium mb-1 text-sm">Entity ID</h4>
                          <p className="text-sm text-muted-foreground">{log.entity_id}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-sm">Metadata</h4>
                          <pre className="text-xs bg-background p-2 rounded border overflow-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </ExpandedRowCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {hasMore && (
        <div className="mt-4 text-center">
          <Button onClick={onLoadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </>
  );
}
