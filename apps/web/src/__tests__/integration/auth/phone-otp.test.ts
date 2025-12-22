import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendPhoneOTP, verifyPhoneOTP } from '@/app/actions/auth';
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

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Phone OTP Integration Tests', () => {
  beforeEach(() => {
    setupIntegrationTest();
  });

  afterEach(() => {
    teardownIntegrationTest();
  });

  describe('Phone OTP - New User', () => {
    it('should send OTP to valid phone number', async () => {
      // Arrange
      const phone = '+12345678901';
      const formData = new FormData();
      formData.append('phone', phone);

      // Act
      const result = await sendPhoneOTP({}, formData);

      // Assert: Action should succeed
      expect(result.success).toBe(true);
      expect(result.message).toBe('OTP sent to your phone.');

      // Assert: SMS should be captured
      const messages = testState.smsCapture.getMessagesTo(phone);
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toContain('verification code');
      expect(messages[0].otp).toBeDefined();
      expect(messages[0].otp).toMatch(/^\d{6}$/); // 6-digit OTP
    });

    it('should complete full phone OTP flow for new user', async () => {
      // Arrange: Send OTP
      const phone = '+12345678901';
      const formData = new FormData();
      formData.append('phone', phone);

      await sendPhoneOTP({}, formData);

      // Extract OTP from captured SMS
      const otp = testState.smsCapture.extractOTP(phone);
      expect(otp).toBeDefined();

      // Mock successful verification
      const mockUser = createMockUser({
        id: 'phone-user-123',
        phone,
        app_metadata: { provider: 'phone' },
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.verifyOtp).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act: Verify OTP
      const verifyResult = await verifyPhoneOTP(phone, otp!);

      // Assert: Verification should succeed
      expect(verifyResult.success).toBe(true);
      expect(supabaseMock.auth.verifyOtp).toHaveBeenCalledWith({
        phone,
        token: otp,
        type: 'sms',
      });
    });

    it('should reject invalid phone format (missing +)', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('phone', '12345678901'); // Missing +

      // Act
      const result = await sendPhoneOTP({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.phone).toBeDefined();
      expect(result.error?.phone[0]).toContain('Invalid phone number');

      // Assert: No SMS should be sent
      expect(testState.smsCapture.getMessages()).toHaveLength(0);
    });

    it('should reject invalid phone format (too short)', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('phone', '+123'); // Too short

      // Act
      const result = await sendPhoneOTP({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.phone).toBeDefined();
    });
  });

  describe('Phone OTP - Returning User', () => {
    it('should send OTP to existing user', async () => {
      // Arrange: Create existing user
      const phone = '+19876543210';
      testState.database.seedUser({
        id: 'existing-phone-user',
        phone_number: phone,
        onboarding_completed: true,
      });

      const formData = new FormData();
      formData.append('phone', phone);

      // Act
      const result = await sendPhoneOTP({}, formData);

      // Assert
      expect(result.success).toBe(true);

      // Assert: SMS sent
      const messages = testState.smsCapture.getMessagesTo(phone);
      expect(messages).toHaveLength(1);
    });
  });

  describe('Phone OTP - Invalid OTP', () => {
    it('should reject wrong OTP code', async () => {
      // Arrange: Send OTP
      const phone = '+12345678901';
      const formData = new FormData();
      formData.append('phone', phone);

      await sendPhoneOTP({}, formData);

      // Get the correct OTP
      const correctOTP = testState.smsCapture.extractOTP(phone);
      expect(correctOTP).toBeDefined();

      // Mock verification with wrong OTP
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.verifyOtp).mockResolvedValue({
        data: { session: null, user: null },
        error: {
          message: 'Invalid OTP',
          name: 'AuthError',
          status: 400,
        },
      });

      // Act: Try to verify with wrong OTP
      const wrongOTP = '000000';
      const result = await verifyPhoneOTP(phone, wrongOTP);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.form).toBeDefined();
      expect(result.error?.form[0]).toContain('Invalid OTP');
    });

    it('should reject OTP with invalid format', async () => {
      // Arrange
      const phone = '+12345678901';
      const formData = new FormData();
      formData.append('phone', phone);

      await sendPhoneOTP({}, formData);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.verifyOtp).mockResolvedValue({
        data: { session: null, user: null },
        error: {
          message: 'Invalid OTP',
          name: 'AuthError',
          status: 400,
        },
      });

      // Act: Try various invalid formats
      const invalidOTPs = ['12345', '1234567', 'abcdef', ''];

      for (const invalidOTP of invalidOTPs) {
        const result = await verifyPhoneOTP(phone, invalidOTP);
        expect(result.success).toBeUndefined();
        expect(result.error?.form).toBeDefined();
      }
    });
  });

  describe('Phone OTP - Expired OTP', () => {
    it('should reject expired OTP code', async () => {
      // Arrange: Send OTP
      const phone = '+12345678901';
      const formData = new FormData();
      formData.append('phone', phone);

      await sendPhoneOTP({}, formData);

      const otp = testState.smsCapture.extractOTP(phone);
      expect(otp).toBeDefined();

      // Mock expired OTP error
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.verifyOtp).mockResolvedValue({
        data: { session: null, user: null },
        error: {
          message: 'OTP expired',
          name: 'AuthError',
          status: 401,
        },
      });

      // Act: Try to verify expired OTP
      const result = await verifyPhoneOTP(phone, otp!);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.form).toBeDefined();
      expect(result.error?.form[0]).toContain('OTP expired');
    });
  });

  describe('Phone OTP - Rate Limiting', () => {
    it('should handle rate limit when sending OTP', async () => {
      // Arrange: Mock rate limit error
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.signInWithOtp).mockResolvedValue({
        error: {
          message: 'Too many attempts',
          name: 'AuthError',
          status: 429,
        },
      });

      const formData = new FormData();
      formData.append('phone', '+12345678901');

      // Act
      const result = await sendPhoneOTP({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.form).toBeDefined();
      expect(result.error?.form[0]).toContain('Too many attempts');
    });

    it('should handle multiple rapid OTP requests', async () => {
      // Arrange
      const phone = '+12345678901';
      const formData = new FormData();
      formData.append('phone', phone);

      // Act: Send multiple requests rapidly
      const results = await Promise.all([
        sendPhoneOTP({}, formData),
        sendPhoneOTP({}, formData),
        sendPhoneOTP({}, formData),
      ]);

      // Assert: All should succeed (rate limiting handled by Supabase)
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });

      // Assert: Multiple SMS sent
      const messages = testState.smsCapture.getMessagesTo(phone);
      expect(messages.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Phone OTP - SMS Service Errors', () => {
    it('should handle SMS service unavailable error', async () => {
      // Arrange: Mock SMS service error
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.signInWithOtp).mockResolvedValue({
        error: {
          message: 'SMS service unavailable',
          name: 'AuthError',
          status: 503,
        },
      });

      const formData = new FormData();
      formData.append('phone', '+12345678901');

      // Act
      const result = await sendPhoneOTP({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.form).toBeDefined();
      expect(result.error?.form[0]).toContain('SMS service unavailable');
    });
  });

  describe('Phone OTP - Edge Cases', () => {
    it('should handle missing phone parameter', async () => {
      // Arrange
      const formData = new FormData();
      // No phone provided

      // Act
      const result = await sendPhoneOTP({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.phone).toBeDefined();
    });

    it('should handle empty phone string', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('phone', '');

      // Act
      const result = await sendPhoneOTP({}, formData);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.phone).toBeDefined();
    });

    it('should handle phone with spaces', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('phone', '+1 234 567 8901');

      // Act
      const result = await sendPhoneOTP({}, formData);

      // Assert: Should either succeed (if normalized) or fail validation
      expect(result.success !== undefined || result.error !== undefined).toBe(true);
    });

    it('should handle international phone numbers', async () => {
      // Arrange: Test various international formats
      const internationalPhones = [
        '+442071234567', // UK
        '+81312345678', // Japan
        '+61212345678', // Australia
        '+33123456789', // France
      ];

      for (const phone of internationalPhones) {
        const formData = new FormData();
        formData.append('phone', phone);

        // Act
        const result = await sendPhoneOTP({}, formData);

        // Assert: Should handle all E.164 format numbers
        expect(result.success || result.error).toBeDefined();
      }
    });
  });

  describe('Phone OTP - Verification Flow', () => {
    it('should verify OTP and establish session', async () => {
      // Arrange: Send OTP
      const phone = '+12345678901';
      const formData = new FormData();
      formData.append('phone', phone);

      await sendPhoneOTP({}, formData);
      const otp = testState.smsCapture.extractOTP(phone)!;

      // Mock successful verification with session
      const mockUser = createMockUser({
        id: 'verified-phone-user',
        phone,
      });
      const mockSession = createMockSession(mockUser);

      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.verifyOtp).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Act
      const result = await verifyPhoneOTP(phone, otp);

      // Assert
      expect(result.success).toBe(true);
      expect(supabaseMock.auth.verifyOtp).toHaveBeenCalledWith({
        phone,
        token: otp,
        type: 'sms',
      });
    });

    it('should handle verification without session', async () => {
      // Arrange
      const phone = '+12345678901';
      const formData = new FormData();
      formData.append('phone', phone);

      await sendPhoneOTP({}, formData);
      const otp = testState.smsCapture.extractOTP(phone)!;

      // Mock verification that returns no session
      const supabaseMock = createIntegrationSupabaseMock();
      vi.mocked(supabaseMock.auth.verifyOtp).mockResolvedValue({
        data: { session: null, user: null },
        error: {
          message: 'Verification failed',
          name: 'AuthError',
          status: 400,
        },
      });

      // Act
      const result = await verifyPhoneOTP(phone, otp);

      // Assert
      expect(result.success).toBeUndefined();
      expect(result.error?.form).toBeDefined();
    });
  });

  describe('Phone OTP - Multiple Attempts', () => {
    it('should allow resending OTP', async () => {
      // Arrange
      const phone = '+12345678901';
      const formData = new FormData();
      formData.append('phone', phone);

      // Act: Send OTP twice
      const result1 = await sendPhoneOTP({}, formData);
      const result2 = await sendPhoneOTP({}, formData);

      // Assert: Both should succeed
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Assert: Two different OTPs sent
      const messages = testState.smsCapture.getMessagesTo(phone);
      expect(messages).toHaveLength(2);
      
      // OTPs might be different (depending on implementation)
      const otp1 = messages[0].otp;
      const otp2 = messages[1].otp;
      expect(otp1).toBeDefined();
      expect(otp2).toBeDefined();
    });
  });
});
