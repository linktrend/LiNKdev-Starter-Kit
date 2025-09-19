export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  created_at?: string;
  updated_at?: string;
  app_metadata?: any;
  aud?: string;
}

export interface UserDetails {
  id: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Price {
  id: string;
  product_id?: string;
  active?: boolean;
  currency?: string;
  unit_amount?: number;
  interval?: 'day' | 'week' | 'month' | 'year';
  interval_count?: number;
  type?: 'one_time' | 'recurring';
  trial_period_days?: number | null;
  metadata?: any;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count: number;
  };
}

export interface Product {
  id: string;
  active?: boolean;
  name?: string;
  description?: string;
  image?: string;
  metadata?: any;
}

export interface Subscription {
  id: string;
  user_id: string;
  status?: string;
  metadata?: any;
  price_id?: string;
  quantity?: number;
  trial_end?: string;
  trial_start?: string;
  current_period_start: string;
  current_period_end: string;
  ended_at?: string;
  cancel_at?: string;
  canceled_at?: string;
  cancel_at_period_end?: boolean;
  created: string;
}

export interface SubscriptionWithProduct extends Subscription {
  product: Product;
  prices: Price[];
  cancel_at?: string;
  canceled_at?: string;
  metadata?: any;
  price_id?: string;
  quantity?: number;
  trial_end?: string;
  trial_start?: string;
}

export interface ProductWithPrices extends Product {
  prices: Price[];
  image?: string;
}
