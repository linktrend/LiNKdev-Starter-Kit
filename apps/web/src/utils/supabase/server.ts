/**
 * @deprecated This file uses the deprecated @supabase/auth-helpers-nextjs package.
 * Please use @/lib/supabase/server or @/lib/auth/server instead.
 * 
 * Migration guide:
 * - Replace `import { createClient } from '@/utils/supabase/server'`
 * - With `import { createClient } from '@/lib/supabase/server'`
 */

import { createRouteHandlerClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import type { Database } from "@starter/types";

export { createRouteHandlerClient, createServerComponentClient };

export const createRouteHandlerClientTyped = () => createRouteHandlerClient<Database>({ cookies });
export const createServerComponentClientTyped = () => createServerComponentClient<Database>({ cookies });

// Alias for createClient with overloads
export function createClient(): ReturnType<typeof createServerComponentClient<Database>>;
export function createClient(options: { cookies: any }): ReturnType<typeof createServerComponentClient<Database>>;
export function createClient(options?: { cookies: any }) {
  if (options?.cookies) {
    return createServerComponentClient<Database>(options);
  }
  return createServerComponentClient<Database>({ cookies });
}
