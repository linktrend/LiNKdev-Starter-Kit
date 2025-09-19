import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  calculateNextRetryDelay, 
  shouldRetry, 
  deliverEvent,
  processPendingEvents 
} from '../outbox';
import { OutboxEvent } from '../outbox';

// Mock fetch globally
global.fetch = vi.fn();

// Mock environment variables
const originalEnv = process.env;

describe('Automation Outbox', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.N8N_WEBHOOK_URL = 'https://test-webhook.com/webhook';
    process.env.N8N_WEBHOOK_SECRET = 'test-secret';
    vi.clearAllMocks();
  });

  describe('calculateNextRetryDelay', () => {
    it('should return correct delays for each attempt', () => {
      expect(calculateNextRetryDelay(0)).toBe(60000); // 1 minute
      expect(calculateNextRetryDelay(1)).toBe(300000); // 5 minutes
      expect(calculateNextRetryDelay(2)).toBe(900000); // 15 minutes
      expect(calculateNextRetryDelay(3)).toBe(3600000); // 1 hour
      expect(calculateNextRetryDelay(4)).toBe(21600000); // 6 hours
      expect(calculateNextRetryDelay(5)).toBe(86400000); // 24 hours
      expect(calculateNextRetryDelay(6)).toBe(86400000); // 24 hours
      expect(calculateNextRetryDelay(7)).toBe(86400000); // 24 hours
    });

    it('should return 0 for max attempts reached', () => {
      expect(calculateNextRetryDelay(8)).toBe(0);
      expect(calculateNextRetryDelay(10)).toBe(0);
    });
  });

  describe('shouldRetry', () => {
    it('should not retry delivered events', () => {
      const event: OutboxEvent = {
        id: 'test-1',
        org_id: 'org-1',
        event: 'test_event',
        payload: {},
        created_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
        attempt_count: 0,
      };

      expect(shouldRetry(event)).toBe(false);
    });

    it('should not retry events at max attempts', () => {
      const event: OutboxEvent = {
        id: 'test-2',
        org_id: 'org-1',
        event: 'test_event',
        payload: {},
        created_at: new Date().toISOString(),
        attempt_count: 8,
      };

      expect(shouldRetry(event)).toBe(false);
    });

    it('should retry events with no retry scheduled', () => {
      const event: OutboxEvent = {
        id: 'test-3',
        org_id: 'org-1',
        event: 'test_event',
        payload: {},
        created_at: new Date().toISOString(),
        attempt_count: 0,
      };

      expect(shouldRetry(event)).toBe(true);
    });

    it('should retry events when retry time has passed', () => {
      const pastTime = new Date(Date.now() - 1000).toISOString();
      const event: OutboxEvent = {
        id: 'test-4',
        org_id: 'org-1',
        event: 'test_event',
        payload: {},
        created_at: new Date().toISOString(),
        attempt_count: 1,
        next_retry_at: pastTime,
      };

      expect(shouldRetry(event)).toBe(true);
    });

    it('should not retry events when retry time has not passed', () => {
      const futureTime = new Date(Date.now() + 1000).toISOString();
      const event: OutboxEvent = {
        id: 'test-5',
        org_id: 'org-1',
        event: 'test_event',
        payload: {},
        created_at: new Date().toISOString(),
        attempt_count: 1,
        next_retry_at: futureTime,
      };

      expect(shouldRetry(event)).toBe(false);
    });
  });

  describe('deliverEvent', () => {
    it('should simulate delivery when no webhook URL', async () => {
      process.env.N8N_WEBHOOK_URL = undefined;
      
      const event: OutboxEvent = {
        id: 'test-1',
        org_id: 'org-1',
        event: 'test_event',
        payload: { test: 'data' },
        created_at: new Date().toISOString(),
        attempt_count: 0,
      };

      const result = await deliverEvent(event);
      
      expect(result.success).toBe(true);
      expect(result.latencyMs).toBeGreaterThan(0);
    });

    it('should deliver successfully with valid response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('OK'),
      });

      const event: OutboxEvent = {
        id: 'test-2',
        org_id: 'org-1',
        event: 'test_event',
        payload: { test: 'data' },
        created_at: new Date().toISOString(),
        attempt_count: 0,
      };

      const result = await deliverEvent(event);
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-webhook.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Hikari-Signature': expect.any(String),
            'X-Hikari-Timestamp': expect.any(String),
            'User-Agent': 'Hikari-Automation-Bridge/1.0',
          }),
          body: expect.stringContaining('"event":"test_event"'),
        })
      );
    });

    it('should handle delivery failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      const event: OutboxEvent = {
        id: 'test-3',
        org_id: 'org-1',
        event: 'test_event',
        payload: { test: 'data' },
        created_at: new Date().toISOString(),
        attempt_count: 0,
      };

      const result = await deliverEvent(event);
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toContain('HTTP 500');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const event: OutboxEvent = {
        id: 'test-4',
        org_id: 'org-1',
        event: 'test_event',
        payload: { test: 'data' },
        created_at: new Date().toISOString(),
        attempt_count: 0,
      };

      const result = await deliverEvent(event);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should timeout after 30 seconds', async () => {
      (global.fetch as any).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 35000))
      );

      const event: OutboxEvent = {
        id: 'test-5',
        org_id: 'org-1',
        event: 'test_event',
        payload: { test: 'data' },
        created_at: new Date().toISOString(),
        attempt_count: 0,
      };

      const result = await deliverEvent(event);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('processPendingEvents', () => {
    it('should process events successfully', async () => {
      // Mock the getPendingEvents and updateEventAfterDelivery functions
      vi.mock('../outbox', async () => {
        const actual = await vi.importActual('../outbox');
        return {
          ...actual,
          getPendingEvents: vi.fn().mockResolvedValue([
            {
              id: 'test-1',
              org_id: 'org-1',
              event: 'test_event',
              payload: { test: 'data' },
              created_at: new Date().toISOString(),
              attempt_count: 0,
            },
          ]),
          deliverEvent: vi.fn().mockResolvedValue({
            success: true,
            latencyMs: 100,
          }),
          updateEventAfterDelivery: vi.fn().mockResolvedValue(undefined),
        };
      });

      const result = await processPendingEvents();
      
      expect(result.processed).toBe(1);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
    });
  });
});
