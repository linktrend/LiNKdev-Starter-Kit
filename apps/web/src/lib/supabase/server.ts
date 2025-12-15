import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { cache } from "react";
import type { Database } from "@/types/database.types";

type TypedSupabaseClient = ReturnType<typeof createServerClient<Database>>;

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return { supabaseUrl, supabaseAnonKey };
}

// Cached server client with full cookie handling
export const createClient = cache((): TypedSupabaseClient => {
  const cookieStore = cookies();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: any) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options?: any) {
        cookieStore.delete({ name, ...options });
      },
    },
  });
});

// Legacy export for backward compatibility
export const supabaseServer = createClient;
