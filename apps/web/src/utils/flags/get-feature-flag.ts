/**
 * Server-side utility for checking feature flags
 */

import type { FeatureFlagName } from '@starter/types';
import { getFlag } from '@/server/mocks/feature-flags.store';

/**
 * Get a feature flag value for the current organization
 * @param orgId - Organization ID
 * @param flagName - Name of the feature flag
 * @returns Boolean value indicating if the feature is enabled
 */
export function getFeatureFlag(orgId: string, flagName: FeatureFlagName): boolean {
  return getFlag(orgId, flagName);
}

/**
 * Check if a feature is enabled for the current organization
 * @param orgId - Organization ID
 * @param flagName - Name of the feature flag
 * @returns Boolean value indicating if the feature is enabled
 */
export function isFeatureEnabled(orgId: string, flagName: FeatureFlagName): boolean {
  return getFeatureFlag(orgId, flagName);
}

/**
 * Check if a feature is disabled for the current organization
 * @param orgId - Organization ID
 * @param flagName - Name of the feature flag
 * @returns Boolean value indicating if the feature is disabled
 */
export function isFeatureDisabled(orgId: string, flagName: FeatureFlagName): boolean {
  return !getFeatureFlag(orgId, flagName);
}
