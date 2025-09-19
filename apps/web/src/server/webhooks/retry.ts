/**
 * Retry/backoff utility for webhook processing
 * Provides exponential backoff with configurable parameters
 */

export type RetryResult = 
  | { ok: true }
  | { ok: false; attempts: number; lastError: string };

export interface RetryOptions {
  maxAttempts?: number;
  baseMs?: number;
  factor?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 5,
  baseMs: 1000,
  factor: 4,
};

/**
 * Execute a function with exponential backoff retry
 */
export async function withBackoff<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const options = { ...DEFAULT_OPTIONS, ...opts };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on the last attempt
      if (attempt === options.maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = options.baseMs * Math.pow(options.factor, attempt - 1);
      
      console.warn('WEBHOOK: Retry attempt failed', {
        attempt,
        maxAttempts: options.maxAttempts,
        delayMs: delay,
        error: lastError.message,
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  throw new Error(`Retry failed after ${options.maxAttempts} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Execute a function with retry and return a structured result
 */
export async function withBackoffResult<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<RetryResult> {
  try {
    await withBackoff(fn, opts);
    return { ok: true };
  } catch (error) {
    const lastError = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      attempts: opts.maxAttempts || DEFAULT_OPTIONS.maxAttempts,
      lastError,
    };
  }
}

/**
 * Check if pg-boss is available and provide adapter
 * TODO: Implement pg-boss adapter when dependency is available
 */
export function createPgBossAdapter(): null {
  // TODO: Implement pg-boss adapter
  // This would provide a more robust retry mechanism using PostgreSQL
  // For now, return null to indicate it's not available
  console.info('WEBHOOK: pg-boss adapter not implemented yet');
  return null;
}

/**
 * Retry configuration for different webhook types
 */
export const RETRY_CONFIGS = {
  // Stripe webhooks - more aggressive retry for billing events
  stripe: {
    maxAttempts: 5,
    baseMs: 1000,
    factor: 2,
  },
  
  // Generic webhooks - standard retry
  generic: {
    maxAttempts: 3,
    baseMs: 500,
    factor: 2,
  },
  
  // N8N webhooks - less aggressive retry
  n8n: {
    maxAttempts: 3,
    baseMs: 2000,
    factor: 1.5,
  },
} as const;
