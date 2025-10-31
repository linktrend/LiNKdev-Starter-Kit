import { AuditLog } from '@starter/types';

/**
 * Mock data for Audit Logs tab
 * Contains sample audit log entries with various actions, entities, and actors
 */
export const mockAuditLogs: AuditLog[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    org_id: '123e4567-e89b-12d3-a456-426614174000',
    actor_id: '987fcdeb-51a2-43d7-89ab-123456789abc',
    action: 'created',
    entity_type: 'record',
    entity_id: 'rec-001',
    metadata: {
      name: 'Customer Registration Form',
      priority: 'high',
      tags: ['customer', 'registration']
    },
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    org_id: '123e4567-e89b-12d3-a456-426614174000',
    actor_id: '987fcdeb-51a2-43d7-89ab-123456789def',
    action: 'updated',
    entity_type: 'reminder',
    entity_id: 'rem-042',
    metadata: {
      previous_status: 'pending',
      new_status: 'completed',
      completed_at: new Date().toISOString()
    },
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    org_id: '123e4567-e89b-12d3-a456-426614174000',
    actor_id: null, // System action
    action: 'started',
    entity_type: 'automation',
    entity_id: 'auto-123',
    metadata: {
      automation_name: 'Email Notification Workflow',
      trigger: 'schedule',
      scheduled_time: new Date().toISOString()
    },
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    org_id: '123e4567-e89b-12d3-a456-426614174000',
    actor_id: '987fcdeb-51a2-43d7-89ab-123456789ghi',
    action: 'invited',
    entity_type: 'member',
    entity_id: 'inv-789',
    metadata: {
      email: 'newuser@example.com',
      role: 'viewer',
      invited_by: 'admin@example.com'
    },
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    org_id: '123e4567-e89b-12d3-a456-426614174000',
    actor_id: '987fcdeb-51a2-43d7-89ab-123456789abc',
    action: 'deleted',
    entity_type: 'record',
    entity_id: 'rec-045',
    metadata: {
      name: 'Old Document',
      deletion_reason: 'no longer needed',
      soft_delete: true
    },
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    org_id: '123e4567-e89b-12d3-a456-426614174000',
    actor_id: '987fcdeb-51a2-43d7-89ab-123456789jkl',
    action: 'role_changed',
    entity_type: 'member',
    entity_id: 'mem-234',
    metadata: {
      previous_role: 'viewer',
      new_role: 'editor',
      changed_by: 'admin@example.com'
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    org_id: '123e4567-e89b-12d3-a456-426614174000',
    actor_id: null,
    action: 'completed',
    entity_type: 'schedule',
    entity_id: 'sch-567',
    metadata: {
      schedule_name: 'Daily Backup',
      execution_time: '120ms',
      records_processed: 1250
    },
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    org_id: '123e4567-e89b-12d3-a456-426614174000',
    actor_id: '987fcdeb-51a2-43d7-89ab-123456789mno',
    action: 'created',
    entity_type: 'subscription',
    entity_id: 'sub-890',
    metadata: {
      plan: 'premium',
      billing_cycle: 'monthly',
      amount: 99.99,
      currency: 'USD'
    },
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    org_id: '123e4567-e89b-12d3-a456-426614174000',
    actor_id: '987fcdeb-51a2-43d7-89ab-123456789pqr',
    action: 'accepted',
    entity_type: 'invite',
    entity_id: 'inv-345',
    metadata: {
      email: 'newmember@example.com',
      role: 'editor',
      accepted_at: new Date().toISOString()
    },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    org_id: '123e4567-e89b-12d3-a456-426614174000',
    actor_id: null,
    action: 'failed',
    entity_type: 'automation',
    entity_id: 'auto-456',
    metadata: {
      automation_name: 'Data Sync Automation',
      error: 'Connection timeout',
      retry_count: 3,
      last_attempt: new Date().toISOString()
    },
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
];

