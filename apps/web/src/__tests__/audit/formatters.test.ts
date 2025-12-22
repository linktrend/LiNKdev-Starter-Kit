import { describe, expect, it } from 'vitest';

import {
  AUDIT_PAGE_SIZE,
  formatAuditAction,
  formatAuditTimestamp,
  formatEntityType,
  formatMetadata,
  getActionColor,
  highlightMatches,
  normalizeSearchTerms,
  pickGroupBy,
} from '@/lib/audit/formatters';

describe('audit formatters', () => {
  it('formats actions and entity types', () => {
    expect(formatAuditAction('role_changed')).toBe('Role Changed');
    expect(formatAuditAction('')).toBe('Unknown');
    expect(formatEntityType('subscription')).toBe('Subscription');
  });

  it('returns color classes per action', () => {
    expect(getActionColor('created')).toContain('emerald');
    expect(getActionColor('deleted')).toContain('rose');
    expect(getActionColor('other')).toContain('zinc');
  });

  it('formats timestamps gracefully', () => {
    const iso = '2024-01-02T03:04:05.000Z';
    expect(formatAuditTimestamp(iso)).toContain('2024');
    expect(formatAuditTimestamp('')).toBe('—');
  });

  it('stringifies metadata safely', () => {
    expect(formatMetadata({ a: 1 })).toContain('"a": 1');
    expect(formatMetadata({})).toBe('—');
    expect(formatMetadata(undefined)).toBe('—');
  });

  it('normalizes and highlights search terms', () => {
    expect(normalizeSearchTerms(' Foo  Bar ')).toEqual(['foo', 'bar']);
    const segments = highlightMatches('foo bar baz', 'bar baz');
    const matches = segments.filter((s) => s.match).map((s) => s.text);
    expect(matches).toEqual(['bar', 'baz']);
  });

  it('picks sensible groupBy buckets', () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 61 * 24 * 60 * 60 * 1000);
    expect(pickGroupBy(oneDayAgo, now)).toBe('hour');
    expect(pickGroupBy(twoMonthsAgo, now)).toBe('week');
  });

  it('exposes the audit page size', () => {
    expect(AUDIT_PAGE_SIZE).toBe(50);
  });
});
