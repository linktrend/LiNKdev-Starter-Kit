import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  created_at: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Get current user profile information
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  // TEMPORARY: Offline mode for testing
  if (process.env.TEMPLATE_OFFLINE === '1') {
    return {
      id: 'test-user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
  }

  try {
    const supabase = createClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    // Get user details from the users table
    const { data: userDetails, error: userError } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, created_at')
      .eq('id', user.id)
      .single();

    if (userError || !userDetails) {
      // Fallback to auth user data if users table doesn't have the record
      return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at || new Date().toISOString(),
      };
    }

    return {
      id: user.id,
      email: user.email || '',
      full_name: userDetails.full_name,
      avatar_url: userDetails.avatar_url,
      created_at: userDetails.created_at || user.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
