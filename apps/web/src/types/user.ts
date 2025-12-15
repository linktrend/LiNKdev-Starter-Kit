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

export type Price = import('@/types/db').Tables<'prices'>;
export type Product = import('@/types/db').Tables<'products'>;
export type Subscription = import('@/types/db').Tables<'org_subscriptions'>;

export interface SubscriptionWithProduct extends Subscription {
  product: Product;
  prices: Array<import('@/types/db').Tables<'prices'>>;
}

export interface ProductWithPrices extends Product {
  prices: Array<import('@/types/db').Tables<'prices'>>;
}
