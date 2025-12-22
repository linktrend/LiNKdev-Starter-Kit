import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockStripeEvent,
  mockStripeSubscription,
  mockStripeInvoice,
  mockStripeCheckoutSession,
} from '../../helpers/stripe-mocks';
import type { NextRequest } from 'next/server';

// Mock Stripe webhook verification
vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
  },
}));

// Mock Supabase admin client - use factory to avoid hoisting issues
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

// Mock email dispatcher
vi.mock('@/utils/communication/email-dispatcher', () => ({
  sendPaymentReceiptEmail: vi.fn(),
  sendPaymentFailedEmail: vi.fn(),
}));

// Import mocked modules after mocking
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Import the route handler AFTER all mocks are set up
import { POST } from '@/app/api/webhooks/stripe/route';

describe.skip('Stripe Webhook Handler', () => {
  // Get reference to the mocked Supabase client's from function
  let mockSupabaseFrom: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Get the from function from the mocked createClient
    const mockClient = vi.mocked(createClient)();
    mockSupabaseFrom = vi.mocked(mockClient.from);
    
    // Setup default headers mock
    vi.mocked(headers).mockReturnValue({
      get: vi.fn((name: string) => {
        if (name === 'stripe-signature') return 'test_signature';
        return null;
      }),
    } as any);
    
    // Default mock for constructEvent - returns the parsed event
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation((body, sig, secret) => {
      return JSON.parse(body);
    });
  });

  function createMockRequest(event: any, signature?: string): NextRequest {
    const headers = new Headers();
    if (signature !== undefined) {
      headers.set('stripe-signature', signature);
    } else {
      headers.set('stripe-signature', 'test_signature');
    }

    return {
      text: () => Promise.resolve(JSON.stringify(event)),
      headers,
    } as unknown as NextRequest;
  }

  describe('Event Processing', () => {
    it('should handle checkout.session.completed event', async () => {
      const event = createMockStripeEvent('checkout.session.completed', {
        ...mockStripeCheckoutSession,
        metadata: { org_id: 'test-org-id' },
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('should handle customer.subscription.created event', async () => {
      const event = createMockStripeEvent('customer.subscription.created', {
        ...mockStripeSubscription,
        metadata: { org_id: 'test-org-id' },
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            upsert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        if (table === 'billing_customers') {
          return {
            upsert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      // Verify subscription was upserted
      const fromCalls = mockSupabaseFrom.mock.calls;
      expect(fromCalls.some(call => call[0] === 'org_subscriptions')).toBe(true);
    });

    it('should handle customer.subscription.updated event', async () => {
      const event = createMockStripeEvent('customer.subscription.updated', {
        ...mockStripeSubscription,
        status: 'active',
        metadata: { org_id: 'test-org-id' },
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            upsert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        if (table === 'billing_customers') {
          return {
            upsert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('should handle customer.subscription.deleted event', async () => {
      const event = createMockStripeEvent('customer.subscription.deleted', {
        ...mockStripeSubscription,
        metadata: { org_id: 'test-org-id' },
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ error: null })),
            })),
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      // Verify subscription was marked as canceled
      const fromCalls = mockSupabaseFrom.mock.calls;
      expect(fromCalls.some(call => call[0] === 'org_subscriptions')).toBe(true);
    });

    it('should handle invoice.paid event', async () => {
      const event = createMockStripeEvent('invoice.paid', mockStripeInvoice);

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('should handle invoice.payment_failed event', async () => {
      const event = createMockStripeEvent('invoice.payment_failed', {
        ...mockStripeInvoice,
        subscription: 'sub_test123',
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ error: null })),
            })),
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      // Verify subscription status was updated to past_due
      const fromCalls = mockSupabaseFrom.mock.calls;
      expect(fromCalls.some(call => call[0] === 'org_subscriptions')).toBe(true);
    });

    it('should handle unhandled event types gracefully', async () => {
      const event = createMockStripeEvent('customer.created', { id: 'cus_test123' });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });

  describe('Webhook Security & Reliability', () => {
    it('should return 400 for missing signature', async () => {
      const event = createMockStripeEvent('customer.subscription.created', mockStripeSubscription);
      
      // Mock headers to return null for signature
      vi.mocked(headers).mockReturnValueOnce({
        get: vi.fn(() => null),
      } as any);

      const request = {
        text: () => Promise.resolve(JSON.stringify(event)),
        headers: new Headers(),
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No signature');
    });

    it('should return 400 for invalid signature', async () => {
      const event = createMockStripeEvent('customer.subscription.created', mockStripeSubscription);
      
      vi.mocked(stripe.webhooks.constructEvent).mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid signature');
    });

    it('should check processed_events table for idempotency', async () => {
      const event = createMockStripeEvent('customer.subscription.created', {
        ...mockStripeSubscription,
        metadata: { org_id: 'test-org-id' },
      });

      const selectMock = vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'existing' }, error: null })),
        })),
      }));

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: selectMock,
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.idempotent).toBe(true);
      expect(selectMock).toHaveBeenCalled();
    });

    it('should skip duplicate events (idempotency)', async () => {
      const event = createMockStripeEvent('customer.subscription.created', {
        ...mockStripeSubscription,
        metadata: { org_id: 'test-org-id' },
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'existing' }, error: null })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.idempotent).toBe(true);
      
      // Verify no subscription upsert was attempted
      const fromCalls = mockSupabaseFrom.mock.calls;
      expect(fromCalls.every(call => call[0] !== 'org_subscriptions')).toBe(true);
    });

    it('should record event in processed_events after processing', async () => {
      const event = createMockStripeEvent('customer.subscription.created', {
        ...mockStripeSubscription,
        metadata: { org_id: 'test-org-id' },
      });

      const insertMock = vi.fn(() => Promise.resolve({ error: null }));

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
            insert: insertMock,
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            upsert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        if (table === 'billing_customers') {
          return {
            upsert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          event_id: event.id,
          event_type: event.type,
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const event = createMockStripeEvent('customer.subscription.created', {
        ...mockStripeSubscription,
        metadata: { org_id: 'test-org-id' },
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            upsert: vi.fn(() => Promise.reject(new Error('Database error'))),
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook processing failed');
    });

    it('should handle missing org_id in metadata', async () => {
      const event = createMockStripeEvent('customer.subscription.created', {
        ...mockStripeSubscription,
        metadata: {}, // No org_id
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'processed_events') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
          } as any;
        }
        return {} as any;
      });

      const request = createMockRequest(event);
      const response = await POST(request);
      const data = await response.json();

      // Should still return 200 but log error internally
      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });
});
