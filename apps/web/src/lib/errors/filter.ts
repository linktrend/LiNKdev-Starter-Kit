import type { ErrorLogRecord, Severity } from '@/app/actions/errors';
import type { ErrorListFilters } from '@/components/console/ErrorList';

function matchesSeverity(item: ErrorLogRecord, severity?: Severity | 'all') {
  if (!severity || severity === 'all') return true;
  return item.severity === severity;
}

function matchesResolved(item: ErrorLogRecord, resolved?: boolean | 'all') {
  if (resolved === undefined || resolved === 'all') return true;
  return item.resolved === resolved;
}

function matchesSearch(item: ErrorLogRecord, search?: string) {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    item.message?.toLowerCase().includes(q) ||
    item.stack_trace?.toLowerCase().includes(q) ||
    item.page_url?.toLowerCase().includes(q) ||
    item.id.toLowerCase().includes(q)
  );
}

function sortErrors(items: ErrorLogRecord[], sort?: ErrorListFilters['sort']) {
  const clone = [...items];
  switch (sort) {
    case 'oldest':
      return clone.sort((a, b) => new Date(a.last_seen).getTime() - new Date(b.last_seen).getTime());
    case 'severity':
      return clone.sort((a, b) => severityRank(b.severity as Severity) - severityRank(a.severity as Severity));
    case 'occurrences':
      return clone.sort((a, b) => (b.occurrence_count ?? 0) - (a.occurrence_count ?? 0));
    case 'newest':
    default:
      return clone.sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());
  }
}

const rankMap: Record<Severity, number> = {
  critical: 4,
  error: 3,
  warning: 2,
  info: 1,
};

function severityRank(sev: Severity) {
  return rankMap[sev] ?? 0;
}

export function applyErrorFilters(
  items: ErrorLogRecord[],
  filters: ErrorListFilters,
): ErrorLogRecord[] {
  const filtered = items.filter(
    (item) =>
      matchesSeverity(item, filters.severity) &&
      matchesResolved(item, filters.resolved) &&
      matchesSearch(item, filters.search),
  );

  return sortErrors(filtered, filters.sort);
}
