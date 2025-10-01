"use client";
import posthog from "posthog-js";

let inited = false;

/**
 * Initialize PostHog with environment variables
 * Only initializes in production or when explicitly configured
 */
export function initPostHog(apiKey?: string, host?: string): void {
  if (inited) return;
  
  // Use environment variables if not provided
  const posthogKey = apiKey || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = host || process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  
  // Only initialize if we have a valid API key
  if (!posthogKey || posthogKey === 'phc_your_posthog_key') {
    console.log('PostHog not initialized: No valid API key provided');
    return;
  }
  
  // Only initialize in production or when explicitly configured
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.log('PostHog not initialized: Development environment without explicit key');
    return;
  }
  
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: true,
    // Additional configuration
    capture_pageleave: true,
    capture_performance: true,
    debug: process.env.NODE_ENV === 'development',
  });
  
  inited = true;
  console.log('PostHog initialized successfully');
}

export { posthog };
