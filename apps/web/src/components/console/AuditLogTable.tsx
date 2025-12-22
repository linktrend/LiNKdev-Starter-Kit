'use client';

import { useEffect, useState } from 'react';
import type { AuditLog } from '@starter/types';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AuditLogRow } from './AuditLogRow';
import { AUDIT_PAGE_SIZE } from '@/lib/audit/formatters';

type Props = {
  logs: AuditLog[];
  search?: string;
  orgId?: string;
  isLoading?: boolean;
  page: number;
  total: number;
  hasMore: boolean;
  onPageChange: (page: number) => Promise<void> | void;
};

export function AuditLogTable({ logs, search, orgId, isLoading, page, total, hasMore, onPageChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState<string>(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const pageCount = Math.max(1, Math.ceil((total || logs.length || AUDIT_PAGE_SIZE) / AUDIT_PAGE_SIZE));

  const handleJump = async () => {
    const target = Number(pageInput);
    if (Number.isNaN(target) || target < 1) return;
    const clamped = Math.min(Math.max(target, 1), pageCount);
    await onPageChange(clamped);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {isLoading ? 'Loading logs…' : `${total} results`} • Page {page} of {pageCount}
          {search ? ` • Searching "${search}"` : ''}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="h-8 w-20"
            type="number"
            min={1}
            max={pageCount}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleJump();
              }
            }}
          />
          <Button variant="secondary" size="sm" onClick={() => void handleJump()}>
            Go
          </Button>
          <Button variant="outline" size="sm" onClick={() => void onPageChange(page - 1)} disabled={page <= 1}>
            Prev
          </Button>
          <Button variant="outline" size="sm" onClick={() => void onPageChange(page + 1)} disabled={!hasMore}>
            Next
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-40">Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading audit logs…
                    </span>
                  ) : (
                    'No audit logs found'
                  )}
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <AuditLogRow
                key={log.id}
                log={log}
                expanded={expandedId === log.id}
                onToggle={() => setExpandedId((prev) => (prev === log.id ? null : log.id))}
                search={search}
                orgId={orgId}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
