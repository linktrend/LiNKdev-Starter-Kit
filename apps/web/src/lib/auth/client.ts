"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return { supabaseUrl, supabaseAnonKey };
}

// Browser client for client-side auth operations
export function createClient(): TypedSupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Singleton instance for client-side usage
let clientInstance: TypedSupabaseClient | null = null;

export function getClient(): TypedSupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}
