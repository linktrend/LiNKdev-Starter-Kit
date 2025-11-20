import { Tables } from '@starter/types';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}

export const dummyPricing: ProductWithPrices[] = [
  {
    id: 'dummy-basic',
    name: 'Basic Plan',
    description: 'For individuals just getting started',
    prices: [
      {
        id: 'dummy-basic-price-month',
        currency: 'USD',
        unit_amount: 999,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-basic',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-basic-price-year',
        currency: 'USD',
        unit_amount: 9990,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-basic',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  },
  {
    id: 'dummy-pro',
    name: 'Pro Plan',
    description: 'For growing businesses',
    prices: [
      {
        id: 'dummy-pro-price-month',
        currency: 'USD',
        unit_amount: 2999,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-pro',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-pro-price-year',
        currency: 'USD',
        unit_amount: 29990,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-pro',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  },
  {
    id: 'dummy-enterprise',
    name: 'Enterprise Plan',
    description: 'For large organizations',
    prices: [
      {
        id: 'dummy-enterprise-price-month',
        currency: 'USD',
        unit_amount: 9999,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-enterprise',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-enterprise-price-year',
        currency: 'USD',
        unit_amount: 99990,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-enterprise',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  }
];
