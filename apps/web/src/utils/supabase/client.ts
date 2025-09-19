import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
export const supabaseClient = () => createClientComponentClient();
export const createClient = createClientComponentClient;
export default supabaseClient;
