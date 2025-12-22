import type { SupabaseClient } from '@supabase/supabase-js';
import type { UsageLogPayload, Database } from '@starter/types';
import type { OrgRole } from '@starter/types';

export interface SessionUser {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

export type UsageLogger = (payload: UsageLogPayload) => void | Promise<void>;

export interface TRPCContext {
  supabase: SupabaseClient<Database>;
  user: SessionUser | null;
  posthog?: any;
  headers?: Headers;
  usageLogger?: UsageLogger;
  userRole?: OrgRole;
  orgId?: string;
}
