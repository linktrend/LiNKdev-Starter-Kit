'use client'

import { useQuery } from '@tanstack/react-query'

export interface FeatureAccess {
  enabled: boolean
  limit?: number
  unlimited?: boolean
}

/**
 * Client-side feature check hook (for UI purposes only, NOT security)
 */
export function useFeatureAccess(featureKey: string, orgId?: string) {
  return useQuery({
    queryKey: ['feature-access', featureKey, orgId],
    queryFn: async () => {
      const params = new URLSearchParams({ feature: featureKey })
      if (orgId) params.append('orgId', orgId)

      const res = await fetch(`/api/features/check?${params}`)
      if (!res.ok) throw new Error('Failed to check feature access')

      const data = await res.json()
      return data.data as FeatureAccess
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Client-side usage check hook
 */
export function useUsageLimit(featureKey: string, currentUsage: number, orgId?: string) {
  return useQuery({
    queryKey: ['usage-limit', featureKey, currentUsage, orgId],
    queryFn: async () => {
      const params = new URLSearchParams({
        feature: featureKey,
        usage: String(currentUsage),
      })
      if (orgId) params.append('orgId', orgId)

      const res = await fetch(`/api/features/usage?${params}`)
      if (!res.ok) throw new Error('Failed to check usage limit')

      const data = await res.json()
      return data.data as {
        allowed: boolean
        limit: number
        remaining: number
      }
    },
    staleTime: 1 * 60 * 1000,
  })
}
