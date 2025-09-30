/**
 * Client-side hook for checking feature flags
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/trpc/react';
import type { FeatureFlagName } from '@starter/types';

interface UseFeatureFlagOptions {
  orgId?: string;
  flagName: FeatureFlagName;
  enabled?: boolean;
}

interface FeatureFlagResult {
  isEnabled: boolean;
  isLoading: boolean;
  error?: Error;
}

/**
 * Hook to check if a feature flag is enabled for the current organization
 * @param options - Configuration object
 * @returns Feature flag status and loading state
 */
export function useFeatureFlag({ 
  orgId, 
  flagName, 
  enabled = true 
}: UseFeatureFlagOptions): FeatureFlagResult {
  const { data, isLoading, error } = api.flags.getFlagStatus.useQuery(
    { 
      orgId: orgId || '', 
      name: flagName 
    },
    { 
      enabled: enabled && !!orgId,
      retry: false,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  if (!orgId) {
    return {
      isEnabled: false,
      isLoading: false,
    };
  }

  if (isLoading) {
    return {
      isEnabled: false,
      isLoading: true,
    };
  }

  if (error) {
    return {
      isEnabled: false,
      isLoading: false,
      error: error as unknown as Error,
    };
  }

  return {
    isEnabled: data?.isEnabled ?? false,
    isLoading: false,
  };
}

/**
 * Hook to check if a feature is enabled (convenience wrapper)
 * @param orgId - Organization ID
 * @param flagName - Feature flag name
 * @returns Boolean indicating if the feature is enabled
 */
export function useIsFeatureEnabled(orgId?: string, flagName?: FeatureFlagName): boolean {
  const { isEnabled } = useFeatureFlag({ 
    orgId, 
    flagName: flagName!, 
    enabled: !!orgId && !!flagName 
  });
  return isEnabled;
}

/**
 * Hook to check if a feature is disabled (convenience wrapper)
 * @param orgId - Organization ID
 * @param flagName - Feature flag name
 * @returns Boolean indicating if the feature is disabled
 */
export function useIsFeatureDisabled(orgId?: string, flagName?: FeatureFlagName): boolean {
  const { isEnabled } = useFeatureFlag({ 
    orgId, 
    flagName: flagName!, 
    enabled: !!orgId && !!flagName 
  });
  return !isEnabled;
}

// Convenience hooks for specific feature flags
export function useRecordsFeature(orgId?: string) {
  return useFeatureFlag({ orgId, flagName: 'RECORDS_FEATURE_ENABLED' });
}

export function useBillingFeature(orgId?: string) {
  return useFeatureFlag({ orgId, flagName: 'BILLING_FEATURE_ENABLED' });
}

export function useAuditFeature(orgId?: string) {
  return useFeatureFlag({ orgId, flagName: 'AUDIT_FEATURE_ENABLED' });
}

export function useSchedulingFeature(orgId?: string) {
  return useFeatureFlag({ orgId, flagName: 'SCHEDULING_FEATURE_ENABLED' });
}

export function useAttachmentsFeature(orgId?: string) {
  return useFeatureFlag({ orgId, flagName: 'ATTACHMENTS_FEATURE_ENABLED' });
}

export function useAdvancedAnalytics(orgId?: string) {
  return useFeatureFlag({ orgId, flagName: 'ADVANCED_ANALYTICS_ENABLED' });
}

export function useBetaFeatures(orgId?: string) {
  return useFeatureFlag({ orgId, flagName: 'BETA_FEATURES_ENABLED' });
}
