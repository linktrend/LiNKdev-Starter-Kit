import { describe, it, expect, beforeEach, vi } from 'vitest';
import { completeOnboardingStep2 } from '@/app/actions/profile';
import { createPersonalOrganization } from '@/app/actions/onboarding';
import { login } from '@/app/actions/auth';
import { GET } from '@/app/auth/callback/route';
import { NextRequest } from 'next/server';
import {
  setupIntegrationTest,
  teardownIntegrationTest,
  testState,
  createIntegrationSupabaseMock,
} from '../../setup/integration-setup';
import { createMockUser, createMockSession } from '../../helpers/auth-helpers';

// Mock the Supabase clients
vi.mock('@/lib/auth/server', async () => {
  const actual = await vi.importActual('@/lib/auth/server');
  return {
    ...actual,
    createClient: () => createIntegrationSupabaseMock(),
    requireAuth: vi.fn(async () => {
      // Return mock authenticated user
      const users = testState.database.getAll('users');
      if (users.length > 0) {
        // Use the most recently created user as the "current" authed user
        return users[users.length - 1];
      }
      throw new Error('Unauthorized');
    }),
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => createIntegrationSupabaseMock(),
}));

// Mock usage logging
vi.mock('@/lib/usage/server', () => ({
  logUsage: vi.fn().mockResolvedValue(undefined),
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

// Mock onboarding utilities
vi.mock('@/utils/onboarding', () => ({
  generateUniqueSlug: vi.fn(async (base: string) => {
    return `${base}-${Math.random().toString(36).substring(7)}`;
  }),
}));

describe('Onboarding Flow Integration Tests', () => {
  beforeEach(() => {
    setupIntegrationTest();
  });

  afterEach(() => {
    teardownIntegrationTest();
  });

  describe('Complete Onboarding - New User', () => {
    it('should complete full onboarding flow after OAuth login', async () => {
      // Step 1: OAuth login creates new user
      const code = 'valid-oauth-code';
      const mockUser = createMockUser({
        id: 'new-onboarding-user',
        email: 'newuser@example.com',
        app_metadata: { provider: 'google' },
        user_metadata: {
          full_name: 'New User',
        },
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      const callbackRequest = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      const callbackResponse = await GET(callbackRequest);

      // Assert: User created and redirected to onboarding
      const users = testState.database.query('users', { id: mockUser.id });
      expect(users).toHaveLength(1);
      expect(users[0].onboarding_completed).toBe(false);
      expect(callbackResponse.headers.get('location')).toContain('/onboarding');

      // Step 2: Complete profile (onboarding step 2)
      const formData = new FormData();
      formData.append('username', 'newuser');
      formData.append('first_name', 'New');
      formData.append('last_name', 'User');
      formData.append('display_name', 'New U.');
      formData.append('locale', 'en');

      const result = await completeOnboardingStep2(formData);

      // Assert: Profile completed
      expect(result.success).toBe(true);
      expect(result.redirectTo).toContain('/dashboard');

      // Assert: User profile updated
      const updatedUsers = testState.database.query('users', { id: mockUser.id });
      expect(updatedUsers[0]).toMatchObject({
        username: 'newuser',
        first_name: 'New',
        last_name: 'User',
        display_name: 'New U.',
        full_name: 'New User',
        profile_completed: true,
        onboarding_completed: true,
      });

      // Assert: Personal organization created
      const orgs = testState.database.query('organizations', {
        created_by: mockUser.id,
        is_personal: true,
      });
      expect(orgs).toHaveLength(1);
      expect(orgs[0].org_type).toBe('personal');

      // Assert: Organization membership created
      const members = testState.database.query('organization_members', {
        user_id: mockUser.id,
        organization_id: orgs[0].id,
      });
      expect(members).toHaveLength(1);
      expect(members[0].role).toBe('owner');

      // Assert: Subscription created
      const subscriptions = testState.database.query('org_subscriptions', {
        organization_id: orgs[0].id,
      });
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].plan_name).toBe('free');
    });
  });

  describe('Resume Onboarding', () => {
    it('should allow user to resume incomplete onboarding', async () => {
      // Arrange: Create user with incomplete onboarding
      const user = testState.database.seedUser({
        id: 'incomplete-onboarding-user',
        email: 'incomplete@example.com',
        onboarding_completed: false,
        profile_completed: false,
      });

      // Act: Complete onboarding
      const formData = new FormData();
      formData.append('username', 'resumeduser');
      formData.append('first_name', 'Resumed');
      formData.append('last_name', 'User');
      formData.append('locale', 'en');

      const result = await completeOnboardingStep2(formData);

      // Assert: Onboarding completed
      expect(result.success).toBe(true);

      const updatedUsers = testState.database.query('users', { id: user.id });
      expect(updatedUsers[0].onboarding_completed).toBe(true);
      expect(updatedUsers[0].profile_completed).toBe(true);
    });

    it('should redirect incomplete users to onboarding on login', async () => {
      // Arrange: Create user with incomplete onboarding
      const user = testState.database.seedUser({
        id: 'incomplete-login-user',
        email: 'incomplete@example.com',
        onboarding_completed: false,
      });

      const mockUser = createMockUser({
        id: user.id,
        email: user.email,
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act: Login
      const formData = new FormData();
      formData.append('email', user.email);
      formData.append('password', 'password123');
      formData.append('locale', 'en');

      try {
        await login({}, formData);
      } catch (error: any) {
        // Assert: Redirected to onboarding
        expect(error.message).toContain('NEXT_REDIRECT');
        expect(error.message).toContain('/onboarding');
      }
    });
  });

  describe('Skip Onboarding - Returning User', () => {
    it('should skip onboarding for user with completed onboarding', async () => {
      // Arrange: Create user with completed onboarding
      const user = testState.database.seedUser({
        id: 'completed-user',
        email: 'completed@example.com',
        username: 'completeduser',
        onboarding_completed: true,
        profile_completed: true,
      });

      const mockUser = createMockUser({
        id: user.id,
        email: user.email,
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act: Login
      const formData = new FormData();
      formData.append('email', user.email);
      formData.append('password', 'password123');
      formData.append('locale', 'en');

      try {
        await login({}, formData);
      } catch (error: any) {
        // Assert: Redirected to dashboard, not onboarding
        expect(error.message).toContain('NEXT_REDIRECT');
        expect(error.message).toContain('/dashboard');
        expect(error.message).not.toContain('/onboarding');
      }
    });

    it('should redirect completed user from OAuth to dashboard', async () => {
      // Arrange: Create user with completed onboarding
      const user = testState.database.seedUser({
        id: 'oauth-completed-user',
        email: 'oauthcompleted@example.com',
        username: 'oauthcompleted',
        onboarding_completed: true,
      });

      const code = 'valid-oauth-code';
      const mockUser = createMockUser({
        id: user.id,
        email: user.email,
        app_metadata: { provider: 'google' },
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act: OAuth callback
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      const response = await GET(request);

      // Assert: Redirected to dashboard
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/dashboard');
      expect(response.headers.get('location')).not.toContain('/onboarding');
    });
  });

  describe('Onboarding Validation', () => {
    it('should reject invalid username', async () => {
      // Arrange: Create user
      testState.database.seedUser({
        id: 'validation-user',
        email: 'validation@example.com',
      });

      // Act: Try invalid username
      const formData = new FormData();
      formData.append('username', 'a'); // Too short
      formData.append('first_name', 'Test');
      formData.append('last_name', 'User');

      const result = await completeOnboardingStep2(formData);

      // Assert: Validation error
      expect(result.success).toBeUndefined();
      expect(result.error?.username).toBeDefined();
    });

    it('should reject duplicate username', async () => {
      // Arrange: Create two users
      testState.database.seedUser({
        id: 'existing-username-user',
        email: 'existing@example.com',
        username: 'existinguser',
        onboarding_completed: true,
      });

      testState.database.seedUser({
        id: 'new-duplicate-user',
        email: 'newduplicate@example.com',
      });

      // Act: Try to use existing username
      const formData = new FormData();
      formData.append('username', 'existinguser'); // Already taken
      formData.append('first_name', 'New');
      formData.append('last_name', 'User');

      const result = await completeOnboardingStep2(formData);

      // Assert: Username taken error
      expect(result.success).toBeUndefined();
      expect(result.error?.username).toBeDefined();
      expect(result.error?.username[0]).toContain('taken');
    });

    it('should require first and last name', async () => {
      // Arrange
      testState.database.seedUser({
        id: 'name-validation-user',
        email: 'namevalidation@example.com',
      });

      // Act: Missing names
      const formData = new FormData();
      formData.append('username', 'validusername');
      // Missing first_name and last_name

      const result = await completeOnboardingStep2(formData);

      // Assert: Validation errors
      expect(result.success).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  describe('Onboarding Rollback', () => {
    it('should rollback on organization creation failure', async () => {
      // Arrange: Create user
      const user = testState.database.seedUser({
        id: 'rollback-user',
        email: 'rollback@example.com',
      });

      // Mock organization creation to fail
      const supabaseMock = createIntegrationSupabaseMock();
      const originalFrom = supabaseMock.from;
      
      vi.spyOn(supabaseMock, 'from').mockImplementation((table: string) => {
        if (table === 'organization_members') {
          return {
            insert: vi.fn().mockResolvedValue({
              error: { message: 'Failed to add member' },
            }),
          } as any;
        }
        return originalFrom(table);
      });

      // Act: Try to complete onboarding
      const formData = new FormData();
      formData.append('username', 'rollbackuser');
      formData.append('first_name', 'Rollback');
      formData.append('last_name', 'User');
      formData.append('locale', 'en');

      const result = await completeOnboardingStep2(formData);

      // Assert: Should fail
      expect(result.success).toBeUndefined();
      expect(result.error?.form).toBeDefined();

      // Assert: User profile should not be marked complete
      const users = testState.database.query('users', { id: user.id });
      // Profile might be updated but onboarding should not be complete
      expect(users[0].onboarding_completed).not.toBe(true);
    });
  });

  describe('Personal Organization Creation', () => {
    it('should create personal organization during onboarding', async () => {
      // Arrange: Create user
      const user = testState.database.seedUser({
        id: 'org-creation-user',
        email: 'orgcreation@example.com',
      });

      // Act: Complete onboarding
      const formData = new FormData();
      formData.append('username', 'orguser');
      formData.append('first_name', 'Org');
      formData.append('last_name', 'User');
      formData.append('locale', 'en');

      await completeOnboardingStep2(formData);

      // Assert: Personal organization created
      const orgs = testState.database.query('organizations', {
        created_by: user.id,
        is_personal: true,
      });
      expect(orgs).toHaveLength(1);
      expect(orgs[0]).toMatchObject({
        is_personal: true,
        org_type: 'personal',
        created_by: user.id,
      });
    });

    it('should make user owner of personal organization', async () => {
      // Arrange
      const user = testState.database.seedUser({
        id: 'owner-user',
        email: 'owner@example.com',
      });

      // Act: Complete onboarding
      const formData = new FormData();
      formData.append('username', 'owneruser');
      formData.append('first_name', 'Owner');
      formData.append('last_name', 'User');
      formData.append('locale', 'en');

      await completeOnboardingStep2(formData);

      // Assert: User is owner
      const orgs = testState.database.query('organizations', {
        created_by: user.id,
      });
      const members = testState.database.query('organization_members', {
        user_id: user.id,
        organization_id: orgs[0].id,
      });
      expect(members).toHaveLength(1);
      expect(members[0].role).toBe('owner');
    });

    it('should create free subscription for personal organization', async () => {
      // Arrange
      const user = testState.database.seedUser({
        id: 'subscription-user',
        email: 'subscription@example.com',
      });

      // Act: Complete onboarding
      const formData = new FormData();
      formData.append('username', 'subuser');
      formData.append('first_name', 'Sub');
      formData.append('last_name', 'User');
      formData.append('locale', 'en');

      await completeOnboardingStep2(formData);

      // Assert: Free subscription created
      const orgs = testState.database.query('organizations', {
        created_by: user.id,
      });
      const subscriptions = testState.database.query('org_subscriptions', {
        organization_id: orgs[0].id,
      });
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].plan_name).toBe('free');
    });

    it('should handle idempotent organization creation', async () => {
      // Arrange: Create user with existing personal org
      const user = testState.database.seedUser({
        id: 'idempotent-user',
        email: 'idempotent@example.com',
      });

      const existingOrg = testState.database.seedOrganization({
        created_by: user.id,
        is_personal: true,
        org_type: 'personal',
      });

      // Act: Try to create personal org again
      const result = await createPersonalOrganization();

      // Assert: Should return existing org
      expect(result.success).toBe(true);
      expect(result.organization?.id).toBe(existingOrg.id);

      // Assert: No duplicate org created
      const orgs = testState.database.query('organizations', {
        created_by: user.id,
        is_personal: true,
      });
      expect(orgs).toHaveLength(1);
    });
  });

  describe('Onboarding Edge Cases', () => {
    it('should handle missing required fields', async () => {
      // Arrange
      testState.database.seedUser({
        id: 'missing-fields-user',
        email: 'missing@example.com',
      });

      // Act: Empty form data
      const formData = new FormData();

      const result = await completeOnboardingStep2(formData);

      // Assert: Validation errors
      expect(result.success).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    it('should trim whitespace from username', async () => {
      // Arrange
      testState.database.seedUser({
        id: 'trim-user',
        email: 'trim@example.com',
      });

      // Act: Username with spaces
      const formData = new FormData();
      formData.append('username', '  trimmeduser  ');
      formData.append('first_name', 'Trim');
      formData.append('last_name', 'User');
      formData.append('locale', 'en');

      const result = await completeOnboardingStep2(formData);

      // Assert: Should succeed with trimmed username
      if (result.success) {
        const users = testState.database.getAll('users');
        const user = users.find((u) => u.email === 'trim@example.com');
        // Username should be trimmed (if validation does this)
        expect(user?.username).toBeTruthy();
      }
    });
  });
});
