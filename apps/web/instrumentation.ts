/**
 * Next.js Instrumentation Hook
 * This runs before any other code in the server
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Polyfill React.cache for React 18 compatibility
    const React = await import('react');
    
    if (!(React as any).cache) {
      const cacheMap = new WeakMap<unknown, Map<string, unknown>>();
      
      (React as any).cache = function cache<T extends (...args: any[]) => any>(fn: T): T {
        if (!cacheMap.has(fn)) {
          cacheMap.set(fn, new Map());
        }
        
        const fnCache = cacheMap.get(fn) as Map<string, any>;

        return ((...args: any[]): any => {
          const key = JSON.stringify(args);
          
          if (fnCache.has(key)) {
            return fnCache.get(key);
          }

          const result = fn(...args);
          fnCache.set(key, result);
          return result;
        }) as T;
      };
      
      console.log('[Instrumentation] React.cache polyfill loaded for React 18 compatibility');
    }
  }
}
