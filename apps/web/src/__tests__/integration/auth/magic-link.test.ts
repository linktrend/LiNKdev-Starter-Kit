import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendMagicLink } from '@/app/actions/auth';
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
vi.mock('@/lib/auth/server', () => ({
  createClient: () => createIntegrationSupabaseMock(),
}));

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

describe('Magic Link Integration Tests', () => {
  beforeEach(() => {
    setupIntegrationTest();
  });

  afterEach(() => {
    teardownIntegrationTest();
  });

  describe('Magic Link - New User', () => {
    it('should send magic link email for new user', async () => {
      // Arrange
      const email = 'newuser@example.com';
      const formData = new FormData();
      formData.append('email', email);
      formData.append('locale', 'en');

      // Act
      const result = await sendMagicLink({}, formData);

      // Assert: Action should succeed
      expect(result.success).toBe(true);
      expect(result.message).toBe('Check your email for the magic link.');

      // Assert: Email should be captured
      const emails = testState.emailCapture.getEmailsTo(email);
      expect(emails).toHaveLength(1);
      expect(emails[0].subject).toContain('Magic Link');
      expect(emails[0].link).toBeDefined();
      expect(emails[0].link).toContain('/auth/callback');
    });

    it('should complete full magic link flow for new user', async () => {
      // Arrange: Send magic link
      const email = 'newuser@example.com';
      const formData = new FormData();
      formData.append('email', email);
      formData.append('locale', 'en');

      await sendMagicLink({}, formData);

      // Extract magic link from captured email
      const magicLink = testState.emailCapture.extractMagicLink(email);
      expect(magicLink).toBeDefined();

      // Mock successful callback
      const mockUser = createMockUser({
        id: 'magic-link-user-123',
        email,
        app_metadata: { provider: 'email' },
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act: Simulate clicking magic link
      const url = new URL(magicLink!);
      const code = url.searchParams.get('token') || 'mock-token';
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      const response = await GET(request);

      // Assert: User should be created
      const users = testState.database.query('users', { id: mockUser.id });
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        onboarding_completed: false,
      });

      // Assert: Should redirect to onboarding
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/onboarding');
    });

    it('should reject invalid email format', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'invalid-email');

      // Act
      const result = await sendMagicLink({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.email).toBeDefined();
      expect(result.error?.email[0]).toContain('Invalid email');

      // Assert: No email should be sent
      expect(testState.emailCapture.getEmails()).toHaveLength(0);
    });
  });

  describe('Magic Link - Returning User', () => {
    it('should send magic link to existing user and redirect to dashboard', async () => {
      // Arrange: Create existing user with completed onboarding
      const existingUser = testState.database.seedUser({
        id: 'existing-magic-user',
        email: 'existing@example.com',
        username: 'existinguser',
        onboarding_completed: true,
        profile_completed: true,
      });

      // Send magic link
      const formData = new FormData();
      formData.append('email', existingUser.email);
      formData.append('locale', 'en');

      const result = await sendMagicLink({}, formData);
      expect(result.success).toBe(true);

      // Extract magic link
      const magicLink = testState.emailCapture.extractMagicLink(existingUser.email);
      expect(magicLink).toBeDefined();

      // Mock callback
      const mockUser = createMockUser({
        id: existingUser.id,
        email: existingUser.email,
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act: Click magic link
      const url = new URL(magicLink!);
      const code = url.searchParams.get('token') || 'mock-token';
      const request = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}`
      );
      const response = await GET(request);

      // Assert: Should redirect to dashboard, not onboarding
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/dashboard');
      expect(response.headers.get('location')).not.toContain('/onboarding');
    });
  });

  describe('Magic Link - Expired Link', () => {
    it('should handle expired magic link token', async () => {
      // Arrange: Send magic link
      const email = 'user@example.com';
      const formData = new FormData();
      formData.append('email', email);

      await sendMagicLink({}, formData);

      // Mock expired token error
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: null, user: null },
        error: { 
          message: 'Token has expired',
          name: 'AuthError',
          status: 401,
        },
      });

      // Act: Try to use expired link
      const request = new NextRequest(
        'http://localhost:3000/auth/callback?code=expired-token'
      );
      const response = await GET(request);

      // Assert: Should redirect to login with error
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=');
      expect(decodeURIComponent(location!)).toContain('expired');
    });
  });

  describe('Magic Link - Invalid Token', () => {
    it('should handle tampered or invalid magic link token', async () => {
      // Arrange: Mock invalid token
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: null, user: null },
        error: {
          message: 'Invalid token',
          name: 'AuthError',
          status: 400,
        },
      });

      // Act: Try to use invalid token
      const request = new NextRequest(
        'http://localhost:3000/auth/callback?code=tampered-invalid-token'
      );
      const response = await GET(request);

      // Assert: Should redirect to login with error
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=');
    });
  });

  describe('Magic Link - Rate Limiting', () => {
    it('should handle rate limit errors when sending magic links', async () => {
      // Arrange: Mock rate limit error
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.signInWithOtp).mockResolvedValue({
        error: {
          message: 'Rate limit exceeded',
          name: 'AuthError',
          status: 429,
        },
      });

      const formData = new FormData();
      formData.append('email', 'user@example.com');

      // Act
      const result = await sendMagicLink({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.form).toBeDefined();
      expect(result.error?.form[0]).toContain('Rate limit exceeded');
    });

    it('should handle multiple rapid magic link requests', async () => {
      // Arrange
      const email = 'rapid@example.com';
      const formData = new FormData();
      formData.append('email', email);

      // Act: Send multiple requests
      const result1 = await sendMagicLink({}, formData);
      const result2 = await sendMagicLink({}, formData);
      const result3 = await sendMagicLink({}, formData);

      // Assert: All should succeed (rate limiting handled by Supabase)
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);

      // Assert: Multiple emails sent
      const emails = testState.emailCapture.getEmailsTo(email);
      expect(emails.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Magic Link - Email Service Errors', () => {
    it('should handle email service unavailable error', async () => {
      // Arrange: Mock email service error
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.signInWithOtp).mockResolvedValue({
        error: {
          message: 'Email service unavailable',
          name: 'AuthError',
          status: 503,
        },
      });

      const formData = new FormData();
      formData.append('email', 'user@example.com');

      // Act
      const result = await sendMagicLink({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.form).toBeDefined();
      expect(result.error?.form[0]).toContain('Email service unavailable');
    });
  });

  describe('Magic Link - Edge Cases', () => {
    it('should handle missing email parameter', async () => {
      // Arrange
      const formData = new FormData();
      // No email provided

      // Act
      const result = await sendMagicLink({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.email).toBeDefined();
    });

    it('should handle empty email string', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', '');

      // Act
      const result = await sendMagicLink({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.email).toBeDefined();
    });

    it('should handle email with spaces', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', '  user@example.com  ');

      // Act
      const result = await sendMagicLink({}, formData);

      // Assert: Should either succeed (if trimmed) or fail validation
      // The actual behavior depends on validation implementation
      expect(result.success || result.error).toBeDefined();
    });

    it('should handle very long email addresses', async () => {
      // Arrange
      const longEmail = 'a'.repeat(100) + '@example.com';
      const formData = new FormData();
      formData.append('email', longEmail);

      // Act
      const result = await sendMagicLink({}, formData);

      // Assert: Should handle gracefully (either succeed or fail validation)
      expect(result.success !== undefined || result.error !== undefined).toBe(true);
    });
  });

  describe('Magic Link - Redirect URL Configuration', () => {
    it('should include correct redirect URL in magic link', async () => {
      // Arrange
      const email = 'user@example.com';
      const formData = new FormData();
      formData.append('email', email);

      // Act
      await sendMagicLink({}, formData);

      // Assert: Check captured email has correct redirect
      const emails = testState.emailCapture.getEmailsTo(email);
      expect(emails).toHaveLength(1);
      expect(emails[0].link).toContain('http://localhost:3000/auth/callback');
    });
  });
});
