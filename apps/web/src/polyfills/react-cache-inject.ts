/**
 * Inject React.cache polyfill for React 18
 * This file is loaded before any other code to ensure React.cache is available
 */

import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CacheFunction<T extends (...args: any[]) => any> = T;

const cacheMap = new WeakMap<unknown, Map<string, unknown>>();

/**
 * Simple cache implementation for React 18 compatibility
 * @param fn Function to cache
 * @returns Cached function
 */
function cachePolyfill<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T
): CacheFunction<T> {
  if (!cacheMap.has(fn)) {
    cacheMap.set(fn, new Map());
  }
  
  const fnCache = cacheMap.get(fn) as Map<string, ReturnType<T>>;

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

// Inject cache into React if it doesn't exist
if (!(React as any).cache) {
  (React as any).cache = cachePolyfill;
  console.log('[Polyfill] React.cache polyfill loaded for React 18 compatibility');
}
