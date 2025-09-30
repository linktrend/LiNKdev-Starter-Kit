import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@starter/types";

export const supabaseClient = () => createClientComponentClient<Database>();
export const createClient = () => createClientComponentClient<Database>();
export default supabaseClient;
