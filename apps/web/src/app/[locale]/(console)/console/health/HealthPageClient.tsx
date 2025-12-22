'use client';

import { HealthConsoleClient } from '@/components/console/HealthConsoleClient';
import { Spinner } from '@/components/ui/spinner';
import { useOrg } from '@/contexts/OrgContext';

export function HealthPageClient() {
  const { currentOrgId, isLoading } = useOrg();

  if (isLoading) {
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
        Select an organization to view console health.
      </div>
    );
  }

  return <HealthConsoleClient />;
}
