/**
 * Feature flag types for the LTM Starter Kit
 */

/**
 * Union type of all available feature flag names
 */
export type FeatureFlagName = 
  | 'RECORDS_FEATURE_ENABLED'
  | 'BILLING_FEATURE_ENABLED'
  | 'AUDIT_FEATURE_ENABLED'
  | 'SCHEDULING_FEATURE_ENABLED'
  | 'ATTACHMENTS_FEATURE_ENABLED'
  | 'ADVANCED_ANALYTICS_ENABLED'
  | 'BETA_FEATURES_ENABLED';

/**
 * Feature flag value type (currently only boolean)
 */
export type FeatureFlagValue = boolean;

/**
 * Feature flag configuration for an organization
 */
export interface FeatureFlag {
  name: FeatureFlagName;
  isEnabled: boolean;
  orgId: string;
  description?: string;
}

/**
 * Input for getting a feature flag status
 */
export interface GetFeatureFlagInput {
  orgId: string;
  name: FeatureFlagName;
}

/**
 * Response from feature flag API
 */
export interface FeatureFlagResponse {
  name: FeatureFlagName;
  isEnabled: boolean;
}
