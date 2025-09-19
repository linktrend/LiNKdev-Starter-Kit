import { BillingPlan, PlanEntitlements } from '@/types/billing';
import { getPlanById } from '@/config/plans';

/**
 * Check if an organization has a specific entitlement
 */
export async function hasEntitlement(
  orgId: string,
  featureKey: keyof PlanEntitlements,
  supabase?: any
): Promise<boolean> {
  try {
    // Get organization's current plan
    const plan = await getCurrentPlan(orgId, supabase);
    if (!plan) return false;

    const entitlement = plan.entitlements[featureKey];
    
    // Handle unlimited (-1) or boolean entitlements
    if (typeof entitlement === 'boolean') {
      return entitlement;
    }
    
    if (typeof entitlement === 'number') {
      return entitlement === -1; // -1 means unlimited
    }
    
    return false;
  } catch (error) {
    console.error('Error checking entitlement:', error);
    return false;
  }
}

/**
 * Check if an organization has exceeded a specific limit
 */
export async function hasExceededLimit(
  orgId: string,
  featureKey: keyof PlanEntitlements,
  currentCount: number,
  supabase?: any
): Promise<boolean> {
  try {
    const plan = await getCurrentPlan(orgId, supabase);
    if (!plan) return true; // No plan = exceeded

    const limit = plan.entitlements[featureKey];
    
    if (typeof limit === 'number') {
      return limit !== -1 && currentCount >= limit; // -1 means unlimited
    }
    
    return false;
  } catch (error) {
    console.error('Error checking limit:', error);
    return true; // Error = assume exceeded
  }
}

/**
 * Get the current plan for an organization
 */
export async function getCurrentPlan(
  orgId: string,
  supabase?: any
): Promise<BillingPlan | null> {
  try {
    if (!supabase) {
      // Offline mode - return free plan
      return getPlanById('free') || null;
    }

    const { data: subscription, error } = await supabase
      .from('org_subscriptions')
      .select('plan')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      return getPlanById('free') || null;
    }

    return getPlanById(subscription.plan) || getPlanById('free') || null;
  } catch (error) {
    console.error('Error getting current plan:', error);
    return getPlanById('free') || null;
  }
}

/**
 * Get entitlement limits for an organization
 */
export async function getEntitlementLimits(
  orgId: string,
  supabase?: any
): Promise<PlanEntitlements> {
  const plan = await getCurrentPlan(orgId, supabase);
  return plan?.entitlements || getPlanById('free')?.entitlements || {};
}

/**
 * Check if a plan supports a specific feature
 */
export function planSupportsFeature(plan: BillingPlan, featureKey: keyof PlanEntitlements): boolean {
  const entitlement = plan.entitlements[featureKey];
  
  if (typeof entitlement === 'boolean') {
    return entitlement;
  }
  
  if (typeof entitlement === 'number') {
    return entitlement > 0 || entitlement === -1; // -1 means unlimited
  }
  
  return false;
}

/**
 * Get usage statistics for an organization (for display in UI)
 */
export async function getUsageStats(
  orgId: string,
  supabase?: any
): Promise<Record<string, { current: number; limit: number | string; exceeded: boolean }>> {
  try {
    if (!supabase) {
      // Offline mode - return mock data
      return {
        organizations: { current: 1, limit: 1, exceeded: false },
        members: { current: 2, limit: 3, exceeded: false },
        records: { current: 15, limit: 100, exceeded: false },
        reminders: { current: 5, limit: 50, exceeded: false },
      };
    }

    const limits = await getEntitlementLimits(orgId, supabase);
    
    // Get current counts (simplified - in real implementation, you'd query actual data)
    const stats: Record<string, { current: number; limit: number | string; exceeded: boolean }> = {};
    
    // This is a simplified version - in practice, you'd query actual counts
    Object.entries(limits).forEach(([key, limit]) => {
      if (typeof limit === 'number') {
        const current = 0; // TODO: Implement actual counting logic
        stats[key] = {
          current,
          limit: limit === -1 ? 'unlimited' : limit,
          exceeded: limit !== -1 && current >= limit,
        };
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return {};
  }
}
