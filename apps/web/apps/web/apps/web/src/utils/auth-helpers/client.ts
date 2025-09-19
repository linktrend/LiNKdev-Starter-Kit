export function handleRequest<T extends (...a: any[]) => Promise<any>>(fn: T) { return fn; }
export async function signInWithOAuth(_provider: string) { return { user: null as any, error: null }; }
