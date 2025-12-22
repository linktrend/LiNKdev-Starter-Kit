import { randomUUID } from 'crypto';
import {
  TEST_IDS,
  createApiUsageFixture,
  createAuditLogFixture,
  createInviteFixture,
  createMembershipFixture,
  createOrganizationFixture,
  createUsageEventFixture,
  createUserFixture,
  createUserSettingsFixture,
  createOrgSettingsFixture,
} from '../../helpers/fixtures';
import type { OrgRole } from '@starter/types';

let idCounter = 0;

export { TEST_IDS };

/**
 * Generate a unique test ID
 */
export function generateTestId(prefix: string = 'test'): string {
  idCounter++;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

/**
 * Generate a real v4 UUID
 */
export function generateUUID(): string {
  return randomUUID();
}

/**
 * Create a test user aligned to schema defaults
 */
export function createTestUser(overrides: Partial<any> = {}) {
  const id = overrides.id || generateUUID();
  return createUserFixture({
    id,
    email: overrides.email || `user-${id}@example.com`,
    ...overrides,
  });
}

/**
 * Create a test organization
 */
export function createTestOrganization(overrides: Partial<any> = {}) {
  return createOrganizationFixture({
    id: overrides.id || generateUUID(),
    owner_id: overrides.owner_id || TEST_IDS.userOwner,
    ...overrides,
  });
}

/**
 * Create a test organization membership
 */
export function createTestMembership(
  orgId: string,
  userId: string,
  role: OrgRole = 'viewer',
  overrides: Partial<any> = {},
) {
  return createMembershipFixture(orgId, userId, role, overrides);
}

/**
 * Create a test notification
 */
export function createTestNotification(overrides: Partial<any> = {}) {
  const id = overrides.id || generateUUID();
  return {
    id,
    org_id: overrides.org_id || generateUUID(),
    user_id: overrides.user_id || generateUUID(),
    type: overrides.type || 'info',
    title: overrides.title || 'Test Notification',
    message: overrides.message || 'This is a test notification',
    read: overrides.read ?? false,
    metadata: overrides.metadata || {},
    created_at: overrides.created_at || new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create test user settings
 */
export function createTestUserSettings(userId: string, overrides: Partial<any> = {}) {
  return createUserSettingsFixture(userId, overrides);
}

/**
 * Create test org settings
 */
export function createTestOrgSettings(orgId: string, overrides: Partial<any> = {}) {
  return createOrgSettingsFixture(orgId, overrides);
}

/**
 * Create a test team invite
 */
export function createTestTeamInvite(overrides: Partial<any> = {}) {
  return createInviteFixture({
    id: overrides.id || generateUUID(),
    ...overrides,
  });
}

/**
 * Create a test audit log
 */
export function createTestAuditLog(overrides: Partial<any> = {}) {
  return createAuditLogFixture({
    id: overrides.id || generateUUID(),
    ...overrides,
  });
}

/**
 * Create a test usage event
 */
export function createTestUsageEvent(overrides: Partial<any> = {}) {
  return createUsageEventFixture({
    id: overrides.id || generateUUID(),
    ...overrides,
  });
}

/**
 * Create test API usage record
 */
export function createTestApiUsage(overrides: Partial<any> = {}) {
  return createApiUsageFixture({
    id: overrides.id || generateUUID(),
    ...overrides,
  });
}

/**
 * Create a batch of test notifications
 */
export function createTestNotifications(count: number, baseOverrides: Partial<any> = {}) {
  return Array.from({ length: count }, (_, i) =>
    createTestNotification({
      ...baseOverrides,
      title: `${baseOverrides.title || 'Test Notification'} ${i + 1}`,
    }),
  );
}

/**
 * Create a batch of test audit logs
 */
export function createTestAuditLogs(count: number, baseOverrides: Partial<any> = {}) {
  const baseAction = baseOverrides.action ?? 'audit.event';
  return Array.from({ length: count }, (_, i) =>
    createTestAuditLog({
      ...baseOverrides,
      action: baseOverrides.action ? baseAction : `${baseAction}_${i + 1}`,
    }),
  );
}

/**
 * Create a batch of test usage events
 */
export function createTestUsageEvents(count: number, baseOverrides: Partial<any> = {}) {
  return Array.from({ length: count }, (_, i) =>
    createTestUsageEvent({
      ...baseOverrides,
      created_at: new Date(Date.now() - i * 60000).toISOString(), // 1 minute apart
    }),
  );
}

/**
 * Date/time helpers
 */
export const dateHelpers = {
  now: () => new Date(),
  yesterday: () => new Date(Date.now() - 24 * 60 * 60 * 1000),
  tomorrow: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  daysAgo: (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000),
  daysFromNow: (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  hoursAgo: (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000),
  hoursFromNow: (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000),
  toISO: (date: Date) => date.toISOString(),
};

/**
 * Reset the ID counter (useful for test isolation)
 */
export function resetIdCounter() {
  idCounter = 0;
}
