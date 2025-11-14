'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useUsageLimit } from '@/lib/features/client'

interface UsageIndicatorProps {
  featureKey: string
  currentUsage: number
  orgId?: string
  label: string
}

export function UsageIndicator({ featureKey, currentUsage, orgId, label }: UsageIndicatorProps) {
  const { data: usage, isLoading } = useUsageLimit(featureKey, currentUsage, orgId)

  if (isLoading || !usage) return null

  const { allowed, limit, remaining } = usage

  if (limit === -1) {
    return (
      <div className="text-sm text-muted-foreground">
        {label}: {currentUsage} (Unlimited)
      </div>
    )
  }

  const percentage = (currentUsage / limit) * 100
  const isNearLimit = percentage >= 80

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className={isNearLimit ? 'font-semibold text-destructive' : ''}>
          {currentUsage} / {limit}
        </span>
      </div>

      <Progress value={percentage} className="h-2" />

      {isNearLimit && (
        <Alert variant={!allowed ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{!allowed ? 'Limit Reached' : 'Approaching Limit'}</AlertTitle>
          <AlertDescription>
            {!allowed
              ? `You've reached your ${label.toLowerCase()} limit. `
              : `You have ${remaining} ${label.toLowerCase()} remaining. `}
            <Link href="/en/billing" className="underline">
              Upgrade your plan
            </Link>{' '}
            to increase limits.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
