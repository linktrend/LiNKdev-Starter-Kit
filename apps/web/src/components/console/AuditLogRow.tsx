'use client';

import { useMemo } from 'react';
import { ChevronDown, ChevronRight, LinkIcon, Loader2 } from 'lucide-react';
import type { AuditLog } from '@starter/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/utils/cn';
import { api } from '@/trpc/react';
import {
  formatAuditAction,
  formatAuditTimestamp,
  formatEntityType,
  formatMetadata,
  getActionColor,
  highlightMatches,
} from '@/lib/audit/formatters';

type Props = {
  log: AuditLog;
  expanded: boolean;
  onToggle: () => void;
  search?: string;
  orgId?: string;
};

export function AuditLogRow({ log, expanded, onToggle, search, orgId }: Props) {
  const detailQuery = api.audit.getById.useQuery(
    { logId: log.id, orgId: orgId || '' },
    { enabled: expanded && !!orgId, staleTime: 5 * 60 * 1000 }
  );

  const relatedQuery = api.audit.search.useQuery(
    {
      orgId: orgId || '',
      query: log.entity_id,
      entityType: log.entity_type,
      limit: 5,
    },
    { enabled: expanded && !!orgId && !!log.entity_id }
  );

  const metadata = detailQuery.data?.metadata ?? log.metadata ?? {};
  const beforeState = (metadata as any)?.before;
  const afterState = (metadata as any)?.after;
  const ipAddress = (metadata as any)?.ip || (metadata as any)?.ip_address;
  const userAgent = (metadata as any)?.userAgent || (metadata as any)?.user_agent;

  const related = useMemo(
    () =>
      (relatedQuery.data?.logs || []).filter((item: any) => item.id !== log.id).slice(0, 5),
    [relatedQuery.data?.logs, log.id]
  );

  const renderHighlighted = (value: string) =>
    highlightMatches(value, search).map((segment, idx) =>
      segment.match ? (
        <mark key={idx} className="bg-amber-100 px-0.5 dark:bg-amber-900/60">
          {segment.text}
        </mark>
      ) : (
        <span key={idx}>{segment.text}</span>
      )
    );

  return (
    <>
      <TableRow className={cn(expanded && 'bg-muted/30')}>
        <TableCell className="w-10">
          <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Toggle details">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
          {renderHighlighted(formatAuditTimestamp(log.created_at))}
        </TableCell>
        <TableCell className="max-w-[160px] truncate text-sm">
          {log.actor_id ? renderHighlighted(log.actor_id) : <span className="text-muted-foreground">System</span>}
        </TableCell>
        <TableCell className="text-sm">
          <Badge className={cn('capitalize', getActionColor(log.action))}>
            {renderHighlighted(formatAuditAction(log.action))}
          </Badge>
        </TableCell>
        <TableCell className="text-sm">{renderHighlighted(formatEntityType(log.entity_type))}</TableCell>
        <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">
          {renderHighlighted(log.entity_id)}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">
          {renderHighlighted(JSON.stringify(log.metadata ?? {}))}
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={7}>
            <Card className="bg-muted/40">
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>Log ID: {log.id}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>Actor: {log.actor_id || 'System'}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>Entity: {log.entity_type} / {log.entity_id}</span>
                  {ipAddress && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <span>IP: {ipAddress}</span>
                    </>
                  )}
                  {userAgent && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="truncate">UA: {userAgent}</span>
                    </>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Metadata</div>
                    <pre className="max-h-48 overflow-auto rounded-md bg-zinc-950/90 p-3 text-xs text-zinc-50 dark:bg-zinc-900">
                      {formatMetadata(metadata)}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Before / After</div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="rounded-md border bg-background p-2">
                        <div className="text-xs font-semibold mb-1">Before</div>
                        <pre className="max-h-24 overflow-auto text-xs">{beforeState ? JSON.stringify(beforeState, null, 2) : '—'}</pre>
                      </div>
                      <div className="rounded-md border bg-background p-2">
                        <div className="text-xs font-semibold mb-1">After</div>
                        <pre className="max-h-24 overflow-auto text-xs">{afterState ? JSON.stringify(afterState, null, 2) : '—'}</pre>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <LinkIcon className="h-4 w-4" />
                    Related logs (same entity)
                    {relatedQuery.isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  {related.length === 0 && !relatedQuery.isFetching && (
                    <p className="text-xs text-muted-foreground">No related logs.</p>
                  )}
                  <div className="flex flex-col gap-1">
                    {related.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded border bg-background px-3 py-2 text-xs"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{formatAuditAction(item.action)}</span>
                          <span className="text-muted-foreground">{formatAuditTimestamp(item.created_at)}</span>
                        </div>
                        <Badge variant="outline" className={cn('capitalize', getActionColor(item.action))}>
                          {item.action}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  {detailQuery.isFetching && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading full details…
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={() => detailQuery.refetch()}>
                    Refresh log
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
