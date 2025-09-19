// Offline fallback store for Billing module
// Used when TEMPLATE_OFFLINE=1 or Stripe is not configured

import { BillingCustomer, BillingSubscription, BillingPlan, BillingInvoice } from '@/types/billing';
import { getPlanById } from '@/config/plans';

interface BillingStore {
  customers: Map<string, BillingCustomer>;
  subscriptions: Map<string, BillingSubscription>;
  processedEvents: Set<string>;
}

class InMemoryBillingStore {
  private store: BillingStore = {
    customers: new Map(),
    subscriptions: new Map(),
    processedEvents: new Set(),
  };

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some mock data for demo purposes
    const mockCustomer: BillingCustomer = {
      org_id: 'org-1',
      stripe_customer_id: 'cus_mock_123',
      created_at: new Date().toISOString(),
    };

    const mockSubscription: BillingSubscription = {
      org_id: 'org-1',
      plan: 'pro',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      stripe_sub_id: 'sub_mock_123',
      updated_at: new Date().toISOString(),
    };

    this.store.customers.set('org-1', mockCustomer);
    this.store.subscriptions.set('org-1', mockSubscription);
  }

  // Customer management
  async getOrCreateCustomer(orgId: string): Promise<BillingCustomer> {
    let customer = this.store.customers.get(orgId);
    
    if (!customer) {
      customer = {
        org_id: orgId,
        stripe_customer_id: `cus_mock_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
      };
      this.store.customers.set(orgId, customer);
    }
    
    return customer;
  }

  async getCustomer(orgId: string): Promise<BillingCustomer | null> {
    return this.store.customers.get(orgId) || null;
  }

  // Subscription management
  async getSubscription(orgId: string): Promise<BillingSubscription | null> {
    return this.store.subscriptions.get(orgId) || null;
  }

  async createSubscription(
    orgId: string,
    plan: string,
    stripeSubId?: string
  ): Promise<BillingSubscription> {
    const subscription: BillingSubscription = {
      org_id: orgId,
      plan,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      stripe_sub_id: stripeSubId,
      updated_at: new Date().toISOString(),
    };
    
    this.store.subscriptions.set(orgId, subscription);
    return subscription;
  }

  async updateSubscription(
    orgId: string,
    updates: Partial<BillingSubscription>
  ): Promise<BillingSubscription | null> {
    const existing = this.store.subscriptions.get(orgId);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    this.store.subscriptions.set(orgId, updated);
    return updated;
  }

  async cancelSubscription(orgId: string): Promise<BillingSubscription | null> {
    return this.updateSubscription(orgId, {
      status: 'canceled',
      current_period_end: new Date().toISOString(),
    });
  }

  // Event processing
  async isEventProcessed(eventId: string): Promise<boolean> {
    return this.store.processedEvents.has(eventId);
  }

  async markEventProcessed(eventId: string): Promise<void> {
    this.store.processedEvents.add(eventId);
  }

  // Mock checkout session creation
  async createCheckoutSession(
    orgId: string,
    plan: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string }> {
    const sessionId = `cs_mock_${Math.random().toString(36).substr(2, 9)}`;
    const url = `https://checkout.stripe.com/mock/${sessionId}`;
    
    return { sessionId, url };
  }

  // Mock portal session creation
  async createPortalSession(
    orgId: string,
    returnUrl: string
  ): Promise<{ url: string }> {
    const url = `https://billing.stripe.com/mock/${orgId}`;
    return { url };
  }

  // Simulate webhook events
  async simulateEvent(eventType: string, orgId: string): Promise<void> {
    const eventId = `evt_mock_${Math.random().toString(36).substr(2, 9)}`;
    
    switch (eventType) {
      case 'checkout.session.completed':
        // Simulate successful checkout
        await this.createSubscription(orgId, 'pro', `sub_mock_${Math.random().toString(36).substr(2, 9)}`);
        break;
        
      case 'customer.subscription.created':
        // Subscription already created above
        break;
        
      case 'customer.subscription.updated':
        // Update subscription with realistic period dates
        const existingSub = this.store.subscriptions.get(orgId);
        if (existingSub) {
          const now = new Date();
          const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          
          await this.updateSubscription(orgId, {
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: nextMonth.toISOString(),
          });
          
          console.log('Updated subscription period:', {
            start: now.toISOString(),
            end: nextMonth.toISOString()
          });
        }
        break;
        
      case 'customer.subscription.deleted':
        await this.cancelSubscription(orgId);
        break;
        
      case 'invoice.paid':
        // Update subscription status
        await this.updateSubscription(orgId, { status: 'active' });
        break;
        
      case 'invoice.payment_failed':
        await this.updateSubscription(orgId, { status: 'past_due' });
        break;
    }
    
    await this.markEventProcessed(eventId);
  }

  // Get all subscriptions (for admin purposes)
  async getAllSubscriptions(): Promise<BillingSubscription[]> {
    return Array.from(this.store.subscriptions.values());
  }

  // Get subscription by Stripe subscription ID
  async getSubscriptionByStripeId(stripeSubId: string): Promise<BillingSubscription | null> {
    for (const subscription of this.store.subscriptions.values()) {
      if (subscription.stripe_sub_id === stripeSubId) {
        return subscription;
      }
    }
    return null;
  }

  // Invoice management
  async getInvoices(orgId: string, limit: number = 10): Promise<BillingInvoice[]> {
    // Return mock invoices for offline mode
    const mockInvoices: BillingInvoice[] = [
      {
        id: 'inv_mock_001',
        org_id: orgId,
        stripe_invoice_id: 'in_mock_001',
        amount: 2900, // $29.00
        currency: 'usd',
        status: 'paid',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_mock/inv_mock_001',
        invoice_pdf: 'https://pay.stripe.com/invoice/acct_mock/inv_mock_001/pdf',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
      },
      {
        id: 'inv_mock_002',
        org_id: orgId,
        stripe_invoice_id: 'in_mock_002',
        amount: 2900, // $29.00
        currency: 'usd',
        status: 'paid',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_mock/inv_mock_002',
        invoice_pdf: 'https://pay.stripe.com/invoice/acct_mock/inv_mock_002/pdf',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        paid_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        period_start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'inv_mock_003',
        org_id: orgId,
        stripe_invoice_id: 'in_mock_003',
        amount: 0, // Free trial
        currency: 'usd',
        status: 'paid',
        hosted_invoice_url: 'https://invoice.stripe.com/i/acct_mock/inv_mock_003',
        invoice_pdf: 'https://pay.stripe.com/invoice/acct_mock/inv_mock_003/pdf',
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
        paid_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        period_start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return mockInvoices.slice(0, limit);
  }
}

export const billingStore = new InMemoryBillingStore();
