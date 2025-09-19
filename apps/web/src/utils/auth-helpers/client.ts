export { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Client auth helper functions
export async function signInWithOAuth(provider: string) {
  // Implementation for OAuth sign in
  throw new Error("Not implemented");
}

export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>, 
  authFunction: (email: string, password: string) => Promise<any>, 
  router: any
) {
  // Implementation for handling requests
  const formData = new FormData(e.currentTarget);
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  
  try {
    const result = await authFunction(email, password);
    if (result.error) {
      throw new Error(result.error.message);
    }
    router.push('/dashboard');
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
}
