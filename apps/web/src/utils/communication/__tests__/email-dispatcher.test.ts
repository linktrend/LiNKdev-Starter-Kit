/**
 * Test file for the email dispatcher utility
 */

import { describe, it, expect, vi } from 'vitest';
import { 
  sendTestEmail, 
  sendProfileUpdateEmail,
  sendWelcomeEmail 
} from '../email-dispatcher';
import type { TestEmailData, ProfileUpdateEmailData, WelcomeEmailData } from '@starter/types';

// Mock the email service
const mockSendEmail = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('../../server/services/email.service', () => ({
  emailService: {
    sendEmail: mockSendEmail(),
  },
}));

describe('Email Dispatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendTestEmail', () => {
    it.skip('should send a test email with correct payload', async () => {
      const testData: TestEmailData = {
        message: 'Test message',
        timestamp: '2024-01-27T10:00:00Z',
      };

      await sendTestEmail('test@example.com', testData);

      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Test Email - LTM Starter Kit',
        templateName: 'test',
        templateData: testData,
      });
    });
  });

  describe('sendProfileUpdateEmail', () => {
    it.skip('should send a profile update email with correct payload', async () => {
      const profileData: ProfileUpdateEmailData = {
        userName: 'John Doe',
        updatedField: 'Organization Name',
        newValue: 'New Org Name',
        profileUrl: 'https://example.com/profile',
      };

      await sendProfileUpdateEmail('user@example.com', profileData);

      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Profile Updated - LTM Starter Kit',
        templateName: 'profile-update',
        templateData: profileData,
      });
    });
  });

  describe('sendWelcomeEmail', () => {
    it.skip('should send a welcome email with correct payload', async () => {
      const welcomeData: WelcomeEmailData = {
        userName: 'Jane Doe',
        loginUrl: 'https://example.com/login',
      };

      await sendWelcomeEmail('welcome@example.com', welcomeData);

      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'welcome@example.com',
        subject: 'Welcome to LTM Starter Kit!',
        templateName: 'welcome',
        templateData: welcomeData,
      });
    });
  });
});
