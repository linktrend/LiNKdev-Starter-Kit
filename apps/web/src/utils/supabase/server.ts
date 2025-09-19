import { createRouteHandlerClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
export { createRouteHandlerClient, createServerComponentClient };

// Alias for createClient
export const createClient = createServerComponentClient;
