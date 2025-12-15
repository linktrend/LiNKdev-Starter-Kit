import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestPasswordReset, updatePassword } from '@/app/actions/auth';

// Mock the Supabase client
vi.mock('@/lib/auth/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
  })),
}));

describe('Password Reset Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Password Reset', () => {
    it('should send reset email for valid email', async () => {
      const { createClient } = await import('@/lib/auth/server');
      const mockResetPassword = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(createClient).mockReturnValue({
        auth: { resetPasswordForEmail: mockResetPassword },
      } as any);

      const formData = new FormData();
      formData.append('email', 'test@example.com');

      const result = await requestPasswordReset({}, formData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent. Please check your inbox.');
      expect(mockResetPassword).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/reset-password'),
        })
      );
    });

    it('should reject invalid email', async () => {
      const formData = new FormData();
      formData.append('email', 'invalid-email');

      const result = await requestPasswordReset({}, formData);

      expect(result.error?.email).toBeDefined();
    });

    it('should handle Supabase errors', async () => {
      const { createClient } = await import('@/lib/auth/server');
      const mockResetPassword = vi.fn().mockResolvedValue({
        error: { message: 'Email not found' },
      });
      vi.mocked(createClient).mockReturnValue({
        auth: { resetPasswordForEmail: mockResetPassword },
      } as any);

      const formData = new FormData();
      formData.append('email', 'test@example.com');

      const result = await requestPasswordReset({}, formData);

      expect(result.error?.form).toContain('Email not found');
    });
  });

  describe('Update Password', () => {
    it('should update password with valid input', async () => {
      const { createClient } = await import('@/lib/auth/server');
      const mockUpdateUser = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(createClient).mockReturnValue({
        auth: { updateUser: mockUpdateUser },
      } as any);

      const formData = new FormData();
      formData.append('password', 'NewSecurePassword123');

      const result = await updatePassword({}, formData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password updated successfully.');
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'NewSecurePassword123',
      });
    });

    it('should reject password that is too short', async () => {
      const formData = new FormData();
      formData.append('password', 'short');

      const result = await updatePassword({}, formData);

      expect(result.error?.password).toBeDefined();
    });

    it('should handle update errors', async () => {
      const { createClient } = await import('@/lib/auth/server');
      const mockUpdateUser = vi.fn().mockResolvedValue({
        error: { message: 'Session expired' },
      });
      vi.mocked(createClient).mockReturnValue({
        auth: { updateUser: mockUpdateUser },
      } as any);

      const formData = new FormData();
      formData.append('password', 'NewSecurePassword123');

      const result = await updatePassword({}, formData);

      expect(result.error?.form).toContain('Session expired');
    });
  });
});
