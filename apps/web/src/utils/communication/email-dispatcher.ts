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
  PaymentReceiptEmailData,
  PaymentFailedEmailData,
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
  'payment-receipt': {
    subject: 'Payment Receipt - LTM Starter Kit',
    getBody: (data: PaymentReceiptEmailData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9fafb; }
          .invoice-details { background: white; padding: 15px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Received</h1>
          </div>
          <div class="content">
            <p>Hi ${data.orgName},</p>
            <p>Thank you for your payment! Your subscription has been successfully renewed.</p>
            
            <div class="invoice-details">
              <h3>Payment Details</h3>
              <p><strong>Amount:</strong> ${data.amount} ${data.currency.toUpperCase()}</p>
              <p><strong>Date:</strong> ${data.paidAt}</p>
              <p><strong>Billing Period:</strong> ${data.periodStart} - ${data.periodEnd}</p>
            </div>

            ${data.invoiceUrl ? `
              <p style="text-align: center;">
                <a href="${data.invoiceUrl}" class="button">View Invoice</a>
              </p>
            ` : ''}

            <p>If you have any questions about this payment, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>This is an automated receipt from LTM Starter Kit.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  'payment-failed': {
    subject: 'Payment Failed - Action Required',
    getBody: (data: PaymentFailedEmailData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9fafb; }
          .alert { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #DC2626; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Failed</h1>
          </div>
          <div class="content">
            <p>Hi ${data.orgName},</p>
            
            <div class="alert">
              <p><strong>We were unable to process your payment.</strong></p>
              <p>Amount: ${data.amount} ${data.currency.toUpperCase()}</p>
              ${data.reason ? `<p>Reason: ${data.reason}</p>` : ''}
            </div>

            <p>To avoid any interruption to your service, please update your payment method as soon as possible.</p>

            <p style="text-align: center;">
              <a href="${data.billingUrl}" class="button">Update Payment Method</a>
            </p>

            <p>If you believe this is an error or need assistance, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from LTM Starter Kit.</p>
          </div>
        </div>
      </body>
      </html>
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
 * Sends a payment receipt email
 * @param to - Recipient email address
 * @param data - Payment receipt email data
 */
export async function sendPaymentReceiptEmail(
  to: string,
  data: PaymentReceiptEmailData
): Promise<void> {
  const payload = composeEmail('payment-receipt', data, to);
  await emailService.sendEmail(payload);
}

/**
 * Sends a payment failed notification email
 * @param to - Recipient email address
 * @param data - Payment failed email data
 */
export async function sendPaymentFailedEmail(
  to: string,
  data: PaymentFailedEmailData
): Promise<void> {
  const payload = composeEmail('payment-failed', data, to);
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
