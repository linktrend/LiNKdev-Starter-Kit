import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getUser } from '@/utils/supabase/queries';
// Define TRPCContext locally since it's not being exported properly
type TRPCContext = {
  user: {
    id: string;
    email?: string;
  } | null;
  supabase: ReturnType<typeof createClient>;
  posthog: {
    capture: (event: string, properties?: Record<string, unknown>) => void;
  } | null;
  headers?: Headers;
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
    capture: (event: string, properties?: Record<string, unknown>) => {
      // PostHog event tracked
    }
  } : null;

  return {
    supabase,
    user,
    posthog,
    headers: opts?.headers,
  };
};
