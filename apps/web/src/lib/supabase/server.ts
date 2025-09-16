import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
export const supabaseServer = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { cookies: { get: (key) => cookieStore.get(key)?.value } }
  );
};
