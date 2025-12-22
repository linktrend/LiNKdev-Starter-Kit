import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createOrgStripeCustomer,
  createSubscriptionCheckout,
  createBillingPortal,
  getOrgSubscription,
  cancelSubscription,
} from '@/app/actions/billing';
import {
  mockStripeCustomer,
  mockStripeCheckoutSession,
  mockStripeSubscription,
} from '../helpers/stripe-mocks';
import {
  mockOrgSubscription,
  mockOrganization,
  mockUser,
  mockBillingCustomer,
  mockOrganizationMember,
} from '../helpers/billing-fixtures';

// Mock dependencies
vi.mock('@/lib/auth/server', () => ({
  requireAuth: vi.fn(() => Promise.resolve(mockUser)),
}));

// Create mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    subscriptions: {
      update: vi.fn(() => Promise.resolve(mockStripeSubscription)),
    },
  },
  createStripeCustomer: vi.fn(() => Promise.resolve(mockStripeCustomer)),
  createCheckoutSession: vi.fn(() => Promise.resolve(mockStripeCheckoutSession)),
  createBillingPortalSession: vi.fn(() =>
    Promise.resolve({ url: 'https://portal.stripe.com/test' })
  ),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Import mocked modules
import * as authServer from '@/lib/auth/server';
import * as stripeServer from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

describe('Billing Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrgStripeCustomer', () => {
    it('should create a new Stripe customer for organization', async () => {
      // Setup mocks
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'billing_customers') {
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

      const result = await createOrgStripeCustomer('test-org-id');

      expect(result.success).toBe(true);
      expect(result.customerId).toBe('cus_test123');
      expect(stripeServer.createStripeCustomer).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test Organization',
        metadata: {
          org_id: 'test-org-id',
          owner_id: 'test-user-id',
        },
      });
    });

    it('should return existing customer if already exists', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'billing_customers') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() =>
                  Promise.resolve({
                    data: { stripe_customer_id: 'cus_existing123' },
                    error: null,
                  })
                ),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await createOrgStripeCustomer('test-org-id');

      expect(result.success).toBe(true);
      expect(result.customerId).toBe('cus_existing123');
      expect(stripeServer.createStripeCustomer).not.toHaveBeenCalled();
    });

    it('should return error if user is not owner', async () => {
      const mockNonOwnerOrg = { ...mockOrganization, owner_id: 'different-user-id' };

      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockNonOwnerOrg, error: null })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await createOrgStripeCustomer('test-org-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only the owner can manage billing');
    });

    it('should return error if organization not found', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await createOrgStripeCustomer('test-org-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Organization not found');
    });

    it('should handle database insert errors', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'billing_customers') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
            insert: vi.fn(() => Promise.resolve({ error: { message: 'Insert failed' } })),
          } as any;
        }
        return {} as any;
      });

      const result = await createOrgStripeCustomer('test-org-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create billing customer');
    });
  });

  describe('createSubscriptionCheckout', () => {
    it('should create checkout session with correct parameters', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'billing_customers') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() =>
                  Promise.resolve({
                    data: { stripe_customer_id: 'cus_test123' },
                    error: null,
                  })
                ),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await createSubscriptionCheckout('test-org-id', 'price_pro_monthly');

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://checkout.stripe.com/test');
      expect(stripeServer.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          priceId: 'price_pro_monthly',
          customerId: 'cus_test123',
          metadata: expect.objectContaining({
            org_id: 'test-org-id',
          }),
        })
      );
    });

    it('should return error if user is not owner', async () => {
      const mockNonOwnerOrg = { ...mockOrganization, owner_id: 'different-user-id' };

      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockNonOwnerOrg, error: null })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await createSubscriptionCheckout('test-org-id', 'price_pro_monthly');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only the owner can manage billing');
    });

    it('should return error if organization not found', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await createSubscriptionCheckout('test-org-id', 'price_pro_monthly');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Organization not found');
    });

    it('should handle Stripe errors gracefully', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'billing_customers') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() =>
                  Promise.resolve({
                    data: { stripe_customer_id: 'cus_test123' },
                    error: null,
                  })
                ),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      vi.mocked(stripeServer.createCheckoutSession).mockRejectedValueOnce(
        new Error('Stripe API error')
      );

      const result = await createSubscriptionCheckout('test-org-id', 'price_pro_monthly');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create checkout session');
    });
  });

  describe('createBillingPortal', () => {
    it('should create billing portal session', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'billing_customers') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { stripe_customer_id: 'cus_test123' },
                    error: null,
                  })
                ),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await createBillingPortal('test-org-id');

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://portal.stripe.com/test');
      expect(stripeServer.createBillingPortalSession).toHaveBeenCalledWith({
        customerId: 'cus_test123',
        returnUrl: expect.stringContaining('/billing'),
      });
    });

    it('should return error if user is not owner', async () => {
      const mockNonOwnerOrg = { ...mockOrganization, owner_id: 'different-user-id' };

      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockNonOwnerOrg, error: null })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await createBillingPortal('test-org-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only the owner can manage billing');
    });

    it('should return error if no billing customer found', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'billing_customers') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: null, error: { message: 'Not found' } })
                ),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await createBillingPortal('test-org-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No billing account found');
    });
  });

  describe('getOrgSubscription', () => {
    it('should return subscription for org member', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organization_members') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn(() =>
                    Promise.resolve({ data: mockOrganizationMember, error: null })
                  ),
                })),
              })),
            })),
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() =>
                  Promise.resolve({ data: mockOrgSubscription, error: null })
                ),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await getOrgSubscription('test-org-id');

      expect(result.success).toBe(true);
      expect(result.subscription).toEqual(mockOrgSubscription);
    });

    it('should return null if no subscription exists', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organization_members') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn(() =>
                    Promise.resolve({ data: mockOrganizationMember, error: null })
                  ),
                })),
              })),
            })),
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await getOrgSubscription('test-org-id');

      expect(result.success).toBe(true);
      expect(result.subscription).toBeNull();
    });

    it('should return error if user is not org member', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organization_members') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
                })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await getOrgSubscription('test-org-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not a member of this organization');
    });

    it('should handle database errors', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organization_members') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn(() =>
                    Promise.resolve({ data: mockOrganizationMember, error: null })
                  ),
                })),
              })),
            })),
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() =>
                  Promise.resolve({ data: null, error: { message: 'Database error' } })
                ),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await getOrgSubscription('test-org-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch subscription');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { stripe_subscription_id: 'sub_test123' },
                    error: null,
                  })
                ),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await cancelSubscription('test-org-id');

      expect(result.success).toBe(true);
      expect(stripeServer.stripe.subscriptions.update).toHaveBeenCalledWith('sub_test123', {
        cancel_at_period_end: true,
      });
    });

    it('should return error if user is not owner', async () => {
      const mockNonOwnerOrg = { ...mockOrganization, owner_id: 'different-user-id' };

      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockNonOwnerOrg, error: null })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await cancelSubscription('test-org-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only the owner can cancel subscription');
    });

    it('should return error if no active subscription found', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: null, error: { message: 'Not found' } })
                ),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await cancelSubscription('test-org-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No active subscription found');
    });

    it('should handle Stripe API errors', async () => {
      vi.mocked(mockSupabaseClient.from).mockImplementation((table: string) => {
        if (table === 'organizations') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'org_subscriptions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { stripe_subscription_id: 'sub_test123' },
                    error: null,
                  })
                ),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      vi.mocked(stripeServer.stripe.subscriptions.update).mockRejectedValueOnce(
        new Error('Stripe API error')
      );

      const result = await cancelSubscription('test-org-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to cancel subscription');
    });
  });
});
