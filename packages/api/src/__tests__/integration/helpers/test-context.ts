/**
 * Test Context Factory for Integration Tests
 * 
 * Provides utilities for creating tRPC callers with different user roles and contexts.
 * Supports state tracking for database verification in integration tests.
 */

import { vi } from 'vitest';
import type { TRPCContext } from '../../../context';
import type { OrgRole } from '@starter/types';
import { appRouter } from '../../../root';
import { createSupabaseMock } from '../../helpers/supabaseMock';

const uuid = (suffix: string | number) =>
  `00000000-0000-4000-8000-${suffix.toString().padStart(12, '0')}`;

export interface TestUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export interface TestContextOptions {
  user?: TestUser;
  orgId?: string;
  userRole?: OrgRole;
  usageLogger?: any;
  posthog?: any;
  headers?: Headers;
}

/**
 * Enhanced Supabase mock with state tracking for integration tests
 */
export function createIntegrationSupabaseMock(seed?: Record<string, any | any[]>) {
  const baseMock = createSupabaseMock();
  if (seed) {
    baseMock.seedWith(seed);
  }
  
  // In-memory database state for integration tests
  const state = {
    users: new Map<string, any>(),
    organizations: new Map<string, any>(),
    organization_members: new Map<string, any>(),
    notifications: new Map<string, any>(),
    user_settings: new Map<string, any>(),
    org_settings: new Map<string, any>(),
    team_invites: new Map<string, any>(),
    audit_logs: new Map<string, any>(),
    usage_events: new Map<string, any>(),
    api_usage: new Map<string, any>(),
  };

  return {
    supabase: baseMock.supabase,
    getTable: baseMock.getTable,
    seedWith: baseMock.seedWith,
    state,
    reset: () => {
      state.users.clear();
      state.organizations.clear();
      state.organization_members.clear();
      state.notifications.clear();
      state.user_settings.clear();
      state.org_settings.clear();
      state.team_invites.clear();
      state.audit_logs.clear();
      state.usage_events.clear();
      state.api_usage.clear();
    },
  };
}

/**
 * Create a tRPC caller with test context
 */
export function createTestCaller(options: TestContextOptions = {}): any {
  const {
    user = { id: uuid(1), email: 'test@example.com' },
    orgId = uuid(2),
    userRole,
    usageLogger = vi.fn(),
    posthog = null,
    headers,
  } = options;

  const mock = createIntegrationSupabaseMock();

  const context: TRPCContext = {
    supabase: mock.supabase as any,
    user,
    orgId,
    userRole,
    usageLogger,
    posthog,
    headers,
  };

  const caller = appRouter.createCaller(context);

  return {
    caller,
    context,
    mock,
    supabase: mock.supabase,
    getTable: mock.getTable,
    state: mock.state,
    reset: mock.reset,
  };
}

/**
 * Create multiple callers with different roles for permission testing
 */
export function createMultiRoleCallers(orgId: string): any {
  const ownerUser = { id: uuid(10), email: 'owner@example.com' };
  const adminUser = { id: uuid(11), email: 'admin@example.com' };
  const editorUser = { id: uuid(12), email: 'editor@example.com' };
  const viewerUser = { id: uuid(13), email: 'viewer@example.com' };
  const nonMemberUser = { id: uuid(14), email: 'nonmember@example.com' };

  const owner = createTestCaller({ user: ownerUser, orgId, userRole: 'owner' });
  const admin = createTestCaller({ user: adminUser, orgId, userRole: 'admin' });
  const editor = createTestCaller({ user: editorUser, orgId, userRole: 'editor' });
  const viewer = createTestCaller({ user: viewerUser, orgId, userRole: 'viewer' });
  const nonMember = createTestCaller({ user: nonMemberUser });

  return {
    owner,
    admin,
    editor,
    viewer,
    nonMember,
    users: {
      owner: ownerUser,
      admin: adminUser,
      editor: editorUser,
      viewer: viewerUser,
      nonMember: nonMemberUser,
    },
  };
}

/**
 * Setup organization with members for testing
 */
export function setupOrgWithMembers(orgId: string, ownerId: string) {
  const mock = createIntegrationSupabaseMock();
  const { getTable } = mock;

  // Create organization
  const orgs = getTable('organizations');
  orgs.single.mockResolvedValueOnce({
    data: {
      id: orgId,
      name: 'Test Organization',
      slug: 'test-org',
      owner_id: ownerId,
      org_type: 'business',
      is_personal: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    error: null,
  });

  // Create owner membership
  const members = getTable('organization_members');
  members.single.mockResolvedValueOnce({
    data: {
      org_id: orgId,
      user_id: ownerId,
      role: 'owner',
      created_at: new Date().toISOString(),
    },
    error: null,
  });

  return mock;
}

/**
 * Mock usage logger for testing
 */
export function createMockUsageLogger() {
  const logs: any[] = [];
  
  const logger = vi.fn((payload: any) => {
    logs.push(payload);
  });

  return {
    logger,
    logs,
    clear: () => logs.splice(0, logs.length),
    getLogs: () => [...logs],
    getLogsByType: (eventType: string) => logs.filter(l => l.eventType === eventType),
  };
}

/**
 * Wait for async operations to complete
 */
export async function waitForAsync(ms: number = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
