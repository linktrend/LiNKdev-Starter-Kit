/**
 * Usage Router
 * 
 * Provides endpoints for tracking and querying usage metrics across the application.
 * Includes API usage, feature adoption, active users, storage, and plan limits.
 */

import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { requireMember } from '../middleware/accessGuard';
import {
  GetApiUsageInput,
  GetFeatureUsageInput,
  GetActiveUsersInput,
  GetStorageUsageInput,
  GetUsageLimitsInput,
  RecordUsageEventInput,
  ApiUsageResponse,
  FeatureUsageResponse,
  ActiveUsersResponse,
  StorageUsageResponse,
  UsageLimitsResponse,
} from '@starter/types';
import {
  getApiUsageStats,
  getActiveUsersCount,
  calculateStorageUsage,
  checkUsageLimits,
  trackFeatureUsage,
} from '../lib/usage-tracker';

// Note: These stores will need to be provided by the consuming application
declare const usageStore: any;

const isOfflineMode = process.env.TEMPLATE_OFFLINE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const usageRouter = createTRPCRouter({
  /**
   * Get API usage metrics for an organization
   */
  getApiUsage: protectedProcedure
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(GetApiUsageInput)
    .query(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          const result = await usageStore.getApiUsage({
            ...input,
            orgId: input.orgId,
          });
          return result;
        }

        // Calculate date range (default to last 30 days)
        const now = new Date();
        const from = input.from ? new Date(input.from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const to = input.to ? new Date(input.to) : now;

        // Get API usage stats from database function
        const stats = await getApiUsageStats(ctx.supabase, input.orgId, from, to);

        // Filter by endpoint/method if specified
        let filteredStats = stats;
        if (input.endpoint) {
          filteredStats = filteredStats.filter(s => s.endpoint === input.endpoint);
        }
        if (input.method) {
          filteredStats = filteredStats.filter(s => s.method === input.method);
        }

        // Calculate totals
        const totalCalls = filteredStats.reduce((sum, s) => sum + Number(s.call_count), 0);
        const avgResponseTime = filteredStats.length > 0
          ? filteredStats.reduce((sum, s) => sum + Number(s.avg_response_time), 0) / filteredStats.length
          : 0;
        const totalErrors = filteredStats.reduce((sum, s) => sum + Number(s.error_count), 0);
        const errorRate = totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0;

        return {
          endpoints: filteredStats.map(s => ({
            endpoint: s.endpoint,
            method: s.method,
            call_count: Number(s.call_count),
            avg_response_time: Number(s.avg_response_time),
            error_count: Number(s.error_count),
            error_rate: Number(s.error_rate),
          })),
          total_calls: totalCalls,
          avg_response_time: Math.round(avgResponseTime * 100) / 100,
          error_rate: Math.round(errorRate * 100) / 100,
          period: {
            from: from.toISOString(),
            to: to.toISOString(),
          },
        } as ApiUsageResponse;
      } catch (error) {
        console.error('Error fetching API usage:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch API usage',
        });
      }
    }),

  /**
   * Get feature usage metrics for an organization
   */
  getFeatureUsage: protectedProcedure
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(GetFeatureUsageInput)
    .query(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          const result = await usageStore.getFeatureUsage({
            ...input,
            orgId: input.orgId,
          });
          return result;
        }

        // Calculate date range (default to last 30 days)
        const now = new Date();
        const from = input.from ? new Date(input.from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const to = input.to ? new Date(input.to) : now;

        // Build query
        let query = ctx.supabase
          .from('usage_events')
          .select('event_type, user_id, quantity, created_at')
          .eq('org_id', input.orgId)
          .gte('created_at', from.toISOString())
          .lte('created_at', to.toISOString());

        if (input.eventType) {
          query = query.eq('event_type', input.eventType);
        }

        const { data: events, error } = await query;

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch feature usage',
          });
        }

        if (!events || events.length === 0) {
          return {
            features: [],
            total_events: 0,
            active_users: 0,
            period: {
              from: from.toISOString(),
              to: to.toISOString(),
            },
          } as FeatureUsageResponse;
        }

        // Aggregate by event type
        const featureMap = new Map<string, {
          usage_count: number;
          unique_users: Set<string>;
          last_used: Date;
        }>();

        const allUsers = new Set<string>();

        for (const event of events) {
          const eventType = event.event_type;
          const userId = event.user_id;
          const createdAt = new Date(event.created_at);

          if (!featureMap.has(eventType)) {
            featureMap.set(eventType, {
              usage_count: 0,
              unique_users: new Set(),
              last_used: createdAt,
            });
          }

          const feature = featureMap.get(eventType)!;
          feature.usage_count += Number(event.quantity || 1);
          feature.unique_users.add(userId);
          if (createdAt > feature.last_used) {
            feature.last_used = createdAt;
          }

          allUsers.add(userId);
        }

        // Convert to array
        const features = Array.from(featureMap.entries()).map(([event_type, data]) => ({
          event_type,
          usage_count: data.usage_count,
          unique_users: data.unique_users.size,
          last_used: data.last_used.toISOString(),
        }));

        // Sort by usage count
        features.sort((a, b) => b.usage_count - a.usage_count);

        return {
          features,
          total_events: events.length,
          active_users: allUsers.size,
          period: {
            from: from.toISOString(),
            to: to.toISOString(),
          },
        } as FeatureUsageResponse;
      } catch (error) {
        console.error('Error fetching feature usage:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch feature usage',
        });
      }
    }),

  /**
   * Get active users metrics (DAU/MAU/WAU)
   */
  getActiveUsers: protectedProcedure
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(GetActiveUsersInput)
    .query(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          const result = await usageStore.getActiveUsers({
            ...input,
            orgId: input.orgId,
          });
          return result;
        }

        // If date range is provided, calculate daily breakdown
        if (input.from && input.to) {
          const from = new Date(input.from);
          const to = new Date(input.to);

          const { data: events, error } = await ctx.supabase
            .from('usage_events')
            .select('user_id, created_at')
            .eq('org_id', input.orgId)
            .eq('event_type', 'user_active')
            .gte('created_at', from.toISOString())
            .lte('created_at', to.toISOString());

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to fetch active users',
            });
          }

          // Group by date
          const dailyUsers = new Map<string, Set<string>>();
          const allUsers = new Set<string>();

          for (const event of events || []) {
            const date = event.created_at.split('T')[0];
            if (!dailyUsers.has(date)) {
              dailyUsers.set(date, new Set());
            }
            dailyUsers.get(date)!.add(event.user_id);
            allUsers.add(event.user_id);
          }

          const dailyBreakdown = Array.from(dailyUsers.entries())
            .map(([date, users]) => ({
              date,
              count: users.size,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

          return {
            active_users: allUsers.size,
            period_type: input.period,
            period_start: from.toISOString(),
            period_end: to.toISOString(),
            daily_breakdown: dailyBreakdown,
          } as ActiveUsersResponse;
        }

        // Use database function for single period
        const referenceDate = input.from ? new Date(input.from) : new Date();
        const result = await getActiveUsersCount(ctx.supabase, input.orgId, input.period, referenceDate);

        if (!result) {
          return {
            active_users: 0,
            period_type: input.period,
            period_start: new Date().toISOString(),
            period_end: new Date().toISOString(),
          } as ActiveUsersResponse;
        }

        return {
          active_users: result.activeUsers,
          period_type: result.periodType,
          period_start: result.periodStart.toISOString(),
          period_end: result.periodEnd.toISOString(),
        } as ActiveUsersResponse;
      } catch (error) {
        console.error('Error fetching active users:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch active users',
        });
      }
    }),

  /**
   * Get storage usage for an organization
   */
  getStorageUsage: protectedProcedure
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(GetStorageUsageInput)
    .query(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          const result = await usageStore.getStorageUsage({
            ...input,
            orgId: input.orgId,
          });
          return result;
        }

        const result = await calculateStorageUsage(ctx.supabase, input.orgId);

        return {
          total_bytes: result.totalBytes,
          total_gb: Math.round((result.totalBytes / (1024 * 1024 * 1024)) * 100) / 100,
          file_count: result.fileCount,
          last_updated: result.lastUpdated?.toISOString() || null,
        } as StorageUsageResponse;
      } catch (error) {
        console.error('Error fetching storage usage:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch storage usage',
        });
      }
    }),

  /**
   * Get usage limits and current usage for an organization
   */
  getUsageLimits: protectedProcedure
    .use(requireMember({ orgIdSource: 'input', orgIdField: 'orgId' }))
    .input(GetUsageLimitsInput)
    .query(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          const result = await usageStore.getUsageLimits({
            ...input,
            orgId: input.orgId,
          });
          return result;
        }

        // Get organization's plan
        const { data: subscription, error: subError } = await ctx.supabase
          .from('org_subscriptions')
          .select('plan_name')
          .eq('org_id', input.orgId)
          .eq('status', 'active')
          .single();

        if (subError || !subscription) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No active subscription found',
          });
        }

        const planName = subscription.plan_name;

        // Get all plan features
        const { data: features, error: featuresError } = await ctx.supabase
          .from('plan_features')
          .select('feature_key, feature_value')
          .eq('plan_name', planName);

        if (featuresError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch plan features',
          });
        }

        // Parse limits
        const limits: any = {
          max_records: -1,
          max_api_calls_per_month: -1,
          max_automations: -1,
          max_storage_gb: -1,
          max_mau: -1,
          max_schedules: -1,
          max_ai_tokens_per_month: -1,
          max_seats: -1,
        };

        for (const feature of features || []) {
          if (feature.feature_key in limits) {
            limits[feature.feature_key] = feature.feature_value?.limit ?? -1;
          }
        }

        // Get current usage
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count records
        const { count: recordsCount } = await ctx.supabase
          .from('usage_events')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', input.orgId)
          .eq('event_type', 'record_created');

        // Count API calls this month
        const { count: apiCallsCount } = await ctx.supabase
          .from('api_usage')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', input.orgId)
          .gte('created_at', monthStart.toISOString());

        // Count automations
        const { count: automationsCount } = await ctx.supabase
          .from('usage_events')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', input.orgId)
          .eq('event_type', 'automation_run');

        // Get storage
        const storage = await calculateStorageUsage(ctx.supabase, input.orgId);
        const storageGb = storage.totalBytes / (1024 * 1024 * 1024);

        // Get MAU
        const mauResult = await getActiveUsersCount(ctx.supabase, input.orgId, 'month');
        const mau = mauResult?.activeUsers || 0;

        // Count schedules
        const { count: schedulesCount } = await ctx.supabase
          .from('usage_events')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', input.orgId)
          .eq('event_type', 'schedule_executed');

        // Count AI tokens this month
        const { data: aiTokens } = await ctx.supabase
          .from('usage_events')
          .select('quantity')
          .eq('org_id', input.orgId)
          .eq('event_type', 'ai_tokens_used')
          .gte('created_at', monthStart.toISOString());

        const aiTokensSum = aiTokens?.reduce((sum, e) => sum + Number(e.quantity || 0), 0) || 0;

        // Count seats (org members)
        const { count: seatsCount } = await ctx.supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', input.orgId);

        const currentUsage = {
          records: recordsCount || 0,
          api_calls: apiCallsCount || 0,
          automations: automationsCount || 0,
          storage_gb: Math.round(storageGb * 100) / 100,
          mau,
          schedules: schedulesCount || 0,
          ai_tokens: aiTokensSum,
          seats: seatsCount || 0,
        };

        // Calculate percentages
        const usagePercentage: any = {};
        const approachingLimits: string[] = [];
        const exceededLimits: string[] = [];

        for (const [key, limit] of Object.entries(limits)) {
          const usageKey = key.replace('max_', '').replace('_per_month', '');
          const current = currentUsage[usageKey as keyof typeof currentUsage] || 0;

          if (limit === -1) {
            usagePercentage[usageKey] = 0;
          } else {
            const percentage = (current / limit) * 100;
            usagePercentage[usageKey] = Math.round(percentage * 100) / 100;

            if (percentage >= 100) {
              exceededLimits.push(usageKey);
            } else if (percentage >= 80) {
              approachingLimits.push(usageKey);
            }
          }
        }

        return {
          plan_name: planName,
          limits,
          current_usage: currentUsage,
          usage_percentage: usagePercentage,
          approaching_limits: approachingLimits,
          exceeded_limits: exceededLimits,
        } as UsageLimitsResponse;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching usage limits:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch usage limits',
        });
      }
    }),

  /**
   * Record a usage event (internal use)
   */
  recordEvent: protectedProcedure
    .input(RecordUsageEventInput)
    .mutation(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
          await usageStore.recordEvent({
            ...input,
            userId: ctx.user.id,
          });
          return { success: true };
        }

        await trackFeatureUsage(ctx.supabase, {
          orgId: input.orgId,
          userId: ctx.user.id,
          eventType: input.eventType,
          quantity: input.quantity,
          metadata: input.metadata,
        });

        return { success: true };
      } catch (error) {
        console.error('Error recording usage event:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record usage event',
        });
      }
    }),
});
