/**
 * Usage Tracker Library
 * 
 * Utility functions for tracking and querying usage metrics across the application.
 * Provides async, non-blocking logging with error handling and batch support.
 */

import type { UsageEventType } from '@starter/types';

/**
 * Configuration for tracking API calls
 */
export interface ApiCallConfig {
  orgId: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Configuration for tracking feature usage
 */
export interface FeatureUsageConfig {
  orgId: string;
  userId: string;
  eventType: UsageEventType;
  quantity?: number;
  metadata?: Record<string, any>;
}

/**
 * Usage period configuration
 */
export interface UsagePeriodConfig {
  orgId: string;
  from: Date;
  to: Date;
  eventType?: UsageEventType;
}

/**
 * Storage usage result
 */
export interface StorageUsageResult {
  totalBytes: number;
  fileCount: number;
  lastUpdated: Date | null;
}

/**
 * Track an API call asynchronously
 * 
 * @param supabase - Supabase client instance
 * @param config - API call configuration
 * @returns Promise that resolves when logged (or fails silently)
 */
export async function trackApiCall(
  supabase: any,
  config: ApiCallConfig
): Promise<void> {
  try {
    const { error } = await supabase
      .from('api_usage')
      .insert({
        org_id: config.orgId,
        user_id: config.userId,
        endpoint: config.endpoint,
        method: config.method,
        status_code: config.statusCode,
        response_time_ms: config.responseTimeMs,
        ip_address: config.ipAddress || null,
        user_agent: config.userAgent || null,
      });

    if (error) {
      console.error('Failed to track API call:', error);
    }
  } catch (error) {
    // Fail silently to not impact user experience
    console.error('Exception tracking API call:', error);
  }
}

/**
 * Track a feature usage event asynchronously
 * 
 * @param supabase - Supabase client instance
 * @param config - Feature usage configuration
 * @returns Promise that resolves when logged (or fails silently)
 */
export async function trackFeatureUsage(
  supabase: any,
  config: FeatureUsageConfig
): Promise<void> {
  try {
    const { error } = await supabase
      .from('usage_events')
      .insert({
        user_id: config.userId,
        org_id: config.orgId,
        event_type: config.eventType,
        quantity: config.quantity ?? 1,
        event_data: config.metadata ?? {},
      });

    if (error) {
      console.error('Failed to track feature usage:', error);
    }
  } catch (error) {
    // Fail silently to not impact user experience
    console.error('Exception tracking feature usage:', error);
  }
}

/**
 * Track multiple usage events in a batch
 * 
 * @param supabase - Supabase client instance
 * @param events - Array of feature usage configurations
 * @returns Promise that resolves when all events are logged
 */
export async function trackBatchUsage(
  supabase: any,
  events: FeatureUsageConfig[]
): Promise<void> {
  try {
    const records = events.map(event => ({
      user_id: event.userId,
      org_id: event.orgId,
      event_type: event.eventType,
      quantity: event.quantity ?? 1,
      event_data: event.metadata ?? {},
    }));

    const { error } = await supabase
      .from('usage_events')
      .insert(records);

    if (error) {
      console.error('Failed to track batch usage:', error);
    }
  } catch (error) {
    console.error('Exception tracking batch usage:', error);
  }
}

/**
 * Get usage events for a specific period
 * 
 * @param supabase - Supabase client instance
 * @param config - Usage period configuration
 * @returns Array of usage events
 */
export async function getUsageForPeriod(
  supabase: any,
  config: UsagePeriodConfig
): Promise<any[]> {
  try {
    let query = supabase
      .from('usage_events')
      .select('*')
      .eq('org_id', config.orgId)
      .gte('created_at', config.from.toISOString())
      .lte('created_at', config.to.toISOString())
      .order('created_at', { ascending: false });

    if (config.eventType) {
      query = query.eq('event_type', config.eventType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get usage for period:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception getting usage for period:', error);
    return [];
  }
}

/**
 * Calculate storage usage for an organization
 * 
 * @param supabase - Supabase client instance
 * @param orgId - Organization ID
 * @returns Storage usage statistics
 */
export async function calculateStorageUsage(
  supabase: any,
  orgId: string
): Promise<StorageUsageResult> {
  try {
    const { data, error } = await supabase
      .rpc('get_storage_usage', {
        p_org_id: orgId,
      });

    if (error) {
      console.error('Failed to calculate storage usage:', error);
      return {
        totalBytes: 0,
        fileCount: 0,
        lastUpdated: null,
      };
    }

    const result = data?.[0] || { total_bytes: 0, file_count: 0, last_updated: null };

    return {
      totalBytes: Number(result.total_bytes || 0),
      fileCount: Number(result.file_count || 0),
      lastUpdated: result.last_updated ? new Date(result.last_updated) : null,
    };
  } catch (error) {
    console.error('Exception calculating storage usage:', error);
    return {
      totalBytes: 0,
      fileCount: 0,
      lastUpdated: null,
    };
  }
}

/**
 * Check if usage is within plan limits
 * 
 * @param supabase - Supabase client instance
 * @param orgId - Organization ID
 * @param metric - Metric to check (e.g., 'max_records', 'max_api_calls_per_month')
 * @param currentValue - Current usage value
 * @returns Object with limit info and whether limit is exceeded
 */
export async function checkUsageLimits(
  supabase: any,
  orgId: string,
  metric: string,
  currentValue: number
): Promise<{
  limit: number;
  current: number;
  percentage: number;
  exceeded: boolean;
  approaching: boolean;
}> {
  try {
    // Get organization's plan
    const { data: subscription, error: subError } = await supabase
      .from('org_subscriptions')
      .select('plan_name')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      console.error('Failed to get org subscription:', subError);
      return {
        limit: -1,
        current: currentValue,
        percentage: 0,
        exceeded: false,
        approaching: false,
      };
    }

    // Get plan limits
    const { data: feature, error: featureError } = await supabase
      .from('plan_features')
      .select('feature_value')
      .eq('plan_name', subscription.plan_name)
      .eq('feature_key', metric)
      .single();

    if (featureError || !feature) {
      console.error('Failed to get plan feature:', featureError);
      return {
        limit: -1,
        current: currentValue,
        percentage: 0,
        exceeded: false,
        approaching: false,
      };
    }

    const limit = feature.feature_value?.limit ?? -1;

    // -1 means unlimited
    if (limit === -1) {
      return {
        limit: -1,
        current: currentValue,
        percentage: 0,
        exceeded: false,
        approaching: false,
      };
    }

    const percentage = (currentValue / limit) * 100;
    const exceeded = currentValue >= limit;
    const approaching = percentage >= 80 && !exceeded;

    return {
      limit,
      current: currentValue,
      percentage: Math.round(percentage * 100) / 100,
      exceeded,
      approaching,
    };
  } catch (error) {
    console.error('Exception checking usage limits:', error);
    return {
      limit: -1,
      current: currentValue,
      percentage: 0,
      exceeded: false,
      approaching: false,
    };
  }
}

/**
 * Aggregate daily metrics for a specific date
 * 
 * @param supabase - Supabase client instance
 * @param targetDate - Date to aggregate (defaults to yesterday)
 * @returns Promise that resolves when aggregation is complete
 */
export async function aggregateDailyMetrics(
  supabase: any,
  targetDate?: Date
): Promise<void> {
  try {
    const date = targetDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    const { error } = await supabase
      .rpc('aggregate_daily_usage', {
        p_target_date: dateStr,
      });

    if (error) {
      console.error('Failed to aggregate daily metrics:', error);
    }
  } catch (error) {
    console.error('Exception aggregating daily metrics:', error);
  }
}

/**
 * Get API usage statistics for a period
 * 
 * @param supabase - Supabase client instance
 * @param orgId - Organization ID
 * @param from - Start date
 * @param to - End date
 * @returns Array of API usage statistics by endpoint
 */
export async function getApiUsageStats(
  supabase: any,
  orgId: string,
  from: Date,
  to: Date
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_api_usage_stats', {
        p_org_id: orgId,
        p_start_date: from.toISOString(),
        p_end_date: to.toISOString(),
      });

    if (error) {
      console.error('Failed to get API usage stats:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception getting API usage stats:', error);
    return [];
  }
}

/**
 * Get active users count for a period
 * 
 * @param supabase - Supabase client instance
 * @param orgId - Organization ID
 * @param period - Period type ('day', 'week', 'month')
 * @param referenceDate - Reference date (defaults to now)
 * @returns Active users count with period info
 */
export async function getActiveUsersCount(
  supabase: any,
  orgId: string,
  period: 'day' | 'week' | 'month' = 'day',
  referenceDate?: Date
): Promise<{
  activeUsers: number;
  periodType: string;
  periodStart: Date;
  periodEnd: Date;
} | null> {
  try {
    const refDate = referenceDate || new Date();

    const { data, error } = await supabase
      .rpc('get_active_users_count', {
        p_org_id: orgId,
        p_period: period,
        p_reference_date: refDate.toISOString(),
      });

    if (error) {
      console.error('Failed to get active users count:', error);
      return null;
    }

    const result = data?.[0];
    if (!result) {
      return null;
    }

    return {
      activeUsers: Number(result.active_users || 0),
      periodType: result.period_type,
      periodStart: new Date(result.period_start),
      periodEnd: new Date(result.period_end),
    };
  } catch (error) {
    console.error('Exception getting active users count:', error);
    return null;
  }
}

/**
 * Sanitize metadata to remove sensitive information
 * 
 * @param metadata - Raw metadata object
 * @returns Sanitized metadata
 */
export function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'api_key',
    'apiKey',
    'accessToken',
    'refreshToken',
    'privateKey',
    'creditCard',
    'ssn',
    'socialSecurity',
  ];

  const sanitized = { ...metadata };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Extract IP address from request headers
 * 
 * @param headers - Request headers
 * @returns IP address or null
 */
export function extractIpAddress(headers: Headers | Record<string, string>): string | null {
  try {
    // Check common headers for IP address
    const ipHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'cf-connecting-ip', // Cloudflare
      'x-client-ip',
      'x-cluster-client-ip',
    ];

    for (const header of ipHeaders) {
      let value: string | null = null;
      
      if (headers instanceof Headers) {
        value = headers.get(header);
      } else {
        value = headers[header] || null;
      }

      if (value) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return value.split(',')[0].trim();
      }
    }

    return null;
  } catch (error) {
    console.error('Exception extracting IP address:', error);
    return null;
  }
}

/**
 * Extract user agent from request headers
 * 
 * @param headers - Request headers
 * @returns User agent string or null
 */
export function extractUserAgent(headers: Headers | Record<string, string>): string | null {
  try {
    if (headers instanceof Headers) {
      return headers.get('user-agent');
    } else {
      return headers['user-agent'] || null;
    }
  } catch (error) {
    console.error('Exception extracting user agent:', error);
    return null;
  }
}
