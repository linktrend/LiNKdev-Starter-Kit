import { User, UserDetails, Subscription, Product, SubscriptionWithProduct, ProductWithPrices } from '@starter/types';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function getDashboardSummary(_orgId: string) {
  return { pets: 0, reminders: 0, logs: 0 };
}

export async function getUser(): Promise<User | null> {
  // TEMPORARY: Offline mode for testing
  if (process.env.TEMPLATE_OFFLINE === '1') {
    return {
      id: 'test-user-123',
      email: 'test@example.com',
    };
  }

  try {
    const supabase = createClient({ cookies });
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getUserDetails(): Promise<UserDetails | null> {
  // TEMPORARY: Offline mode for testing
  if (process.env.TEMPLATE_OFFLINE === '1') {
    return {
      id: 'test-user-123',
      email: 'test@example.com',
      username: 'testuser',
      display_name: 'Test User',
      full_name: 'Test User',
      avatar_url: null,
    };
  }

  try {
    const supabase = createClient({ cookies });
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Get user details from the users table
    const { data: userDetails, error: userError } = await supabase
      .from('users')
      .select('id, email, username, display_name, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    type UserDetailsResult = {
      id: string;
      email: string | null;
      username: string | null;
      display_name: string | null;
      full_name: string | null;
      avatar_url: string | null;
    };
    const typedUserDetails = userDetails as UserDetailsResult | null;

    if (userError || !typedUserDetails) {
      // Fallback to auth user data if users table doesn't have the record
      return {
        id: user.id,
        email: user.email || null,
        username: null,
        display_name: user.user_metadata?.full_name || null,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      };
    }

    return {
      id: typedUserDetails.id,
      email: typedUserDetails.email,
      username: typedUserDetails.username,
      display_name: typedUserDetails.display_name,
      full_name: typedUserDetails.full_name,
      avatar_url: typedUserDetails.avatar_url,
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
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
