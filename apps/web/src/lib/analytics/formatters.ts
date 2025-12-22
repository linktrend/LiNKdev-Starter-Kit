import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns';

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = seconds / 60;
  return `${minutes.toFixed(1)}m`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getDateRangeLabel(from: Date, to: Date): string {
  return `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`;
}

export const PRESETS = {
  LAST_7_DAYS: {
    label: 'Last 7 Days',
    getRange: () => {
      const to = new Date();
      const from = subDays(to, 7);
      return { from, to };
    },
  },
  LAST_30_DAYS: {
    label: 'Last 30 Days',
    getRange: () => {
      const to = new Date();
      const from = subDays(to, 30);
      return { from, to };
    },
  },
  LAST_90_DAYS: {
    label: 'Last 90 Days',
    getRange: () => {
      const to = new Date();
      const from = subDays(to, 90);
      return { from, to };
    },
  },
  THIS_MONTH: {
    label: 'This Month',
    getRange: () => {
      const now = new Date();
      return { from: startOfMonth(now), to: endOfMonth(now) };
    },
  },
  LAST_MONTH: {
    label: 'Last Month',
    getRange: () => {
      const now = new Date();
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    },
  },
};
