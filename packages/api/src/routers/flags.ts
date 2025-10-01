/**
 * Feature flags router for tRPC API
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import type { FeatureFlagName, FeatureFlagResponse } from '@starter/types';
import { featureFlagsService } from '../../../apps/web/src/server/services/feature-flags.service';

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
      const { orgId, name } = input;
      
      // Use the live feature flags service
      return await featureFlagsService.getFeatureFlag(orgId, name);
    }),

  /**
   * Get all feature flags for an organization
   */
  getAllFlags: publicProcedure
    .input(z.object({
      orgId: z.string().min(1, 'Organization ID is required'),
    }))
    .query(async ({ input }): Promise<FeatureFlagResponse[]> => {
      const { orgId } = input;
      
      // Use the live feature flags service
      return await featureFlagsService.getAllFeatureFlags(orgId);
    }),
});
