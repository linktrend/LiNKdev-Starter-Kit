'use client';

import { Clock } from 'lucide-react';
import { useRateLimitCountdown } from '@/lib/auth/rate-limit';

interface RateLimitDisplayProps {
  retryAfter: number; // seconds
}

export function RateLimitDisplay({ retryAfter }: RateLimitDisplayProps) {
  const { secondsRemaining, isComplete, formatTime } = useRateLimitCountdown(retryAfter);

  if (isComplete) return null;

  return (
    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
            Too many attempts
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Please wait {formatTime()} before trying again.
          </p>
        </div>
      </div>
    </div>
  );
}
