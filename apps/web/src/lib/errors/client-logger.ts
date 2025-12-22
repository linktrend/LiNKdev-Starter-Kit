'use client';

import { logError, type Severity } from '@/app/actions/errors';
import { env } from '@/env';

type ClientErrorMetadata = Record<string, unknown>;

const recentErrors = new Map<string, number>();
const DEDUP_MS = 5_000;

function toError(input: unknown): Error {
  if (input instanceof Error) return input;
  if (typeof input === 'string') return new Error(input);
  try {
    return new Error(JSON.stringify(input));
  } catch {
    return new Error('Unknown error');
  }
}

function shouldDedup(key: string) {
  const now = Date.now();
  const last = recentErrors.get(key);
  if (last && now - last < DEDUP_MS) return true;
  recentErrors.set(key, now);
  return false;
}

export interface LogClientErrorOptions {
  orgId?: string;
  severity?: Severity;
  pageUrl?: string;
  componentStack?: string;
  metadata?: ClientErrorMetadata;
}

export async function logClientError(error: unknown, options: LogClientErrorOptions = {}) {
  if (process.env.TEMPLATE_OFFLINE === '1') return { success: false, skipped: true };

  const err = toError(error);
  const key = `${err.message}|${options.pageUrl ?? ''}`;
  if (shouldDedup(key)) {
    return { success: false, skipped: true };
  }

  const orgId = options.orgId ?? env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  if (!orgId) {
    console.warn('logClientError skipped: missing orgId');
    return { success: false, error: 'missing_org' as const };
  }

  const pageUrl = options.pageUrl ?? (typeof window !== 'undefined' ? window.location.href : undefined);
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;

  try {
    return await logError({
      orgId,
      message: err.message || 'Unknown client error',
      stackTrace: err.stack ?? undefined,
      componentStack: options.componentStack,
      severity: options.severity ?? 'error',
      pageUrl,
      userAgent,
      metadata: options.metadata,
    });
  } catch (actionError) {
    console.error('logClientError failed', actionError);
    return { success: false, error: 'action_failed' as const };
  }
}

export async function logUnhandledRejection(event: PromiseRejectionEvent, options?: LogClientErrorOptions) {
  const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  return logClientError(reason, { ...options, severity: options?.severity ?? 'error' });
}
