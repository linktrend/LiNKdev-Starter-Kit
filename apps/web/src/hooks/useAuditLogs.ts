'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/trpc/react';
import { useDebounce } from './use-debounce';
import { AUDIT_PAGE_SIZE, pickGroupBy } from '@/lib/audit/formatters';

type DateRange = { from: Date; to: Date };

export type AuditFilters = {
  action?: string;
  entityType?: string;
  actorId?: string;
  dateRange: DateRange;
  search?: string;
};

type UseAuditLogsOptions = {
  orgId?: string;
};

const DEFAULT_RANGE: DateRange = {
  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  to: new Date(),
};

const toIso = (date?: Date) => (date ? date.toISOString() : undefined);

export function useAuditLogs({ orgId }: UseAuditLogsOptions) {
  const utils = api.useUtils();
  const [filters, setFilters] = useState<AuditFilters>({ dateRange: DEFAULT_RANGE });
  const [page, setPage] = useState(1);
  const [cursorByPage, setCursorByPage] = useState<Record<number, string | undefined>>({ 1: undefined });

  const debouncedSearch = useDebounce(filters.search ?? '', 300);

  useEffect(() => {
    setPage(1);
    setCursorByPage({ 1: undefined });
  }, [orgId]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setCursorByPage({ 1: undefined });
  }, [
    filters.action,
    filters.entityType,
    filters.actorId,
    filters.dateRange.from,
    filters.dateRange.to,
    debouncedSearch,
  ]);

  const baseParams = useMemo(
    () => ({
      orgId: orgId || '',
      entityType: filters.entityType || undefined,
      action: filters.action || undefined,
      actorId: filters.actorId || undefined,
      from: toIso(filters.dateRange?.from),
      to: toIso(filters.dateRange?.to),
      limit: AUDIT_PAGE_SIZE,
      cursor: cursorByPage[page],
    }),
    [orgId, filters.entityType, filters.action, filters.actorId, filters.dateRange, page, cursorByPage]
  );

  const listQuery = api.audit.list.useQuery(
    {
      ...baseParams,
      q: debouncedSearch ? undefined : filters.search || undefined,
    },
    {
      enabled: !!orgId && !debouncedSearch,
      keepPreviousData: false,
      refetchOnWindowFocus: false,
    }
  );

  const searchQuery = api.audit.search.useQuery(
    {
      ...baseParams,
      query: debouncedSearch || filters.search || '',
    },
    {
      enabled: !!orgId && !!debouncedSearch,
      keepPreviousData: false,
      refetchOnWindowFocus: false,
    }
  );

  const activeQuery = debouncedSearch ? searchQuery : listQuery;
  const logs = activeQuery.data?.logs ?? [];
  const hasMore = activeQuery.data?.has_more ?? false;
  const nextCursor = activeQuery.data?.next_cursor;

  // Prime cursor for next page
  useEffect(() => {
    if (!hasMore || !nextCursor) return;
    setCursorByPage((prev) => {
      if (prev[page + 1]) return prev;
      return { ...prev, [page + 1]: nextCursor };
    });
  }, [hasMore, nextCursor, page]);

  const prefetchCursorForPage = useCallback(
    async (targetPage: number) => {
      if (targetPage <= 1 || cursorByPage[targetPage]) return;
      let currentPage = 1;
      let currentCursor = cursorByPage[1];

      while (currentPage < targetPage) {
        const fetchParams = {
          orgId: orgId || '',
          entityType: filters.entityType || undefined,
          action: filters.action || undefined,
          actorId: filters.actorId || undefined,
          from: toIso(filters.dateRange?.from),
          to: toIso(filters.dateRange?.to),
          limit: AUDIT_PAGE_SIZE,
          cursor: currentCursor,
        };

        const res = debouncedSearch
          ? await utils.audit.search.fetch({
              ...fetchParams,
              query: debouncedSearch || filters.search || '',
            })
          : await utils.audit.list.fetch({
              ...fetchParams,
              q: filters.search || undefined,
            });

        const next = res?.next_cursor;
        if (!next) break;

        currentPage += 1;
        currentCursor = next;
        setCursorByPage((prev) => ({ ...prev, [currentPage]: currentCursor }));

        if (!res?.has_more) break;
      }
    },
    [cursorByPage, debouncedSearch, filters.action, filters.actorId, filters.dateRange, filters.entityType, filters.search, orgId, utils.audit.list, utils.audit.search]
  );

  const goToPage = async (targetPage: number) => {
    if (targetPage < 1) return;
    await prefetchCursorForPage(targetPage);
    setPage(targetPage);
  };

  const clearFilters = () => {
    setFilters({ dateRange: DEFAULT_RANGE });
  };

  const summaryQuery = api.audit.getActivitySummary.useQuery(
    {
      orgId: orgId || '',
      from: toIso(filters.dateRange?.from),
      to: toIso(filters.dateRange?.to),
      groupBy: pickGroupBy(filters.dateRange?.from, filters.dateRange?.to),
    },
    {
      enabled: !!orgId,
      refetchOnWindowFocus: false,
    }
  );

  const membersQuery = api.org.listMembers.useQuery(
    { orgId: orgId || '' },
    { enabled: !!orgId, staleTime: 5 * 60 * 1000 }
  );

  const exportMutation = api.audit.exportCsv.useMutation();

  const exportCsv = async (range?: DateRange) => {
    if (!orgId) return;
    const effectiveRange = range ?? filters.dateRange;
    const { csv } = await exportMutation.mutateAsync({
      orgId,
      q: filters.search || undefined,
      entityType: filters.entityType || undefined,
      action: filters.action || undefined,
      actorId: filters.actorId || undefined,
      from: toIso(effectiveRange?.from),
      to: toIso(effectiveRange?.to),
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${orgId}-${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return {
    filters,
    setFilters,
    logs,
    total: activeQuery.data?.total ?? 0,
    isLoading: activeQuery.isLoading || activeQuery.isFetching,
    page,
    hasMore,
    goToPage,
    clearFilters,
    refetch: activeQuery.refetch,
    summary: summaryQuery.data,
    summaryLoading: summaryQuery.isLoading,
    members: membersQuery.data ?? [],
    membersLoading: membersQuery.isLoading,
    exporting: exportMutation.isLoading,
    exportCsv,
    searchMode: !!debouncedSearch,
  };
}
