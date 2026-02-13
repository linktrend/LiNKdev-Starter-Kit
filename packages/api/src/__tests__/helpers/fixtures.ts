import { randomUUID } from 'crypto';
import type { OrgRole } from '@starter/types';

const isoNow = () => new Date().toISOString();

export const TEST_IDS = {
  userOwner: '00000000-0000-4000-8000-000000000001',
  userAdmin: '00000000-0000-4000-8000-000000000002',
  userMember: '00000000-0000-4000-8000-000000000003',
  userViewer: '00000000-0000-4000-8000-000000000004',
  orgPrimary: '00000000-0000-4000-8000-000000000011',
  orgSecondary: '00000000-0000-4000-8000-000000000012',
  invite: '00000000-0000-4000-8000-000000000021',
  auditLog: '00000000-0000-4000-8000-000000000031',
  usageEvent: '00000000-0000-4000-8000-000000000041',
  record1: '550e8400-e29b-41d4-a716-446655440031',
  record2: '550e8400-e29b-41d4-a716-446655440032',
  task1: '550e8400-e29b-41d4-a716-446655440041',
  task2: '550e8400-e29b-41d4-a716-446655440042',
};

export const VALID_ENUMS = {
  accountType: ['super_admin', 'admin', 'user'] as const,
  orgType: ['personal', 'business', 'family', 'education', 'other'] as const,
  inviteRole: ['admin', 'editor', 'viewer'] as const,
  inviteStatus: ['pending', 'accepted', 'expired'] as const,
  membershipRole: ['owner', 'admin', 'editor', 'viewer'] as const,
  usageEventType: [
    'record_created',
    'api_call',
    'automation_run',
    'storage_used',
    'schedule_executed',
    'ai_tokens_used',
    'user_active',
  ] as const,
  invoiceStatus: ['draft', 'open', 'paid', 'void', 'uncollectible'] as const,
  planName: ['free', 'pro', 'business'] as const,
  billingInterval: ['monthly', 'annual'] as const,
};

export const createUuid = () => randomUUID();

export function createUserFixture(overrides: Partial<any> = {}) {
  const id = overrides.id ?? TEST_IDS.userOwner;
  return {
    id,
    email: overrides.email ?? `user-${id}@example.com`,
    full_name: overrides.full_name ?? 'Test User',
    display_name: overrides.display_name ?? null,
    avatar_url: overrides.avatar_url ?? null,
    bio: overrides.bio ?? null,
    account_type: overrides.account_type ?? 'user',
    onboarding_completed: overrides.onboarding_completed ?? false,
    profile_completed: overrides.profile_completed ?? false,
    created_at: overrides.created_at ?? isoNow(),
    updated_at: overrides.updated_at ?? isoNow(),
    ...overrides,
  };
}

export function createOrganizationFixture(overrides: Partial<any> = {}) {
  const id = overrides.id ?? TEST_IDS.orgPrimary;
  const name = overrides.name ?? 'Test Organization';
  return {
    id,
    name,
    owner_id: overrides.owner_id ?? TEST_IDS.userOwner,
    slug: overrides.slug ?? name.toLowerCase().replace(/\s+/g, '-'),
    org_type: overrides.org_type ?? 'business',
    is_personal: overrides.is_personal ?? false,
    settings: overrides.settings ?? {},
    created_at: overrides.created_at ?? isoNow(),
    updated_at: overrides.updated_at ?? isoNow(),
    ...overrides,
  };
}

export function createMembershipFixture(
  orgId: string,
  userId: string,
  role: OrgRole = 'viewer',
  overrides: Partial<any> = {},
) {
  return {
    org_id: orgId,
    user_id: userId,
    role,
    created_at: overrides.created_at ?? isoNow(),
    ...overrides,
  };
}

export function createInviteFixture(overrides: Partial<any> = {}) {
  const id = overrides.id ?? TEST_IDS.invite;
  return {
    id,
    org_id: overrides.org_id ?? TEST_IDS.orgPrimary,
    email: overrides.email ?? `invite-${id}@example.com`,
    role: overrides.role ?? 'viewer',
    token: overrides.token ?? createUuid(),
    invited_by: overrides.invited_by ?? TEST_IDS.userOwner,
    expires_at:
      overrides.expires_at ??
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: overrides.status ?? 'pending',
    created_at: overrides.created_at ?? isoNow(),
    ...overrides,
  };
}

export function createAuditLogFixture(overrides: Partial<any> = {}) {
  const id = overrides.id ?? TEST_IDS.auditLog;
  return {
    id,
    org_id: overrides.org_id ?? TEST_IDS.orgPrimary,
    actor_id: overrides.actor_id ?? TEST_IDS.userOwner,
    action: overrides.action ?? 'audit.event',
    entity_type: overrides.entity_type ?? 'organization',
    entity_id: overrides.entity_id ?? TEST_IDS.orgPrimary,
    metadata: overrides.metadata ?? {},
    created_at: overrides.created_at ?? isoNow(),
    ...overrides,
  };
}

export function createUsageEventFixture(overrides: Partial<any> = {}) {
  const id = overrides.id ?? TEST_IDS.usageEvent;
  return {
    id,
    org_id: overrides.org_id ?? TEST_IDS.orgPrimary,
    user_id: overrides.user_id ?? TEST_IDS.userOwner,
    event_type: overrides.event_type ?? 'api_call',
    quantity: overrides.quantity ?? 1,
    event_data: overrides.event_data ?? {},
    created_at: overrides.created_at ?? isoNow(),
    ...overrides,
  };
}

export function createApiUsageFixture(overrides: Partial<any> = {}) {
  const id = overrides.id ?? createUuid();
  return {
    id,
    org_id: overrides.org_id ?? TEST_IDS.orgPrimary,
    user_id: overrides.user_id ?? TEST_IDS.userOwner,
    endpoint: overrides.endpoint ?? '/api/test',
    method: overrides.method ?? 'GET',
    status_code: overrides.status_code ?? 200,
    response_time_ms: overrides.response_time_ms ?? 120,
    ip_address: overrides.ip_address ?? '127.0.0.1',
    user_agent: overrides.user_agent ?? 'Vitest',
    created_at: overrides.created_at ?? isoNow(),
    ...overrides,
  };
}

export function createUserSettingsFixture(userId: string, overrides: Partial<any> = {}) {
  return {
    user_id: userId,
    theme: overrides.theme ?? 'system',
    language: overrides.language ?? 'en',
    timezone: overrides.timezone ?? 'UTC',
    email_notifications: overrides.email_notifications ?? {
      marketing: true,
      features: true,
      security: true,
      updates: true,
    },
    push_notifications: overrides.push_notifications ?? {
      enabled: false,
      browser: false,
      mobile: false,
    },
    created_at: overrides.created_at ?? isoNow(),
    updated_at: overrides.updated_at ?? isoNow(),
    ...overrides,
  };
}

export function createOrgSettingsFixture(orgId: string, overrides: Partial<any> = {}) {
  return {
    org_id: orgId,
    settings:
      overrides.settings ??
      {
        features: {},
        limits: {},
        integrations: {},
      },
    created_at: overrides.created_at ?? isoNow(),
    updated_at: overrides.updated_at ?? isoNow(),
    ...overrides,
  };
}

export const defaultFixtures = {
  users: [createUserFixture()],
  organizations: [createOrganizationFixture()],
  organization_members: [createMembershipFixture(TEST_IDS.orgPrimary, TEST_IDS.userOwner, 'owner')],
};

export const createMockRecord = (overrides: Partial<any> = {}) => ({
  id: overrides.id ?? TEST_IDS.record1,
  org_id: overrides.org_id ?? TEST_IDS.orgPrimary,
  type_id: overrides.type_id ?? 'type-1',
  user_id: overrides.user_id ?? TEST_IDS.userOwner,
  title: overrides.title ?? 'Test Record',
  content: overrides.content ?? 'Test content',
  data: overrides.data ?? { field: 'value' },
  created_by: overrides.created_by ?? TEST_IDS.userOwner,
  created_at: overrides.created_at ?? isoNow(),
  updated_at: overrides.updated_at ?? isoNow(),
  ...overrides,
});

export const createMockTask = (overrides: Partial<any> = {}) => ({
  id: overrides.id ?? TEST_IDS.task1,
  org_id: overrides.org_id ?? TEST_IDS.orgPrimary,
  title: overrides.title ?? 'Test Task',
  description: overrides.description ?? 'Test description',
  status: overrides.status ?? 'todo',
  priority: overrides.priority ?? 'normal',
  assignee_id: overrides.assignee_id ?? null,
  metadata: overrides.metadata ?? {},
  due_date: overrides.due_date ?? null,
  created_at: overrides.created_at ?? isoNow(),
  updated_at: overrides.updated_at ?? isoNow(),
  ...overrides,
});
