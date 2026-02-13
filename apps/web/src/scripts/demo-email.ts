/**
 * Demo script to showcase the email service functionality
 * Run with: pnpm --filter ./apps/web tsx src/scripts/demo-email.ts
 */

import { 
  sendTestEmail, 
  sendProfileUpdateEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendInvoiceEmail
} from '../utils/communication/email-dispatcher';

async function demoEmailService() {
  console.log('🚀 Starting Email Service Demo\n');

  try {
    // Demo 1: Test Email
    console.log('📧 Demo 1: Sending Test Email');
    await sendTestEmail('demo@example.com', {
      message: 'This is a demo of the LiNKdev Starter Kit email service!',
      timestamp: new Date().toISOString(),
    });

    // Demo 2: Welcome Email
    console.log('\n📧 Demo 2: Sending Welcome Email');
    await sendWelcomeEmail('newuser@example.com', {
      userName: 'John Doe',
      loginUrl: 'https://app.linkdev-starter-kit.com/login',
    });

    // Demo 3: Profile Update Email
    console.log('\n📧 Demo 3: Sending Profile Update Email');
    await sendProfileUpdateEmail('user@example.com', {
      userName: 'Jane Smith',
      updatedField: 'Organization Name',
      newValue: 'Acme Corporation',
      profileUrl: 'https://app.linkdev-starter-kit.com/org/settings',
    });

    // Demo 4: Password Reset Email
    console.log('\n📧 Demo 4: Sending Password Reset Email');
    await sendPasswordResetEmail('reset@example.com', {
      userName: 'Bob Johnson',
      resetUrl: 'https://app.linkdev-starter-kit.com/reset-password?token=abc123',
      expiresIn: '1 hour',
    });

    // Demo 5: Invoice Email
    console.log('\n📧 Demo 5: Sending Invoice Email');
    await sendInvoiceEmail('billing@example.com', {
      userName: 'Alice Wilson',
      invoiceNumber: 'INV-2024-001',
      amount: '$99.00',
      dueDate: 'February 15, 2024',
      invoiceUrl: 'https://app.linkdev-starter-kit.com/billing/invoices/INV-2024-001',
    });

    console.log('\n✅ Email Service Demo Complete!');
    console.log('All emails were "sent" (logged to console) successfully.');
    console.log('\n📝 Note: This is a mock implementation for development.');
    console.log('In production, you would integrate with a real email service like Resend or SendGrid.');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
demoEmailService();
