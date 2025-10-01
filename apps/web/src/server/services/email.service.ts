/**
 * Live email service implementation using Resend
 * Falls back to mock service when API key is not available
 */

import { Resend } from 'resend';
import type { EmailService, EmailPayload } from '@starter/types';
import { mockEmailService } from '../mocks/email.service';

/**
 * Live email service implementation using Resend
 */
export class LiveEmailService implements EmailService {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  /**
   * Send an email using Resend
   * @param payload - The email payload to send
   */
  async sendEmail(payload: EmailPayload): Promise<void> {
    try {
      const { to, subject, templateName, templateData } = payload;
      
      // Convert template data to HTML content
      // In a real implementation, you would use a proper template engine
      const htmlContent = this.renderTemplate(templateName, templateData);
      
      await this.resend.emails.send({
        from: 'noreply@yourdomain.com', // This should be configured per environment
        to: [to],
        subject,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Simple template rendering (in production, use a proper template engine)
   * @param templateName - Name of the template
   * @param data - Template data
   * @returns Rendered HTML content
   */
  private renderTemplate(templateName: string, data: Record<string, any>): string {
    // This is a simplified template renderer
    // In production, you would use a proper template engine like Handlebars, Mustache, etc.
    let html = `<h1>${templateName}</h1>`;
    
    Object.entries(data).forEach(([key, value]) => {
      html += `<p><strong>${key}:</strong> ${value}</p>`;
    });
    
    return html;
  }
}

/**
 * Email service factory that returns the appropriate service based on environment
 */
export function createEmailService(): EmailService {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (apiKey && apiKey !== 'resend_live_placeholder') {
    return new LiveEmailService(apiKey);
  }
  
  // Fall back to mock service for development or when API key is not available
  return mockEmailService;
}

/**
 * Singleton instance of the email service
 */
export const emailService = createEmailService();
