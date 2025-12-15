/**
 * Tests for Settings Router
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { settingsRouter } from '../../routers/settings';
import { getUserOrgRole } from '../../rbac';

// Mock the RBAC functions
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

describe('Settings Router', () => {
  const mockUser = { id: 'user-123', email: 'user@example.com' };
  const mockOrgId = 'org-123';

  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TEMPLATE_OFFLINE = '1';

    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
          })),
        })),
        upsert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    };
  });

  describe('getUserSettings', () => {
    it('should return user settings', async () => {
      const mockSettings = {
        user_id: mockUser.id,
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        email_notifications: { marketing: true, features: true, security: true, updates: true },
        push_notifications: { enabled: false, browser: false, mobile: false },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSettingsStore.getUserSettings.mockReturnValue(mockSettings);

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.getUserSettings();

      expect(result).toEqual(mockSettings);
      expect(mockSettingsStore.getUserSettings).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return defaults if settings not found', async () => {
      mockSettingsStore.getUserSettings.mockReturnValue(null);

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.getUserSettings();

      expect(result.user_id).toBe(mockUser.id);
      expect(result.theme).toBe('system');
      expect(result.language).toBe('en');
      expect(result.timezone).toBe('UTC');
    });

    it('should deny access to other users settings', async () => {
      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.getUserSettings({ userId: 'other-user-123' })
      ).rejects.toThrow('You can only access your own settings');
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings', async () => {
      const updatedSettings = {
        user_id: mockUser.id,
        theme: 'dark',
        language: 'es',
        timezone: 'America/New_York',
        email_notifications: { marketing: false, features: true, security: true, updates: true },
        push_notifications: { enabled: true, browser: true, mobile: false },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSettingsStore.updateUserSettings.mockReturnValue(updatedSettings);

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.updateUserSettings({
        theme: 'dark',
        language: 'es',
        timezone: 'America/New_York',
      });

      expect(result).toEqual(updatedSettings);
      expect(mockSettingsStore.updateUserSettings).toHaveBeenCalledWith(mockUser.id, {
        theme: 'dark',
        language: 'es',
        timezone: 'America/New_York',
      });
    });

    it('should handle partial updates', async () => {
      const updatedSettings = {
        user_id: mockUser.id,
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        email_notifications: { marketing: true, features: true, security: true, updates: true },
        push_notifications: { enabled: false, browser: false, mobile: false },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSettingsStore.updateUserSettings.mockReturnValue(updatedSettings);

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.updateUserSettings({ theme: 'light' });

      expect(result.theme).toBe('light');
    });

    it('should merge email notification preferences', async () => {
      const updatedSettings = {
        user_id: mockUser.id,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        email_notifications: { marketing: false, features: true, security: true, updates: true },
        push_notifications: { enabled: false, browser: false, mobile: false },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSettingsStore.updateUserSettings.mockReturnValue(updatedSettings);

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.updateUserSettings({
        emailNotifications: { marketing: false },
      });

      expect(result.email_notifications.marketing).toBe(false);
    });
  });

  describe('getOrgSettings', () => {
    it('should return org settings', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      const mockSettings = {
        org_id: mockOrgId,
        settings: { features: { newFeature: true }, limits: {}, integrations: {} },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSettingsStore.getOrgSettings.mockReturnValue(mockSettings);

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.getOrgSettings({ orgId: mockOrgId });

      expect(result).toEqual(mockSettings);
      expect(mockSettingsStore.getOrgSettings).toHaveBeenCalledWith(mockOrgId);
    });

    it('should return defaults if settings not found', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      mockSettingsStore.getOrgSettings.mockReturnValue(null);

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.getOrgSettings({ orgId: mockOrgId });

      expect(result.org_id).toBe(mockOrgId);
      expect(result.settings).toEqual({ features: {}, limits: {}, integrations: {} });
    });

    it('should deny access to non-members', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue(null);

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.getOrgSettings({ orgId: mockOrgId })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('updateOrgSettings', () => {
    it('should update org settings (owner only)', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('owner');

      const updatedSettings = {
        org_id: mockOrgId,
        settings: { features: { newFeature: true }, limits: { maxUsers: 100 }, integrations: {} },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSettingsStore.updateOrgSettings.mockReturnValue(updatedSettings);

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.updateOrgSettings({
        orgId: mockOrgId,
        settings: { features: { newFeature: true }, limits: { maxUsers: 100 } },
      });

      expect(result).toEqual(updatedSettings);
      expect(mockSettingsStore.updateOrgSettings).toHaveBeenCalledWith(mockOrgId, {
        features: { newFeature: true },
        limits: { maxUsers: 100 },
      });
    });

    it('should deny access to non-owners', async () => {
      const mockGetUserOrgRole = vi.mocked(getUserOrgRole);
      mockGetUserOrgRole.mockResolvedValue('member');

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.updateOrgSettings({
          orgId: mockOrgId,
          settings: { features: { newFeature: true } },
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset user settings to defaults', async () => {
      mockSettingsStore.resetUserSettings.mockReturnValue({
        user_id: mockUser.id,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        email_notifications: { marketing: true, features: true, security: true, updates: true },
        push_notifications: { enabled: false, browser: false, mobile: false },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.resetToDefaults({ scope: 'user' });

      expect(result.success).toBe(true);
      expect(mockSettingsStore.resetUserSettings).toHaveBeenCalledWith(mockUser.id);
    });

    it('should reset org settings to defaults (owner only)', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: { role: 'owner' }, error: null })),
            })),
          })),
        })),
      }));

      mockSettingsStore.resetOrgSettings.mockReturnValue({
        org_id: mockOrgId,
        settings: { features: {}, limits: {}, integrations: {} },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.resetToDefaults({ scope: 'org', orgId: mockOrgId });

      expect(result.success).toBe(true);
      expect(mockSettingsStore.resetOrgSettings).toHaveBeenCalledWith(mockOrgId);
    });

    it('should require orgId for org scope', async () => {
      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.resetToDefaults({ scope: 'org' })
      ).rejects.toThrow('Organization ID is required for org scope');
    });

    it('should deny non-owners from resetting org settings', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: { role: 'member' }, error: null })),
            })),
          })),
        })),
      }));

      const caller = settingsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.resetToDefaults({ scope: 'org', orgId: mockOrgId })
      ).rejects.toThrow('Only owners can reset organization settings');
    });
  });
});
