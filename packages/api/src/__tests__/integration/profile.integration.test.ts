/**
 * Integration Tests for Profile Router
 * 
 * Tests onboarding status, profile completion, and preferences management.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createTestCaller } from './helpers/test-context';
import { createTestUser, generateUUID } from './helpers/test-data';

describe('Profile Router Integration Tests', () => {
  let testUser: any;

  beforeEach(() => {
    testUser = createTestUser();
  });

  describe('getOnboardingStatus', () => {
    it('should return onboarding status for user', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: {
          id: testUser.id,
          onboarding_completed: true,
          profile_completed: false,
          preferences: { theme: 'dark' },
        },
        error: null,
      });

      const result = await caller.profile.getOnboardingStatus();

      expect(result).toEqual({
        onboardingCompleted: true,
        profileCompleted: false,
        preferences: { theme: 'dark' },
      });
    });

    it('should return false for incomplete onboarding', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: {
          id: testUser.id,
          onboarding_completed: false,
          profile_completed: false,
          preferences: null,
        },
        error: null,
      });

      const result = await caller.profile.getOnboardingStatus();

      expect(result.onboardingCompleted).toBe(false);
      expect(result.profileCompleted).toBe(false);
      expect(result.preferences).toBeNull();
    });

    it('should throw error when user not found', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      await expect(caller.profile.getOnboardingStatus()).rejects.toThrow(TRPCError);
    });
  });

  describe('completeProfile', () => {
    it('should mark profile as complete', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: {
          onboarding_completed: true,
          profile_completed: true,
        },
        error: null,
      });

      const result = await caller.profile.completeProfile();

      expect(result).toEqual({
        onboardingCompleted: true,
        profileCompleted: true,
      });
      expect(users.update).toHaveBeenCalled();
      expect(users.eq).toHaveBeenCalledWith('id', testUser.id);
    });

    it('should be idempotent (can call multiple times)', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: {
          onboarding_completed: true,
          profile_completed: true,
        },
        error: null,
      });

      // First call
      const result1 = await caller.profile.completeProfile();
      expect(result1.profileCompleted).toBe(true);

      // Second call
      users.single.mockResolvedValue({
        data: {
          onboarding_completed: true,
          profile_completed: true,
        },
        error: null,
      });

      const result2 = await caller.profile.completeProfile();
      expect(result2.profileCompleted).toBe(true);

      // Both calls should succeed
      expect(users.update).toHaveBeenCalledTimes(2);
    });

    it('should handle database errors', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(caller.profile.completeProfile()).rejects.toThrow(TRPCError);
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      const newPreferences = {
        theme: 'dark',
        language: 'es',
        notifications: true,
      };

      users.single.mockResolvedValue({
        data: {
          id: testUser.id,
          preferences: newPreferences,
        },
        error: null,
      });

      const result = await caller.profile.updatePreferences({
        preferences: newPreferences,
      });

      expect(result.preferences).toEqual(newPreferences);
      expect(users.update).toHaveBeenCalled();
    });

    it('should accept empty preferences object', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: {
          id: testUser.id,
          preferences: {},
        },
        error: null,
      });

      const result = await caller.profile.updatePreferences({
        preferences: {},
      });

      expect(result.preferences).toEqual({});
    });

    it('should accept nested preferences', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      const nestedPreferences = {
        ui: {
          theme: 'dark',
          fontSize: 14,
        },
        notifications: {
          email: true,
          push: false,
        },
      };

      users.single.mockResolvedValue({
        data: {
          id: testUser.id,
          preferences: nestedPreferences,
        },
        error: null,
      });

      const result = await caller.profile.updatePreferences({
        preferences: nestedPreferences,
      });

      expect(result.preferences).toEqual(nestedPreferences);
    });

    it('should handle database errors', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(
        caller.profile.updatePreferences({
          preferences: { theme: 'dark' },
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('Integration: Profile lifecycle', () => {
    it('should get status → complete profile → verify status updated', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      // Get initial status
      users.single.mockResolvedValueOnce({
        data: {
          id: testUser.id,
          onboarding_completed: false,
          profile_completed: false,
          preferences: null,
        },
        error: null,
      });

      const initialStatus = await caller.profile.getOnboardingStatus();
      expect(initialStatus.profileCompleted).toBe(false);

      // Complete profile
      users.single.mockResolvedValueOnce({
        data: {
          onboarding_completed: true,
          profile_completed: true,
        },
        error: null,
      });

      const completeResult = await caller.profile.completeProfile();
      expect(completeResult.profileCompleted).toBe(true);

      // Verify status updated
      users.single.mockResolvedValueOnce({
        data: {
          id: testUser.id,
          onboarding_completed: true,
          profile_completed: true,
          preferences: null,
        },
        error: null,
      });

      const updatedStatus = await caller.profile.getOnboardingStatus();
      expect(updatedStatus.profileCompleted).toBe(true);
      expect(updatedStatus.onboardingCompleted).toBe(true);
    });

    it('should update preferences → get status → verify preferences persisted', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      const preferences = {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
      };

      // Update preferences
      users.single.mockResolvedValueOnce({
        data: {
          id: testUser.id,
          preferences,
        },
        error: null,
      });

      await caller.profile.updatePreferences({ preferences });

      // Get status
      users.single.mockResolvedValueOnce({
        data: {
          id: testUser.id,
          onboarding_completed: true,
          profile_completed: true,
          preferences,
        },
        error: null,
      });

      const status = await caller.profile.getOnboardingStatus();
      expect(status.preferences).toEqual(preferences);
    });

    it('should handle multiple preference updates', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      // First update
      const prefs1 = { theme: 'light' };
      users.single.mockResolvedValueOnce({
        data: { id: testUser.id, preferences: prefs1 },
        error: null,
      });

      await caller.profile.updatePreferences({ preferences: prefs1 });

      // Second update
      const prefs2 = { theme: 'dark', language: 'es' };
      users.single.mockResolvedValueOnce({
        data: { id: testUser.id, preferences: prefs2 },
        error: null,
      });

      const result = await caller.profile.updatePreferences({ preferences: prefs2 });

      expect(result.preferences).toEqual(prefs2);
      expect(users.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('Permission checks', () => {
    it('should require authentication for all operations', async () => {
      const { caller } = createTestCaller({ user: null as any });

      await expect(caller.profile.getOnboardingStatus()).rejects.toThrow('You must be logged in');
      await expect(caller.profile.completeProfile()).rejects.toThrow('You must be logged in');
      await expect(
        caller.profile.updatePreferences({ preferences: {} })
      ).rejects.toThrow('You must be logged in');
    });

    it('should only allow users to access their own profile', async () => {
      const user1 = createTestUser({ id: generateUUID() });
      const { caller, getTable } = createTestCaller({ user: user1 });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: {
          id: user1.id,
          onboarding_completed: true,
          profile_completed: true,
          preferences: {},
        },
        error: null,
      });

      const result = await caller.profile.getOnboardingStatus();

      // Verify query was for user1's ID
      expect(users.eq).toHaveBeenCalledWith('id', user1.id);
    });
  });

  describe('Data validation', () => {
    it('should accept any valid JSON as preferences', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      const complexPreferences = {
        string: 'value',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: {
          deep: {
            value: 'test',
          },
        },
      };

      users.single.mockResolvedValue({
        data: {
          id: testUser.id,
          preferences: complexPreferences,
        },
        error: null,
      });

      const result = await caller.profile.updatePreferences({
        preferences: complexPreferences,
      });

      expect(result.preferences).toEqual(complexPreferences);
    });

    it('should handle null preferences', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: {
          id: testUser.id,
          onboarding_completed: false,
          profile_completed: false,
          preferences: null,
        },
        error: null,
      });

      const result = await caller.profile.getOnboardingStatus();
      expect(result.preferences).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle concurrent profile completions', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: {
          onboarding_completed: true,
          profile_completed: true,
        },
        error: null,
      });

      // Simulate concurrent calls
      const [result1, result2] = await Promise.all([
        caller.profile.completeProfile(),
        caller.profile.completeProfile(),
      ]);

      expect(result1.profileCompleted).toBe(true);
      expect(result2.profileCompleted).toBe(true);
    });

    it('should handle large preferences objects', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      // Create a large preferences object
      const largePreferences: any = {};
      for (let i = 0; i < 100; i++) {
        largePreferences[`key${i}`] = `value${i}`;
      }

      users.single.mockResolvedValue({
        data: {
          id: testUser.id,
          preferences: largePreferences,
        },
        error: null,
      });

      const result = await caller.profile.updatePreferences({
        preferences: largePreferences,
      });

      expect(Object.keys(result.preferences)).toHaveLength(100);
    });
  });
});
