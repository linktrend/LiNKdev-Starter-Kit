/**
 * System Log Entry Interface
 * Represents system-level logs for infrastructure monitoring
 */
export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: 'database' | 'server' | 'api' | 'auth' | 'storage' | 'realtime' | 'edge-function';
  message: string;
  metadata?: {
    request_id?: string;
    user_id?: string;
    duration_ms?: number;
    status_code?: number;
    method?: string;
    path?: string;
    query?: string;
    [key: string]: any;
  };
}

/**
 * Mock data for System Logs tab
 * Contains sample system log entries with various levels, sources, and metadata
 */
export const mockSystemLogs: SystemLog[] = [
  {
    id: 'sys-001',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    level: 'info',
    source: 'database',
    message: 'Database backup completed successfully',
    metadata: {
      backup_size: '2.4 GB',
      duration_ms: 45000,
      tables_backed_up: 23
    }
  },
  {
    id: 'sys-002',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    level: 'info',
    source: 'server',
    message: 'API server started on port 3000',
    metadata: {
      environment: 'production',
      node_version: '20.11.0',
      uptime: 3600000
    }
  },
  {
    id: 'sys-003',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    level: 'warn',
    source: 'server',
    message: 'High memory usage detected (85%)',
    metadata: {
      memory_used: '6.8 GB',
      memory_total: '8.0 GB',
      threshold: 80
    }
  },
  {
    id: 'sys-004',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 minutes ago
    level: 'info',
    source: 'auth',
    message: 'User authentication successful',
    metadata: {
      user_id: '987fcdeb-51a2-43d7-89ab-123456789abc',
      method: 'email',
      ip_address: '192.168.1.100'
    }
  },
  {
    id: 'sys-005',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    level: 'error',
    source: 'api',
    message: 'Failed to process webhook request',
    metadata: {
      request_id: 'req-abc123',
      status_code: 500,
      error: 'Timeout after 30s',
      endpoint: '/api/webhooks/stripe',
      duration_ms: 30000
    }
  },
  {
    id: 'sys-006',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
    level: 'info',
    source: 'storage',
    message: 'File upload completed',
    metadata: {
      file_id: 'file-xyz789',
      file_size: '5.2 MB',
      file_type: 'image/png',
      bucket: 'user-uploads',
      duration_ms: 1200
    }
  },
  {
    id: 'sys-007',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
    level: 'warn',
    source: 'database',
    message: 'Slow query detected',
    metadata: {
      query: 'SELECT * FROM records WHERE org_id = $1',
      duration_ms: 3500,
      threshold_ms: 2000,
      table: 'records'
    }
  },
  {
    id: 'sys-008',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    level: 'info',
    source: 'realtime',
    message: 'WebSocket connection established',
    metadata: {
      connection_id: 'conn-456',
      channel: 'audit_logs',
      user_id: '987fcdeb-51a2-43d7-89ab-123456789def'
    }
  },
  {
    id: 'sys-009',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 minutes ago
    level: 'debug',
    source: 'edge-function',
    message: 'Edge function execution started',
    metadata: {
      function_name: 'send-email-notification',
      region: 'us-east-1',
      execution_id: 'exec-789'
    }
  },
  {
    id: 'sys-010',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 minutes ago
    level: 'info',
    source: 'api',
    message: 'API request processed successfully',
    metadata: {
      request_id: 'req-def456',
      method: 'POST',
      path: '/api/records',
      status_code: 201,
      duration_ms: 145
    }
  },
  {
    id: 'sys-011',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    level: 'error',
    source: 'auth',
    message: 'Failed login attempt',
    metadata: {
      email: 'user@example.com',
      reason: 'invalid_password',
      ip_address: '192.168.1.200',
      attempt_count: 3
    }
  },
  {
    id: 'sys-012',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(), // 50 minutes ago
    level: 'info',
    source: 'database',
    message: 'Migration applied successfully',
    metadata: {
      migration_name: '20250130_add_audit_indexes',
      version: '002',
      duration_ms: 2300
    }
  },
  {
    id: 'sys-013',
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(), // 55 minutes ago
    level: 'warn',
    source: 'storage',
    message: 'Storage quota approaching limit',
    metadata: {
      used: '45 GB',
      total: '50 GB',
      percentage: 90,
      threshold: 85
    }
  },
  {
    id: 'sys-014',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    level: 'info',
    source: 'realtime',
    message: 'Broadcast message sent',
    metadata: {
      channel: 'notifications',
      subscribers: 150,
      message_type: 'system_update'
    }
  },
  {
    id: 'sys-015',
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(), // 1 hour 5 minutes ago
    level: 'debug',
    source: 'edge-function',
    message: 'Edge function execution completed',
    metadata: {
      function_name: 'process-payment',
      duration_ms: 890,
      status: 'success',
      execution_id: 'exec-012'
    }
  },
];

