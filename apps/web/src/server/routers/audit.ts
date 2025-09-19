import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/api/root';
import { 
  AppendAuditLogInput,
  ListAuditLogsInput,
  AuditStatsInput,
  ExportAuditLogsInput,
  AuditLogsResponse,
  AuditStatsResponse,
  AuditAnalyticsEvent,
  AuditAnalyticsPayload
} from '@/types/audit';
import { auditStore } from '../mocks/audit.store';
import { createClient } from '@/utils/supabase/server';

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
          org_id: input.orgId,
          actor_id: ctx.user.id,
          action: input.action,
          entity_type: input.entityType,
          entity_id: input.entityId,
          metadata: input.metadata || {},
        };

        if (isOfflineMode) {
          const result = await auditStore.appendLog(auditLog);
          
          // Emit analytics event
          await emitAnalyticsEvent(ctx.user.id, 'audit.appended', {
            org_id: input.orgId,
            action: input.action,
            entity_type: input.entityType,
            actor_id: ctx.user.id,
            metadata: { offline: true },
          });
          
          return result;
        }

        const supabase = createClient();
        
        const { data, error } = await supabase
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
          org_id: input.orgId,
          action: input.action,
          entity_type: input.entityType,
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
          const result = await auditStore.listLogs(input);
          
          // Emit analytics event
          await emitAnalyticsEvent(ctx.user.id, 'audit.viewed', {
            org_id: input.orgId,
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

        const supabase = createClient();
        
        // Build query
        let query = supabase
          .from('audit_logs')
          .select('*', { count: 'exact' })
          .eq('org_id', input.orgId)
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
          const { data: cursorLog } = await supabase
            .from('audit_logs')
            .select('created_at')
            .eq('id', input.cursor)
            .single();
          
          if (cursorLog) {
            query = query.lt('created_at', cursorLog.created_at);
          }
        }

        // Apply limit
        query = query.limit(input.limit + 1); // +1 to check if there are more

        const { data: logs, error, count } = await query;

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch audit logs',
          });
        }

        const hasMore = logs && logs.length > input.limit;
        const paginatedLogs = hasMore ? logs.slice(0, input.limit) : (logs || []);
        const nextCursor = hasMore ? paginatedLogs[paginatedLogs.length - 1]?.id : undefined;

        // Emit analytics event
        await emitAnalyticsEvent(ctx.user.id, 'audit.viewed', {
          org_id: input.orgId,
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
          const result = await auditStore.getStats(input);
          
          return result;
        }

        const supabase = createClient();
        
        // Use the database function for statistics
        const { data, error } = await supabase
          .rpc('get_audit_stats', {
            p_org_id: input.orgId,
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
          const csv = await auditStore.exportCsv(input);
          
          // Emit analytics event
          await emitAnalyticsEvent(ctx.user.id, 'audit.exported', {
            org_id: input.orgId,
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

        const supabase = createClient();
        
        // Build query for export
        let query = supabase
          .from('audit_logs')
          .select('*')
          .eq('org_id', input.orgId)
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
          org_id: input.orgId,
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

/**
 * Emit analytics event
 */
async function emitAnalyticsEvent(
  userId: string,
  event: AuditAnalyticsEvent,
  payload: AuditAnalyticsPayload
): Promise<void> {
  try {
    // Log the event for debugging
    console.log('Audit Analytics Event:', { 
      userId, 
      event, 
      payload,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement actual analytics emission
    // In a real implementation, this would call PostHog or similar:
    // await posthog.capture({
    //   distinctId: userId,
    //   event,
    //   properties: payload,
    // });
    
  } catch (error) {
    console.error('Error emitting analytics event:', error);
    // Don't throw - analytics failures shouldn't break the main flow
  }
}
