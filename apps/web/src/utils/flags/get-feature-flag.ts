/**
 * Server-side utility for checking feature flags
 */

import type { FeatureFlagName } from '@starter/types';
import { featureFlagsService } from '@/server/services/feature-flags.service';

/**
 * Get a feature flag value for the current organization
 * @param orgId - Organization ID
 * @param flagName - Name of the feature flag
 * @returns Boolean value indicating if the feature is enabled
 */
export async function getFeatureFlag(orgId: string, flagName: FeatureFlagName): Promise<boolean> {
  const result = await featureFlagsService.getFeatureFlag(orgId, flagName);
  return result.isEnabled;
}

/**
 * Check if a feature is enabled for the current organization
 * @param orgId - Organization ID
 * @param flagName - Name of the feature flag
 * @returns Boolean value indicating if the feature is enabled
 */
export async function isFeatureEnabled(orgId: string, flagName: FeatureFlagName): Promise<boolean> {
  return await getFeatureFlag(orgId, flagName);
}

/**
 * Check if a feature is disabled for the current organization
 * @param orgId - Organization ID
 * @param flagName - Name of the feature flag
 * @returns Boolean value indicating if the feature is disabled
 */
export async function isFeatureDisabled(orgId: string, flagName: FeatureFlagName): Promise<boolean> {
  return !(await getFeatureFlag(orgId, flagName));
}
