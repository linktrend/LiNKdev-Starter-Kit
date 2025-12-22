'use client';

import { useErrorTracking } from '@/hooks/useErrorTracking';

export function ErrorTracker({ orgId }: { orgId?: string }) {
  useErrorTracking({ orgId, severity: 'error' });
  return null;
}
