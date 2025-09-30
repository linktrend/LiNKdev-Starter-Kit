/**
 * Mock email service for local development and testing
 * Logs email content to console instead of sending actual emails
 */

import type { EmailService, EmailPayload } from '@starter/types';

/**
 * Mock email service implementation
 * Logs email details to console for development/testing purposes
 */
export class MockEmailService implements EmailService {
  /**
   * Simulates sending an email by logging the content to console
   * @param payload - The email payload to "send"
   */
  async sendEmail(payload: EmailPayload): Promise<void> {
    const timestamp = new Date().toISOString();
    
    console.log('\n📧 === MOCK EMAIL SENT ===');
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`📬 To: ${payload.to}`);
    console.log(`📝 Subject: ${payload.subject}`);
    console.log(`🎨 Template: ${payload.templateName}`);
    console.log('📄 Template Data:');
    console.log(JSON.stringify(payload.templateData, null, 2));
    console.log('========================\n');
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Singleton instance of the mock email service
 */
export const mockEmailService = new MockEmailService();
