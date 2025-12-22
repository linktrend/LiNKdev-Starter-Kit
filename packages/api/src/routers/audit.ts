import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { 
  AppendAuditLogInput,
  ListAuditLogsInput,
  AuditStatsInput,
  ExportAuditLogsInput,
  GetAuditLogByIdInput,
  SearchAuditLogsInput,
  GetActivitySummaryInput,
  AuditLogsResponse,
  AuditStatsResponse,
  ActivitySummaryResponse,
  AuditAnalyticsEvent,
  AuditAnalyticsPayload
} from '@starter/types';

// Note: These utility functions and stores will need to be provided by the consuming application
declare const auditStore: any;
declare const emitAnalyticsEvent: (userId: string, event: AuditAnalyticsEvent, payload: AuditAnalyticsPayload) => Promise<void>;

const isOfflineMode = () =>
  process.env.TEMPLATE_OFFLINE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const auditRouter = createTRPCRouter({
  /**
   * Append a new audit log entry (server-only)
   */
  append: protectedProcedure
    .input(AppendAuditLogInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const auditLog = {
          org_id: input.orgId as string,
          actor_id: ctx.user.id,
          action: input.action as string,
          entity_type: input.entityType as string,
          entity_id: input.entityId as string,
          metadata: input.metadata || {},
        };

        if (isOfflineMode()) {
          const result = await auditStore.appendLog(auditLog);
          
          // Emit analytics event
          await emitAnalyticsEvent(ctx.user.id, 'audit.appended', {
            org_id: input.orgId as string,
            action: input.action as string,
            entity_type: input.entityType as string,
            actor_id: ctx.user.id,
            metadata: { offline: true },
          });
          
          return result;
        }

        const { data, error } = await ctx.supabase
          .from('audit_logs')
          .insert(auditLog)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to append audit log',
          });
        }

        // Emit analytics event
        await emitAnalyticsEvent(ctx.user.id, 'audit.appended', {
          org_id: input.orgId as string,
          action: input.action as string,
          entity_type: input.entityType as string,
          actor_id: ctx.user.id,
        });

        return data;
      } catch (error) {
        console.error('Error appending audit log:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to append audit log',
        });
      }
    }),

  /**
   * List audit logs with filtering and pagination
   */
  list: protectedProcedure
    .input(ListAuditLogsInput)
    .query(async ({ input, ctx }) => {
      try {
        if (isOfflineMode()) {
          const result = await auditStore.listLogs({
            ...input,
            orgId: input.orgId as string,
            limit: input.limit || 50,
          });
          
          // Emit analytics event
          await emitAnalyticsEvent(ctx.user.id, 'audit.viewed', {
            org_id: input.orgId as string,
            metadata: { 
              filters: {
                q: input.q,
                entityType: input.entityType,
                action: input.action,
                actorId: input.actorId,
                from: input.from,
                to: input.to,
              },
              offline: true,
            },
          });
          
          return result;
        }

        // Build query
        let query = ctx.supabase
          .from('audit_logs')
          .select('*', { count: 'exact' })
          .eq('org_id', input.orgId as string)
          .order('created_at', { ascending: false });

        // Apply filters
        if (input.q) {
          query = query.or(`action.ilike.%${input.q}%,entity_type.ilike.%${input.q}%,entity_id.ilike.%${input.q}%,metadata::text.ilike.%${input.q}%`);
        }

        if (input.entityType) {
          query = query.eq('entity_type', input.entityType);
        }

        if (input.action) {
          query = query.eq('action', input.action);
        }

        if (input.actorId) {
          query = query.eq('actor_id', input.actorId);
        }

        if (input.from) {
          query = query.gte('created_at', input.from);
        }

        if (input.to) {
          query = query.lte('created_at', input.to);
        }

        // Apply cursor-based pagination
        if (input.cursor) {
          const { data: cursorLog } = await ctx.supabase
            .from('audit_logs')
            .select('created_at')
            .eq('id', input.cursor)
            .single();
          
          if (cursorLog) {
            query = query.lt('created_at', cursorLog.created_at);
          }
        }

        // Apply limit
        query = query.limit((input.limit || 50) + 1); // +1 to check if there are more

        const { data: logs, error, count } = await query;

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch audit logs',
          });
        }

        const limit = input.limit || 50;
        const hasMore = logs && logs.length > limit;
        const paginatedLogs = hasMore ? logs.slice(0, limit) : (logs || []);
        const nextCursor = hasMore ? paginatedLogs[paginatedLogs.length - 1]?.id : undefined;

        // Emit analytics event
        await emitAnalyticsEvent(ctx.user.id, 'audit.viewed', {
          org_id: input.orgId as string,
          metadata: { 
            filters: {
              q: input.q,
              entityType: input.entityType,
              action: input.action,
              actorId: input.actorId,
              from: input.from,
              to: input.to,
            },
          },
        });

        return {
          logs: paginatedLogs,
          has_more: hasMore,
          next_cursor: nextCursor,
          total: count || 0,
        } as AuditLogsResponse;
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit logs',
        });
      }
    }),

  /**
   * Get audit statistics
   */
  stats: protectedProcedure
    .input(AuditStatsInput)
    .query(async ({ input, ctx }) => {
      try {
        const orgId = input.orgId!;

        if (isOfflineMode()) {
          const result = await auditStore.getStats({
            ...input,
            orgId,
            window: input.window || 'day',
          });
          
          return result;
        }

        // Use the database function for statistics
        const { data, error } = await ctx.supabase.rpc('get_audit_stats', {
          p_org_id: orgId,
          p_window: input.window,
        });

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch audit statistics',
          });
        }

        const stats =
          (data as Array<{
            by_action?: Record<string, number>;
            by_entity_type?: Record<string, number>;
            by_actor?: Record<string, number>;
            total?: number;
          }> | null)?.[0] || {
            by_action: {},
            by_entity_type: {},
            by_actor: {},
            total: 0,
          };

        return {
          by_action: stats.by_action || {},
          by_entity_type: stats.by_entity_type || {},
          by_actor: stats.by_actor || {},
          total: stats.total || 0,
          window: input.window,
        } as AuditStatsResponse;
      } catch (error) {
        console.error('Error fetching audit statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit statistics',
        });
      }
    }),

  /**
   * Get a single audit log by ID
   */
  getById: protectedProcedure
    .input(GetAuditLogByIdInput)
    .query(async ({ input, ctx }) => {
      try {
        const orgId = input.orgId!;
        const logId = input.logId!;

        if (isOfflineMode()) {
          const log = await auditStore.getLogById(input.logId, orgId);
          
          if (!log) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Audit log not found',
            });
          }
          
          return log;
        }

        // Verify user has access to this org
        const { data: membership } = await ctx.supabase
          .from('organization_members')
          .select('role')
          .eq('org_id', orgId)
          .eq('user_id', ctx.user.id)
          .single();

        if (!membership) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not a member of this organization',
          });
        }

        // Fetch the audit log
        const { data: log, error } = await ctx.supabase
          .from('audit_logs')
          .select('*')
          .eq('id', logId)
          .eq('org_id', orgId)
          .single();

        if (error || !log) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Audit log not found',
          });
        }

        return log;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching audit log:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit log',
        });
      }
    }),

  /**
   * Search audit logs with full-text search
   */
  search: protectedProcedure
    .input(SearchAuditLogsInput)
    .query(async ({ input, ctx }) => {
      try {
        const orgId = input.orgId!;

        if (isOfflineMode()) {
          const result = await auditStore.searchLogs({
            ...input,
            orgId,
            limit: input.limit || 50,
          });
          
          return result;
        }

        // Build search query
        let query = ctx.supabase
          .from('audit_logs')
          .select('*', { count: 'exact' })
          .eq('org_id', orgId)
          .order('created_at', { ascending: false });

        // Apply full-text search across multiple fields
        if (input.query) {
          query = query.or(
            `action.ilike.%${input.query}%,` +
            `entity_type.ilike.%${input.query}%,` +
            `entity_id.ilike.%${input.query}%,` +
            `metadata::text.ilike.%${input.query}%`
          );
        }

        // Apply additional filters
        if (input.entityType) {
          query = query.eq('entity_type', input.entityType);
        }

        if (input.action) {
          query = query.eq('action', input.action);
        }

        if (input.from) {
          query = query.gte('created_at', input.from);
        }

        if (input.to) {
          query = query.lte('created_at', input.to);
        }

        // Apply cursor-based pagination
        if (input.cursor) {
          const { data: cursorLog } = await ctx.supabase
            .from('audit_logs')
            .select('created_at')
            .eq('id', input.cursor)
            .single();
          
          if (cursorLog) {
            query = query.lt('created_at', cursorLog.created_at);
          }
        }

        // Apply limit
        query = query.limit((input.limit || 50) + 1);

        const { data: logs, error, count } = await query;

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to search audit logs',
          });
        }

        const limit = input.limit || 50;
        const hasMore = logs && logs.length > limit;
        const paginatedLogs = hasMore ? logs.slice(0, limit) : (logs || []);
        const nextCursor = hasMore ? paginatedLogs[paginatedLogs.length - 1]?.id : undefined;

        return {
          logs: paginatedLogs,
          has_more: hasMore,
          next_cursor: nextCursor,
          total: count || 0,
        } as AuditLogsResponse;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error searching audit logs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search audit logs',
        });
      }
    }),

  /**
   * Get activity summary with timeline and breakdowns
   */
  getActivitySummary: protectedProcedure
    .input(GetActivitySummaryInput)
    .query(async ({ input, ctx }) => {
      try {
        const orgId = input.orgId!;

        if (isOfflineMode()) {
          const result = await auditStore.getActivitySummary({
            ...input,
            orgId,
          });
          
          return result;
        }

        // Calculate date range
        const now = new Date();
        const from = input.from ? new Date(input.from) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const to = input.to ? new Date(input.to) : now;

        // Fetch logs for the period
        const { data: logs, error } = await ctx.supabase
          .from('audit_logs')
          .select('*')
          .eq('org_id', orgId)
          .gte('created_at', from.toISOString())
          .lte('created_at', to.toISOString())
          .order('created_at', { ascending: true });

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch activity summary',
          });
        }

        if (!logs || logs.length === 0) {
          return {
            timeline: [],
            by_action: {},
            by_entity_type: {},
            top_actors: [],
            total: 0,
            period: {
              from: from.toISOString(),
              to: to.toISOString(),
            },
          } as ActivitySummaryResponse;
        }

        // Build timeline based on groupBy
        const timeline: Record<string, number> = {};
        const byAction: Record<string, number> = {};
        const byEntityType: Record<string, number> = {};
        const actorCounts: Record<string, number> = {};

        for (const log of logs) {
          // Group by time period
          const timestamp = new Date(log.created_at);
          let timeKey: string;

          switch (input.groupBy) {
            case 'hour':
              timeKey = timestamp.toISOString().slice(0, 13) + ':00:00.000Z';
              break;
            case 'week':
              const weekStart = new Date(timestamp);
              weekStart.setDate(timestamp.getDate() - timestamp.getDay());
              timeKey = weekStart.toISOString().split('T')[0];
              break;
            case 'day':
            default:
              timeKey = timestamp.toISOString().split('T')[0];
              break;
          }

          timeline[timeKey] = (timeline[timeKey] || 0) + 1;

          // Count by action
          byAction[log.action] = (byAction[log.action] || 0) + 1;

          // Count by entity type
          byEntityType[log.entity_type] = (byEntityType[log.entity_type] || 0) + 1;

          // Count by actor
          if (log.actor_id) {
            actorCounts[log.actor_id] = (actorCounts[log.actor_id] || 0) + 1;
          }
        }

        // Convert timeline to array
        const timelineArray = Object.entries(timeline)
          .map(([timestamp, count]) => ({ timestamp, count }))
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        // Get top 10 actors
        const topActors = Object.entries(actorCounts)
          .map(([actor_id, count]) => ({ actor_id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return {
          timeline: timelineArray,
          by_action: byAction,
          by_entity_type: byEntityType,
          top_actors: topActors,
          total: logs.length,
          period: {
            from: from.toISOString(),
            to: to.toISOString(),
          },
        } as ActivitySummaryResponse;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching activity summary:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch activity summary',
        });
      }
    }),

  /**
   * Export audit logs as CSV
   */
  exportCsv: protectedProcedure
    .input(ExportAuditLogsInput)
    .mutation(async ({ input, ctx }) => {
      try {
        if (isOfflineMode()) {
          const csv = await auditStore.exportCsv({
            ...input,
            orgId: input.orgId as string,
          });
          
          // Emit analytics event
          await emitAnalyticsEvent(ctx.user.id, 'audit.exported', {
            org_id: input.orgId as string,
            metadata: { 
              filters: {
                q: input.q,
                entityType: input.entityType,
                action: input.action,
                actorId: input.actorId,
                from: input.from,
                to: input.to,
              },
              offline: true,
            },
          });
          
          return { csv };
        }

        // Build query for export
        let query = ctx.supabase
          .from('audit_logs')
          .select('*')
          .eq('org_id', input.orgId as string)
          .order('created_at', { ascending: false });

        // Apply filters
        if (input.q) {
          query = query.or(`action.ilike.%${input.q}%,entity_type.ilike.%${input.q}%,entity_id.ilike.%${input.q}%,metadata::text.ilike.%${input.q}%`);
        }

        if (input.entityType) {
          query = query.eq('entity_type', input.entityType);
        }

        if (input.action) {
          query = query.eq('action', input.action);
        }

        if (input.actorId) {
          query = query.eq('actor_id', input.actorId);
        }

        if (input.from) {
          query = query.gte('created_at', input.from);
        }

        if (input.to) {
          query = query.lte('created_at', input.to);
        }

        const { data: logs, error } = await query;

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to export audit logs',
          });
        }

        // Generate CSV
        const csv = generateCsv(logs || []);

        // Emit analytics event
        await emitAnalyticsEvent(ctx.user.id, 'audit.exported', {
          org_id: input.orgId as string,
          metadata: { 
            filters: {
              q: input.q,
              entityType: input.entityType,
              action: input.action,
              actorId: input.actorId,
              from: input.from,
              to: input.to,
            },
            record_count: logs?.length || 0,
          },
        });

        return { csv };
      } catch (error) {
        console.error('Error exporting audit logs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export audit logs',
        });
      }
    }),
});

/**
 * Generate CSV from audit logs
 */
function generateCsv(logs: any[]): string {
  if (logs.length === 0) {
    return 'id,org_id,actor_id,action,entity_type,entity_id,metadata,created_at\n';
  }

  const headers = [
    'id',
    'org_id', 
    'actor_id',
    'action',
    'entity_type',
    'entity_id',
    'metadata',
    'created_at'
  ];

  const csvRows = logs.map(log => [
    log.id,
    log.org_id,
    log.actor_id || '',
    log.action,
    log.entity_type,
    log.entity_id,
    JSON.stringify(log.metadata),
    log.created_at,
  ]);

  const csvContent = [headers, ...csvRows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}
