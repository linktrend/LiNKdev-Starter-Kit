'use client';

import React from 'react';
import { AuditLog } from '@starter/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableContainer } from '@/components/ui/table-container';
import { DateTimeCell, DetailsLink, ExpandedRowCell } from '@/components/ui/table-utils';
import { TableHeadText, TableHeadStatus, TableCellText, TableCellStatus } from '@/components/ui/table-cells';
import { Activity } from 'lucide-react';
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
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHeadText className="hidden md:table-cell min-w-[160px] max-w-[200px]">
                Time
              </TableHeadText>
              <TableHeadText className="min-w-[240px] max-w-[360px]">
                Actor
              </TableHeadText>
              <TableHeadText className="min-w-[160px] max-w-[200px]">
                Entity
              </TableHeadText>
              <TableHeadStatus className="min-w-[140px] max-w-[160px]">
                Action
              </TableHeadStatus>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <TableRow>
                  <TableCellText className="hidden md:table-cell min-w-[160px] max-w-[200px]">
                    <DateTimeCell 
                      date={log.created_at && typeof log.created_at === 'object' && 'getTime' in log.created_at
                        ? log.created_at as Date
                        : new Date(log.created_at as string)}
                    />
                  </TableCellText>
                  <TableCellText className="min-w-[240px] max-w-[360px]">
                    <div className="flex flex-col gap-2 md:whitespace-normal whitespace-nowrap md:pr-2">
                      <span className="text-sm">
                        {log.actor_id ? `User ${log.actor_id.slice(0, 8)}` : 'System'}
                      </span>
                      <DetailsLink
                        isExpanded={expandedRows.has(log.id)}
                        onToggle={() => toggleExpanded(log.id)}
                        label="Details"
                      />
                    </div>
                  </TableCellText>
                  <TableCellText className="min-w-[160px] max-w-[200px]">
                    <span className="text-sm capitalize md:whitespace-normal whitespace-nowrap">
                      {log.entity_type}
                    </span>
                  </TableCellText>
                  <TableCellStatus className="min-w-[140px] max-w-[160px]">
                    <span className="text-sm capitalize text-muted-foreground">
                      {log.action}
                    </span>
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
