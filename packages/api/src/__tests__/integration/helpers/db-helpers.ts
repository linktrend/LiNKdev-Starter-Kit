/**
 * Database Verification Helpers for Integration Tests
 * 
 * Provides utilities for verifying database state changes in integration tests.
 */

import { expect } from 'vitest';

/**
 * Database state interface for mock verification
 */
export interface MockDatabaseState {
  users: Map<string, any>;
  organizations: Map<string, any>;
  organization_members: Map<string, any>;
  notifications: Map<string, any>;
  user_settings: Map<string, any>;
  org_settings: Map<string, any>;
  team_invites: Map<string, any>;
  audit_logs: Map<string, any>;
  usage_events: Map<string, any>;
  api_usage: Map<string, any>;
}

/**
 * Verify a user exists in the database
 */
export function assertUserExists(state: MockDatabaseState, userId: string, expectedData?: Partial<any>) {
  const user = state.users.get(userId);
  expect(user, `User ${userId} should exist`).toBeDefined();
  
  if (expectedData) {
    expect(user).toMatchObject(expectedData);
  }
  
  return user;
}

/**
 * Verify a user does not exist in the database
 */
export function assertUserNotExists(state: MockDatabaseState, userId: string) {
  const user = state.users.get(userId);
  expect(user, `User ${userId} should not exist`).toBeUndefined();
}

/**
 * Verify an organization exists in the database
 */
export function assertOrgExists(state: MockDatabaseState, orgId: string, expectedData?: Partial<any>) {
  const org = state.organizations.get(orgId);
  expect(org, `Organization ${orgId} should exist`).toBeDefined();
  
  if (expectedData) {
    expect(org).toMatchObject(expectedData);
  }
  
  return org;
}

/**
 * Verify an organization does not exist in the database
 */
export function assertOrgNotExists(state: MockDatabaseState, orgId: string) {
  const org = state.organizations.get(orgId);
  expect(org, `Organization ${orgId} should not exist`).toBeUndefined();
}

/**
 * Verify a membership exists in the database
 */
export function assertMembershipExists(
  state: MockDatabaseState,
  orgId: string,
  userId: string,
  expectedRole?: string
) {
  const membershipKey = `${orgId}:${userId}`;
  const membership = state.organization_members.get(membershipKey);
  expect(membership, `Membership ${membershipKey} should exist`).toBeDefined();
  
  if (expectedRole) {
    expect(membership.role).toBe(expectedRole);
  }
  
  return membership;
}

/**
 * Verify a membership does not exist in the database
 */
export function assertMembershipNotExists(state: MockDatabaseState, orgId: string, userId: string) {
  const membershipKey = `${orgId}:${userId}`;
  const membership = state.organization_members.get(membershipKey);
  expect(membership, `Membership ${membershipKey} should not exist`).toBeUndefined();
}

/**
 * Get all memberships for an organization
 */
export function getMembershipsForOrg(state: MockDatabaseState, orgId: string) {
  const memberships: any[] = [];

  for (const [_key, membership] of state.organization_members.entries()) {
    if (membership.org_id === orgId) {
      memberships.push(membership);
    }
  }

  return memberships;
}

/**
 * Get all memberships for a user
 */
export function getMembershipsForUser(state: MockDatabaseState, userId: string) {
  const memberships: any[] = [];

  for (const [_key, membership] of state.organization_members.entries()) {
    if (membership.user_id === userId) {
      memberships.push(membership);
    }
  }

  return memberships;
}

/**
 * Verify a notification exists in the database
 */
export function assertNotificationExists(
  state: MockDatabaseState,
  notificationId: string,
  expectedData?: Partial<any>
) {
  const notification = state.notifications.get(notificationId);
  expect(notification, `Notification ${notificationId} should exist`).toBeDefined();
  
  if (expectedData) {
    expect(notification).toMatchObject(expectedData);
  }
  
  return notification;
}

/**
 * Get all notifications for a user in an org
 */
export function getNotificationsForUser(state: MockDatabaseState, orgId: string, userId: string) {
  const notifications: any[] = [];

  for (const [_key, notification] of state.notifications.entries()) {
    if (notification.org_id === orgId && notification.user_id === userId) {
      notifications.push(notification);
    }
  }

  return notifications;
}

/**
 * Count unread notifications for a user in an org
 */
export function countUnreadNotifications(state: MockDatabaseState, orgId: string, userId: string) {
  return getNotificationsForUser(state, orgId, userId).filter(n => !n.read).length;
}

/**
 * Verify user settings exist
 */
export function assertUserSettingsExist(
  state: MockDatabaseState,
  userId: string,
  expectedData?: Partial<any>
) {
  const settings = state.user_settings.get(userId);
  expect(settings, `User settings for ${userId} should exist`).toBeDefined();
  
  if (expectedData) {
    expect(settings).toMatchObject(expectedData);
  }
  
  return settings;
}

/**
 * Verify org settings exist
 */
export function assertOrgSettingsExist(
  state: MockDatabaseState,
  orgId: string,
  expectedData?: Partial<any>
) {
  const settings = state.org_settings.get(orgId);
  expect(settings, `Org settings for ${orgId} should exist`).toBeDefined();
  
  if (expectedData) {
    expect(settings).toMatchObject(expectedData);
  }
  
  return settings;
}

/**
 * Verify a team invite exists
 */
export function assertTeamInviteExists(
  state: MockDatabaseState,
  inviteId: string,
  expectedData?: Partial<any>
) {
  const invite = state.team_invites.get(inviteId);
  expect(invite, `Team invite ${inviteId} should exist`).toBeDefined();
  
  if (expectedData) {
    expect(invite).toMatchObject(expectedData);
  }
  
  return invite;
}

/**
 * Get all pending invites for an org
 */
export function getPendingInvitesForOrg(state: MockDatabaseState, orgId: string) {
  const invites: any[] = [];
  
  for (const [_key, invite] of state.team_invites.entries()) {
    if (invite.org_id === orgId && invite.status === 'pending') {
      invites.push(invite);
    }
  }
  
  return invites;
}

/**
 * Verify an audit log exists
 */
export function assertAuditLogExists(
  state: MockDatabaseState,
  logId: string,
  expectedData?: Partial<any>
) {
  const log = state.audit_logs.get(logId);
  expect(log, `Audit log ${logId} should exist`).toBeDefined();
  
  if (expectedData) {
    expect(log).toMatchObject(expectedData);
  }
  
  return log;
}

/**
 * Get all audit logs for an org
 */
export function getAuditLogsForOrg(state: MockDatabaseState, orgId: string) {
  const logs: any[] = [];
  
  for (const [_key, log] of state.audit_logs.entries()) {
    if (log.org_id === orgId) {
      logs.push(log);
    }
  }
  
  return logs;
}

/**
 * Get audit logs by action
 */
export function getAuditLogsByAction(state: MockDatabaseState, orgId: string, action: string) {
  return getAuditLogsForOrg(state, orgId).filter(log => log.action === action);
}

/**
 * Verify a usage event exists
 */
export function assertUsageEventExists(
  state: MockDatabaseState,
  eventId: string,
  expectedData?: Partial<any>
) {
  const event = state.usage_events.get(eventId);
  expect(event, `Usage event ${eventId} should exist`).toBeDefined();
  
  if (expectedData) {
    expect(event).toMatchObject(expectedData);
  }
  
  return event;
}

/**
 * Get all usage events for an org
 */
export function getUsageEventsForOrg(state: MockDatabaseState, orgId: string) {
  const events: any[] = [];
  
  for (const [_key, event] of state.usage_events.entries()) {
    if (event.org_id === orgId) {
      events.push(event);
    }
  }
  
  return events;
}

/**
 * Get usage events by type
 */
export function getUsageEventsByType(state: MockDatabaseState, orgId: string, eventType: string) {
  return getUsageEventsForOrg(state, orgId).filter(event => event.event_type === eventType);
}

/**
 * Count records in a table
 */
export function countRecords(state: MockDatabaseState, table: keyof MockDatabaseState) {
  return state[table].size;
}

/**
 * Clear all data from the mock database
 */
export function clearAllData(state: MockDatabaseState) {
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
}

/**
 * Seed database with test data
 */
export function seedDatabase(state: MockDatabaseState, data: {
  users?: any[];
  organizations?: any[];
  memberships?: any[];
  notifications?: any[];
  userSettings?: any[];
  orgSettings?: any[];
  teamInvites?: any[];
  auditLogs?: any[];
  usageEvents?: any[];
  apiUsage?: any[];
}) {
  data.users?.forEach(user => state.users.set(user.id, user));
  data.organizations?.forEach(org => state.organizations.set(org.id, org));
  data.memberships?.forEach(m => state.organization_members.set(`${m.org_id}:${m.user_id}`, m));
  data.notifications?.forEach(n => state.notifications.set(n.id, n));
  data.userSettings?.forEach(s => state.user_settings.set(s.user_id, s));
  data.orgSettings?.forEach(s => state.org_settings.set(s.org_id, s));
  data.teamInvites?.forEach(i => state.team_invites.set(i.id, i));
  data.auditLogs?.forEach(l => state.audit_logs.set(l.id, l));
  data.usageEvents?.forEach(e => state.usage_events.set(e.id, e));
  data.apiUsage?.forEach(a => state.api_usage.set(a.id, a));
}
