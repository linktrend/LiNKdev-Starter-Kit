import { describe, it, expect, beforeEach } from 'vitest';
import { signPayload, verifySignature, createWebhookHeaders } from '../signing';

// Mock environment variables
const originalEnv = process.env;

describe('Automation Signing', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.N8N_WEBHOOK_SECRET = 'test-secret-key';
  });

  describe('signPayload', () => {
    it('should sign a payload with HMAC-SHA256', () => {
      const body = '{"test": "data"}';
      const signed = signPayload(body);
      
      expect(signed).toHaveProperty('signature');
      expect(signed).toHaveProperty('timestamp');
      expect(signed).toHaveProperty('body', body);
      expect(signed.signature).toMatch(/^[a-f0-9]{64}$/); // 64 hex chars
      expect(signed.timestamp).toMatch(/^\d+$/); // Numeric timestamp
    });

    it('should use provided timestamp', () => {
      const body = '{"test": "data"}';
      const timestamp = '1640995200';
      const signed = signPayload(body, timestamp);
      
      expect(signed.timestamp).toBe(timestamp);
    });

    it('should generate different signatures for different payloads', () => {
      const body1 = '{"test": "data1"}';
      const body2 = '{"test": "data2"}';
      
      const signed1 = signPayload(body1);
      const signed2 = signPayload(body2);
      
      expect(signed1.signature).not.toBe(signed2.signature);
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signatures', () => {
      const body = '{"test": "data"}';
      const signed = signPayload(body);
      
      const isValid = verifySignature(body, signed.signature, signed.timestamp);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const body = '{"test": "data"}';
      const signed = signPayload(body);
      
      const isValid = verifySignature(body, 'invalid-signature', signed.timestamp);
      expect(isValid).toBe(false);
    });

    it('should reject signatures with wrong timestamp', () => {
      const body = '{"test": "data"}';
      const signed = signPayload(body);
      
      // Use a timestamp that's too old (more than 5 minutes)
      const oldTimestamp = (Date.now() / 1000 - 400).toString(); // 400 seconds ago
      const isValid = verifySignature(body, signed.signature, oldTimestamp);
      expect(isValid).toBe(false);
    });

    it('should reject signatures with future timestamp', () => {
      const body = '{"test": "data"}';
      const signed = signPayload(body);
      
      // Use a timestamp in the future
      const futureTimestamp = (Date.now() / 1000 + 400).toString(); // 400 seconds in future
      const isValid = verifySignature(body, signed.signature, futureTimestamp);
      expect(isValid).toBe(false);
    });

    it('should accept signatures within timestamp tolerance', () => {
      const body = '{"test": "data"}';
      
      // Use a timestamp that's within tolerance (2 minutes ago)
      const recentTimestamp = (Date.now() / 1000 - 120).toString();
      const signed = signPayload(body, recentTimestamp);
      
      const isValid = verifySignature(body, signed.signature, recentTimestamp);
      expect(isValid).toBe(true);
    });
  });

  describe('createWebhookHeaders', () => {
    it('should create proper webhook headers', () => {
      const signed = signPayload('{"test": "data"}');
      const headers = createWebhookHeaders(signed);
      
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'X-Hikari-Signature': signed.signature,
        'X-Hikari-Timestamp': signed.timestamp,
        'User-Agent': 'Hikari-Automation-Bridge/1.0',
      });
    });
  });

  describe('signature consistency', () => {
    it('should produce consistent signatures for same input', () => {
      const body = '{"test": "data"}';
      const timestamp = '1640995200';
      
      const signed1 = signPayload(body, timestamp);
      const signed2 = signPayload(body, timestamp);
      
      expect(signed1.signature).toBe(signed2.signature);
    });

    it('should produce different signatures for different timestamps', () => {
      const body = '{"test": "data"}';
      
      const signed1 = signPayload(body, '1640995200');
      const signed2 = signPayload(body, '1640995201');
      
      expect(signed1.signature).not.toBe(signed2.signature);
    });
  });
});
