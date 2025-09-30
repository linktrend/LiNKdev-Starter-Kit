import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getUser } from '@/utils/supabase/queries';
// Define TRPCContext locally since it's not being exported properly
type TRPCContext = {
  user: any;
  supabase: any;
  posthog: any;
  headers?: any;
};
import { 
  sendProfileUpdateEmail, 
  sendTestEmail 
} from '@/utils/communication/email-dispatcher';

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
