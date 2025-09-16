import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
export const getSupabaseClient = () => createClientComponentClient();
export async function uploadPublic(bucket: string, path: string, file: File | Blob) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  return { path };
}
