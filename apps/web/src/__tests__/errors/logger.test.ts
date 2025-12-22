import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  computeGroupingHash,
  sanitizeStackTrace,
  sanitizeMetadata,
  checkRateLimit,
  __resetRateLimits,
} from '@/lib/errors/utils';
import { applyErrorFilters } from '@/lib/errors/filter';
import { logClientError } from '@/lib/errors/client-logger';

vi.mock('@/app/actions/errors', async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    logError: vi.fn(async () => ({ success: true })),
  };
});

const mockNow = 1_700_000_000_000;

describe('error utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
    __resetRateLimits();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('computeGroupingHash is deterministic and changes when input changes', () => {
    const a1 = computeGroupingHash('msg', 'stack');
    const a2 = computeGroupingHash('msg', 'stack');
    const b = computeGroupingHash('msg2', 'stack');

    expect(a1).toBe(a2);
    expect(a1).not.toBe(b);
    expect(a1).toHaveLength(24);
  });

  it('sanitizeStackTrace redacts absolute paths', () => {
    const input = 'Error: boom at file:///Users/me/project/src/file.ts:10\n    at /Users/me/project/app/page.tsx:12';
    const sanitized = sanitizeStackTrace(input);
    expect(sanitized).not.toContain('/Users/me/project');
    expect(sanitized).toContain('[redacted]');
  });

  it('sanitizeMetadata redacts secret-like keys and values', () => {
    const meta = {
      token: 'super-secret',
      nested: {
        password: 'p@ss',
        safe: 'ok',
      },
    };
    const sanitized = sanitizeMetadata(meta);
    expect(sanitized.token).toBe('[redacted]');
    // @ts-expect-error testing nested
    expect(sanitized.nested.password).toBe('[redacted]');
    // @ts-expect-error testing nested
    expect(sanitized.nested.safe).toBe('ok');
  });

  it('checkRateLimit enforces window and max', () => {
    const key = 'org:hash';
    expect(checkRateLimit(key, 1000, 2).allowed).toBe(true);
    expect(checkRateLimit(key, 1000, 2).allowed).toBe(true);
    const third = checkRateLimit(key, 1000, 2);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterMs).toBeGreaterThan(0);
  });

  it('logClientError dedupes rapid repeats', async () => {
    const { logError } = await import('@/app/actions/errors');
    const spy = logError as unknown as ReturnType<typeof vi.fn>;

    await logClientError(new Error('boom'), { orgId: 'org-1', pageUrl: 'https://x.test' });
    await logClientError(new Error('boom'), { orgId: 'org-1', pageUrl: 'https://x.test' });

    expect(spy).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(6000);
    await logClientError(new Error('boom'), { orgId: 'org-1', pageUrl: 'https://x.test' });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('applyErrorFilters filters by severity, resolved, search, and sorts', () => {
    const items = [
      {
        id: '1',
        org_id: 'o',
        user_id: null,
        actor_id: null,
        action: 'error.logged',
        entity_type: 'error',
        entity_id: 'g1',
        severity: 'critical',
        message: 'Crash on dashboard',
        stack_trace: 'at Dashboard',
        component_stack: null,
        page_url: '/dashboard',
        user_agent: 'ua',
        metadata: {},
        resolved: false,
        occurrence_count: 5,
        first_seen: '2024-01-01T00:00:00Z',
        last_seen: '2024-01-02T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        grouping_hash: 'g1',
      },
      {
        id: '2',
        org_id: 'o',
        user_id: null,
        actor_id: null,
        action: 'error.logged',
        entity_type: 'error',
        entity_id: 'g2',
        severity: 'warning',
        message: 'Minor issue',
        stack_trace: 'at minor',
        component_stack: null,
        page_url: '/profile',
        user_agent: 'ua',
        metadata: {},
        resolved: true,
        occurrence_count: 1,
        first_seen: '2024-01-01T00:00:00Z',
        last_seen: '2024-01-03T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        grouping_hash: 'g2',
      },
    ];

    const filtered = applyErrorFilters(items, {
      severity: 'critical',
      resolved: false,
      search: 'Crash',
      sort: 'occurrences',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });
});
