import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendPhoneOTP, verifyPhoneOTP } from '@/app/actions/auth';

// Mock the Supabase client
vi.mock('@/lib/auth/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
    },
  })),
}));

describe('Phone OTP Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Send OTP', () => {
    it('should send OTP for valid phone number', async () => {
      const { createClient } = await import('@/lib/auth/server');
      const mockSignInWithOtp = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(createClient).mockReturnValue({
        auth: { signInWithOtp: mockSignInWithOtp },
      } as any);

      const formData = new FormData();
      formData.append('phone', '+12345678901');

      const result = await sendPhoneOTP({}, formData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('OTP sent to your phone.');
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        phone: '+12345678901',
      });
    });

    it('should reject invalid phone format', async () => {
      const formData = new FormData();
      formData.append('phone', '1234567890'); // Missing +

      const result = await sendPhoneOTP({}, formData);

      expect(result.error?.phone).toBeDefined();
      expect(result.success).toBeUndefined();
    });

    it('should handle rate limit errors', async () => {
      const { createClient } = await import('@/lib/auth/server');
      const mockSignInWithOtp = vi.fn().mockResolvedValue({
        error: { status: 429, message: 'Too many attempts' },
      });
      vi.mocked(createClient).mockReturnValue({
        auth: { signInWithOtp: mockSignInWithOtp },
      } as any);

      const formData = new FormData();
      formData.append('phone', '+12345678901');

      const result = await sendPhoneOTP({}, formData);

      expect(result.error?.form).toContain('Too many attempts');
    });
  });

  describe('Verify OTP', () => {
    it('should verify valid OTP', async () => {
      const { createClient } = await import('@/lib/auth/server');
      const mockVerifyOtp = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(createClient).mockReturnValue({
        auth: { verifyOtp: mockVerifyOtp },
      } as any);

      const result = await verifyPhoneOTP('+12345678901', '123456');

      expect(result.success).toBe(true);
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        phone: '+12345678901',
        token: '123456',
        type: 'sms',
      });
    });

    it('should handle invalid OTP', async () => {
      const { createClient } = await import('@/lib/auth/server');
      const mockVerifyOtp = vi.fn().mockResolvedValue({
        error: { message: 'Invalid OTP' },
      });
      vi.mocked(createClient).mockReturnValue({
        auth: { verifyOtp: mockVerifyOtp },
      } as any);

      const result = await verifyPhoneOTP('+12345678901', '000000');

      expect(result.error?.form).toContain('Invalid OTP');
    });

    it('should handle expired OTP', async () => {
      const { createClient } = await import('@/lib/auth/server');
      const mockVerifyOtp = vi.fn().mockResolvedValue({
        error: { message: 'OTP expired' },
      });
      vi.mocked(createClient).mockReturnValue({
        auth: { verifyOtp: mockVerifyOtp },
      } as any);

      const result = await verifyPhoneOTP('+12345678901', '123456');

      expect(result.error?.form).toContain('OTP expired');
    });
  });
});
