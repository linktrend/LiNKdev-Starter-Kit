/**
 * Email dispatcher utility for sending transactional emails
 * Central entry point for all server-side email functionality
 */

import type { 
  EmailPayload, 
  EmailTemplateConfig, 
  TypedEmailPayload,
  WelcomeEmailData,
  PasswordResetEmailData,
  InvoiceEmailData,
  ProfileUpdateEmailData,
  TestEmailData
} from '@starter/types';
import { emailService } from '../../server/services/email.service';

/**
 * Email template configurations
 * Maps template names to their subject lines and body generation functions
 */
const emailTemplates: Record<string, EmailTemplateConfig<any>> = {
  welcome: {
    subject: 'Welcome to LTM Starter Kit!',
    getBody: (data: WelcomeEmailData) => `
      <h1>Welcome, ${data.userName}!</h1>
      <p>Thank you for joining LTM Starter Kit. We're excited to have you on board!</p>
      <p>You can now access your account by clicking the link below:</p>
      <a href="${data.loginUrl}">Access Your Account</a>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The LTM Starter Kit Team</p>
    `,
  },
  'password-reset': {
    subject: 'Reset Your Password - LTM Starter Kit',
    getBody: (data: PasswordResetEmailData) => `
      <h1>Password Reset Request</h1>
      <p>Hello ${data.userName},</p>
      <p>We received a request to reset your password. Click the link below to create a new password:</p>
      <a href="${data.resetUrl}">Reset Password</a>
      <p>This link will expire in ${data.expiresIn}.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The LTM Starter Kit Team</p>
    `,
  },
  invoice: {
    subject: `Invoice #{{invoiceNumber}} - LTM Starter Kit`,
    getBody: (data: InvoiceEmailData) => `
      <h1>Invoice #${data.invoiceNumber}</h1>
      <p>Hello ${data.userName},</p>
      <p>Your invoice is ready for payment.</p>
      <p><strong>Amount:</strong> ${data.amount}</p>
      <p><strong>Due Date:</strong> ${data.dueDate}</p>
      <p>You can view and pay your invoice by clicking the link below:</p>
      <a href="${data.invoiceUrl}">View Invoice</a>
      <p>Thank you for your business!</p>
      <p>Best regards,<br>The LTM Starter Kit Team</p>
    `,
  },
  'profile-update': {
    subject: 'Profile Updated - LTM Starter Kit',
    getBody: (data: ProfileUpdateEmailData) => `
      <h1>Profile Update Confirmation</h1>
      <p>Hello ${data.userName},</p>
      <p>Your profile has been successfully updated.</p>
      <p><strong>Updated Field:</strong> ${data.updatedField}</p>
      <p><strong>New Value:</strong> ${data.newValue}</p>
      <p>You can view your updated profile by clicking the link below:</p>
      <a href="${data.profileUrl}">View Profile</a>
      <p>If you didn't make this change, please contact our support team immediately.</p>
      <p>Best regards,<br>The LTM Starter Kit Team</p>
    `,
  },
  test: {
    subject: 'Test Email - LTM Starter Kit',
    getBody: (data: TestEmailData) => `
      <h1>Test Email</h1>
      <p>This is a test email sent at ${data.timestamp}.</p>
      <p><strong>Message:</strong> ${data.message}</p>
      <p>If you received this email, the email service is working correctly!</p>
    `,
  },
};

/**
 * Composes an email by applying template data to the template configuration
 * @param templateName - The name of the email template
 * @param templateData - The data to populate the template with
 * @returns Complete email payload ready for sending
 */
function composeEmail<T extends Record<string, unknown>>(
  templateName: string,
  templateData: T,
  to: string
): EmailPayload {
  const template = emailTemplates[templateName];
  
  if (!template) {
    throw new Error(`Unknown email template: ${templateName}`);
  }

  // Replace placeholders in subject (e.g., {{invoiceNumber}})
  let subject = template.subject;
  Object.entries(templateData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    if (subject.includes(placeholder)) {
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    }
  });

  return {
    to,
    subject,
    templateName: templateName as any,
    templateData,
  };
}

/**
 * Sends a welcome email to a new user
 * @param to - Recipient email address
 * @param data - Welcome email data
 */
export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<void> {
  const payload = composeEmail('welcome', data, to);
  await emailService.sendEmail(payload);
}

/**
 * Sends a password reset email
 * @param to - Recipient email address
 * @param data - Password reset email data
 */
export async function sendPasswordResetEmail(
  to: string,
  data: PasswordResetEmailData
): Promise<void> {
  const payload = composeEmail('password-reset', data, to);
  await emailService.sendEmail(payload);
}

/**
 * Sends an invoice email
 * @param to - Recipient email address
 * @param data - Invoice email data
 */
export async function sendInvoiceEmail(
  to: string,
  data: InvoiceEmailData
): Promise<void> {
  const payload = composeEmail('invoice', data, to);
  await emailService.sendEmail(payload);
}

/**
 * Sends a profile update confirmation email
 * @param to - Recipient email address
 * @param data - Profile update email data
 */
export async function sendProfileUpdateEmail(
  to: string,
  data: ProfileUpdateEmailData
): Promise<void> {
  const payload = composeEmail('profile-update', data, to);
  await emailService.sendEmail(payload);
}

/**
 * Sends a test email
 * @param to - Recipient email address
 * @param data - Test email data
 */
export async function sendTestEmail(
  to: string,
  data: TestEmailData
): Promise<void> {
  const payload = composeEmail('test', data, to);
  await emailService.sendEmail(payload);
}

/**
 * Generic email dispatcher for custom templates
 * @param payload - Complete email payload
 */
export async function dispatchEmail(payload: EmailPayload): Promise<void> {
  await emailService.sendEmail(payload);
}

/**
 * Type-safe email dispatcher for typed payloads
 * @param payload - Typed email payload
 */
export async function dispatchTypedEmail(payload: TypedEmailPayload): Promise<void> {
  await emailService.sendEmail(payload);
}
