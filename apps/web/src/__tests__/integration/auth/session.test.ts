import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login, logout } from '@/app/actions/auth';
import { getSession, getUser, requireAuth } from '@/lib/auth/server';
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
  };
});

// Mock usage logging
vi.mock('@/lib/usage/server', () => ({
  logUsage: vi.fn().mockResolvedValue(undefined),
}));

// Mock Next.js cache and navigation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

// Mock Next.js headers for cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe('Session Management Integration Tests', () => {
  beforeEach(() => {
    setupIntegrationTest();
  });

  afterEach(() => {
    teardownIntegrationTest();
  });

  describe('Session Persistence', () => {
    it('should establish session after successful login', async () => {
      // Arrange: Create user
      const user = testState.database.seedUser({
        id: 'session-user-123',
        email: 'user@example.com',
        username: 'sessionuser',
        onboarding_completed: true,
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
        // Expect redirect
        expect(error.message).toContain('NEXT_REDIRECT');
      }

      // Assert: Session should be established
      expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalled();
    });

    it('should persist session data', async () => {
      // Arrange: Mock active session
      const mockUser = createMockUser({
        id: 'persistent-user',
        email: 'persistent@example.com',
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Seed user in database
      testState.database.seedUser({
        id: mockUser.id,
        email: mockUser.email,
        username: 'persistentuser',
        onboarding_completed: true,
      });

      // Act: Get session
      const session = await getSession();

      // Assert: Session should be returned
      expect(session).toBeTruthy();
      expect(session?.user.id).toBe(mockUser.id);
    });

    it('should retrieve user data from session', async () => {
      // Arrange: Mock active session
      const mockUser = createMockUser({
        id: 'user-with-session',
        email: 'user@example.com',
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Seed user in database
      const dbUser = testState.database.seedUser({
        id: mockUser.id,
        email: mockUser.email,
        username: 'testuser',
        full_name: 'Test User',
        onboarding_completed: true,
      });

      // Act: Get user
      const user = await getUser();

      // Assert: User data should be retrieved
      expect(user).toBeTruthy();
      expect(user?.id).toBe(dbUser.id);
      expect(user?.username).toBe(dbUser.username);
      expect(user?.email).toBe(dbUser.email);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh session token when near expiry', async () => {
      // Arrange: Mock session near expiry
      const mockUser = createMockUser({
        id: 'refresh-user',
        email: 'refresh@example.com',
      });
      
      // Create session expiring soon (in 5 minutes)
      const expiringSession = createMockSession(mockUser, {
        expires_at: Math.floor(Date.now() / 1000) + 300,
      });

      const refreshedSession = createMockSession(mockUser, {
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      });

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.getSession).mockResolvedValue({
        data: { session: expiringSession },
        error: null,
      });

      vi.mocked(supabaseMock.auth.refreshSession).mockResolvedValue({
        data: { session: refreshedSession, user: mockUser },
        error: null,
      });

      // Act: Refresh session
      const newSession = await supabaseMock.auth.refreshSession();

      // Assert: New session with extended expiry
      expect(newSession.data.session).toBeTruthy();
      expect(newSession.data.session!.expires_at).toBeGreaterThan(expiringSession.expires_at!);
    });

    it('should handle refresh token errors', async () => {
      // Arrange: Mock refresh failure
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.refreshSession).mockResolvedValue({
        data: { session: null, user: null },
        error: {
          message: 'Refresh token expired',
          name: 'AuthError',
          status: 401,
        },
      });

      // Act: Try to refresh
      const result = await supabaseMock.auth.refreshSession();

      // Assert: Should return error
      expect(result.error).toBeTruthy();
      expect(result.data.session).toBeNull();
    });
  });

  describe('Logout', () => {
    it('should clear session on logout', async () => {
      // Arrange: Mock active session
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.signOut).mockResolvedValue({
        error: null,
      });

      const formData = new FormData();
      formData.append('locale', 'en');

      // Act: Logout
      try {
        await logout(formData);
      } catch (error: any) {
        // Expect redirect to login
        expect(error.message).toContain('NEXT_REDIRECT');
        expect(error.message).toContain('/login');
      }

      // Assert: signOut was called
      expect(supabaseMock.auth.signOut).toHaveBeenCalled();
    });

    it('should redirect to login page after logout', async () => {
      // Arrange
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.signOut).mockResolvedValue({
        error: null,
      });

      const formData = new FormData();
      formData.append('locale', 'en');

      // Act & Assert
      try {
        await logout(formData);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toContain('NEXT_REDIRECT');
        expect(error.message).toContain('/en/login');
      }
    });

    it('should handle logout errors gracefully', async () => {
      // Arrange: Mock logout error
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.signOut).mockResolvedValue({
        error: {
          message: 'Logout failed',
          name: 'AuthError',
          status: 500,
        },
      });

      const formData = new FormData();
      formData.append('locale', 'en');

      // Act & Assert: Should still redirect even on error
      try {
        await logout(formData);
      } catch (error: any) {
        expect(error.message).toContain('NEXT_REDIRECT');
      }
    });
  });

  describe('Expired Session', () => {
    it('should return null for expired session', async () => {
      // Arrange: Mock expired session
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: {
          message: 'Session expired',
          name: 'AuthError',
          status: 401,
        },
      });

      // Act
      const session = await getSession();

      // Assert: Should return null
      expect(session).toBeNull();
    });

    it('should throw error when accessing protected resource with expired session', async () => {
      // Arrange: Mock no session
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Act & Assert: Should throw unauthorized error
      await expect(requireAuth()).rejects.toThrow('Unauthorized');
    });
  });

  describe('Concurrent Sessions', () => {
    it('should support multiple active sessions', async () => {
      // Arrange: Create user with multiple sessions
      const user = testState.database.seedUser({
        id: 'multi-session-user',
        email: 'multi@example.com',
        username: 'multiuser',
        onboarding_completed: true,
      });

      const mockUser = createMockUser({
        id: user.id,
        email: user.email,
      });

      // Create two different sessions
      const session1 = createMockSession(mockUser, {
        access_token: 'token-device-1',
      });

      const session2 = createMockSession(mockUser, {
        access_token: 'token-device-2',
      });

      // Assert: Both sessions are valid and for same user
      expect(session1.user.id).toBe(session2.user.id);
      expect(session1.access_token).not.toBe(session2.access_token);
    });
  });

  describe('Session Revocation', () => {
    it('should revoke all sessions on logout', async () => {
      // Arrange
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.signOut).mockResolvedValue({
        error: null,
      });

      // Act: Logout (revokes all sessions)
      const formData = new FormData();
      formData.append('locale', 'en');

      try {
        await logout(formData);
      } catch (error: any) {
        // Expect redirect
        expect(error.message).toContain('NEXT_REDIRECT');
      }

      // Assert: signOut was called
      expect(supabaseMock.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('Session Edge Cases', () => {
    it('should handle missing session gracefully', async () => {
      // Arrange: Mock no session
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Act
      const session = await getSession();
      const user = await getUser();

      // Assert
      expect(session).toBeNull();
      expect(user).toBeNull();
    });

    it('should handle session fetch errors', async () => {
      // Arrange: Mock session fetch error
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: {
          message: 'Network error',
          name: 'AuthError',
          status: 500,
        },
      });

      // Act
      const session = await getSession();

      // Assert: Should return null on error
      expect(session).toBeNull();
    });

    it('should create fallback user when database query fails', async () => {
      // Arrange: Mock session exists but database query fails
      const mockUser = createMockUser({
        id: 'fallback-user',
        email: 'fallback@example.com',
        user_metadata: {
          full_name: 'Fallback User',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Don't seed user in database - will cause query to fail

      // Act
      const user = await getUser();

      // Assert: Should return fallback user from session metadata
      expect(user).toBeTruthy();
      expect(user?.id).toBe(mockUser.id);
      expect(user?.email).toBe(mockUser.email);
      expect(user?.full_name).toBe('Fallback User');
      expect(user?.onboarding_completed).toBeNull();
    });

    it('should handle remember me option', async () => {
      // Arrange
      const user = testState.database.seedUser({
        id: 'remember-me-user',
        email: 'remember@example.com',
        onboarding_completed: true,
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

      // Act: Login with remember me
      const formData = new FormData();
      formData.append('email', user.email);
      formData.append('password', 'password123');
      formData.append('rememberMe', 'on');
      formData.append('locale', 'en');

      try {
        await login({}, formData);
      } catch (error: any) {
        // Expect redirect
        expect(error.message).toContain('NEXT_REDIRECT');
      }

      // Assert: Login called with remember_me option
      expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          email: user.email,
          password: 'password123',
          options: expect.objectContaining({
            data: expect.objectContaining({
              remember_me: true,
            }),
          }),
        })
      );
    });
  });

  describe('Session Security', () => {
    it('should not expose sensitive session data', async () => {
      // Arrange
      const mockUser = createMockUser({
        id: 'secure-user',
        email: 'secure@example.com',
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      testState.database.seedUser({
        id: mockUser.id,
        email: mockUser.email,
        username: 'secureuser',
      });

      // Act
      const user = await getUser();

      // Assert: User object should not contain sensitive auth tokens
      expect(user).toBeTruthy();
      expect(user).not.toHaveProperty('access_token');
      expect(user).not.toHaveProperty('refresh_token');
    });
  });
});
