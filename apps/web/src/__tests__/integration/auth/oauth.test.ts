import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '@/app/auth/callback/route';
import { NextRequest } from 'next/server';
import {
  setupIntegrationTest,
  teardownIntegrationTest,
  testState,
  extractRedirectUrl,
  createIntegrationSupabaseMock,
} from '../../setup/integration-setup';
import { createMockUser, createMockSession } from '../../helpers/auth-helpers';

// Mock the Supabase server client
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

describe('OAuth Integration Tests', () => {
  beforeEach(() => {
    setupIntegrationTest();
  });

  afterEach(() => {
    teardownIntegrationTest();
  });

  describe('Google OAuth - New User', () => {
    it('should complete full OAuth flow for new user and redirect to onboarding', async () => {
      // Arrange: Mock OAuth callback with valid code
      const code = 'valid-google-oauth-code';
      const mockUser = createMockUser({
        id: 'google-user-123',
        email: 'newuser@gmail.com',
        app_metadata: { provider: 'google' },
        user_metadata: {
          full_name: 'New Google User',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      });
      const mockSession = createMockSession(mockUser);

      // Mock Supabase auth to return successful session exchange
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act: Simulate OAuth callback
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      const response = await GET(request);

      // Assert: User should be created in database
      const users = testState.database.query('users', { id: mockUser.id });
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        full_name: 'New Google User',
        avatar_url: 'https://example.com/avatar.jpg',
        onboarding_completed: false,
        profile_completed: false,
        account_type: 'user',
      });

      // Assert: Should redirect to onboarding
      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toContain('/onboarding');
    });

    it('should handle Google OAuth with minimal user metadata', async () => {
      // Arrange
      const code = 'valid-google-oauth-code';
      const mockUser = createMockUser({
        id: 'google-user-minimal',
        email: 'minimal@gmail.com',
        app_metadata: { provider: 'google' },
        user_metadata: {}, // Minimal metadata
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      const response = await GET(request);

      // Assert: User created with null values for missing metadata
      const users = testState.database.query('users', { id: mockUser.id });
      expect(users).toHaveLength(1);
      expect(users[0].full_name).toBeNull();
      expect(users[0].avatar_url).toBeNull();
      expect(response.headers.get('location')).toContain('/onboarding');
    });
  });

  describe('Apple OAuth - New User', () => {
    it('should complete full OAuth flow for Apple and redirect to onboarding', async () => {
      // Arrange
      const code = 'valid-apple-oauth-code';
      const mockUser = createMockUser({
        id: 'apple-user-123',
        email: 'newuser@privaterelay.appleid.com',
        app_metadata: { provider: 'apple' },
        user_metadata: {
          full_name: 'Apple User',
        },
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      const response = await GET(request);

      // Assert
      const users = testState.database.query('users', { id: mockUser.id });
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        full_name: 'Apple User',
        onboarding_completed: false,
      });
      expect(response.headers.get('location')).toContain('/onboarding');
    });
  });

  describe('Microsoft OAuth - New User', () => {
    it('should complete full OAuth flow for Microsoft and redirect to onboarding', async () => {
      // Arrange
      const code = 'valid-azure-oauth-code';
      const mockUser = createMockUser({
        id: 'azure-user-123',
        email: 'newuser@outlook.com',
        app_metadata: { provider: 'azure' },
        user_metadata: {
          full_name: 'Microsoft User',
        },
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      const response = await GET(request);

      // Assert
      const users = testState.database.query('users', { id: mockUser.id });
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        full_name: 'Microsoft User',
        onboarding_completed: false,
      });
      expect(response.headers.get('location')).toContain('/onboarding');
    });
  });

  describe('OAuth - Returning User', () => {
    it('should skip onboarding for user with completed onboarding', async () => {
      // Arrange: Create existing user with completed onboarding
      const existingUser = testState.database.seedUser({
        id: 'existing-user-123',
        email: 'existing@gmail.com',
        username: 'existinguser',
        onboarding_completed: true,
        profile_completed: true,
      });

      const code = 'valid-oauth-code';
      const mockUser = createMockUser({
        id: existingUser.id,
        email: existingUser.email,
        app_metadata: { provider: 'google' },
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      const response = await GET(request);

      // Assert: Should redirect to dashboard, not onboarding
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/dashboard');
      expect(response.headers.get('location')).not.toContain('/onboarding');
    });

    it('should redirect to onboarding for user with incomplete onboarding', async () => {
      // Arrange: Create existing user without completed onboarding
      const existingUser = testState.database.seedUser({
        id: 'incomplete-user-123',
        email: 'incomplete@gmail.com',
        onboarding_completed: false,
        profile_completed: false,
      });

      const code = 'valid-oauth-code';
      const mockUser = createMockUser({
        id: existingUser.id,
        email: existingUser.email,
        app_metadata: { provider: 'google' },
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      const response = await GET(request);

      // Assert: Should redirect to onboarding
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/onboarding');
    });
  });

  describe('OAuth - Error Handling', () => {
    it('should handle provider error and redirect to login with error message', async () => {
      // Arrange: OAuth provider returns error
      const request = new NextRequest(
        'http://localhost:3000/auth/callback?error=access_denied&error_description=User%20denied%20access'
      );

      // Act
      const response = await GET(request);

      // Assert: Should redirect to login with error
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=');
      expect(decodeURIComponent(location!)).toContain('denied');
    });

    it('should handle invalid authorization code', async () => {
      // Arrange: Invalid code that fails session exchange
      const code = 'invalid-code';
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid authorization code', name: 'AuthError', status: 400 },
      });

      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );

      // Act
      const response = await GET(request);

      // Assert: Should redirect to login with error
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=');
    });

    it('should handle session exchange failure', async () => {
      // Arrange: Session exchange returns null session
      const code = 'valid-code-but-no-session';
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: null, user: null },
        error: null,
      });

      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );

      // Act
      const response = await GET(request);

      // Assert: Should redirect to login with generic error
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=');
      expect(decodeURIComponent(location!)).toContain('Authentication failed');
    });

    it('should handle missing code parameter', async () => {
      // Arrange: No code in callback URL
      const request = new NextRequest('http://localhost:3000/auth/callback');

      // Act
      const response = await GET(request);

      // Assert: Should redirect to login with error
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=');
      expect(decodeURIComponent(location!)).toContain('No authentication code');
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange: Simulate unexpected error during processing
      const code = 'valid-code';
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockRejectedValue(
        new Error('Unexpected database error')
      );

      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );

      // Act
      const response = await GET(request);

      // Assert: Should redirect to login with error
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=');
    });
  });

  describe('OAuth - Password Reset Flow', () => {
    it('should redirect to reset-password page when type is recovery', async () => {
      // Arrange: OAuth callback with recovery type (password reset)
      const code = 'valid-recovery-code';
      const mockUser = createMockUser({
        id: 'user-resetting-password',
        email: 'reset@example.com',
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Seed existing user
      testState.database.seedUser({
        id: mockUser.id,
        email: mockUser.email,
        onboarding_completed: true,
      });

      // Act
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}&type=recovery`
      );
      const response = await GET(request);

      // Assert: Should redirect to reset-password page
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/auth/reset-password');
    });
  });

  describe('OAuth - Usage Logging', () => {
    it('should log signup event for new users', async () => {
      // Arrange
      const { logUsage } = await import('@/lib/usage/server');
      const code = 'valid-oauth-code';
      const mockUser = createMockUser({
        id: 'new-user-for-logging',
        email: 'newuser@example.com',
        app_metadata: { provider: 'google' },
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      await GET(request);

      // Assert: Should log user_signup event
      expect(logUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          eventType: 'user_signup',
          metadata: expect.objectContaining({
            method: 'oauth',
            provider: 'google',
          }),
        })
      );
    });

    it('should log active event for returning users', async () => {
      // Arrange
      const { logUsage } = await import('@/lib/usage/server');
      const existingUser = testState.database.seedUser({
        id: 'existing-user-for-logging',
        email: 'existing@example.com',
        onboarding_completed: true,
      });

      const code = 'valid-oauth-code';
      const mockUser = createMockUser({
        id: existingUser.id,
        email: existingUser.email,
        app_metadata: { provider: 'apple' },
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      await GET(request);

      // Assert: Should log user_active event
      expect(logUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          eventType: 'user_active',
          metadata: expect.objectContaining({
            method: 'oauth',
            provider: 'apple',
          }),
        })
      );
    });
  });
});
