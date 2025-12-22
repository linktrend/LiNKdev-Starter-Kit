import { describe, it, expect, beforeEach, vi } from 'vitest';
import { requestPasswordReset, updatePassword, login } from '@/app/actions/auth';
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

// Mock Next.js cache and redirect
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

describe('Password Reset Integration Tests', () => {
  beforeEach(() => {
    setupIntegrationTest();
  });

  afterEach(() => {
    teardownIntegrationTest();
  });

  describe('Password Reset - Complete Flow', () => {
    it('should complete full password reset flow', async () => {
      // Arrange: Create existing user
      const user = testState.database.seedUser({
        id: 'user-reset-password',
        email: 'user@example.com',
        username: 'testuser',
        onboarding_completed: true,
      });

      // Step 1: Request password reset
      const resetFormData = new FormData();
      resetFormData.append('email', user.email);

      const resetResult = await requestPasswordReset({}, resetFormData);

      // Assert: Reset email sent
      expect(resetResult.success).toBe(true);
      expect(resetResult.message).toContain('Password reset email sent');

      // Assert: Email captured
      const emails = testState.emailCapture.getEmailsTo(user.email);
      expect(emails).toHaveLength(1);
      expect(emails[0].subject).toContain('Reset');
      expect(emails[0].link).toBeDefined();

      // Step 2: Extract reset link and simulate callback
      const resetLink = testState.emailCapture.extractResetLink(user.email);
      expect(resetLink).toBeDefined();

      const url = new URL(resetLink!);
      const code = url.searchParams.get('token') || 'reset-token';

      const mockUser = createMockUser({
        id: user.id,
        email: user.email,
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      const callbackRequest = new NextRequest(
        `http://localhost:3000/auth/callback?code=${code}&type=recovery`
      );
      const callbackResponse = await GET(callbackRequest);

      // Assert: Redirected to reset-password page
      expect(callbackResponse.status).toBe(307);
      expect(callbackResponse.headers.get('location')).toContain('/auth/reset-password');

      // Step 3: Update password
      const newPassword = 'NewSecurePassword123!';
      const updateFormData = new FormData();
      updateFormData.append('password', newPassword);

      vi.mocked(supabaseMock.auth.updateUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const updateResult = await updatePassword({}, updateFormData);

      // Assert: Password updated
      expect(updateResult.success).toBe(true);
      expect(updateResult.message).toContain('Password updated successfully');
      expect(supabaseMock.auth.updateUser).toHaveBeenCalledWith({
        password: newPassword,
      });

      // Step 4: Login with new password
      const loginFormData = new FormData();
      loginFormData.append('email', user.email);
      loginFormData.append('password', newPassword);
      loginFormData.append('locale', 'en');

      vi.mocked(supabaseMock.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act: Login should succeed
      try {
        await login({}, loginFormData);
      } catch (error: any) {
        // Expect redirect to dashboard
        expect(error.message).toContain('NEXT_REDIRECT');
        expect(error.message).toContain('/dashboard');
      }

      // Assert: Login was attempted with new credentials
      expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
        email: user.email,
        password: newPassword,
        options: expect.any(Object),
      });
    });
  });

  describe('Password Reset - Request Reset', () => {
    it('should send reset email for valid email', async () => {
      // Arrange
      const email = 'user@example.com';
      testState.database.seedUser({
        id: 'user-123',
        email,
        onboarding_completed: true,
      });

      const formData = new FormData();
      formData.append('email', email);

      // Act
      const result = await requestPasswordReset({}, formData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent. Please check your inbox.');

      // Assert: Email sent
      const emails = testState.emailCapture.getEmailsTo(email);
      expect(emails).toHaveLength(1);
      expect(emails[0].link).toContain('/auth/reset-password');
    });

    it('should reject invalid email format', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'invalid-email');

      // Act
      const result = await requestPasswordReset({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.email).toBeDefined();
      expect(result.error?.email[0]).toContain('Invalid email');
    });

    it('should handle non-existent email gracefully (security)', async () => {
      // Arrange: Email doesn't exist in database
      const formData = new FormData();
      formData.append('email', 'nonexistent@example.com');

      // Act
      const result = await requestPasswordReset({}, formData);

      // Assert: Should still show success (security best practice)
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent. Please check your inbox.');

      // Assert: Email still sent (Supabase handles non-existent users)
      const emails = testState.emailCapture.getEmailsTo('nonexistent@example.com');
      expect(emails).toHaveLength(1);
    });
  });

  describe('Password Reset - Expired Link', () => {
    it('should handle expired reset link', async () => {
      // Arrange: Mock expired token
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: null, user: null },
        error: {
          message: 'Token has expired',
          name: 'AuthError',
          status: 401,
        },
      });

      const request = new NextRequest(
        'http://localhost:3000/auth/callback?code=expired-reset-token&type=recovery'
      );

      // Act
      const response = await GET(request);

      // Assert: Should redirect to login with error
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=');
      expect(decodeURIComponent(location!)).toContain('expired');
    });
  });

  describe('Password Reset - Invalid Token', () => {
    it('should handle tampered reset link', async () => {
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

      const request = new NextRequest(
        'http://localhost:3000/auth/callback?code=tampered-token&type=recovery'
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

  describe('Password Reset - Weak Password', () => {
    it('should reject password that is too short', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('password', 'short');

      // Act
      const result = await updatePassword({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.password).toBeDefined();
      expect(result.error?.password[0]).toContain('at least 8 characters');
    });

    it('should reject empty password', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('password', '');

      // Act
      const result = await updatePassword({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.password).toBeDefined();
    });

    it('should accept strong password', async () => {
      // Arrange
      const strongPassword = 'StrongPassword123!@#';
      const formData = new FormData();
      formData.append('password', strongPassword);

      const mockUser = createMockUser();
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.updateUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Act
      const result = await updatePassword({}, formData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Password updated successfully');
    });
  });

  describe('Password Reset - Update Errors', () => {
    it('should handle session expired during password update', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('password', 'NewPassword123');

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Session expired',
          name: 'AuthError',
          status: 401,
        },
      });

      // Act
      const result = await updatePassword({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.form).toBeDefined();
      expect(result.error?.form[0]).toContain('Session expired');
    });

    it('should handle database error during password update', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('password', 'NewPassword123');

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Database error',
          name: 'AuthError',
          status: 500,
        },
      });

      // Act
      const result = await updatePassword({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.form).toBeDefined();
    });
  });

  describe('Password Reset - Edge Cases', () => {
    it('should handle missing email parameter', async () => {
      // Arrange
      const formData = new FormData();
      // No email provided

      // Act
      const result = await requestPasswordReset({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.email).toBeDefined();
    });

    it('should handle missing password parameter', async () => {
      // Arrange
      const formData = new FormData();
      // No password provided

      // Act
      const result = await updatePassword({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.password).toBeDefined();
    });

    it('should handle very long password', async () => {
      // Arrange: Very long but valid password
      const longPassword = 'A'.repeat(100) + '1!';
      const formData = new FormData();
      formData.append('password', longPassword);

      const mockUser = createMockUser();
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.updateUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Act
      const result = await updatePassword({}, formData);

      // Assert: Should accept long passwords
      expect(result.success).toBe(true);
    });

    it('should handle password with special characters', async () => {
      // Arrange
      const specialPassword = 'P@ssw0rd!#$%^&*()';
      const formData = new FormData();
      formData.append('password', specialPassword);

      const mockUser = createMockUser();
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.updateUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Act
      const result = await updatePassword({}, formData);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('Password Reset - Multiple Requests', () => {
    it('should allow multiple password reset requests', async () => {
      // Arrange
      const email = 'user@example.com';
      testState.database.seedUser({
        id: 'user-multiple-resets',
        email,
      });

      const formData = new FormData();
      formData.append('email', email);

      // Act: Request reset multiple times
      const result1 = await requestPasswordReset({}, formData);
      const result2 = await requestPasswordReset({}, formData);

      // Assert: Both should succeed
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Assert: Multiple emails sent
      const emails = testState.emailCapture.getEmailsTo(email);
      expect(emails.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Password Reset - Security', () => {
    it('should not reveal whether email exists in system', async () => {
      // Arrange: Test both existing and non-existing emails
      const existingEmail = 'existing@example.com';
      const nonExistingEmail = 'nonexisting@example.com';

      testState.database.seedUser({
        id: 'existing-user',
        email: existingEmail,
      });

      const formData1 = new FormData();
      formData1.append('email', existingEmail);

      const formData2 = new FormData();
      formData2.append('email', nonExistingEmail);

      // Act
      const result1 = await requestPasswordReset({}, formData1);
      const result2 = await requestPasswordReset({}, formData2);

      // Assert: Both should show same success message (security)
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.message).toBe(result2.message);
    });

    it('should include redirect URL in reset email', async () => {
      // Arrange
      const email = 'user@example.com';
      const formData = new FormData();
      formData.append('email', email);

      // Act
      await requestPasswordReset({}, formData);

      // Assert: Email contains correct redirect
      const emails = testState.emailCapture.getEmailsTo(email);
      expect(emails).toHaveLength(1);
      expect(emails[0].link).toContain('http://localhost:3000/auth/reset-password');
    });
  });
});
