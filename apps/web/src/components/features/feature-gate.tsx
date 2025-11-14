'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useFeatureAccess } from '@/lib/features/client'

interface FeatureGateProps {
  featureKey: string
  orgId?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgrade?: boolean
}

export function FeatureGate({
  featureKey,
  orgId,
  children,
  fallback,
  showUpgrade = true,
}: FeatureGateProps) {
  const { data: access, isLoading } = useFeatureAccess(featureKey, orgId)

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (!access?.enabled) {
    if (fallback) return <>{fallback}</>

    if (showUpgrade) {
      return (
        <div className="rounded-lg border border-muted bg-muted/30 p-6 text-center">
          <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">This feature is not available on your plan</h3>
          <p className="mb-4 text-sm text-muted-foreground">Upgrade to access this feature</p>
          <Button asChild>
            <Link href="/en/billing">Upgrade Plan</Link>
          </Button>
        </div>
      )
    }

    return null
  }

  return <>{children}</>
}
