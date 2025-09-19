import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
export const getSupabaseClient = () => createClientComponentClient();
export async function uploadPublic(bucket: string, path: string, file: File | Blob) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  return { path };
}

export async function uploadImage(bucket: string, path: string, file: File | Blob): Promise<{ path: string; imageUrl?: string; error?: any }> {
  try {
    const result = await uploadPublic(bucket, path, file);
    return {
      path: result.path,
      imageUrl: `https://example.com/${result.path}`,
      error: null
    };
  } catch (error) {
    return {
      path: '',
      error
    };
  }
}
