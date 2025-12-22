/**
 * Email service types for transactional email functionality
 */

/**
 * Base email payload interface
 */
export interface EmailPayload {
  to: string;
  subject: string;
  templateName: EmailTemplate;
  templateData: Record<string, unknown>;
}

/**
 * Union type for all supported email templates
 */
export type EmailTemplate = 
  | 'welcome'
  | 'password-reset'
  | 'invoice'
  | 'profile-update'
  | 'payment-receipt'
  | 'payment-failed'
  | 'test';

/**
 * Template-specific data interfaces
 */
export interface WelcomeEmailData {
  userName: string;
  loginUrl: string;
  [key: string]: unknown;
}

export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
  [key: string]: unknown;
}

export interface InvoiceEmailData {
  userName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  invoiceUrl: string;
  [key: string]: unknown;
}

export interface ProfileUpdateEmailData {
  userName: string;
  updatedField: string;
  newValue: string;
  profileUrl: string;
  [key: string]: unknown;
}

export interface TestEmailData {
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface PaymentReceiptEmailData {
  orgName: string;
  amount: string;
  currency: string;
  paidAt: string;
  invoiceUrl?: string;
  invoicePdf?: string;
  periodStart: string;
  periodEnd: string;
  [key: string]: unknown;
}

export interface PaymentFailedEmailData {
  orgName: string;
  amount: string;
  currency: string;
  reason?: string;
  billingUrl: string;
  [key: string]: unknown;
}

/**
 * Type-safe email payload for specific templates
 */
export type WelcomeEmailPayload = Omit<EmailPayload, 'templateData'> & {
  templateName: 'welcome';
  templateData: WelcomeEmailData;
};

export type PasswordResetEmailPayload = Omit<EmailPayload, 'templateData'> & {
  templateName: 'password-reset';
  templateData: PasswordResetEmailData;
};

export type InvoiceEmailPayload = Omit<EmailPayload, 'templateData'> & {
  templateName: 'invoice';
  templateData: InvoiceEmailData;
};

export type ProfileUpdateEmailPayload = Omit<EmailPayload, 'templateData'> & {
  templateName: 'profile-update';
  templateData: ProfileUpdateEmailData;
};

export type TestEmailPayload = Omit<EmailPayload, 'templateData'> & {
  templateName: 'test';
  templateData: TestEmailData;
};

export type PaymentReceiptEmailPayload = Omit<EmailPayload, 'templateData'> & {
  templateName: 'payment-receipt';
  templateData: PaymentReceiptEmailData;
};

export type PaymentFailedEmailPayload = Omit<EmailPayload, 'templateData'> & {
  templateName: 'payment-failed';
  templateData: PaymentFailedEmailData;
};

/**
 * Union type for all typed email payloads
 */
export type TypedEmailPayload = 
  | WelcomeEmailPayload
  | PasswordResetEmailPayload
  | InvoiceEmailPayload
  | ProfileUpdateEmailPayload
  | PaymentReceiptEmailPayload
  | PaymentFailedEmailPayload
  | TestEmailPayload;

/**
 * Email service interface
 */
export interface EmailService {
  sendEmail(payload: EmailPayload): Promise<void>;
}

/**
 * Email template configuration
 */
export interface EmailTemplateConfig<T = Record<string, unknown>> {
  subject: string;
  getBody: (data: T) => string;
}
