/**
 * Test file for the mock email service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockEmailService } from '../email.service';
import type { EmailPayload } from '@starter/types';

describe('MockEmailService', () => {
  let emailService: MockEmailService;

  beforeEach(() => {
    emailService = new MockEmailService();
  });

  it('should log email details to console', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const emailPayload: EmailPayload = {
      to: 'test@example.com',
      subject: 'Test Email',
      templateName: 'test',
      templateData: {
        message: 'Hello World',
        timestamp: '2024-01-27T10:00:00Z',
      },
    };

    await emailService.sendEmail(emailPayload);

    expect(consoleSpy).toHaveBeenCalledWith('\n📧 === MOCK EMAIL SENT ===');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/⏰ Timestamp: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/));
    expect(consoleSpy).toHaveBeenCalledWith('📬 To: test@example.com');
    expect(consoleSpy).toHaveBeenCalledWith('📝 Subject: Test Email');
    expect(consoleSpy).toHaveBeenCalledWith('🎨 Template: test');
    expect(consoleSpy).toHaveBeenCalledWith('📄 Template Data:');
    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(emailPayload.templateData, null, 2));
    expect(consoleSpy).toHaveBeenCalledWith('========================\n');

    consoleSpy.mockRestore();
  });

  it('should simulate async operation', async () => {
    const startTime = Date.now();
    await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      templateName: 'test',
      templateData: {},
    });
    const endTime = Date.now();

    // Should take at least 100ms due to the setTimeout
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });
});
