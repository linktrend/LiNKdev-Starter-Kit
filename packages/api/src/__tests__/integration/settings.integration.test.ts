/**
 * Integration Tests for Settings Router
 * 
 * Tests user and organization settings management with permission checks.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createTestCaller } from './helpers/test-context';
import {
  createTestUser,
  createTestUserSettings,
  createTestOrgSettings,
  generateUUID,
} from './helpers/test-data';
import { getUserOrgRole } from '../../rbac';

// Mock RBAC
vi.mock('../../rbac', () => ({
  getUserOrgRole: vi.fn(),
  roleIsSufficient: vi.fn((required, user) => {
    const hierarchy = { owner: 3, member: 2, viewer: 1 };
    return hierarchy[user as keyof typeof hierarchy] >= hierarchy[required as keyof typeof hierarchy];
  }),
  createRBACError: vi.fn((msg) => new TRPCError({ code: 'FORBIDDEN', message: msg })),
}));

// Mock store
const mockSettingsStore = {
  getUserSettings: vi.fn(),
  updateUserSettings: vi.fn(),
  getOrgSettings: vi.fn(),
  updateOrgSettings: vi.fn(),
  resetUserSettings: vi.fn(),
  resetOrgSettings: vi.fn(),
};

global.settingsStore = mockSettingsStore as any;

describe('Settings Router Integration Tests', () => {
  let testUser: any;
  let testOrgId: string;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TEMPLATE_OFFLINE = '1';
    
    testUser = createTestUser();
    testOrgId = generateUUID();
    
    vi.mocked(getUserOrgRole).mockResolvedValue('member');
  });

  describe('getUserSettings', () => {
    it('should get user settings', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const settings = createTestUserSettings(testUser.id);

      mockSettingsStore.getUserSettings.mockReturnValue(settings);

      const result = await caller.settings.getUserSettings();

      expect(result).toMatchObject({
        user_id: testUser.id,
        theme: settings.theme,
        language: settings.language,
      });
    });

    it('should return defaults if settings not found', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockSettingsStore.getUserSettings.mockReturnValue(null);

      const result = await caller.settings.getUserSettings();

      expect(result).toMatchObject({
        user_id: testUser.id,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
      });
    });

    it('should prevent accessing other user settings', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const otherUserId = generateUUID();

      await expect(
        caller.settings.getUserSettings({ userId: otherUserId })
      ).rejects.toThrow('You can only access your own settings');
    });

    it('should allow accessing own settings with explicit userId', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const settings = createTestUserSettings(testUser.id);

      mockSettingsStore.getUserSettings.mockReturnValue(settings);

      const result = await caller.settings.getUserSettings({
        userId: testUser.id,
      });

      expect(result.user_id).toBe(testUser.id);
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const updatedSettings = createTestUserSettings(testUser.id, {
        theme: 'dark',
        language: 'es',
      });

      mockSettingsStore.updateUserSettings.mockReturnValue(updatedSettings);

      const result = await caller.settings.updateUserSettings({
        theme: 'dark',
        language: 'es',
      });

      expect(result.theme).toBe('dark');
      expect(result.language).toBe('es');
    });

    it('should update partial settings', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const updatedSettings = createTestUserSettings(testUser.id, {
        theme: 'dark',
      });

      mockSettingsStore.updateUserSettings.mockReturnValue(updatedSettings);

      const result = await caller.settings.updateUserSettings({
        theme: 'dark',
      });

      expect(result.theme).toBe('dark');
    });

    it('should update email notifications', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const emailNotifications = {
        marketing: false,
        features: true,
        security: true,
        updates: false,
      };

      const updatedSettings = createTestUserSettings(testUser.id, {
        email_notifications: emailNotifications,
      });

      mockSettingsStore.updateUserSettings.mockReturnValue(updatedSettings);

      const result = await caller.settings.updateUserSettings({
        emailNotifications,
      });

      expect(result.email_notifications).toEqual(emailNotifications);
    });

    it('should update push notifications', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const pushNotifications = {
        enabled: true,
        browser: true,
        mobile: false,
      };

      const updatedSettings = createTestUserSettings(testUser.id, {
        push_notifications: pushNotifications,
      });

      mockSettingsStore.updateUserSettings.mockReturnValue(updatedSettings);

      const result = await caller.settings.updateUserSettings({
        pushNotifications,
      });

      expect(result.push_notifications).toEqual(pushNotifications);
    });
  });

  describe('getOrgSettings', () => {
    it('should get organization settings', async () => {
      const { caller } = createTestCaller({ user: testUser });
      const settings = createTestOrgSettings(testOrgId);

      mockSettingsStore.getOrgSettings.mockReturnValue(settings);

      const result = await caller.settings.getOrgSettings({
        orgId: testOrgId,
      });

      expect(result).toMatchObject({
        org_id: testOrgId,
        settings: settings.settings,
      });
    });

    it('should return defaults if settings not found', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockSettingsStore.getOrgSettings.mockReturnValue(null);

      const result = await caller.settings.getOrgSettings({
        orgId: testOrgId,
      });

      expect(result).toMatchObject({
        org_id: testOrgId,
        settings: {
          features: {},
          limits: {},
          integrations: {},
        },
      });
    });

    it('should deny access to non-members', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue(null);
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.settings.getOrgSettings({
          orgId: testOrgId,
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should allow any member to view org settings', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('viewer');
      const { caller } = createTestCaller({ user: testUser });
      const settings = createTestOrgSettings(testOrgId);

      mockSettingsStore.getOrgSettings.mockReturnValue(settings);

      const result = await caller.settings.getOrgSettings({
        orgId: testOrgId,
      });

      expect(result.org_id).toBe(testOrgId);
    });
  });

  describe('updateOrgSettings', () => {
    it('should update org settings when user is owner', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');
      const { caller } = createTestCaller({ user: testUser });
      
      const newSettings = {
        features: { newFeature: true },
        limits: { maxUsers: 100 },
      };

      const updatedSettings = createTestOrgSettings(testOrgId, {
        settings: newSettings,
      });

      mockSettingsStore.updateOrgSettings.mockReturnValue(updatedSettings);

      const result = await caller.settings.updateOrgSettings({
        orgId: testOrgId,
        settings: newSettings,
      });

      expect(result.settings).toEqual(newSettings);
    });

    it('should deny update from non-owner', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('member');
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.settings.updateOrgSettings({
          orgId: testOrgId,
          settings: { features: {} },
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should merge settings with existing', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');
      const { caller } = createTestCaller({ user: testUser });

      const existingSettings = {
        features: { feature1: true },
        limits: { maxUsers: 50 },
      };

      const newSettings = {
        features: { feature2: true },
      };

      const mergedSettings = createTestOrgSettings(testOrgId, {
        settings: {
          ...existingSettings,
          ...newSettings,
        },
      });

      mockSettingsStore.updateOrgSettings.mockReturnValue(mergedSettings);

      const result = await caller.settings.updateOrgSettings({
        orgId: testOrgId,
        settings: newSettings,
      });

      expect(result.settings.features).toHaveProperty('feature2');
    });
  });

  describe('resetToDefaults', () => {
    it('should reset user settings to defaults', async () => {
      const { caller } = createTestCaller({ user: testUser });

      mockSettingsStore.resetUserSettings.mockReturnValue(
        createTestUserSettings(testUser.id)
      );

      const result = await caller.settings.resetToDefaults({
        scope: 'user',
      });

      expect(result.success).toBe(true);
      expect(mockSettingsStore.resetUserSettings).toHaveBeenCalledWith(testUser.id);
    });

    it('should reset org settings to defaults when user is owner', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');
      const { caller, getTable } = createTestCaller({ user: testUser });
      const members = getTable('organization_members');
      members.single.mockResolvedValueOnce({
        data: {
          org_id: testOrgId,
          user_id: testUser.id,
          role: 'owner',
        },
        error: null,
      });

      mockSettingsStore.resetOrgSettings.mockReturnValue(
        createTestOrgSettings(testOrgId)
      );

      const result = await caller.settings.resetToDefaults({
        scope: 'org',
        orgId: testOrgId,
      });

      expect(result.success).toBe(true);
      expect(mockSettingsStore.resetOrgSettings).toHaveBeenCalledWith(testOrgId);
    });

    it('should require orgId for org scope', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.settings.resetToDefaults({
          scope: 'org',
        })
      ).rejects.toThrow('Organization ID is required for org scope');
    });

    it('should deny org reset from non-owner', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('member');
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.settings.resetToDefaults({
          scope: 'org',
          orgId: testOrgId,
        })
      ).rejects.toThrow('Only owners can reset organization settings');
    });
  });

  describe('Integration: Settings lifecycle', () => {
    it('should get → update → get and verify changes persist', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Initial get
      const initialSettings = createTestUserSettings(testUser.id);
      mockSettingsStore.getUserSettings.mockReturnValue(initialSettings);

      const initial = await caller.settings.getUserSettings();
      expect(initial.theme).toBe('system');

      // Update
      const updatedSettings = createTestUserSettings(testUser.id, {
        theme: 'dark',
        language: 'es',
      });
      mockSettingsStore.updateUserSettings.mockReturnValue(updatedSettings);

      await caller.settings.updateUserSettings({
        theme: 'dark',
        language: 'es',
      });

      // Get again
      mockSettingsStore.getUserSettings.mockReturnValue(updatedSettings);

      const updated = await caller.settings.getUserSettings();
      expect(updated.theme).toBe('dark');
      expect(updated.language).toBe('es');
    });

    it('should update → reset → verify defaults restored', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Update
      const customSettings = createTestUserSettings(testUser.id, {
        theme: 'dark',
        language: 'es',
        timezone: 'America/New_York',
      });
      mockSettingsStore.updateUserSettings.mockReturnValue(customSettings);

      await caller.settings.updateUserSettings({
        theme: 'dark',
        language: 'es',
        timezone: 'America/New_York',
      });

      // Reset
      const defaultSettings = createTestUserSettings(testUser.id);
      mockSettingsStore.resetUserSettings.mockReturnValue(defaultSettings);

      await caller.settings.resetToDefaults({ scope: 'user' });

      // Verify defaults
      mockSettingsStore.getUserSettings.mockReturnValue(defaultSettings);

      const result = await caller.settings.getUserSettings();
      expect(result.theme).toBe('system');
      expect(result.language).toBe('en');
      expect(result.timezone).toBe('UTC');
    });

    it('should handle multiple partial updates', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // First update
      let settings = createTestUserSettings(testUser.id, { theme: 'dark' });
      mockSettingsStore.updateUserSettings.mockReturnValue(settings);
      await caller.settings.updateUserSettings({ theme: 'dark' });

      // Second update
      settings = createTestUserSettings(testUser.id, {
        theme: 'dark',
        language: 'es',
      });
      mockSettingsStore.updateUserSettings.mockReturnValue(settings);
      await caller.settings.updateUserSettings({ language: 'es' });

      // Third update
      settings = createTestUserSettings(testUser.id, {
        theme: 'dark',
        language: 'es',
        timezone: 'Europe/Madrid',
      });
      mockSettingsStore.updateUserSettings.mockReturnValue(settings);
      const result = await caller.settings.updateUserSettings({
        timezone: 'Europe/Madrid',
      });

      expect(result.theme).toBe('dark');
      expect(result.language).toBe('es');
      expect(result.timezone).toBe('Europe/Madrid');
    });
  });

  describe('Permission checks', () => {
    it('should require authentication for all operations', async () => {
      const { caller } = createTestCaller({ user: null as any });

      await expect(caller.settings.getUserSettings()).rejects.toThrow('You must be logged in');
      await expect(
        caller.settings.updateUserSettings({ theme: 'dark' })
      ).rejects.toThrow('You must be logged in');
    });

    it('should enforce org membership for org settings', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue(null);
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.settings.getOrgSettings({ orgId: testOrgId })
      ).rejects.toThrow(TRPCError);
    });

    it('should enforce owner role for org settings updates', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('viewer');
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.settings.updateOrgSettings({
          orgId: testOrgId,
          settings: {},
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('Input validation', () => {
    it('should validate theme values', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.settings.updateUserSettings({
          theme: 'invalid' as any,
        })
      ).rejects.toThrow();
    });

    it('should accept valid theme values', async () => {
      const { caller } = createTestCaller({ user: testUser });

      for (const theme of ['light', 'dark', 'system']) {
        const settings = createTestUserSettings(testUser.id, { theme: theme as any });
        mockSettingsStore.updateUserSettings.mockReturnValue(settings);

        const result = await caller.settings.updateUserSettings({
          theme: theme as any,
        });

        expect(result.theme).toBe(theme);
      }
    });

    it('should validate orgId format', async () => {
      const { caller } = createTestCaller({ user: testUser });

      await expect(
        caller.settings.getOrgSettings({
          orgId: 'invalid-uuid',
        })
      ).rejects.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle concurrent settings updates', async () => {
      const { caller } = createTestCaller({ user: testUser });

      const settings1 = createTestUserSettings(testUser.id, { theme: 'dark' });
      const settings2 = createTestUserSettings(testUser.id, { language: 'es' });

      mockSettingsStore.updateUserSettings
        .mockReturnValueOnce(settings1)
        .mockReturnValueOnce(settings2);

      const [result1, result2] = await Promise.all([
        caller.settings.updateUserSettings({ theme: 'dark' }),
        caller.settings.updateUserSettings({ language: 'es' }),
      ]);

      expect(result1.theme).toBe('dark');
      expect(result2.language).toBe('es');
    });

    it('should handle empty settings object', async () => {
      vi.mocked(getUserOrgRole).mockResolvedValue('owner');
      const { caller } = createTestCaller({ user: testUser });

      const settings = createTestOrgSettings(testOrgId, {
        settings: {},
      });

      mockSettingsStore.updateOrgSettings.mockReturnValue(settings);

      const result = await caller.settings.updateOrgSettings({
        orgId: testOrgId,
        settings: {},
      });

      expect(result.settings).toEqual({});
    });
  });
});
