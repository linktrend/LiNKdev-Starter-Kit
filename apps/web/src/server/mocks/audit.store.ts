// Offline fallback store for Audit Logs module
// Used when TEMPLATE_OFFLINE=1 or Supabase is not configured

import { AuditLog, AuditLogsResponse, AuditStatsResponse } from '@/types/audit';

interface AuditStore {
  logs: Map<string, AuditLog>;
  byOrg: Map<string, string[]>; // org_id -> log_ids
}

class InMemoryAuditStore {
  private store: AuditStore = {
    logs: new Map(),
    byOrg: new Map(),
  };

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some mock audit logs for demo purposes
    const mockLogs: AuditLog[] = [
      {
        id: 'audit-001',
        org_id: 'org-1',
        actor_id: 'user-1',
        action: 'created',
        entity_type: 'org',
        entity_id: 'org-1',
        metadata: { name: 'Hikari Inc.' },
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      },
      {
        id: 'audit-002',
        org_id: 'org-1',
        actor_id: 'user-1',
        action: 'created',
        entity_type: 'record',
        entity_id: 'record-001',
        metadata: { type: 'contact', name: 'John Doe' },
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      },
      {
        id: 'audit-003',
        org_id: 'org-1',
        actor_id: 'user-2',
        action: 'updated',
        entity_type: 'record',
        entity_id: 'record-001',
        metadata: { changes: { email: 'john.doe@example.com' } },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      {
        id: 'audit-004',
        org_id: 'org-1',
        actor_id: 'user-1',
        action: 'created',
        entity_type: 'reminder',
        entity_id: 'reminder-001',
        metadata: { title: 'Follow up with client', due_at: new Date().toISOString() },
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      },
      {
        id: 'audit-005',
        org_id: 'org-1',
        actor_id: 'user-2',
        action: 'completed',
        entity_type: 'reminder',
        entity_id: 'reminder-001',
        metadata: { completed_at: new Date().toISOString() },
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      },
      {
        id: 'audit-006',
        org_id: 'org-1',
        actor_id: null, // System action
        action: 'updated',
        entity_type: 'subscription',
        entity_id: 'sub-001',
        metadata: { plan: 'pro', status: 'active' },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        id: 'audit-007',
        org_id: 'org-1',
        actor_id: 'user-1',
        action: 'invited',
        entity_type: 'member',
        entity_id: 'invite-001',
        metadata: { email: 'newuser@example.com', role: 'editor' },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
    ];

    mockLogs.forEach(log => {
      this.store.logs.set(log.id, log);
      
      // Index by org
      if (!this.store.byOrg.has(log.org_id)) {
        this.store.byOrg.set(log.org_id, []);
      }
      this.store.byOrg.get(log.org_id)!.push(log.id);
    });
  }

  // Append a new audit log entry
  async appendLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const auditLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    this.store.logs.set(auditLog.id, auditLog);
    
    // Index by org
    if (!this.store.byOrg.has(auditLog.org_id)) {
      this.store.byOrg.set(auditLog.org_id, []);
    }
    this.store.byOrg.get(auditLog.org_id)!.push(auditLog.id);

    return auditLog;
  }

  // List audit logs with filtering and pagination
  async listLogs(params: {
    orgId: string;
    q?: string;
    entityType?: string;
    action?: string;
    actorId?: string;
    from?: string;
    to?: string;
    cursor?: string;
    limit: number;
  }): Promise<AuditLogsResponse> {
    const orgLogIds = this.store.byOrg.get(params.orgId) || [];
    let logs = orgLogIds
      .map(id => this.store.logs.get(id)!)
      .filter(log => log !== undefined)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply filters
    if (params.q) {
      const query = params.q.toLowerCase();
      logs = logs.filter(log => 
        log.action.toLowerCase().includes(query) ||
        log.entity_type.toLowerCase().includes(query) ||
        log.entity_id.toLowerCase().includes(query) ||
        JSON.stringify(log.metadata).toLowerCase().includes(query)
      );
    }

    if (params.entityType) {
      logs = logs.filter(log => log.entity_type === params.entityType);
    }

    if (params.action) {
      logs = logs.filter(log => log.action === params.action);
    }

    if (params.actorId) {
      logs = logs.filter(log => log.actor_id === params.actorId);
    }

    if (params.from) {
      const fromDate = new Date(params.from);
      logs = logs.filter(log => new Date(log.created_at) >= fromDate);
    }

    if (params.to) {
      const toDate = new Date(params.to);
      logs = logs.filter(log => new Date(log.created_at) <= toDate);
    }

    // Apply cursor-based pagination
    let startIndex = 0;
    if (params.cursor) {
      const cursorIndex = logs.findIndex(log => log.id === params.cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const paginatedLogs = logs.slice(startIndex, startIndex + params.limit);
    const hasMore = startIndex + params.limit < logs.length;
    const nextCursor = hasMore ? paginatedLogs[paginatedLogs.length - 1]?.id : undefined;

    return {
      logs: paginatedLogs,
      has_more: hasMore,
      next_cursor: nextCursor,
      total: logs.length,
    };
  }

  // Get audit statistics
  async getStats(params: {
    orgId: string;
    window: 'hour' | 'day' | 'week' | 'month';
  }): Promise<AuditStatsResponse> {
    const orgLogIds = this.store.byOrg.get(params.orgId) || [];
    let logs = orgLogIds
      .map(id => this.store.logs.get(id)!)
      .filter(log => log !== undefined);

    // Apply time window filter
    const now = new Date();
    let windowMs: number;
    
    switch (params.window) {
      case 'hour':
        windowMs = 60 * 60 * 1000;
        break;
      case 'day':
        windowMs = 24 * 60 * 60 * 1000;
        break;
      case 'week':
        windowMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        windowMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        windowMs = 24 * 60 * 60 * 1000;
    }

    const cutoffTime = new Date(now.getTime() - windowMs);
    logs = logs.filter(log => new Date(log.created_at) >= cutoffTime);

    // Calculate statistics
    const byAction: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};
    const byActor: Record<string, number> = {};

    logs.forEach(log => {
      // Count by action
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      
      // Count by entity type
      byEntityType[log.entity_type] = (byEntityType[log.entity_type] || 0) + 1;
      
      // Count by actor
      const actorKey = log.actor_id || 'system';
      byActor[actorKey] = (byActor[actorKey] || 0) + 1;
    });

    return {
      by_action: byAction,
      by_entity_type: byEntityType,
      by_actor: byActor,
      total: logs.length,
      window: params.window,
    };
  }

  // Export audit logs as CSV
  async exportCsv(params: {
    orgId: string;
    q?: string;
    entityType?: string;
    action?: string;
    actorId?: string;
    from?: string;
    to?: string;
  }): Promise<string> {
    const { logs } = await this.listLogs({
      ...params,
      limit: 10000, // Large limit for export
    });

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

  // Get all logs (for admin purposes)
  async getAllLogs(): Promise<AuditLog[]> {
    return Array.from(this.store.logs.values());
  }
}

export const auditStore = new InMemoryAuditStore();
