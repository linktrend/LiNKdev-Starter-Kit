import { TRPCError } from '@trpc/server';
import { PlanEntitlements } from '@/types/billing';
import { hasEntitlement } from './entitlements';

/**
 * Server-side entitlement assertion helper
 * Throws a typed error if the organization doesn't have the required entitlement
 */
export async function assertEntitlement(
  orgId: string,
  featureKey: keyof PlanEntitlements,
  supabase?: any
): Promise<void> {
  const hasAccess = await hasEntitlement(orgId, featureKey, supabase);
  
  if (!hasAccess) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Feature '${featureKey}' is not available in your current plan. Please upgrade to access this feature.`,
    });
  }
}

/**
 * Check if an organization has exceeded a specific limit
 * Throws a typed error if the limit is exceeded
 */
export async function assertWithinLimit(
  orgId: string,
  featureKey: keyof PlanEntitlements,
  currentCount: number,
  supabase?: any
): Promise<void> {
  const { hasExceededLimit } = await import('./entitlements');
  const hasExceeded = await hasExceededLimit(orgId, featureKey, currentCount, supabase);
  
  if (hasExceeded) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You have exceeded the limit for '${featureKey}'. Please upgrade your plan to increase limits.`,
    });
  }
}

/**
 * Get entitlement limits for an organization
 * Returns the current limits for display purposes
 */
export async function getEntitlementLimits(
  orgId: string,
  supabase?: any
): Promise<PlanEntitlements> {
  const { getEntitlementLimits: getLimits } = await import('./entitlements');
  return getLimits(orgId, supabase);
}
