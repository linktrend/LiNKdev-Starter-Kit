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
