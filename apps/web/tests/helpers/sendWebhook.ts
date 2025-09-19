/**
 * Webhook testing helper
 * Sends webhook requests with proper headers and signature generation
 */

import { createHmac } from 'crypto';

export interface SendWebhookOptions {
  provider: 'stripe' | 'n8n';
  jsonFixture: string;
  secret: string;
  toleranceSec?: number;
  baseUrl?: string;
  invalidSignature?: boolean;
  customTimestamp?: number;
}

export interface WebhookResponse {
  ok: boolean;
  status: number;
  data: any;
  headers: Record<string, string>;
}

/**
 * Send a webhook request to the centralized router
 */
export async function sendWebhook(opts: SendWebhookOptions): Promise<WebhookResponse> {
  const {
    provider,
    jsonFixture,
    secret,
    toleranceSec = 300,
    baseUrl = 'http://localhost:3000',
    invalidSignature = false,
    customTimestamp,
  } = opts;

  // Load fixture data
  const fixtureData = await loadFixture(jsonFixture);
  const body = JSON.stringify(fixtureData);

  // Generate headers based on provider
  const headers = await generateHeaders(provider, body, secret, {
    invalidSignature,
    customTimestamp,
  });

  // Send request
  const url = `${baseUrl}/api/webhooks/${provider}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  });

  const data = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: response.status,
    data,
    headers: Object.fromEntries(response.headers.entries()),
  };
}

/**
 * Generate appropriate headers for the webhook provider
 */
async function generateHeaders(
  provider: 'stripe' | 'n8n',
  body: string,
  secret: string,
  options: {
    invalidSignature?: boolean;
    customTimestamp?: number;
  } = {}
): Promise<Record<string, string>> {
  const { invalidSignature = false, customTimestamp } = options;

  switch (provider) {
    case 'stripe':
      return generateStripeHeaders(body, secret, { invalidSignature, customTimestamp });
    
    case 'n8n':
      return generateN8nHeaders(body, secret, { invalidSignature, customTimestamp });
    
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Generate Stripe webhook headers
 * Note: This is a simplified version for testing
 * In production, Stripe uses a more complex signature format
 */
function generateStripeHeaders(
  body: string,
  secret: string,
  options: { invalidSignature?: boolean; customTimestamp?: number } = {}
): Record<string, string> {
  const { invalidSignature = false, customTimestamp } = options;
  const timestamp = customTimestamp || Math.floor(Date.now() / 1000);
  
  // For testing, we'll use a simplified signature format
  // In real Stripe webhooks, the signature is more complex
  const payload = `${timestamp}.${body}`;
  const signature = invalidSignature 
    ? 'invalid_signature'
    : createHmac('sha256', secret).update(payload).digest('hex');
  
  return {
    'Stripe-Signature': `t=${timestamp},v1=${signature}`,
  };
}

/**
 * Generate N8N webhook headers
 */
function generateN8nHeaders(
  body: string,
  secret: string,
  options: { invalidSignature?: boolean; customTimestamp?: number } = {}
): Record<string, string> {
  const { invalidSignature = false, customTimestamp } = options;
  const timestamp = customTimestamp || Math.floor(Date.now() / 1000);
  
  const payload = `${timestamp}.${body}`;
  const signature = invalidSignature 
    ? 'invalid_signature'
    : createHmac('sha256', secret).update(payload).digest('hex');
  
  return {
    'X-Hikari-Signature': signature,
    'X-Hikari-Timestamp': timestamp.toString(),
  };
}

/**
 * Load fixture data from file
 */
async function loadFixture(fixturePath: string): Promise<any> {
  // In a real implementation, this would load from the file system
  // For now, we'll return mock data based on the fixture name
  if (fixturePath.includes('stripe_invoice_paid')) {
    return {
      id: 'evt_test_invoice_paid',
      object: 'event',
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_test_invoice_paid',
          object: 'invoice',
          amount_paid: 2000,
          currency: 'usd',
          customer: 'cus_test_customer',
          status: 'paid',
        },
      },
    };
  }
  
  if (fixturePath.includes('stripe_subscription_updated')) {
    return {
      id: 'evt_test_subscription_updated',
      object: 'event',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_test_subscription_updated',
          object: 'subscription',
          customer: 'cus_test_customer',
          status: 'active',
          current_period_start: 1640995200,
          current_period_end: 1643673600,
        },
      },
    };
  }
  
  throw new Error(`Unknown fixture: ${fixturePath}`);
}

/**
 * Test webhook with valid signature
 */
export async function testValidWebhook(
  provider: 'stripe' | 'n8n',
  fixture: string,
  secret: string
): Promise<WebhookResponse> {
  return sendWebhook({
    provider,
    jsonFixture: fixture,
    secret,
  });
}

/**
 * Test webhook with invalid signature
 */
export async function testInvalidWebhook(
  provider: 'stripe' | 'n8n',
  fixture: string,
  secret: string
): Promise<WebhookResponse> {
  return sendWebhook({
    provider,
    jsonFixture: fixture,
    secret,
    invalidSignature: true,
  });
}

/**
 * Test webhook with old timestamp (should fail tolerance check)
 */
export async function testOldTimestampWebhook(
  provider: 'stripe' | 'n8n',
  fixture: string,
  secret: string,
  toleranceSec: number = 300
): Promise<WebhookResponse> {
  const oldTimestamp = Math.floor(Date.now() / 1000) - toleranceSec - 60; // 1 minute past tolerance
  
  return sendWebhook({
    provider,
    jsonFixture: fixture,
    secret,
    customTimestamp: oldTimestamp,
  });
}
