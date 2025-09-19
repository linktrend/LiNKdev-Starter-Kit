"use client";
import posthog from "posthog-js";

let inited = false;

export function initPostHog(apiKey?: string, host?: string) {
  if (inited) return;
  if (!apiKey) return;
  posthog.init(apiKey, {
    api_host: host || "https://us.i.posthog.com",
    capture_pageview: true,
  });
  inited = true;
}

export { posthog };
