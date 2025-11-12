/**
 * Test endpoint for email functionality
 * GET /api/labs/test-email - Sends a test email
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/utils/communication/email-dispatcher';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'test@example.com';
    const message = searchParams.get('message') || 'Hello from the API!';

    await sendTestEmail(email, {
      message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully! Check the server console for output.',
      email,
      emailMessage: message,
    });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test email',
      },
      { status: 500 }
    );
  }
}
