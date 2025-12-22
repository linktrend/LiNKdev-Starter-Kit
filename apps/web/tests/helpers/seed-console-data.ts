import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getDefaultOrgId } from './admin-setup';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type SeedClients = {
  service: SupabaseClient;
  orgId: string;
};

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing ${name} environment variable for console seed helper`);
  }
  return value;
}

function getClients(): SeedClients {
  const orgId = getDefaultOrgId();
  const service = createClient(
    requireEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  return { service, orgId };
}

const errorIds = [
  '90000000-0000-0000-0000-000000000011',
  '90000000-0000-0000-0000-000000000012',
  '90000000-0000-0000-0000-000000000013',
];

const auditIds = [
  '80000000-0000-0000-0000-000000000011',
  '80000000-0000-0000-0000-000000000012',
  '80000000-0000-0000-0000-000000000013',
];

const usageIds = [
  '70000000-0000-0000-0000-000000000011',
  '70000000-0000-0000-0000-000000000012',
  '70000000-0000-0000-0000-000000000013',
];

export async function seedConsoleData() {
  const { service, orgId } = getClients();
  const now = new Date();

  // Errors (stored in audit_logs with entity_type = 'error')
  await service.from('audit_logs').upsert([
    {
      id: errorIds[0],
      org_id: orgId,
      actor_id: null,
      action: 'error.logged',
      entity_type: 'error',
      entity_id: 'db-connection',
      severity: 'critical',
      message: 'Database connection timeout',
      metadata: { page: '/console/errors', code: 'ETIMEDOUT' },
      resolved: false,
      occurrence_count: 3,
      first_seen: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      last_seen: now.toISOString(),
      created_at: now.toISOString(),
    },
    {
      id: errorIds[1],
      org_id: orgId,
      actor_id: null,
      action: 'error.logged',
      entity_type: 'error',
      entity_id: 'api-rate-limit',
      severity: 'warning',
      message: 'API rate limit nearing threshold',
      metadata: { limit: 1000, used: 920 },
      resolved: false,
      occurrence_count: 1,
      first_seen: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      last_seen: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: errorIds[2],
      org_id: orgId,
      actor_id: null,
      action: 'error.logged',
      entity_type: 'error',
      entity_id: 'ui-validation',
      severity: 'info',
      message: 'Client-side validation triggered',
      metadata: { field: 'email' },
      resolved: true,
      occurrence_count: 5,
      first_seen: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      last_seen: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  // Audit events (non-error)
  await service.from('audit_logs').upsert([
    {
      id: auditIds[0],
      org_id: orgId,
      actor_id: null,
      action: 'member.invited',
      entity_type: 'user',
      entity_id: 'security@example.com',
      metadata: { role: 'viewer' },
      created_at: now.toISOString(),
    },
    {
      id: auditIds[1],
      org_id: orgId,
      actor_id: null,
      action: 'member.role_changed',
      entity_type: 'member',
      entity_id: 'user1@ltm.dev',
      metadata: { from: 'viewer', to: 'editor' },
      created_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: auditIds[2],
      org_id: orgId,
      actor_id: null,
      action: 'session.revoked',
      entity_type: 'session',
      entity_id: 'session-revoked',
      metadata: { reason: 'admin_manual' },
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  // Usage events for analytics
  await service.from('usage_events').upsert([
    {
      id: usageIds[0],
      org_id: orgId,
      user_id: null,
      event_type: 'api_call',
      event_data: { path: '/records' },
      quantity: 12,
      created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: usageIds[1],
      org_id: orgId,
      user_id: null,
      event_type: 'user_active',
      event_data: { device: 'web' },
      quantity: 3,
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: usageIds[2],
      org_id: orgId,
      user_id: null,
      event_type: 'ai_tokens_used',
      event_data: { model: 'gpt-4.1' },
      quantity: 4800,
      created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    },
  ]);

  return { orgId, errorIds, auditIds, usageIds };
}

export async function clearConsoleData() {
  const { service, orgId } = getClients();
  await service.from('audit_logs').delete().eq('org_id', orgId).in('id', [...errorIds, ...auditIds]);
  await service.from('usage_events').delete().eq('org_id', orgId).in('id', usageIds);
}
