/**
 * Mock feature flags store for development and testing
 * In production, this would be replaced with a database or remote config service
 */

import type { FeatureFlagName, FeatureFlag } from '@starter/types';

/**
 * In-memory store for feature flags organized by organization ID
 */
const featureFlagsStore = new Map<string, Map<FeatureFlagName, boolean>>();

/**
 * Default feature flag values for all organizations
 * These can be overridden per organization
 */
const defaultFlags: Record<FeatureFlagName, boolean> = {
  RECORDS_FEATURE_ENABLED: true,
  BILLING_FEATURE_ENABLED: true,
  AUDIT_FEATURE_ENABLED: true,
  SCHEDULING_FEATURE_ENABLED: true,
  ATTACHMENTS_FEATURE_ENABLED: true,
  ADVANCED_ANALYTICS_ENABLED: false,
  BETA_FEATURES_ENABLED: false,
};

/**
 * Initialize default flags for an organization if they don't exist
 */
function initializeOrgFlags(orgId: string): void {
  if (!featureFlagsStore.has(orgId)) {
    const orgFlags = new Map<FeatureFlagName, boolean>();
    Object.entries(defaultFlags).forEach(([flagName, value]) => {
      orgFlags.set(flagName as FeatureFlagName, value);
    });
    featureFlagsStore.set(orgId, orgFlags);
  }
}

/**
 * Get a feature flag value for a specific organization
 * @param orgId - Organization ID
 * @param flagName - Name of the feature flag
 * @returns Boolean value of the feature flag
 */
export function getFlag(orgId: string, flagName: FeatureFlagName): boolean {
  initializeOrgFlags(orgId);
  const orgFlags = featureFlagsStore.get(orgId);
  return orgFlags?.get(flagName) ?? defaultFlags[flagName];
}

/**
 * Set a feature flag value for a specific organization
 * @param orgId - Organization ID
 * @param flagName - Name of the feature flag
 * @param isEnabled - Whether the flag is enabled
 */
export function setFlag(orgId: string, flagName: FeatureFlagName, isEnabled: boolean): void {
  initializeOrgFlags(orgId);
  const orgFlags = featureFlagsStore.get(orgId);
  orgFlags?.set(flagName, isEnabled);
}

/**
 * Get all feature flags for an organization
 * @param orgId - Organization ID
 * @returns Array of feature flags
 */
export function getAllFlags(orgId: string): FeatureFlag[] {
  initializeOrgFlags(orgId);
  const orgFlags = featureFlagsStore.get(orgId);
  if (!orgFlags) return [];

  return Array.from(orgFlags.entries()).map(([name, isEnabled]) => ({
    name,
    isEnabled,
    orgId,
  }));
}

/**
 * Reset all flags for an organization to defaults
 * @param orgId - Organization ID
 */
export function resetOrgFlags(orgId: string): void {
  featureFlagsStore.delete(orgId);
  initializeOrgFlags(orgId);
}

/**
 * Clear all feature flags (useful for testing)
 */
export function clearAllFlags(): void {
  featureFlagsStore.clear();
}
