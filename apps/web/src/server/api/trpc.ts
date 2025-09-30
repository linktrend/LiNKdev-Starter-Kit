import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getUser } from '@/utils/supabase/queries';
import { TRPCContext } from '@starter/api';

export const createTRPCContext = async (opts?: { headers?: Headers }): Promise<TRPCContext> => {
  const supabase = createClient({ cookies });
  const user = await getUser();
  
  // PostHog client (optional)
  const posthog = process.env.NEXT_PUBLIC_POSTHOG_KEY ? {
    capture: (event: any) => {
      console.log('PostHog event:', event);
    }
  } : null;

  return {
    supabase,
    user,
    posthog,
    headers: opts?.headers,
  };
};
