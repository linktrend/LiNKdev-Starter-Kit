/**
 * Feature flags service interface for API package
 * This is a simplified version that doesn't depend on Supabase directly
 */

import type { FeatureFlagName, FeatureFlagResponse } from '@starter/types';

/**
 * Feature flags service interface
 */
export interface FeatureFlagsService {
  getFeatureFlag(orgId: string, flagName: FeatureFlagName): Promise<FeatureFlagResponse>;
  getAllFeatureFlags(orgId: string): Promise<FeatureFlagResponse[]>;
}

/**
 * Mock feature flags service implementation
 * This provides default values when the full service is not available
 */
export class MockFeatureFlagsService implements FeatureFlagsService {
  async getFeatureFlag(_orgId: string, flagName: FeatureFlagName): Promise<FeatureFlagResponse> {
    // Return default values for all feature flags
    const defaultFlags: Record<FeatureFlagName, boolean> = {
      RECORDS_FEATURE_ENABLED: true,
      BILLING_FEATURE_ENABLED: false,
      AUDIT_FEATURE_ENABLED: true,
      SCHEDULING_FEATURE_ENABLED: false,
      ATTACHMENTS_FEATURE_ENABLED: false,
      ADVANCED_ANALYTICS_ENABLED: false,
      BETA_FEATURES_ENABLED: false,
    };

    return {
      name: flagName,
      isEnabled: defaultFlags[flagName] || false,
    };
  }

  async getAllFeatureFlags(_orgId: string): Promise<FeatureFlagResponse[]> {
    const flagNames: FeatureFlagName[] = [
      'RECORDS_FEATURE_ENABLED',
      'BILLING_FEATURE_ENABLED',
      'AUDIT_FEATURE_ENABLED',
      'SCHEDULING_FEATURE_ENABLED',
      'ATTACHMENTS_FEATURE_ENABLED',
      'ADVANCED_ANALYTICS_ENABLED',
      'BETA_FEATURES_ENABLED',
    ];

    return Promise.all(
      flagNames.map(name => this.getFeatureFlag(_orgId, name))
    );
  }
}

/**
 * Singleton instance of the feature flags service
 */
export const featureFlagsService = new MockFeatureFlagsService();
