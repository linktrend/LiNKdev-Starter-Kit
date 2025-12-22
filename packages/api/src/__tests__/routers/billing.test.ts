import { describe, it, expect, vi, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createSupabaseMock } from '../helpers/supabaseMock';

vi.mock('../../middleware/accessGuard', () => ({
  requireMember: () => async ({ ctx, input, next }: any) =>
    next({ ctx: { ...ctx, orgId: input?.orgId ?? ctx.orgId }, input }),
  requireAdmin: () => async ({ ctx, input, next }: any) =>
    next({ ctx: { ...ctx, orgId: input?.orgId ?? ctx.orgId }, input }),
}));

const originalEnv = { ...process.env };
const basePlan = {
  id: 'pro',
  entitlements: {
    max_members_per_org: 10,
    max_records: 500,
    max_reminders: 50,
    max_organizations: 3,
  },
};
const ORG_ID = '00000000-0000-4000-8000-000000000111';
const ORG_ID_ALT = '00000000-0000-4000-8000-000000000222';

function setEnv(offline: boolean) {
  process.env = {
    ...originalEnv,
    TEMPLATE_OFFLINE: offline ? '1' : '0',
    BILLING_OFFLINE: offline ? '1' : '0',
    NEXT_PUBLIC_SUPABASE_URL: offline ? '' : 'http://supabase.local',
    STRIPE_SECRET_KEY: offline ? '' : 'sk_test_123',
  };
}

function setupGlobals(plan = basePlan) {
  const billingStore = {
    getSubscription: vi.fn(),
    getCustomer: vi.fn(),
    createCheckoutSession: vi.fn(),
    createPortalSession: vi.fn(),
    simulateEvent: vi.fn(),
    getInvoices: vi.fn(),
  };

  const emitAnalyticsEvent = vi.fn();
  const getPlanById = vi.fn((id: string) => (id === plan?.id ? plan : null));

  Object.assign(globalThis as any, {
    BILLING_PLANS: plan ? [plan] : [],
    getPlanById,
    billingStore,
    emitAnalyticsEvent,
  });

  return { billingStore, emitAnalyticsEvent, getPlanById };
}

async function loadBillingRouter(offline: boolean, plan = basePlan) {
  vi.resetModules();
  setEnv(offline);
  const globals = setupGlobals(plan);
  const mod = await import('../../routers/billing');
  return { billingRouter: mod.billingRouter, globals };
}

async function createCaller(offline: boolean, plan = basePlan, orgId = ORG_ID) {
  const { billingRouter, globals } = await loadBillingRouter(offline, plan);
  const supabaseMock = createSupabaseMock();
  const caller = billingRouter.createCaller({
    supabase: supabaseMock.supabase as any,
    user: { id: 'user-1' },
    userRole: 'owner',
    orgId,
  });

  return { caller, supabaseMock, globals };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  process.env = { ...originalEnv };
  delete (globalThis as any).BILLING_PLANS;
  delete (globalThis as any).getPlanById;
  delete (globalThis as any).billingStore;
  delete (globalThis as any).emitAnalyticsEvent;
});

describe('billingRouter', () => {
  it('returns plans with offline flag', async () => {
    const { caller } = await createCaller(true);

    const result = await caller.getPlans();

    expect(result.plans[0].id).toBe(basePlan.id);
    expect(result.offline).toBe(true);
  });

  it('rejects checkout for invalid plan', async () => {
    const { caller, globals } = await createCaller(true, null as any);
    globals.getPlanById.mockReturnValue(null);

    await expect(
      caller.createCheckout({
        orgId: ORG_ID,
        plan: 'does-not-exist',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      }),
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it('creates offline checkout and emits analytics', async () => {
    const { caller, globals } = await createCaller(true);
    globals.billingStore.createCheckoutSession.mockResolvedValue({
      sessionId: 'sess_123',
      url: 'https://checkout',
    });

    const result = await caller.createCheckout({
      orgId: ORG_ID,
      plan: basePlan.id,
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(result.offline).toBe(true);
    expect(globals.billingStore.createCheckoutSession).toHaveBeenCalledWith(
      ORG_ID,
      basePlan.id,
      'https://example.com/success',
      'https://example.com/cancel',
    );
    expect(globals.emitAnalyticsEvent).toHaveBeenCalledWith(
      'user-1',
      'billing.checkout_started',
      expect.objectContaining({
        org_id: ORG_ID,
        plan: basePlan.id,
        metadata: { offline: true },
      }),
    );
  });

  it('creates online checkout and marks offline false', async () => {
    const { caller, globals } = await createCaller(false, basePlan, ORG_ID_ALT);
    globals.billingStore.createCheckoutSession.mockResolvedValue({
      sessionId: 'sess_456',
      url: 'https://checkout-online',
    });

    const result = await caller.createCheckout({
      orgId: ORG_ID_ALT,
      plan: basePlan.id,
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(result.offline).toBe(false);
    expect(globals.emitAnalyticsEvent).toHaveBeenCalledWith(
      'user-1',
      'billing.checkout_started',
      expect.objectContaining({
        org_id: ORG_ID_ALT,
        plan: basePlan.id,
      }),
    );
  });

  it('opens portal in offline mode', async () => {
    const { caller, globals } = await createCaller(true);
    globals.billingStore.createPortalSession.mockResolvedValue({ url: 'https://portal' });

    const result = await caller.openPortal({
      orgId: ORG_ID,
      returnUrl: 'https://example.com/return',
    });

    expect(result.offline).toBe(true);
    expect(result.url).toBe('https://portal');
  });

  it('fetches subscription and customer in offline mode', async () => {
    const { caller, globals } = await createCaller(true);
    globals.billingStore.getSubscription.mockResolvedValue({ id: 'sub-1' });
    globals.billingStore.getCustomer.mockResolvedValue({ id: 'cust-1' });

    const result = await caller.getSubscription({ orgId: ORG_ID });

    expect(result.offline).toBe(true);
    expect(result.subscription).toEqual({ id: 'sub-1' });
    expect(result.customer).toEqual({ id: 'cust-1' });
  });

  it('fetches subscription and customer from supabase when online', async () => {
    const { caller, supabaseMock } = await createCaller(false);
    supabaseMock.getTable('org_subscriptions').__queueEqResponse({
      data: { plan_name: basePlan.id },
      error: null,
    });
    supabaseMock.getTable('billing_customers').__queueEqResponse({
      data: { id: 'cust-1', stripe_customer_id: 'cus_123' },
      error: null,
    });

    const result = await caller.getSubscription({ orgId: ORG_ID });

    expect(result.offline).toBe(false);
    expect(result.subscription).toEqual({ plan_name: basePlan.id });
    expect(result.customer).toEqual({ id: 'cust-1', stripe_customer_id: 'cus_123' });
  });

  it('blocks event simulation when online', async () => {
    const { caller } = await createCaller(false);

    await expect(
      caller.simulateEvent({
        orgId: ORG_ID,
        type: 'invoice.paid',
      }),
    ).rejects.toThrowError(/only available in offline mode/);
  });

  it('simulates event offline and emits analytics', async () => {
    const { caller, globals } = await createCaller(true);
    globals.billingStore.simulateEvent.mockResolvedValue(undefined);

    const result = await caller.simulateEvent({
      orgId: ORG_ID,
      type: 'customer.subscription.created',
    });

    expect(result).toEqual({
      success: true,
      message: 'Simulated customer.subscription.created event',
    });
    expect(globals.emitAnalyticsEvent).toHaveBeenCalledWith(
      'user-1',
      'billing.customer.subscription.created',
      expect.objectContaining({
        org_id: ORG_ID,
        metadata: expect.objectContaining({ simulated: true }),
      }),
    );
  });

  it('returns mock usage stats when offline', async () => {
    const { caller } = await createCaller(true);

    const result = await caller.getUsageStats({ orgId: ORG_ID });

    expect(result.offline).toBe(true);
    expect(result.members.limit).toBe(3);
  });

  it('returns entitlement-based usage stats when online', async () => {
    const { caller, supabaseMock } = await createCaller(false);
    supabaseMock.getTable('org_subscriptions').__queueEqResponse({
      data: { plan: basePlan.id },
      error: null,
    });

    const result = await caller.getUsageStats({ orgId: ORG_ID });

    expect(result.offline).toBe(false);
    expect(result.members.limit).toBe(3);
    expect(result.records.limit).toBe(100);
  });

  it('lists invoices from store when offline', async () => {
    const { caller, globals } = await createCaller(true);
    globals.billingStore.getInvoices.mockResolvedValue([{ id: 'inv-1' }]);

    const result = await caller.listInvoices({ orgId: ORG_ID, limit: 10 });

    expect(result.offline).toBe(true);
    expect(result.invoices).toEqual([{ id: 'inv-1' }]);
    expect(result.has_more).toBe(false);
  });

  it('returns empty invoices when no customer mapping online', async () => {
    const { caller, supabaseMock } = await createCaller(false);
    supabaseMock.getTable('billing_customers').__queueEqResponse({
      data: { stripe_customer_id: null },
      error: null,
    });

    const result = await caller.listInvoices({ orgId: ORG_ID, limit: 5 });

    expect(result.offline).toBe(false);
    expect(result.invoices).toEqual([]);
  });
});
