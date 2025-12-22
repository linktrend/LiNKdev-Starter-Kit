'use client';

import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/lib/analytics/formatters';

interface AnalyticsMetricCardProps {
  title: string;
  value: number | string;
  trend?: {
    value: number; // percentage
    direction: 'up' | 'down' | 'neutral';
  };
  description?: string;
  className?: string;
  loading?: boolean;
}

export function AnalyticsMetricCard({
  title,
  value,
  trend,
  description,
  className,
  loading,
}: AnalyticsMetricCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend && (
          <div
            className={cn(
              'flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              trend.direction === 'up'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : trend.direction === 'down'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
            )}
          >
            {trend.direction === 'up' && <ArrowUpIcon className="mr-1 h-3 w-3" />}
            {trend.direction === 'down' && <ArrowDownIcon className="mr-1 h-3 w-3" />}
            {trend.direction === 'neutral' && <MinusIcon className="mr-1 h-3 w-3" />}
            {Math.abs(trend.value).toFixed(1)}%
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        ) : (
          <div className="text-2xl font-bold">
            {typeof value === 'number' ? formatNumber(value) : value}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
