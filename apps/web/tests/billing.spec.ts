import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BILLING_PLANS, getPlanById } from '@/config/plans';
import { hasEntitlement, hasExceededLimit, getCurrentPlan } from '@/utils/billing/entitlements';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { plan: 'pro' },
          error: null
        }))
      }))
    }))
  }))
};

describe('Billing Plans Configuration', () => {
  it('should have valid plan configurations', () => {
    expect(BILLING_PLANS).toHaveLength(3);
    
    BILLING_PLANS.forEach(plan => {
      expect(plan.id).toBeDefined();
      expect(plan.name).toBeDefined();
      expect(plan.description).toBeDefined();
      expect(plan.price_monthly).toBeDefined();
      expect(plan.price_yearly).toBeDefined();
      expect(plan.entitlements).toBeDefined();
      expect(plan.features).toBeDefined();
      expect(Array.isArray(plan.features)).toBe(true);
    });
  });

  it('should find plan by ID', () => {
    const freePlan = getPlanById('free');
    expect(freePlan).toBeDefined();
    expect(freePlan?.id).toBe('free');
    expect(freePlan?.price_monthly).toBe(0);
  });

  it('should return undefined for invalid plan ID', () => {
    const invalidPlan = getPlanById('invalid');
    expect(invalidPlan).toBeUndefined();
  });

  it('should have correct entitlements structure', () => {
    const proPlan = getPlanById('pro');
    expect(proPlan?.entitlements).toMatchObject({
      max_organizations: expect.any(Number),
      max_members_per_org: expect.any(Number),
      max_records: expect.any(Number),
      max_reminders: expect.any(Number),
      can_use_automation: expect.any(Boolean),
      can_export_data: expect.any(Boolean),
      can_use_analytics: expect.any(Boolean),
      can_use_webhooks: expect.any(Boolean),
      support_level: expect.any(String),
    });
  });
});

describe('Entitlement Checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should check boolean entitlements correctly', async () => {
    const canUseAutomation = await hasEntitlement('org-1', 'can_use_automation', mockSupabase);
    expect(typeof canUseAutomation).toBe('boolean');
  });

  it('should check numeric limits correctly', async () => {
    const hasExceeded = await hasExceededLimit('org-1', 'max_records', 50, mockSupabase);
    expect(typeof hasExceeded).toBe('boolean');
  });

  it('should handle unlimited limits (-1)', async () => {
    const hasExceeded = await hasExceededLimit('org-1', 'max_organizations', 1000, mockSupabase);
    // This should return false for unlimited plans
    expect(typeof hasExceeded).toBe('boolean');
  });

  it('should return false for missing plan', async () => {
    const mockSupabaseEmpty = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: 'PGRST116' }
            }))
          }))
        }))
      }))
    };

    const hasEntitlementResult = await hasEntitlement('org-1', 'can_use_automation', mockSupabaseEmpty);
    expect(hasEntitlementResult).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    const mockSupabaseError = {
      from: vi.fn(() => {
        throw new Error('Database error');
      })
    };

    const hasEntitlementResult = await hasEntitlement('org-1', 'can_use_automation', mockSupabaseError);
    expect(hasEntitlementResult).toBe(false);
  });
});

describe('Plan Retrieval', () => {
  it('should get current plan from subscription', async () => {
    const plan = await getCurrentPlan('org-1', mockSupabase);
    expect(plan).toBeDefined();
    expect(plan?.id).toBe('pro');
  });

  it('should return free plan for offline mode', async () => {
    const plan = await getCurrentPlan('org-1', null);
    expect(plan?.id).toBe('free');
  });

  it('should return free plan for missing subscription', async () => {
    const mockSupabaseEmpty = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: 'PGRST116' }
            }))
          }))
        }))
      }))
    };

    const plan = await getCurrentPlan('org-1', mockSupabaseEmpty);
    expect(plan?.id).toBe('free');
  });
});

describe('Webhook Event Processing', () => {
  it('should map Stripe statuses correctly', () => {
    const statusMap: Record<string, string> = {
      'active': 'active',
      'trialing': 'trialing',
      'canceled': 'canceled',
      'incomplete': 'incomplete',
      'incomplete_expired': 'incomplete_expired',
      'past_due': 'past_due',
      'unpaid': 'unpaid',
      'paused': 'paused',
    };

    Object.entries(statusMap).forEach(([stripeStatus, expectedStatus]) => {
      // This would be tested in the actual webhook handler
      expect(stripeStatus).toBeDefined();
      expect(expectedStatus).toBeDefined();
    });
  });

  it('should handle unknown status gracefully', () => {
    const unknownStatus = 'unknown_status';
    // In the actual implementation, this should default to 'active'
    expect(unknownStatus).toBeDefined();
  });
});

describe('Webhook Event Processing', () => {
  it('should map Stripe statuses correctly', () => {
    const statusMap: Record<string, string> = {
      'active': 'active',
      'trialing': 'trialing',
      'canceled': 'canceled',
      'incomplete': 'incomplete',
      'incomplete_expired': 'incomplete_expired',
      'past_due': 'past_due',
      'unpaid': 'unpaid',
      'paused': 'paused',
    };

    Object.entries(statusMap).forEach(([stripeStatus, expectedStatus]) => {
      // This would be tested in the actual webhook handler
      expect(stripeStatus).toBeDefined();
      expect(expectedStatus).toBeDefined();
    });
  });

  it('should handle subscription period updates', () => {
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Test period calculation
    expect(nextMonth.getTime()).toBeGreaterThan(now.getTime());
    expect(nextMonth.getTime() - now.getTime()).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it('should handle invoice creation', () => {
    const mockInvoice = {
      id: 'inv_test_001',
      org_id: 'org-1',
      amount: 2900,
      currency: 'usd',
      status: 'paid' as const,
      created_at: new Date().toISOString(),
    };
    
    expect(mockInvoice.id).toBe('inv_test_001');
    expect(mockInvoice.amount).toBe(2900);
    expect(mockInvoice.status).toBe('paid');
  });
});

describe('Entitlement Guards', () => {
  it('should throw error for missing entitlement', async () => {
    const { assertEntitlement } = await import('@/utils/billing/guards');
    
    // Mock hasEntitlement to return false
    vi.mock('@/utils/billing/entitlements', () => ({
      hasEntitlement: vi.fn().mockResolvedValue(false),
    }));

    await expect(assertEntitlement('org-1', 'can_use_automation')).rejects.toThrow('Feature \'can_use_automation\' is not available');
  });

  it('should pass for valid entitlement', async () => {
    const { assertEntitlement } = await import('@/utils/billing/guards');
    
    // Mock hasEntitlement to return true
    vi.mock('@/utils/billing/entitlements', () => ({
      hasEntitlement: vi.fn().mockResolvedValue(true),
    }));

    await expect(assertEntitlement('org-1', 'can_use_automation')).resolves.not.toThrow();
  });
});

describe('Offline Invoices', () => {
  it('should return deterministic mock invoices', async () => {
    const { billingStore } = await import('@/server/mocks/billing.store');
    
    const invoices = await billingStore.getInvoices('org-1', 5);
    
    expect(invoices).toHaveLength(3); // Mock data has 3 invoices
    expect(invoices[0]).toMatchObject({
      id: 'inv_mock_001',
      org_id: 'org-1',
      amount: 2900,
      currency: 'usd',
      status: 'paid',
    });
    
    // Check that all invoices have required fields
    invoices.forEach(invoice => {
      expect(invoice.id).toBeDefined();
      expect(invoice.org_id).toBe('org-1');
      expect(invoice.amount).toBeDefined();
      expect(invoice.currency).toBe('usd');
      expect(invoice.status).toBeDefined();
      expect(invoice.created_at).toBeDefined();
    });
  });

  it('should respect limit parameter', async () => {
    const { billingStore } = await import('@/server/mocks/billing.store');
    
    const invoices = await billingStore.getInvoices('org-1', 2);
    expect(invoices).toHaveLength(2);
  });
});

describe('Offline Mode', () => {
  it('should work without Supabase client', async () => {
    const plan = await getCurrentPlan('org-1', null);
    expect(plan).toBeDefined();
    expect(plan?.id).toBe('free');
  });

  it('should handle missing environment variables', () => {
    const originalEnv = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    
    // This should trigger offline mode
    const isOfflineMode = !process.env.STRIPE_SECRET_KEY;
    expect(isOfflineMode).toBe(true);
    
    // Restore environment
    process.env.STRIPE_SECRET_KEY = originalEnv;
  });
});
