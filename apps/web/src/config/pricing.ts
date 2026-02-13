import { Tables } from '@starter/types';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}

export const dummyPricing: ProductWithPrices[] = [
  {
    id: 'dummy-free',
    name: 'Free Plan',
    description: 'For individuals just getting started',
    prices: [
      {
        id: 'dummy-free-price-month',
        currency: 'USD',
        unit_amount: 0,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-free',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-free-price-year',
        currency: 'USD',
        unit_amount: 0,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-free',
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
    id: 'dummy-business',
    name: 'Business Plan',
    description: 'For teams that need advanced controls and scale',
    prices: [
      {
        id: 'dummy-business-price-month',
        currency: 'USD',
        unit_amount: 9999,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-business',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-business-price-year',
        currency: 'USD',
        unit_amount: 99990,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-business',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  }
];
