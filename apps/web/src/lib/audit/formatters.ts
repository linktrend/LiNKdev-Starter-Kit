import { format } from 'date-fns';

type Metadata = Record<string, unknown> | null | undefined;

const ACTION_COLOR_MAP: Record<string, string> = {
  created: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  updated: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  deleted: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
};

export const AUDIT_PAGE_SIZE = 50;

export function formatAuditAction(action: string): string {
  if (!action) return 'Unknown';
  return action
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatEntityType(entityType: string): string {
  if (!entityType) return 'Unknown';
  return entityType
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getActionColor(action: string): string {
  const normalized = action?.toLowerCase?.() ?? '';
  return ACTION_COLOR_MAP[normalized] ?? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';
}

export function formatAuditTimestamp(iso: string): string {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'PPpp');
  } catch {
    return iso;
  }
}

export function formatMetadata(metadata: Metadata): string {
  if (!metadata || Object.keys(metadata).length === 0) return '—';
  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return String(metadata);
  }
}

export function normalizeSearchTerms(query?: string): string[] {
  if (!query) return [];
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function highlightMatches(text: string, query?: string): Array<{ text: string; match: boolean }> {
  if (!query) return [{ text, match: false }];

  const terms = normalizeSearchTerms(query);
  if (terms.length === 0) return [{ text, match: false }];

  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');

  const segments: Array<{ text: string; match: boolean }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), match: false });
    }
    segments.push({ text: match[0], match: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), match: false });
  }

  return segments;
}

export function pickGroupBy(from?: Date, to?: Date): 'hour' | 'day' | 'week' {
  if (!from || !to) return 'day';
  const diffMs = to.getTime() - from.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  if (days <= 2) return 'hour';
  if (days <= 60) return 'day';
  return 'week';
}
