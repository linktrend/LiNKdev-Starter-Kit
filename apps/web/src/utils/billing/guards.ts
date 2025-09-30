import { TRPCError } from '@trpc/server';
import { PlanEntitlements, FeatureFlagName } from '@starter/types';
import { hasEntitlement } from './entitlements';
import { getFeatureFlag } from '../flags/get-feature-flag';

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
 * Server-side entitlement assertion helper with feature flag support
 * Throws a typed error if the organization doesn't have the required entitlement or feature flag
 */
export async function assertEntitlementWithFlag(
  orgId: string,
  featureKey: keyof PlanEntitlements,
  featureFlag?: FeatureFlagName,
  supabase?: any
): Promise<void> {
  // Check feature flag first if provided
  if (featureFlag && !getFeatureFlag(orgId, featureFlag)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Feature '${featureKey}' is currently disabled. Please contact support if you believe this is an error.`,
    });
  }

  // Check entitlement
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

/**
 * Check if an organization has access to a feature (entitlement + feature flag)
 * @param orgId - Organization ID
 * @param featureKey - Feature key to check
 * @param featureFlag - Optional feature flag to check
 * @param supabase - Supabase client
 * @returns Object with access status and reason
 */
export async function checkEntitlement(
  orgId: string,
  featureKey: keyof PlanEntitlements,
  featureFlag?: FeatureFlagName,
  supabase?: any
): Promise<{
  hasAccess: boolean;
  reason?: string;
  isFeatureFlagDisabled?: boolean;
  isEntitlementMissing?: boolean;
}> {
  // Check feature flag first if provided
  if (featureFlag && !getFeatureFlag(orgId, featureFlag)) {
    return {
      hasAccess: false,
      reason: `Feature '${featureKey}' is currently disabled`,
      isFeatureFlagDisabled: true,
    };
  }

  // Check entitlement
  const hasEntitlementAccess = await hasEntitlement(orgId, featureKey, supabase);
  
  if (!hasEntitlementAccess) {
    return {
      hasAccess: false,
      reason: `Feature '${featureKey}' is not available in your current plan`,
      isEntitlementMissing: true,
    };
  }

  return {
    hasAccess: true,
  };
}
