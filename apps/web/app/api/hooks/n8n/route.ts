// Webhook endpoint for n8n automation integration
// Template-only implementation - validates signature and accepts events

import { NextRequest, NextResponse } from 'next/server';
import { WebhookPayload } from '@/types/scheduling';

const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || 'template-secret-key';

function verifySignature(payload: string, signature: string): boolean {
  // Simple signature verification for template
  // In production, use proper HMAC verification
  const expectedSignature = Buffer.from(WEBHOOK_SECRET + payload).toString('base64');
  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature') || '';
    
    // Verify signature
    if (!verifySignature(body, signature)) {
      console.log('SCHEDULING MODULE: Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload: WebhookPayload = JSON.parse(body);
    
    console.log('SCHEDULING MODULE: Webhook received', {
      event: payload.event,
      timestamp: payload.timestamp,
      org_id: payload.payload.org_id,
    });

    // Template implementation: just log the event
    // In production, this would be processed by n8n or other automation
    console.log('SCHEDULING MODULE: Event payload', payload.payload);

    return NextResponse.json({
      success: true,
      message: 'Event received',
      event: payload.event,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('SCHEDULING MODULE: Webhook error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Scheduling webhook endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}
