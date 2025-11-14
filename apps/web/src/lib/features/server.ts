import { cache } from 'react'

import { createClient, requireAuth } from '@/lib/auth/server'

export interface FeatureLimit {
  limit?: number
  unlimited?: boolean
  enabled?: boolean
}

/**
 * Check if user has access to a feature
 */
export const checkFeatureAccess = cache(async (featureKey: string, orgId?: string): Promise<FeatureLimit> => {
  const user = await requireAuth()
  const supabase = createClient() as any

  const { data, error } = await supabase.rpc('check_feature_access', {
    p_user_id: user.id,
    p_feature_key: featureKey,
    p_org_id: orgId || null,
  })

  if (error) {
    console.error('Error checking feature access:', error)
    // Default to free tier on error
    return { limit: 0, enabled: false }
  }

  return (data as FeatureLimit) || { limit: 0, enabled: false }
})

/**
 * Require a feature to be enabled
 */
export async function requireFeature(featureKey: string, orgId?: string) {
  const access = await checkFeatureAccess(featureKey, orgId)

  if (!access.enabled) {
    throw new Error(`Feature '${featureKey}' is not available on your plan`)
  }

  return access
}

/**
 * Check if usage is within limits
 */
export async function checkUsageLimit(
  featureKey: string,
  currentUsage: number,
  orgId?: string
): Promise<{ allowed: boolean; limit: number; remaining: number }> {
  const access = await checkFeatureAccess(featureKey, orgId)

  if (access.unlimited) {
    return { allowed: true, limit: -1, remaining: -1 }
  }

  const limit = access.limit || 0
  const remaining = Math.max(0, limit - currentUsage)
  const allowed = currentUsage < limit

  return { allowed, limit, remaining }
}

/**
 * Get user's current plan
 */
export const getUserPlan = cache(async (orgId?: string): Promise<string> => {
  const user = await requireAuth()
  const supabase = createClient() as any

  if (orgId) {
    const { data: subscription } = await supabase
      .from('org_subscriptions')
      .select('plan_name, status')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .maybeSingle()

    return (subscription as any)?.plan_name || 'free'
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_name, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  return (subscription as any)?.plan_name || 'free'
})

/**
 * Get all plan features
 */
export const getPlanFeatures = cache(async (planName: string) => {
  const supabase = createClient() as any

  const { data, error } = await supabase
    .from('plan_features')
    .select('feature_key, feature_value')
    .eq('plan_name', planName)

  if (error) {
    console.error('Error fetching plan features:', error)
    return []
  }

  return data || []
})
