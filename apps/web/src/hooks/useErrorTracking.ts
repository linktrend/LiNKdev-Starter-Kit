'use client';

import { useEffect } from 'react';

import { logClientError, logUnhandledRejection } from '@/lib/errors/client-logger';
import type { Severity } from '@/app/actions/errors';

type UseErrorTrackingOptions = {
  orgId?: string;
  enabled?: boolean;
  severity?: Severity;
};

export function useErrorTracking(options: UseErrorTrackingOptions = {}) {
  const { orgId, enabled = true, severity = 'error' } = options;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleError = (event: ErrorEvent) => {
      // Avoid double logging from React error boundaries; dedupe handled inside logger
      logClientError(event.error ?? event.message, {
        orgId,
        severity,
        pageUrl: window.location.href,
        metadata: { filename: event.filename, lineno: event.lineno, colno: event.colno },
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      logUnhandledRejection(event, { orgId, severity, pageUrl: window.location.href });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [enabled, orgId, severity]);
}
