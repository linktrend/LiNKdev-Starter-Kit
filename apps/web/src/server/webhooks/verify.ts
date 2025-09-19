/**
 * Shared webhook verification utilities
 * Supports both Stripe and generic HMAC verification schemes
 */

import { createHmac, timingSafeEqual } from 'crypto';

export interface SignatureHeader {
  ts: number;
  signatures: Record<string, string>;
}

export type VerifyResult = {
  ok: true;
} | {
  ok: false;
  reason: string;
}

/**
 * Parse signature header in format: t=<unix_timestamp>,v1=<signature>,v2=<signature>
 * Tolerates extra parameters and different schemes
 */
export function parseSignatureHeader(header: string): SignatureHeader {
  const parts = header.split(',');
  let ts = 0;
  const signatures: Record<string, string> = {};

  for (const part of parts) {
    const [key, value] = part.trim().split('=');
    if (!key || !value) continue;

    if (key === 't') {
      ts = parseInt(value, 10);
    } else if (key.startsWith('v')) {
      signatures[key] = value;
    }
  }

  return { ts, signatures };
}

/**
 * Check if timestamp is within tolerance window
 */
export function isFreshTimestamp(ts: number, toleranceSec: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const skew = Math.abs(now - ts);
  return skew <= toleranceSec;
}

/**
 * Compute HMAC signature for given body and secret
 */
export function computeHMAC(
  rawBody: Uint8Array | string,
  secret: string,
  algo: 'sha256' = 'sha256'
): string {
  const body = typeof rawBody === 'string' ? rawBody : Buffer.from(rawBody).toString('utf8');
  return createHmac(algo, secret)
    .update(body)
    .digest('hex');
}

/**
 * Verify HMAC signature with timestamp tolerance
 * Supports multiple signature schemes (v1, v2, etc.)
 */
export function verifyHMAC(opts: {
  rawBody: Uint8Array | string;
  secret: string;
  header: string;
  toleranceSec: number;
  algo?: 'sha256';
  scheme?: 'v1';
}): VerifyResult {
  const { rawBody, secret, header, toleranceSec, algo = 'sha256', scheme = 'v1' } = opts;

  try {
    // Parse signature header
    const { ts, signatures } = parseSignatureHeader(header);
    
    if (ts === 0) {
      return { ok: false, reason: 'Missing or invalid timestamp in signature header' };
    }

    // Check timestamp freshness
    if (!isFreshTimestamp(ts, toleranceSec)) {
      return { ok: false, reason: `Timestamp too old or too far in future (tolerance: ${toleranceSec}s)` };
    }

    // Get expected signature for the scheme
    const expectedSignature = signatures[scheme];
    if (!expectedSignature) {
      return { ok: false, reason: `Missing signature for scheme ${scheme}` };
    }

    // Compute expected signature
    const computedSignature = computeHMAC(rawBody, secret, algo);

    // Timing-safe comparison
    const expectedBuffer = Buffer.from(computedSignature, 'hex');
    const actualBuffer = Buffer.from(expectedSignature, 'hex');

    if (expectedBuffer.length !== actualBuffer.length) {
      return { ok: false, reason: 'Signature length mismatch' };
    }

    const isValid = timingSafeEqual(expectedBuffer, actualBuffer);
    
    if (!isValid) {
      return { ok: false, reason: 'Invalid signature' };
    }

    return { ok: true };
  } catch (error) {
    return { 
      ok: false, 
      reason: `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Verify signature with timestamp (convenience function for automation/signing compatibility)
 */
export function verifySignature(
  body: string,
  signature: string,
  timestamp: string,
  secret: string,
  toleranceSec: number = 300
): boolean {
  const header = `t=${timestamp},v1=${signature}`;
  const result = verifyHMAC({
    rawBody: body,
    secret,
    header,
    toleranceSec,
  });
  return result.ok;
}

/**
 * Create signature header (convenience function for automation/signing compatibility)
 */
export function createSignatureHeader(
  body: string,
  secret: string,
  timestamp?: string
): { signature: string; timestamp: string; header: string } {
  const ts = timestamp || Math.floor(Date.now() / 1000).toString();
  const signature = computeHMAC(body, secret);
  const header = `t=${ts},v1=${signature}`;
  
  return {
    signature,
    timestamp: ts,
    header,
  };
}
