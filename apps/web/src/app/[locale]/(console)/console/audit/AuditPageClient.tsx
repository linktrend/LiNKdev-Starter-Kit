'use client';

import { useMemo } from 'react';

import { AuditFilterPanel } from '@/components/console/AuditFilterPanel';
import { AuditLogTable } from '@/components/console/AuditLogTable';
import { AuditSummary } from '@/components/console/AuditSummary';
import { AuditExportDialog } from '@/components/console/AuditExportDialog';
import { useAuditLogs, type AuditFilters } from '@/hooks/useAuditLogs';
import { AUDIT_PAGE_SIZE } from '@/lib/audit/formatters';
import { useOrg } from '@/contexts/OrgContext';
import { Spinner } from '@/components/ui/spinner';

export function AuditPageClient() {
  const { currentOrgId, isLoading: orgLoading } = useOrg();
  const {
    filters,
    setFilters,
    clearFilters,
    logs,
    total,
    isLoading,
    page,
    hasMore,
    goToPage,
    summary,
    summaryLoading,
    members,
    membersLoading,
    exporting,
    exportCsv,
    searchMode,
  } = useAuditLogs({ orgId: currentOrgId ?? undefined });

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil((total || logs.length || AUDIT_PAGE_SIZE) / AUDIT_PAGE_SIZE)),
    [logs.length, total]
  );

  const updateFilters = (patch: Partial<AuditFilters>) =>
    setFilters((prev) => ({
      ...prev,
      ...patch,
    }));

  if (orgLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12 text-muted-foreground">
        <Spinner />
        <span className="ml-3">Loading organizations…</span>
      </div>
    );
  }

  if (!currentOrgId) {
    return (
      <div className="rounded-lg border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        You need an organization to view audit data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Real audit data with filtering, search, summary, export, and detail inspection.
          </p>
        </div>
        <AuditExportDialog
          currentRange={filters.dateRange}
          exporting={exporting}
          onExport={(range) => exportCsv(range)}
        />
      </div>

      <AuditSummary summary={summary} loading={summaryLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <AuditFilterPanel
            filters={filters}
            onChange={(next) => updateFilters(next)}
            onClear={clearFilters}
            members={members}
            loadingMembers={membersLoading}
          />
          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            Org-scoped and admin-only. Server-side pagination ({AUDIT_PAGE_SIZE}/page) with full-text search.
          </div>
        </div>

        <div className="lg:col-span-3">
          <AuditLogTable
            logs={logs}
            search={filters.search}
            orgId={currentOrgId}
            isLoading={isLoading}
            page={page}
            total={total}
            hasMore={hasMore}
            onPageChange={(p) => goToPage(Math.min(Math.max(p, 1), pageCount))}
          />
          {searchMode && (
            <p className="mt-2 text-xs text-muted-foreground">
              Showing search results. Clear search to return to standard listing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
