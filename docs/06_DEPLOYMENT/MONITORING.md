# Monitoring & Observability

**Complete guide to monitoring, error tracking, analytics, and observability in the LiNKdev Starter Kit**

---

## Table of Contents

1. [Overview](#overview)
2. [Error Tracking (Sentry)](#error-tracking-sentry)
3. [Analytics (PostHog)](#analytics-posthog)
4. [Health Checks](#health-checks)
5. [Logging](#logging)
6. [Performance Monitoring](#performance-monitoring)
7. [Alerting](#alerting)
8. [Dashboard Setup](#dashboard-setup)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The LiNKdev Starter Kit includes comprehensive monitoring and observability tools to help you track errors, analyze user behavior, monitor performance, and maintain system health.

### Monitoring Stack

```mermaid
graph TB
    subgraph "Application"
        NextJS[Next.js App]
        API[API Routes]
        tRPC[tRPC Routers]
    end
    
    subgraph "Error Tracking"
        Sentry[Sentry]
        ErrorDB[(Error Database)]
    end
    
    subgraph "Analytics"
        PostHog[PostHog]
        AnalyticsDB[(Analytics DB)]
    end
    
    subgraph "Logging"
        VercelLogs[Vercel Logs]
        ConsoleLogs[Console Logs]
    end
    
    subgraph "Health Checks"
        HealthAPI[/api/health]
        StatusPage[Status Page]
    end
    
    NextJS --> Sentry
    API --> Sentry
    tRPC --> Sentry
    NextJS --> PostHog
    API --> VercelLogs
    NextJS --> ErrorDB
    NextJS --> HealthAPI
```

### Key Features

- **Error Tracking** - Sentry for error capture and analysis
- **Product Analytics** - PostHog for user behavior tracking
- **Health Checks** - Built-in health endpoints
- **Structured Logging** - Centralized logging system
- **Performance Monitoring** - Response time tracking
- **Custom Error Dashboard** - In-app error management console

---

## Error Tracking (Sentry)

### Overview

Sentry provides real-time error tracking, performance monitoring, and release tracking. The application integrates Sentry for both client-side and server-side error capture.

### Setup

**1. Create Sentry Project**

1. Go to [sentry.io](https://sentry.io)
2. Sign up or log in
3. Create new project → Select **Next.js**
4. Copy **DSN** from project settings

**2. Configure Environment Variables**

```bash
# Client-side DSN
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Server-side DSN
SENTRY_DSN=https://...@sentry.io/...

# Environment tag
SENTRY_ENVIRONMENT=production
```

**3. Verify Integration**

The Sentry integration is automatically initialized in:
- `apps/web/src/lib/observability/sentry.ts` - Client-side initialization
- `apps/web/src/app/[locale]/layout.tsx` - Root layout integration

### Features

**Error Capture:**
- Unhandled exceptions
- Promise rejections
- React error boundaries
- API route errors
- tRPC errors

**Performance Monitoring:**
- Transaction tracking
- API route performance
- Database query timing
- External API calls

**Release Tracking:**
- Automatic release detection
- Source map upload
- Version tracking

### Usage

**Client-Side Error Tracking:**

```typescript
import { Sentry } from '@/lib/observability/sentry';

// Capture exception
try {
  // Risky code
} catch (error) {
  Sentry.captureException(error);
}

// Capture message
Sentry.captureMessage('Something went wrong', 'warning');

// Add context
Sentry.setUser({ id: user.id, email: user.email });
Sentry.setTag('feature', 'billing');
Sentry.setContext('checkout', { sessionId: '...' });
```

**Server-Side Error Tracking:**

```typescript
import * as Sentry from '@sentry/nextjs';

// In API routes
export async function POST(req: Request) {
  try {
    // API logic
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**React Error Boundaries:**

```typescript
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Configuration

**Client Configuration:**

```typescript
// apps/web/src/lib/observability/sentry.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'production',
  tracesSampleRate: 0.1, // 10% of transactions
  debug: false,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

**Server Configuration:**

```typescript
// apps/web/src/app/api/[...trpc]/route.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'production',
  tracesSampleRate: 0.1,
});
```

### Custom Error Dashboard

The application includes a built-in error dashboard at `/console/errors`:

**Features:**
- View all errors grouped by hash
- Filter by severity, status, organization
- View error details and stack traces
- Resolve errors
- Delete errors (GDPR compliance)

**Access:**
1. Navigate to `/console/errors`
2. Requires admin/console access
3. View error statistics and trends

---

## Analytics (PostHog)

### Overview

PostHog provides product analytics, feature flags, session recordings, and user behavior tracking.

### Setup

**1. Create PostHog Account**

1. Go to [posthog.com](https://posthog.com)
2. Sign up or log in
3. Create new project
4. Copy **Project API Key** and **Host**

**2. Configure Environment Variables**

```bash
# PostHog API key
NEXT_PUBLIC_POSTHOG_KEY=phc_AbCdEf123456...

# PostHog host (default: https://us.i.posthog.com)
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**3. Verify Integration**

PostHog is initialized in:
- `apps/web/src/lib/analytics/posthog.ts` - Client initialization
- `apps/web/src/app/[locale]/layout.tsx` - Root layout integration

### Features

**Event Tracking:**
- Page views (automatic)
- Custom events
- User identification
- Group identification (organizations)

**Session Recordings:**
- User session replays
- Click tracking
- Scroll tracking
- Form interactions

**Feature Flags:**
- A/B testing
- Feature rollouts
- Gradual releases

### Usage

**Track Events:**

```typescript
import { posthog } from '@/lib/analytics/posthog';

// Track page view (automatic)
// No code needed

// Track custom event
posthog.capture('user_signed_up', {
  email: user.email,
  plan: 'pro',
});

// Identify user
posthog.identify(user.id, {
  email: user.email,
  name: user.display_name,
});

// Group identification (organizations)
posthog.group('organization', orgId, {
  name: org.name,
  plan: subscription.plan_name,
});
```

**Server-Side Tracking:**

```typescript
// In API routes or server actions
import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

posthog.capture({
  distinctId: user.id,
  event: 'subscription_created',
  properties: {
    plan: 'pro',
    org_id: orgId,
  },
});
```

**Feature Flags:**

```typescript
import { posthog } from '@/lib/analytics/posthog';

// Check feature flag
const isEnabled = posthog.isFeatureEnabled('new-feature', user.id);

if (isEnabled) {
  // Show new feature
}
```

### Configuration

**Client Configuration:**

```typescript
// apps/web/src/lib/analytics/posthog.ts
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  capture_pageview: true,
  capture_pageleave: true,
  capture_performance: true,
  debug: process.env.NODE_ENV === 'development',
});
```

### Privacy & GDPR

**Respect User Privacy:**

```typescript
// Disable tracking for specific users
if (user.opt_out_analytics) {
  posthog.opt_out_capturing();
}

// Clear user data
posthog.reset();
```

---

## Health Checks

### Overview

Health check endpoints allow you to monitor application status, database connectivity, and external service availability.

### Health Check Endpoint

**Route:** `/api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-27T12:00:00Z",
  "services": {
    "database": "ok",
    "stripe": "ok"
  }
}
```

### Implementation

```typescript
// apps/web/src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const checks = {
    database: 'unknown',
    stripe: 'unknown',
  };

  // Check database
  try {
    const supabase = createClient();
    await supabase.from('users').select('id').limit(1);
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
  }

  // Check Stripe
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    await stripe.products.list({ limit: 1 });
    checks.stripe = 'ok';
  } catch (error) {
    checks.stripe = 'error';
  }

  const status = Object.values(checks).every(s => s === 'ok') ? 'ok' : 'degraded';

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    services: checks,
  });
}
```

### Monitoring Health Checks

**Vercel Cron Job:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**External Monitoring:**

Use services like:
- **UptimeRobot** - Free uptime monitoring
- **Pingdom** - Advanced monitoring
- **StatusCake** - Status page integration

**Setup Example (UptimeRobot):**
1. Create account at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor → HTTP(s)
3. URL: `https://yourdomain.com/api/health`
4. Interval: 5 minutes
5. Alert on: Status not 200

---

## Logging

### Overview

The application uses structured logging for debugging, monitoring, and troubleshooting.

### Logging Levels

- **ERROR** - Critical errors requiring attention
- **WARN** - Warnings that may indicate issues
- **INFO** - Informational messages
- **DEBUG** - Detailed debugging information

### Client-Side Logging

**Error Logger:**

```typescript
import { logClientError } from '@/lib/errors/client-logger';

// Log client error
logClientError(error, {
  orgId: orgId,
  severity: 'error',
  pageUrl: window.location.href,
  metadata: { component: 'CheckoutForm' },
});
```

**Usage Hook:**

```typescript
import { useErrorTracking } from '@/hooks/useErrorTracking';

function Component() {
  useErrorTracking({ orgId, enabled: true });
  // Automatically tracks unhandled errors
}
```

### Server-Side Logging

**Structured Logger:**

```typescript
import { logger } from '@/lib/logging/logger';

// Log messages
logger.error('Database connection failed', { error });
logger.warn('Rate limit approaching', { userId });
logger.info('User signed up', { userId, email });
logger.debug('Query executed', { query, duration });
```

**tRPC Logging:**

```typescript
// Automatic logging in tRPC middleware
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;
  
  logger.info('tRPC call', { path, type, duration });
  return result;
});
```

### Log Aggregation

**Vercel Logs:**

- View logs in Vercel dashboard
- Filter by function, route, or time
- Export logs for analysis

**Access:**
1. Go to **Deployments → [Deployment] → Functions**
2. View real-time logs
3. Filter by route or search

**External Log Aggregation:**

Consider using:
- **Datadog** - Comprehensive logging and monitoring
- **LogRocket** - Session replay and logging
- **Axiom** - Fast log aggregation

---

## Performance Monitoring

### Overview

Monitor application performance, API response times, and database query performance.

### Sentry Performance Monitoring

**Transaction Tracking:**

```typescript
import * as Sentry from '@sentry/nextjs';

// Track API route performance
export async function POST(req: Request) {
  const transaction = Sentry.startTransaction({
    op: 'http.server',
    name: 'POST /api/checkout',
  });

  try {
    // API logic
    transaction.setStatus('ok');
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}
```

**Database Query Tracking:**

```typescript
const start = Date.now();
const { data } = await supabase.from('records').select('*');
const duration = Date.now() - start;

Sentry.addBreadcrumb({
  category: 'db.query',
  message: 'SELECT records',
  data: { duration, rowCount: data?.length },
});
```

### Custom Performance Metrics

**API Response Times:**

```typescript
// Middleware to track response times
export async function middleware(req: NextRequest) {
  const start = Date.now();
  const response = await next();
  const duration = Date.now() - start;

  // Log slow requests
  if (duration > 1000) {
    logger.warn('Slow API request', {
      path: req.nextUrl.pathname,
      duration,
    });
  }

  return response;
}
```

**Database Performance:**

```typescript
// Track slow queries
const slowQueryThreshold = 500; // ms

const start = Date.now();
const { data } = await supabase.from('records').select('*');
const duration = Date.now() - start;

if (duration > slowQueryThreshold) {
  logger.warn('Slow database query', {
    query: 'SELECT * FROM records',
    duration,
    rowCount: data?.length,
  });
}
```

---

## Alerting

### Sentry Alerts

**Setup Alerts:**

1. Go to Sentry dashboard
2. Navigate to **Alerts → Create Alert**
3. Configure conditions:
   - Error rate threshold
   - Error count threshold
   - Affected users threshold
4. Set notification channels:
   - Email
   - Slack
   - PagerDuty
   - Webhooks

**Example Alert Rules:**

- **Critical Errors:** Alert when error rate > 10/min
- **New Error Types:** Alert on new error types
- **Performance Degradation:** Alert when P95 latency > 2s

### PostHog Alerts

**Setup Alerts:**

1. Go to PostHog dashboard
2. Navigate to **Insights → Create Alert**
3. Configure metrics:
   - User signups drop
   - Feature usage decline
   - Conversion rate changes
4. Set notification channels

### Custom Alerts

**Health Check Monitoring:**

```typescript
// Cron job to check health
export async function GET(req: Request) {
  const health = await fetch('https://yourdomain.com/api/health');
  const data = await health.json();

  if (data.status !== 'ok') {
    // Send alert
    await sendAlert({
      service: 'health-check',
      status: data.status,
      services: data.services,
    });
  }
}
```

---

## Dashboard Setup

### Sentry Dashboard

**Key Metrics to Monitor:**

1. **Error Rate** - Errors per minute
2. **Affected Users** - Users experiencing errors
3. **Performance** - P50, P95, P99 response times
4. **Release Health** - Errors by release version

**Custom Dashboards:**

1. Go to **Dashboards → Create Dashboard**
2. Add widgets:
   - Error count over time
   - Top errors
   - Performance metrics
   - Release comparison

### PostHog Dashboard

**Key Metrics to Monitor:**

1. **Active Users** - DAU, MAU
2. **Feature Usage** - Feature adoption rates
3. **Funnels** - Conversion funnels
4. **Retention** - User retention curves

**Custom Dashboards:**

1. Go to **Dashboards → New Dashboard**
2. Add insights:
   - User signups
   - Feature usage
   - Conversion rates
   - Retention metrics

### Custom Error Dashboard

**In-App Dashboard:**

Access at `/console/errors`:

- **Error List** - All errors with filters
- **Error Details** - Stack traces and metadata
- **Error Statistics** - Trends and counts
- **Resolution** - Mark errors as resolved

---

## Troubleshooting

### Issue: Sentry not capturing errors

**Symptoms:**
- Errors occur but don't appear in Sentry
- No events in Sentry dashboard

**Solutions:**
1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Check DSN format (should start with `https://`)
3. Verify Sentry initialization in code
4. Check browser console for Sentry errors
5. Ensure not in development mode (unless explicitly enabled)

### Issue: PostHog not tracking events

**Symptoms:**
- No events in PostHog dashboard
- Page views not recorded

**Solutions:**
1. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set correctly
2. Check PostHog host URL is correct
3. Verify PostHog initialization in code
4. Check browser console for PostHog errors
5. Ensure not blocked by ad blockers

### Issue: Health check failing

**Symptoms:**
- `/api/health` returns error status
- Services showing as "error"

**Solutions:**
1. Check database connectivity
2. Verify Stripe API keys are valid
3. Check external service status
4. Review health check implementation
5. Check Vercel function logs

### Issue: High error rate

**Symptoms:**
- Many errors in Sentry
- Users reporting issues

**Solutions:**
1. Review error trends in Sentry
2. Identify common error patterns
3. Check for recent deployments
4. Review database query performance
5. Check external service status

### Issue: Performance degradation

**Symptoms:**
- Slow page loads
- High API response times

**Solutions:**
1. Check Sentry performance metrics
2. Review slow database queries
3. Check external API response times
4. Review Vercel function logs
5. Check for resource limits

---

## Best Practices

### 1. Error Tracking

- ✅ Capture all unhandled errors
- ✅ Add context to errors (user, org, feature)
- ✅ Filter sensitive data before sending
- ✅ Set up alerts for critical errors
- ✅ Review errors regularly

### 2. Analytics

- ✅ Track key user actions
- ✅ Identify users and organizations
- ✅ Use feature flags for gradual rollouts
- ✅ Respect user privacy preferences
- ✅ Review analytics regularly

### 3. Monitoring

- ✅ Set up health checks
- ✅ Monitor error rates
- ✅ Track performance metrics
- ✅ Set up alerts for critical issues
- ✅ Review dashboards regularly

### 4. Logging

- ✅ Use structured logging
- ✅ Include relevant context
- ✅ Log at appropriate levels
- ✅ Don't log sensitive data
- ✅ Rotate logs regularly

---

## Next Steps

- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Environment Variables:** [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
- **Architecture:** [../02_ARCHITECTURE/ARCHITECTURE.md](../02_ARCHITECTURE/ARCHITECTURE.md)
- **Development Guide:** [../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md](../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md)

---

**Last Updated:** 2025-01-27
