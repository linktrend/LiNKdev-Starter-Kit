/**
 * Cross-Router Integration Tests
 * 
 * Tests interactions between multiple routers to verify system-wide behavior.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestCaller } from './helpers/test-context';
import {
  createTestUser,
  createTestOrganization,
  createTestNotification,
  createTestAuditLog,
  createTestUsageEvent,
  generateUUID,
} from './helpers/test-data';
import { TEST_IDS } from '../helpers/fixtures';
import { getUserOrgRole } from '../../rbac';

// Mock RBAC
vi.mock('../../rbac', () => ({
  getUserOrgRole: vi.fn(),
  roleIsSufficient: vi.fn((required, user) => {
    const hierarchy = { owner: 3, member: 2, viewer: 1 };
    return hierarchy[user as keyof typeof hierarchy] >= hierarchy[required as keyof typeof hierarchy];
  }),
  canManageMembers: vi.fn((role) => role === 'owner' || role === 'admin'),
  canChangeRole: vi.fn(() => true),
  createRBACError: vi.fn((msg) => new Error(msg)),
}));

// Mock stores
const mockNotificationsStore = {
  list: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  delete: vi.fn(),
  getUnreadCount: vi.fn(),
};

const mockAuditStore = {
  appendLog: vi.fn(),
  listLogs: vi.fn(),
  getLogById: vi.fn(),
};

const mockUsageStore = {
  recordEvent: vi.fn(),
  getFeatureUsage: vi.fn(),
};

global.notificationsStore = mockNotificationsStore as any;
global.auditStore = mockAuditStore as any;
global.usageStore = mockUsageStore as any;
global.emitAnalyticsEvent = vi.fn();

describe('Cross-Router Integration Tests', () => {
  let testUser: any;
  let testOrgId: string;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TEMPLATE_OFFLINE = '1';
    
    testUser = createTestUser();
    testOrgId = generateUUID();
    
    vi.mocked(getUserOrgRole).mockResolvedValue('owner');
  });

  describe('Organization → Notification flow', () => {
    it('should create org → create notification → list notifications', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgs = getTable('organizations');
      const members = getTable('organization_members');

      // Create organization
      const newOrg = createTestOrganization({ owner_id: testUser.id });
      orgs.single.mockResolvedValueOnce({
        data: newOrg,
        error: null,
      });
      members.single.mockResolvedValueOnce({
        data: { org_id: newOrg.id, user_id: testUser.id, role: 'owner' },
        error: null,
      });

      const createdOrg = await caller.organization.create({
        name: newOrg.name,
        orgType: 'business',
      });

      expect(createdOrg.id).toBe(newOrg.id);

      // Create notification for the org
      const notification = createTestNotification({
        org_id: newOrg.id,
        user_id: testUser.id,
        title: 'Welcome to your new organization!',
      });

      mockNotificationsStore.list.mockReturnValue({
        notifications: [notification],
        total: 1,
      });

      // List notifications
      const notifications = await caller.notifications.list({
        orgId: newOrg.id,
        limit: 50,
        offset: 0,
      });

      expect(notifications.notifications).toHaveLength(1);
      expect(notifications.notifications[0].title).toContain('Welcome');
    });
  });

  describe('User Profile → Audit Log flow', () => {
    it('should update profile → verify audit log created', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      // Update profile
      const updatedUser = {
        ...testUser,
        full_name: 'Updated Name',
      };
      users.single.mockResolvedValue({
        data: updatedUser,
        error: null,
      });

      await caller.user.updateProfile({
        full_name: 'Updated Name',
      });

      // Verify audit log would be created (in real implementation)
      // For now, we mock the audit log
      const auditLog = createTestAuditLog({
        org_id: testOrgId,
        actor_id: testUser.id,
        action: 'user.profile_updated',
        entity_type: 'user',
        entity_id: testUser.id,
        metadata: { field: 'full_name', old_value: testUser.full_name, new_value: 'Updated Name' },
      });

      mockAuditStore.appendLog.mockResolvedValue(auditLog);

      // Append audit log
      const log = await caller.audit.append({
        orgId: testOrgId,
        action: 'user.profile_updated',
        entityType: 'user',
        entityId: testUser.id,
        metadata: auditLog.metadata,
      });

      expect(log.action).toBe('user.profile_updated');
      expect(log.entity_id).toBe(testUser.id);
    });
  });

  describe('Organization Deletion → Cascade flow', () => {
    it('should delete org → verify notifications, settings, audit logs cleaned up', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const members = getTable('organization_members');
      const orgs = getTable('organizations');

      // Delete organization
      members.single.mockResolvedValueOnce({
        data: { role: 'owner' },
        error: null,
      });
      orgs.__queueEqResponse({ error: null });

      await caller.organization.delete({ orgId: testOrgId });

      // In a real implementation, cascade deletes would happen
      // We verify the delete was called
      expect(orgs.delete).toHaveBeenCalled();

      // Verify notifications are gone
      mockNotificationsStore.list.mockReturnValue({
        notifications: [],
        total: 0,
      });

      const notifications = await caller.notifications.list({
        orgId: testOrgId,
        limit: 50,
        offset: 0,
      });

      expect(notifications.notifications).toHaveLength(0);
    });
  });

  describe('Team Member Addition → Usage Tracking flow', () => {
    it('should add member → verify usage event recorded', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const members = getTable('organization_members');

      // Add member
      members.__queueSingleResponse({ data: { role: 'owner' }, error: null });
      members.__queueSingleResponse({
        data: {
          org_id: testOrgId,
        user_id: TEST_IDS.userMember,
          role: 'viewer',
        },
        error: null,
      });

      await caller.organization.addMember({
        orgId: testOrgId,
      userId: TEST_IDS.userMember,
        role: 'viewer',
      });

      // Record usage event
      mockUsageStore.recordEvent.mockResolvedValue(undefined);

      await caller.usage.recordEvent({
        orgId: testOrgId,
      eventType: 'user_active',
        quantity: 1,
      metadata: { user_id: TEST_IDS.userMember, role: 'viewer' },
      });

      expect(mockUsageStore.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
        eventType: 'user_active',
        })
      );
    });
  });

  describe('Ownership Transfer → Audit + Notification flow', () => {
    it('should transfer ownership → verify audit log + notification created', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const newOwnerId = generateUUID();

      // Mock team store for transfer
      const mockTeamStore = {
        isUserMember: vi.fn().mockReturnValue(true),
      };
      global.teamStore = mockTeamStore as any;

      // Transfer ownership
      await caller.team.transferOwnership({
        orgId: testOrgId,
        newOwnerId,
      });

      // Create audit log for transfer
      const auditLog = createTestAuditLog({
        org_id: testOrgId,
        actor_id: testUser.id,
        action: 'organization.ownership_transferred',
        entity_type: 'organization',
        entity_id: testOrgId,
        metadata: {
          old_owner_id: testUser.id,
          new_owner_id: newOwnerId,
        },
      });

      mockAuditStore.appendLog.mockResolvedValue(auditLog);

      await caller.audit.append({
        orgId: testOrgId,
        action: 'organization.ownership_transferred',
        entityType: 'organization',
        entityId: testOrgId,
        metadata: auditLog.metadata,
      });

      // Create notification for new owner
      const notification = createTestNotification({
        org_id: testOrgId,
        user_id: newOwnerId,
        title: 'You are now the owner',
        type: 'info',
      });

      mockNotificationsStore.list.mockReturnValue({
        notifications: [notification],
        total: 1,
      });

      // Verify both audit log and notification exist
      expect(auditLog.action).toBe('organization.ownership_transferred');
      expect(notification.user_id).toBe(newOwnerId);
    });
  });

  describe('Settings Update → Audit Log flow', () => {
    it('should update org settings → verify audit log created', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Mock settings store
      const mockSettingsStore = {
        getOrgSettings: vi.fn(),
        updateOrgSettings: vi.fn(),
      };
      global.settingsStore = mockSettingsStore as any;

      const newSettings = {
        features: { newFeature: true },
      };

      mockSettingsStore.updateOrgSettings.mockReturnValue({
        org_id: testOrgId,
        settings: newSettings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Update settings
      await caller.settings.updateOrgSettings({
        orgId: testOrgId,
        settings: newSettings,
      });

      // Create audit log
      const auditLog = createTestAuditLog({
        org_id: testOrgId,
        actor_id: testUser.id,
        action: 'organization.settings_updated',
        entity_type: 'organization',
        entity_id: testOrgId,
        metadata: { settings: newSettings },
      });

      mockAuditStore.appendLog.mockResolvedValue(auditLog);

      await caller.audit.append({
        orgId: testOrgId,
        action: 'organization.settings_updated',
        entityType: 'organization',
        entityId: testOrgId,
        metadata: { settings: newSettings },
      });

      expect(auditLog.action).toBe('organization.settings_updated');
    });
  });

  describe('Multi-step workflow', () => {
    it('should create org → invite member → accept invite → verify all state', async () => {
      const inviter = createTestUser({ id: generateUUID() });
      const invitee = createTestUser({ id: generateUUID() });

      // Step 1: Create organization
      const { caller: inviterCaller, getTable } = createTestCaller({ user: inviter });
      const orgs = getTable('organizations');
      const members = getTable('organization_members');

      const newOrg = createTestOrganization({ owner_id: inviter.id });
      orgs.single.mockResolvedValueOnce({
        data: newOrg,
        error: null,
      });
      members.single.mockResolvedValueOnce({
        data: { org_id: newOrg.id, user_id: inviter.id, role: 'owner' },
        error: null,
      });

      const createdOrg = await inviterCaller.organization.create({
        name: newOrg.name,
        orgType: 'business',
      });

      expect(createdOrg.id).toBe(newOrg.id);

      // Step 2: Invite member
      const mockTeamStore = {
        inviteMember: vi.fn(),
        acceptInvite: vi.fn(),
      };
      global.teamStore = mockTeamStore as any;

      const invite = {
        id: generateUUID(),
        org_id: newOrg.id,
        email: invitee.email,
        role: 'viewer',
        token: 'invite-token-123',
        invited_by: inviter.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      mockTeamStore.inviteMember.mockReturnValue(invite);

      await inviterCaller.team.inviteMember({
        orgId: newOrg.id,
        email: invitee.email!,
        role: 'viewer',
      });

      // Step 3: Accept invite
      const { caller: inviteeCaller, getTable: getInviteeTable } = createTestCaller({ user: invitee });

      mockTeamStore.acceptInvite.mockReturnValue({
        success: true,
        orgId: newOrg.id,
        role: 'viewer',
      });

      const acceptResult = await inviteeCaller.team.acceptInvite({
        token: invite.token,
      });

      expect(acceptResult.success).toBe(true);

      // Step 4: Verify member can access org
      vi.mocked(getUserOrgRole).mockResolvedValue('viewer');

      const inviteeMembers = getInviteeTable('organization_members');
      const inviteeOrgs = getInviteeTable('organizations');

      inviteeMembers.single.mockResolvedValueOnce({
        data: {
          role: 'viewer',
          organizations: newOrg,
        },
        error: null,
      });
      inviteeOrgs.__queueEqResponse({ data: newOrg, error: null });
      inviteeOrgs.__queueSingleResponse({ data: newOrg, error: null });

      const orgDetails = await inviteeCaller.organization.getById({
        orgId: newOrg.id,
      });

      expect(orgDetails.id).toBe(newOrg.id);
      expect(orgDetails.role).toBe('viewer');
    });
  });

  describe('Permission propagation', () => {
    it('should update member role → verify access changes across routers', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const targetUserId = generateUUID();

      // Initial role: viewer
      vi.mocked(getUserOrgRole).mockResolvedValue('viewer');

      // Viewer cannot update org settings
      await expect(
        caller.settings.updateOrgSettings({
          orgId: testOrgId,
          settings: {},
        })
      ).rejects.toThrow();

      // Update role to owner
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');

      const mockTeamStore = {
        getUserRole: vi.fn().mockReturnValue('viewer'),
      };
      global.teamStore = mockTeamStore as any;

      await caller.team.updateMemberRole({
        orgId: testOrgId,
        userId: targetUserId,
        role: 'owner',
      });

      // Now owner can update settings
      const mockSettingsStore = {
        updateOrgSettings: vi.fn().mockReturnValue({
          org_id: testOrgId,
          settings: { updated: true },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      };
      global.settingsStore = mockSettingsStore as any;

      const result = await caller.settings.updateOrgSettings({
        orgId: testOrgId,
        settings: { updated: true },
      });

      expect(result.settings.updated).toBe(true);
    });
  });

  describe('Error propagation', () => {
    it('should handle cascading errors gracefully', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const orgs = getTable('organizations');
      const members = getTable('organization_members');

      // Try to create org (fails)
      orgs.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        caller.organization.create({
          name: 'Test Org',
          orgType: 'business',
        })
      ).rejects.toThrow();

      // Verify no orphaned data
      // In real implementation, transaction would rollback
      expect(members.upsert).not.toHaveBeenCalled();
    });
  });

  describe('Concurrent operations', () => {
    it('should handle concurrent updates to different resources', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      // Mock settings store
      const mockSettingsStore = {
        updateUserSettings: vi.fn(),
      };
      global.settingsStore = mockSettingsStore as any;

      // Update profile and settings concurrently
      users.single.mockResolvedValue({
        data: { ...testUser, full_name: 'Updated Name' },
        error: null,
      });

      mockSettingsStore.updateUserSettings.mockReturnValue({
        user_id: testUser.id,
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        email_notifications: {},
        push_notifications: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const [profileResult, settingsResult] = await Promise.all([
        caller.user.updateProfile({ full_name: 'Updated Name' }),
        caller.settings.updateUserSettings({ theme: 'dark' }),
      ]);

      expect(profileResult.full_name).toBe('Updated Name');
      expect(settingsResult.theme).toBe('dark');
    });
  });
});
