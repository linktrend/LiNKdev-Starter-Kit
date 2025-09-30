/**
 * Feature flags router for tRPC API
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import type { FeatureFlagName, FeatureFlagResponse } from '@starter/types';

/**
 * Input validation schema for getting a feature flag
 */
const getFlagInputSchema = z.object({
  orgId: z.string().min(1, 'Organization ID is required'),
  name: z.enum([
    'RECORDS_FEATURE_ENABLED',
    'BILLING_FEATURE_ENABLED',
    'AUDIT_FEATURE_ENABLED',
    'SCHEDULING_FEATURE_ENABLED',
    'ATTACHMENTS_FEATURE_ENABLED',
    'ADVANCED_ANALYTICS_ENABLED',
    'BETA_FEATURES_ENABLED',
  ] as const),
});

/**
 * Feature flags router
 */
export const flagsRouter = createTRPCRouter({
  /**
   * Get the status of a feature flag for an organization
   */
  getFlagStatus: publicProcedure
    .input(getFlagInputSchema)
    .query(async ({ input }): Promise<FeatureFlagResponse> => {
      const { name } = input;
      
      // In a real implementation, this would query the database or remote config service
      // For now, we'll use a simple mock implementation
      const mockFlags: Record<FeatureFlagName, boolean> = {
        RECORDS_FEATURE_ENABLED: true,
        BILLING_FEATURE_ENABLED: true,
        AUDIT_FEATURE_ENABLED: true,
        SCHEDULING_FEATURE_ENABLED: true,
        ATTACHMENTS_FEATURE_ENABLED: true,
        ADVANCED_ANALYTICS_ENABLED: false,
        BETA_FEATURES_ENABLED: false,
      };

      // In production, you would:
      // 1. Query the database for the organization's feature flags
      // 2. Check for organization-specific overrides
      // 3. Fall back to default values
      // 4. Consider user-level overrides if needed

      return {
        name,
        isEnabled: mockFlags[name] ?? false,
      };
    }),

  /**
   * Get all feature flags for an organization
   */
  getAllFlags: publicProcedure
    .input(z.object({
      orgId: z.string().min(1, 'Organization ID is required'),
    }))
    .query(async (): Promise<FeatureFlagResponse[]> => {
      
      // Mock implementation - in production, query the database
      const mockFlags: Record<FeatureFlagName, boolean> = {
        RECORDS_FEATURE_ENABLED: true,
        BILLING_FEATURE_ENABLED: true,
        AUDIT_FEATURE_ENABLED: true,
        SCHEDULING_FEATURE_ENABLED: true,
        ATTACHMENTS_FEATURE_ENABLED: true,
        ADVANCED_ANALYTICS_ENABLED: false,
        BETA_FEATURES_ENABLED: false,
      };

      return Object.entries(mockFlags).map(([name, isEnabled]) => ({
        name: name as FeatureFlagName,
        isEnabled,
      }));
    }),
});
