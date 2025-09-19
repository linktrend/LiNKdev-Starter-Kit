import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/db';

// Define a function to create a Supabase client for client-side operations
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
};