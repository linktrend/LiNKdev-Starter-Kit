import { createHmac, timingSafeEqual } from 'crypto';

const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || 'template-secret-key';
const MAX_TIMESTAMP_SKEW = 300; // 5 minutes in seconds

export interface SignedPayload {
  signature: string;
  timestamp: string;
  body: string;
}

/**
 * Sign a payload with HMAC-SHA256 using the webhook secret
 * Format: HMAC-SHA256(secret, `${timestamp}.${body}`)
 */
export function signPayload(body: string, timestamp?: string): SignedPayload {
  const ts = timestamp || Math.floor(Date.now() / 1000).toString();
  const payload = `${ts}.${body}`;
  const signature = createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return {
    signature,
    timestamp: ts,
    body,
  };
}

/**
 * Verify a signed payload
 * Checks signature and timestamp skew
 */
export function verifySignature(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    // Check timestamp skew
    const now = Math.floor(Date.now() / 1000);
    const payloadTime = parseInt(timestamp, 10);
    const skew = Math.abs(now - payloadTime);
    
    if (skew > MAX_TIMESTAMP_SKEW) {
      console.warn('AUTOMATION: Timestamp skew too large', { skew, maxSkew: MAX_TIMESTAMP_SKEW });
      return false;
    }
    
    // Verify signature
    const expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
      .update(`${timestamp}.${body}`)
      .digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const actualBuffer = Buffer.from(signature, 'hex');
    
    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (error) {
    console.error('AUTOMATION: Signature verification error', error);
    return false;
  }
}

/**
 * Create headers for webhook delivery
 */
export function createWebhookHeaders(signedPayload: SignedPayload): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Hikari-Signature': signedPayload.signature,
    'X-Hikari-Timestamp': signedPayload.timestamp,
    'User-Agent': 'Hikari-Automation-Bridge/1.0',
  };
}
