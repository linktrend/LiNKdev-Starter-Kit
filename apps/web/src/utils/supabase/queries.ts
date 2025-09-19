import { User, UserDetails, Subscription, Product, SubscriptionWithProduct } from '@/types/user';

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

export async function getSubscription(): Promise<SubscriptionWithProduct | null> {
  // Implementation for getting subscription
  return null;
}

export async function getProducts(): Promise<Product[]> {
  // Implementation for getting products
  return [];
}
