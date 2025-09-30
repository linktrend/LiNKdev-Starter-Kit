// Note: z is imported but not used in this file
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { 
  AppendAuditLogInput,
  ListAuditLogsInput,
  AuditStatsInput,
  ExportAuditLogsInput,
  AuditLogsResponse,
  AuditStatsResponse,
  AuditAnalyticsEvent,
  AuditAnalyticsPayload
} from '@starter/types';

// Note: These utility functions and stores will need to be provided by the consuming application
declare const auditStore: any;
declare const emitAnalyticsEvent: (userId: string, event: AuditAnalyticsEvent, payload: AuditAnalyticsPayload) => Promise<void>;

const isOfflineMode = process.env.TEMPLATE_OFFLINE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

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

        if (isOfflineMode) {
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
        if (isOfflineMode) {
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
        if (isOfflineMode) {
          const result = await auditStore.getStats({
            ...input,
            orgId: input.orgId as string,
            window: input.window || 'day',
          });
          
          return result;
        }

        // Use the database function for statistics
        const { data, error } = await ctx.supabase
          .rpc('get_audit_stats', {
            p_org_id: input.orgId as string,
            p_window: input.window,
          });

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch audit statistics',
          });
        }

        const stats = data?.[0] || {
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
   * Export audit logs as CSV
   */
  exportCsv: protectedProcedure
    .input(ExportAuditLogsInput)
    .mutation(async ({ input, ctx }) => {
      try {
        if (isOfflineMode) {
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
