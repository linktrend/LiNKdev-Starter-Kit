"use client";
import * as Sentry from "@sentry/nextjs";

let inited = false;

/**
 * Initialize Sentry with environment variables
 * Only initializes in production or when explicitly configured
 */
export function initSentry(dsn?: string, environment?: string): void {
  if (inited) return;
  
  // Use environment variables if not provided
  const sentryDsn = dsn || process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  const sentryEnv = environment || process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV;
  
  // Only initialize if we have a DSN and we're in production or explicitly configured
  if (!sentryDsn || sentryDsn === 'https://your_sentry_dsn@sentry.io/project_id') {
    console.warn('Sentry not initialized: No valid DSN provided');
    return;
  }
  
  if (sentryEnv === 'development' && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('Sentry not initialized: Development environment without explicit DSN');
    return;
  }
  
  Sentry.init({ 
    dsn: sentryDsn, 
    environment: sentryEnv,
    // Additional configuration for production
    tracesSampleRate: sentryEnv === 'production' ? 0.1 : 1.0,
    debug: sentryEnv === 'development',
  });
  
  inited = true;
  // Sentry initialized successfully
}

export { Sentry };
