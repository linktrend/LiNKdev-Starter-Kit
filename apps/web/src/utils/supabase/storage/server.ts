/**
 * Server-side Supabase Storage client
 * Uses service role key for elevated permissions
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

// Create server client with service role key for elevated permissions
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

export const createServerStorageClient = () => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase.storage;
};

// Export a default instance
export const serverStorage = createServerStorageClient();
