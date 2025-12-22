import { vi } from 'vitest';
import type { OrgRole } from '@starter/types';
import { createSupabaseMock } from './supabaseMock';

const uuid = (suffix: string | number) =>
  `00000000-0000-4000-8000-${suffix.toString().padStart(12, '0')}`;

type SupabaseMock = ReturnType<typeof createSupabaseMock>;

function queueMembership(table: SupabaseMock['getTable'] extends (table: infer _T) => infer R ? R : never, role: OrgRole) {
  // Ensure both chained .single() and any eq() calls have data
  table.__queueSingleResponse({ data: { role }, error: null });
  table.__queueEqResponse({ data: [{ role }], error: null });
}

/**
 * Mock requireMember middleware by priming membership lookups.
 */
export function mockRequireMember(
  supabaseMock: SupabaseMock,
  _orgId: string,
  _userId: string,
  role: OrgRole = 'admin',
) {
  const members = supabaseMock.getTable('organization_members');
  queueMembership(members, role);
  return supabaseMock;
}

/**
 * Mock requireAdmin middleware by priming membership lookups with an admin role.
 */
export function mockRequireAdmin(
  supabaseMock: SupabaseMock,
  _orgId: string,
  _userId: string,
  role: OrgRole = 'admin',
) {
  const members = supabaseMock.getTable('organization_members');
  queueMembership(members, role);
  return supabaseMock;
}

/**
 * Mock requireOrgRole middleware by returning a membership that meets the required role.
 */
export function mockRequireOrgRole(
  supabaseMock: SupabaseMock,
  _orgId: string,
  _userId: string,
  role: OrgRole = 'admin',
) {
  const members = supabaseMock.getTable('organization_members');
  queueMembership(members, role);
  return supabaseMock;
}

/**
 * Mock ensureCanManageMembers guard.
 */
export function mockEnsureCanManageMembers(
  supabaseMock: SupabaseMock,
  _orgId: string,
  _userId: string,
  role: OrgRole = 'admin',
) {
  const members = supabaseMock.getTable('organization_members');
  queueMembership(members, role);
  return supabaseMock;
}

/**
 * Mock ensureCanChangeRole guard. Defaults permit owner changing another user's role.
 */
export function mockEnsureCanChangeRole(
  supabaseMock: SupabaseMock,
  _orgId: string,
  _actorId: string,
  targetRole: OrgRole = 'editor',
  nextRole: OrgRole = 'viewer',
  actorRole: OrgRole = 'owner',
) {
  const members = supabaseMock.getTable('organization_members');
  queueMembership(members, actorRole);
  // Target role lookups (when present) can reuse the same queued responses
  members.__queueSingleResponse({ data: { role: targetRole }, error: null });
  members.__queueSingleResponse({ data: { role: nextRole }, error: null });
  return supabaseMock;
}

export type TestContext = {
  user: { id: string; email?: string };
  supabase: SupabaseMock['supabase'] & { rpc: ReturnType<typeof vi.fn> };
  orgId?: string;
  userRole?: OrgRole;
};

/**
 * Create a baseline tRPC test context with Supabase + RPC mock.
 */
export function createTestContext(overrides: Partial<TestContext> = {}) {
  const supabaseCore = createSupabaseMock();
  const rpc = vi.fn();
  const supabase = { ...supabaseCore.supabase, rpc };

  const ctx: TestContext = {
    user: { id: uuid(1), email: 'test@example.com' },
    orgId: uuid(2),
    userRole: 'admin',
    supabase,
    ...overrides,
  };

  return {
    ctx,
    supabase,
    rpc,
    getTable: supabaseCore.getTable,
    supabaseMock: supabaseCore,
  };
}
