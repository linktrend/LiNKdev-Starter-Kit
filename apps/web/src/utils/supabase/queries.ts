import { User, UserDetails, Subscription, Product, SubscriptionWithProduct, ProductWithPrices } from '@/types/user';
import { createClient } from '@/utils/supabase/server';

export async function getDashboardSummary(_orgId: string) {
  return { pets: 0, reminders: 0, logs: 0 };
}

export async function getUser(): Promise<User | null> {
  // Re-export from server queries for consistency
  const { getCurrentUserProfile } = await import('@/server/queries/user');
  return getCurrentUserProfile();
}

export async function getUserDetails(): Promise<UserDetails | null> {
  // Implementation for getting user details
  return null;
}

// Overloads for getSubscription
export async function getSubscription(): Promise<SubscriptionWithProduct | null>;
export async function getSubscription(supabase: any, userId?: string): Promise<SubscriptionWithProduct | null>;
export async function getSubscription(supabase?: any, userId?: string): Promise<SubscriptionWithProduct | null> {
  // Implementation for getting subscription
  return null;
}

// Overloads for getProducts
export async function getProducts(): Promise<ProductWithPrices[]>;
export async function getProducts(supabase: any): Promise<ProductWithPrices[]>;
export async function getProducts(supabase?: any): Promise<ProductWithPrices[]> {
  // Implementation for getting products
  return [];
}
