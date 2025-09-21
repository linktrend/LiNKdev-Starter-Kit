/**
 * Centralized webhook router
 * Dispatches to provider-specific handlers
 */

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

// Provider handler type
type ProviderHandler = (req: NextRequest) => Promise<NextResponse>;

// Provider registry
const providers: Record<string, ProviderHandler> = {
  // Stripe handler (Phase 2)
  stripe: async (req: NextRequest) => {
    const rawBody = await req.arrayBuffer();
    const headers = Object.fromEntries(req.headers.entries());
    
    const { handleStripe } = await import('@/server/webhooks/stripe');
    
    const result = await handleStripe({
      rawBody: new Uint8Array(rawBody),
      headers,
      env: {
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
      },
    });

    if (result.ok) {
      return NextResponse.json({ ok: true }, { status: result.status });
    } else {
      return NextResponse.json(
        { error: result.reason },
        { status: result.status }
      );
    }
  },
  
  // N8N handler (migrated from existing route)
  n8n: async (req: NextRequest) => {
    const body = await req.text();
    const signature = req.headers.get('X-LTM-Signature');
    const timestamp = req.headers.get('X-LTM-Timestamp');
    
    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing signature or timestamp' }, { status: 400 });
    }

    // Use shared verification utility
    const { verifySignature } = await import('@/src/server/webhooks/verify');
    const secret = process.env.N8N_WEBHOOK_SECRET || 'template-secret-key';
    const toleranceSec = Number(env.WEBHOOK_TOLERANCE_SEC || 300);
    
    const isValid = verifySignature(body, signature, timestamp, secret, toleranceSec);
    
    if (!isValid) {
      console.warn('WEBHOOK: Invalid N8N signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    try {
      const payload = JSON.parse(body);
      console.info('WEBHOOK: N8N event received', {
        event: payload.event,
        timestamp: new Date().toISOString(),
        // Redact sensitive data in logs
        payloadKeys: Object.keys(payload.payload || {}),
      });

      // Process the event (template implementation)
      console.info('WEBHOOK: Processing N8N event', payload.payload);

      return NextResponse.json({
        message: 'Event received',
        event: payload.event,
        processed: true,
      });
    } catch (error) {
      console.error('WEBHOOK: N8N processing error', error);
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
  },
};

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;

  // Log webhook receipt (deterministic for offline mode)
  const headers = Object.fromEntries(req.headers.entries());
  console.info('WEBHOOK: Received webhook', {
    provider,
    timestamp: new Date().toISOString(),
    // Redact sensitive headers in logs
    headers: {
      'content-type': headers['content-type'],
      'user-agent': headers['user-agent'],
      'x-forwarded-for': headers['x-forwarded-for'],
      // Don't log signature headers for security
    },
  });

  // Check if provider is supported
  const handler = providers[provider];
  if (!handler) {
    console.warn('WEBHOOK: Unsupported provider', { provider });
    return NextResponse.json(
      { error: `Unsupported webhook provider: ${provider}` },
      { status: 404 }
    );
  }

  try {
    return await handler(req);
  } catch (error) {
    console.error('WEBHOOK: Handler error', { provider, error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Reject non-POST methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
