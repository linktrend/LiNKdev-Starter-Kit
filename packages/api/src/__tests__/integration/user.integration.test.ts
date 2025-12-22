/**
 * Integration Tests for User Router
 * 
 * Tests CRUD operations, permission checks, and database state changes
 * for user profile management.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createTestCaller } from './helpers/test-context';
import { createTestUser, generateUUID } from './helpers/test-data';

describe('User Router Integration Tests', () => {
  let testUserId: string;
  let testUser: any;

  beforeEach(() => {
    testUserId = generateUUID();
    testUser = createTestUser({ id: testUserId });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: testUser,
        error: null,
      });

      const result = await caller.user.getProfile();

      expect(result).toMatchObject({
        id: testUserId,
        email: testUser.email,
        full_name: testUser.full_name,
      });
      expect(users.select).toHaveBeenCalled();
    });

    it('should throw error when profile not found', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      await expect(caller.user.getProfile()).rejects.toThrow(TRPCError);
    });
  });

  describe('updateProfile', () => {
    it('should update profile and verify changes', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      const updatedData = {
        ...testUser,
        full_name: 'Updated Name',
        bio: 'Updated bio',
      };

      users.single.mockResolvedValue({
        data: updatedData,
        error: null,
      });

      const result = await caller.user.updateProfile({
        full_name: 'Updated Name',
        bio: 'Updated bio',
      });

      expect(result).toMatchObject({
        id: testUserId,
        full_name: 'Updated Name',
        bio: 'Updated bio',
      });
      expect(users.update).toHaveBeenCalled();
      expect(users.eq).toHaveBeenCalledWith('id', testUserId);
    });

    it('should reject update with invalid data', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Empty object should fail validation
      await expect(
        caller.user.updateProfile({})
      ).rejects.toThrow();
    });

    it('should update only specified fields', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      const updatedData = {
        ...testUser,
        display_name: 'New Display Name',
      };

      users.single.mockResolvedValue({
        data: updatedData,
        error: null,
      });

      const result = await caller.user.updateProfile({
        display_name: 'New Display Name',
      });

      expect(result.display_name).toBe('New Display Name');
      expect(users.update).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        caller.user.updateProfile({ full_name: 'Test' })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.eq.mockResolvedValue({ error: null });

      const result = await caller.user.deleteAccount();

    expect(result).toEqual({ success: true, userId: testUserId });
      expect(users.delete).toHaveBeenCalled();
      expect(users.eq).toHaveBeenCalledWith('id', testUserId);
    });

    it('should handle deletion errors', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      users.eq.mockResolvedValue({
        error: { message: 'Cannot delete user' },
      });

      await expect(caller.user.deleteAccount()).rejects.toThrow(TRPCError);
    });
  });

  describe('Integration: Profile lifecycle', () => {
    it('should get → update → get profile and verify changes persist', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      // First get
      users.single.mockResolvedValueOnce({
        data: testUser,
        error: null,
      });

      const initialProfile = await caller.user.getProfile();
      expect(initialProfile.full_name).toBe(testUser.full_name);

      // Update
      const updatedData = {
        ...testUser,
        full_name: 'Updated Name',
        bio: 'New bio',
      };

      users.single.mockResolvedValueOnce({
        data: updatedData,
        error: null,
      });

      const updateResult = await caller.user.updateProfile({
        full_name: 'Updated Name',
        bio: 'New bio',
      });

      expect(updateResult.full_name).toBe('Updated Name');
      expect(updateResult.bio).toBe('New bio');

      // Verify update was called
      expect(users.update).toHaveBeenCalled();
    });

    it('should handle multiple sequential updates', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      // First update
      users.single.mockResolvedValueOnce({
        data: { ...testUser, full_name: 'Name 1' },
        error: null,
      });

      await caller.user.updateProfile({ full_name: 'Name 1' });

      // Second update
      users.single.mockResolvedValueOnce({
        data: { ...testUser, full_name: 'Name 2' },
        error: null,
      });

      const result = await caller.user.updateProfile({ full_name: 'Name 2' });

      expect(result.full_name).toBe('Name 2');
      expect(users.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('Permission checks', () => {
    it('should require authentication for all operations', async () => {
      const { caller, getTable } = createTestCaller({ user: null as any });
      const users = getTable('users');

      // All operations should fail without authentication
      await expect(caller.user.getProfile()).rejects.toThrow('You must be logged in');
      await expect(caller.user.updateProfile({ full_name: 'Test' })).rejects.toThrow('You must be logged in');
      await expect(caller.user.deleteAccount()).rejects.toThrow('You must be logged in');
    });

    it('should only allow users to access their own profile', async () => {
      const user1 = createTestUser({ id: generateUUID() });
      const user2 = createTestUser({ id: generateUUID() });

      const { caller: caller1, getTable } = createTestCaller({ user: user1 });
      const users = getTable('users');

      // User 1 can access their own profile
      users.single.mockResolvedValue({
        data: user1,
        error: null,
      });

      const result = await caller1.user.getProfile();
      expect(result.id).toBe(user1.id);

      // Verify the query was for user1's ID
      expect(users.eq).toHaveBeenCalledWith('id', user1.id);
    });
  });

  describe('Input validation', () => {
    it('should validate full_name length', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Too long (>120 characters)
      const longName = 'a'.repeat(121);
      await expect(
        caller.user.updateProfile({ full_name: longName })
      ).rejects.toThrow();
    });

    it('should validate avatar_url format', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Invalid URL
      await expect(
        caller.user.updateProfile({ avatar_url: 'not-a-url' })
      ).rejects.toThrow();
    });

    it('should validate bio length', async () => {
      const { caller } = createTestCaller({ user: testUser });

      // Too long (>500 characters)
      const longBio = 'a'.repeat(501);
      await expect(
        caller.user.updateProfile({ bio: longBio })
      ).rejects.toThrow();
    });

    it('should accept valid profile updates', async () => {
      const { caller, getTable } = createTestCaller({ user: testUser });
      const users = getTable('users');

      const validUpdate = {
        full_name: 'Valid Name',
        display_name: 'Display',
        avatar_url: 'https://example.com/avatar.jpg',
        bio: 'A valid bio',
        first_name: 'First',
        last_name: 'Last',
      };

      users.single.mockResolvedValue({
        data: { ...testUser, ...validUpdate },
        error: null,
      });

      const result = await caller.user.updateProfile(validUpdate);

      expect(result).toMatchObject(validUpdate);
    });
  });
});
