// Rate Limiting Configuration
// Per-route rate limit configurations and defaults

export interface RouteRateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitConfigMap {
  [route: string]: {
    [method: string]: RouteRateLimitConfig;
  };
}

// Default rate limit configuration
export const DEFAULT_RATE_LIMIT_CONFIG: RouteRateLimitConfig = {
  limit: parseInt(process.env.RATE_LIMIT_DEFAULT_PER_MIN || '60'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
};

// Per-route rate limit configurations
export const RATE_LIMIT_CONFIGS: RateLimitConfigMap = {
  // Organizations
  '/api/v1/orgs': {
    GET: { limit: 60, windowMs: 60000 },    // 60 req/min
    POST: { limit: 10, windowMs: 60000 },   // 10 req/min (creation)
  },

  // Records
  '/api/v1/records': {
    GET: { limit: 120, windowMs: 60000 },   // 120 req/min (read)
    POST: { limit: 60, windowMs: 60000 },   // 60 req/min (create)
  },
  '/api/v1/records/[id]': {
    GET: { limit: 120, windowMs: 60000 },   // 120 req/min (read)
    PATCH: { limit: 60, windowMs: 60000 },  // 60 req/min (update)
    DELETE: { limit: 30, windowMs: 60000 }, // 30 req/min (delete)
  },

  // Scheduling
  '/api/v1/reminders': {
    GET: { limit: 120, windowMs: 60000 },   // 120 req/min (read)
    POST: { limit: 60, windowMs: 60000 },   // 60 req/min (create)
  },
  '/api/v1/reminders/[id]/complete': {
    POST: { limit: 120, windowMs: 60000 },  // 120 req/min (complete)
  },

  // Billing
  '/api/v1/billing/subscription': {
    GET: { limit: 30, windowMs: 60000 },    // 30 req/min (sensitive)
  },
  '/api/v1/billing/checkout': {
    POST: { limit: 10, windowMs: 60000 },   // 10 req/min (sensitive)
  },

  // Audit
  '/api/v1/audit': {
    GET: { limit: 60, windowMs: 60000 },    // 60 req/min (audit logs)
  },
};

// tRPC procedure rate limit configurations
export const TRPC_RATE_LIMIT_CONFIGS: RateLimitConfigMap = {
  // Organizations
  'org.createOrg': {
    POST: { limit: 10, windowMs: 60000 },   // 10 req/min
  },
  'org.listOrgs': {
    GET: { limit: 60, windowMs: 60000 },    // 60 req/min
  },
  'org.setCurrent': {
    POST: { limit: 120, windowMs: 60000 },  // 120 req/min
  },
  'org.updateMemberRole': {
    POST: { limit: 30, windowMs: 60000 },   // 30 req/min
  },
  'org.removeMember': {
    POST: { limit: 30, windowMs: 60000 },   // 30 req/min
  },
  'org.invite': {
    POST: { limit: 20, windowMs: 60000 },   // 20 req/min
  },
  'org.acceptInvite': {
    POST: { limit: 10, windowMs: 60000 },   // 10 req/min
  },

  // Records
  'records.createRecord': {
    POST: { limit: 60, windowMs: 60000 },   // 60 req/min
  },
  'records.updateRecord': {
    POST: { limit: 60, windowMs: 60000 },   // 60 req/min
  },
  'records.deleteRecord': {
    POST: { limit: 30, windowMs: 60000 },   // 30 req/min
  },
  'records.listRecords': {
    GET: { limit: 120, windowMs: 60000 },   // 120 req/min
  },

  // Scheduling
  'scheduling.createReminder': {
    POST: { limit: 60, windowMs: 60000 },   // 60 req/min
  },
  'scheduling.completeReminder': {
    POST: { limit: 120, windowMs: 60000 },  // 120 req/min
  },
  'scheduling.snoozeReminder': {
    POST: { limit: 60, windowMs: 60000 },   // 60 req/min
  },
  'scheduling.listReminders': {
    GET: { limit: 120, windowMs: 60000 },   // 120 req/min
  },

  // Billing
  'billing.createCheckout': {
    POST: { limit: 10, windowMs: 60000 },   // 10 req/min (sensitive)
  },
  'billing.openPortal': {
    POST: { limit: 10, windowMs: 60000 },   // 10 req/min (sensitive)
  },
  'billing.getSubscription': {
    GET: { limit: 30, windowMs: 60000 },    // 30 req/min
  },

  // Audit
  'audit.list': {
    GET: { limit: 60, windowMs: 60000 },    // 60 req/min
  },
  'audit.append': {
    POST: { limit: 120, windowMs: 60000 },  // 120 req/min
  },
};

/**
 * Get rate limit configuration for a route
 */
export function getRateLimitConfigForRoute(
  route: string, 
  method: string
): RouteRateLimitConfig {
  const routeConfig = RATE_LIMIT_CONFIGS[route];
  if (routeConfig && routeConfig[method]) {
    return routeConfig[method];
  }
  
  // Fallback to default based on method
  if (['POST', 'PATCH', 'DELETE'].includes(method)) {
    return { limit: 60, windowMs: 60000 };
  }
  
  return DEFAULT_RATE_LIMIT_CONFIG;
}

/**
 * Get rate limit configuration for a tRPC procedure
 */
export function getRateLimitConfigForTRPC(
  procedure: string, 
  method: string = 'POST'
): RouteRateLimitConfig {
  const procedureConfig = TRPC_RATE_LIMIT_CONFIGS[procedure];
  if (procedureConfig && procedureConfig[method]) {
    return procedureConfig[method];
  }
  
  // Fallback to default based on method
  if (['POST', 'PATCH', 'DELETE'].includes(method)) {
    return { limit: 60, windowMs: 60000 };
  }
  
  return DEFAULT_RATE_LIMIT_CONFIG;
}

/**
 * Generate rate limit bucket key
 */
export function generateRateLimitBucket(
  ip: string,
  orgId: string,
  route: string
): string {
  return `${ip}:${orgId}:${route}`;
}

/**
 * Get window start timestamp for rate limiting
 */
export function getRateLimitWindowStart(windowMs: number): Date {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  return windowStart;
}

/**
 * Check if rate limit configuration is strict
 */
export function isStrictRateLimit(config: RouteRateLimitConfig): boolean {
  return config.limit <= 10;
}

/**
 * Get retry after seconds for rate limit
 */
export function getRetryAfterSeconds(windowMs: number): number {
  return Math.ceil(windowMs / 1000);
}
