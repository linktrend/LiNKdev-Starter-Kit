export const stripeConfig = { publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_x' };

// Mock stripe instance for now
export const stripe = {
  customers: {
    create: async () => ({ id: 'cus_test' }),
    retrieve: async () => ({ id: 'cus_test' })
  },
  subscriptions: {
    create: async () => ({ id: 'sub_test' }),
    retrieve: async () => ({ id: 'sub_test' })
  },
  checkout: {
    sessions: {
      create: async () => ({ id: 'cs_test', url: 'https://checkout.stripe.com/test' })
    }
  },
  billingPortal: {
    sessions: {
      create: async () => ({ id: 'bps_test', url: 'https://billing.stripe.com/test' })
    }
  }
};

export default stripeConfig;
