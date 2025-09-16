"use client";
import posthog from "posthog-js";
export function initPostHog(apiKey:string, host?:string){ if(!apiKey) return; posthog.init(apiKey,{ api_host: host || "https://us.i.posthog.com", capture_pageview: true }); }
export { posthog };
