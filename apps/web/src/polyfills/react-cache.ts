/**
 * Polyfill for React.cache() for React 18
 * React.cache is available in React 19 canary but not in React 18
 * This polyfill provides basic caching functionality for server components
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CacheFunction<T extends (...args: any[]) => any> = T;

const cacheMap = new Map<unknown, Map<string, unknown>>();

/**
 * Simple cache implementation for React 18 compatibility
 * @param fn Function to cache
 * @returns Cached function
 */
export function cache<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T
): CacheFunction<T> {
  const fnCache = new Map<string, ReturnType<T>>();
  cacheMap.set(fn, fnCache);

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (fnCache.has(key)) {
      return fnCache.get(key) as ReturnType<T>;
    }

    const result = fn(...args);
    fnCache.set(key, result);
    return result;
  }) as CacheFunction<T>;
}

// Attach to React if it doesn't exist
if (typeof React !== 'undefined' && !(React as any).cache) {
  (React as any).cache = cache;
}
