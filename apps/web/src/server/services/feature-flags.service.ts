/**
 * Live feature flags service using Supabase database
 * Falls back to mock service when database connection is not available
 */

import { createClient } from '@supabase/supabase-js';
import type { FeatureFlagName, FeatureFlagResponse } from '@starter/types';
import { getFlag } from '../mocks/feature-flags.store';
import { logger } from '@/lib/logging/logger';

/**
 * Live feature flags service implementation using Supabase
 */
export class LiveFeatureFlagsService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get a feature flag value for an organization
   * @param orgId - Organization ID
   * @param flagName - Name of the feature flag
   * @returns Feature flag response
   */
  async getFeatureFlag(orgId: string, flagName: FeatureFlagName): Promise<FeatureFlagResponse> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('is_enabled')
        .eq('org_id', orgId)
        .eq('flag_name', flagName)
        .single();

      if (error) {
        logger.error('Error fetching feature flag', { 
          service: 'feature-flags', 
          operation: 'getFeatureFlag',
          orgId,
          flagName 
        }, error as Error);
        // Return default value on error
        return {
          name: flagName,
          isEnabled: false,
        };
      }

      return {
        name: flagName,
        isEnabled: data?.is_enabled ?? false,
      };
    } catch (error) {
      logger.error('Error in getFeatureFlag', { 
        service: 'feature-flags', 
        operation: 'getFeatureFlag',
        orgId,
        flagName 
      }, error as Error);
      return {
        name: flagName,
        isEnabled: false,
      };
    }
  }

  /**
   * Get all feature flags for an organization
   * @param orgId - Organization ID
   * @returns Array of feature flag responses
   */
  async getAllFeatureFlags(orgId: string): Promise<FeatureFlagResponse[]> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('flag_name, is_enabled')
        .eq('org_id', orgId);

      if (error) {
        logger.error('Error fetching feature flags', { 
          service: 'feature-flags', 
          operation: 'getAllFeatureFlags',
          orgId 
        }, error as Error);
        return [];
      }

      return data?.map(flag => ({
        name: flag.flag_name as FeatureFlagName,
        isEnabled: flag.is_enabled,
      })) ?? [];
    } catch (error) {
      logger.error('Error in getAllFeatureFlags', { 
        service: 'feature-flags', 
        operation: 'getAllFeatureFlags',
        orgId 
      }, error as Error);
      return [];
    }
  }

  /**
   * Set a feature flag value for an organization
   * @param orgId - Organization ID
   * @param flagName - Name of the feature flag
   * @param isEnabled - Whether the flag is enabled
   */
  async setFeatureFlag(orgId: string, flagName: FeatureFlagName, isEnabled: boolean): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('feature_flags')
        .upsert({
          org_id: orgId,
          flag_name: flagName,
          is_enabled: isEnabled,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        logger.error('Error setting feature flag', { 
          service: 'feature-flags', 
          operation: 'setFeatureFlag',
          orgId,
          flagName,
          isEnabled 
        }, error as Error);
        throw new Error('Failed to set feature flag');
      }
    } catch (error) {
      logger.error('Error in setFeatureFlag', { 
        service: 'feature-flags', 
        operation: 'setFeatureFlag',
        orgId,
        flagName,
        isEnabled 
      }, error as Error);
      throw error;
    }
  }
}

/**
 * Feature flags service factory that returns the appropriate service based on environment
 */
export function createFeatureFlagsService(): {
  getFeatureFlag: (orgId: string, flagName: FeatureFlagName) => Promise<FeatureFlagResponse>;
  getAllFeatureFlags: (orgId: string) => Promise<FeatureFlagResponse[]>;
  setFeatureFlag: (orgId: string, flagName: FeatureFlagName, isEnabled: boolean) => Promise<void>;
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url') {
    const liveService = new LiveFeatureFlagsService(supabaseUrl, supabaseKey);
    return {
      getFeatureFlag: (orgId: string, flagName: FeatureFlagName) => liveService.getFeatureFlag(orgId, flagName),
      getAllFeatureFlags: (orgId: string) => liveService.getAllFeatureFlags(orgId),
      setFeatureFlag: (orgId: string, flagName: FeatureFlagName, isEnabled: boolean) => liveService.setFeatureFlag(orgId, flagName, isEnabled),
    };
  }
  
  // Fall back to mock service for development or when database connection is not available
  return {
    getFeatureFlag: async (orgId: string, flagName: FeatureFlagName) => ({
      name: flagName,
      isEnabled: getFlag(orgId, flagName),
    }),
    getAllFeatureFlags: async (orgId: string) => {
      // Mock implementation - return all flags with their current values
      const flagNames: FeatureFlagName[] = [
        'RECORDS_FEATURE_ENABLED',
        'BILLING_FEATURE_ENABLED',
        'AUDIT_FEATURE_ENABLED',
        'SCHEDULING_FEATURE_ENABLED',
        'ATTACHMENTS_FEATURE_ENABLED',
        'ADVANCED_ANALYTICS_ENABLED',
        'BETA_FEATURES_ENABLED',
      ];
      
      return flagNames.map(name => ({
        name,
        isEnabled: getFlag(orgId, name),
      }));
    },
    setFeatureFlag: async () => {
      // Mock implementation - no-op
      // Mock feature flag service: setFeatureFlag called (no-op)
    },
  };
}

/**
 * Singleton instance of the feature flags service
 */
export const featureFlagsService = createFeatureFlagsService();
