'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorDashboard, type ErrorStatsView } from '@/components/console/ErrorDashboard';
import { ErrorList, type ErrorListFilters } from '@/components/console/ErrorList';
import { ErrorDetails } from '@/components/console/ErrorDetails';
import type { ErrorLogRecord } from '@/app/actions/errors';
import { applyErrorFilters } from '@/lib/errors/filter';
import { useOrg } from '@/contexts/OrgContext';
import { Spinner } from '@/components/ui/spinner';

export default function ConsoleErrorsPage() {
  const { currentOrgId, isLoading } = useOrg();
  const [errors, setErrors] = useState<ErrorLogRecord[]>([]);
  const [stats, setStats] = useState<ErrorStatsView | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<ErrorLogRecord | null>(null);
  const [filters, setFilters] = useState<ErrorListFilters>({ severity: 'all', resolved: 'all', sort: 'newest' });
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadList = useCallback(async () => {
    if (!currentOrgId) return;
    setLoadingList(true);
    const params = new URLSearchParams({
      orgId: currentOrgId,
      sort: filters.sort ?? 'newest',
      limit: '50',
      offset: '0',
    });
    if (filters.search) params.set('search', filters.search);
    if (filters.severity && filters.severity !== 'all') params.set('severity', filters.severity);
    if (filters.resolved !== undefined && filters.resolved !== 'all') params.set('resolved', String(filters.resolved));

    const res = await fetch(`/api/errors/list?${params.toString()}`);
    const json = await res.json();
    if (json?.success) {
      setErrors(json.items ?? []);
    }
    setLoadingList(false);
  }, [currentOrgId, filters]);

  const loadStats = useCallback(async () => {
    if (!currentOrgId) return;
    setLoadingStats(true);
    const res = await fetch(`/api/errors/stats?orgId=${currentOrgId}`);
    const json = await res.json();
    if (json?.success) {
      setStats(json);
    }
    setLoadingStats(false);
  }, [currentOrgId]);

  const loadDetails = useCallback(
    async (id: string) => {
      if (!currentOrgId) return;
      setLoadingDetails(true);
      const res = await fetch(`/api/errors/${id}?orgId=${currentOrgId}`);
      const json = await res.json();
      if (json?.success) {
        setSelectedDetails(json.item);
      }
      setLoadingDetails(false);
    },
    [currentOrgId],
  );

  useEffect(() => {
    setSelectedId(null);
    setSelectedDetails(null);
    setErrors([]);
    setStats(undefined);
  }, [currentOrgId]);

  useEffect(() => {
    void loadList();
    void loadStats();
  }, [loadList, loadStats]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    void loadDetails(id);
  };

  const handleResolve = async (ids: string[]) => {
    if (!currentOrgId) return;
    await fetch('/api/errors/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: currentOrgId, ids }),
    });
    await Promise.all([loadList(), loadStats()]);
    if (selectedId && ids.includes(selectedId)) {
      setSelectedDetails((prev) => (prev ? { ...prev, resolved: true } : prev));
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!currentOrgId) return;
    await fetch('/api/errors/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: currentOrgId, ids }),
    });
    await Promise.all([loadList(), loadStats()]);
    if (selectedId && ids.includes(selectedId)) {
      setSelectedId(null);
      setSelectedDetails(null);
    }
  };

  const filtered = useMemo(() => applyErrorFilters(errors, filters), [errors, filters]);

  const similar = useMemo(() => {
    if (!selectedDetails?.grouping_hash) return [];
    return errors.filter((e) => e.grouping_hash === selectedDetails.grouping_hash && e.id !== selectedDetails.id);
  }, [errors, selectedDetails]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Spinner />
          <span>Loading organizations…</span>
        </div>
      </div>
    );
  }

  if (!currentOrgId) {
    return (
      <div className="rounded-lg border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        You need an organization to view error data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ErrorDashboard stats={stats} loading={loadingStats} onRefresh={() => { void loadStats(); void loadList(); }} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ErrorList
            errors={filtered}
            loading={loadingList}
            selectedId={selectedId}
            filters={filters}
            onChangeFilters={setFilters}
            onSelect={handleSelect}
            onResolve={handleResolve}
            onDelete={handleDelete}
          />
        </div>
        <div className="xl:col-span-1">
          <ErrorDetails
            error={selectedDetails}
            similar={similar}
            loading={loadingDetails}
            onResolve={handleResolve}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
