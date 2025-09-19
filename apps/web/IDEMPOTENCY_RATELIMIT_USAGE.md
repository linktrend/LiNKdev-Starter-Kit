# Idempotency & Rate Limiting Usage Guide

Comprehensive guide for using idempotency and rate limiting in the Hikari starter kit.

## Overview

The Hikari starter kit includes built-in idempotency and rate limiting for both REST API endpoints and tRPC procedures. This ensures:

- **Idempotency**: Mutating operations can be safely retried without side effects
- **Rate Limiting**: API usage is controlled to prevent abuse and ensure fair access
- **Offline Mode**: Full functionality works in template mode without external dependencies

## Idempotency

### What is Idempotency?

Idempotency ensures that making the same request multiple times has the same effect as making it once. This is crucial for:

- **Retry safety**: Network failures can be safely retried
- **Duplicate prevention**: Accidental double-clicks or retries won't create duplicates
- **Consistency**: Same request always returns same response

### How It Works

1. **Client sends request** with `Idempotency-Key` header
2. **Server checks** if key exists in database/memory
3. **If exists**: Returns cached response (same status + body)
4. **If not exists**: Executes request, stores result, returns response
5. **Key expires** after 24 hours (configurable)

### REST API Usage

#### Sending Idempotency Key

```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "X-Org-ID: org-123" \
     -H "Idempotency-Key: unique-key-123" \
     -H "Content-Type: application/json" \
     -d '{"name": "New Organization"}' \
     https://api.hikari.dev/v1/orgs
```

#### JavaScript/TypeScript

```typescript
const response = await fetch('/api/v1/records', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Org-ID': orgId,
    'Idempotency-Key': 'create-record-' + Date.now(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type_id: 'contact',
    data: { name: 'John Doe' }
  })
});
```

#### Python

```python
import requests
import uuid

response = requests.post(
    'https://api.hikari.dev/v1/records',
    headers={
        'Authorization': f'Bearer {token}',
        'X-Org-ID': org_id,
        'Idempotency-Key': f'create-record-{uuid.uuid4()}',
        'Content-Type': 'application/json',
    },
    json={
        'type_id': 'contact',
        'data': {'name': 'John Doe'}
    }
)
```

### tRPC Usage

#### Client-side

```typescript
import { api } from '@/trpc/react';

// tRPC automatically handles idempotency for mutations
const createRecord = api.records.createRecord.useMutation({
  // Idempotency key is automatically generated
});

// Or provide custom key
const createRecordWithKey = api.records.createRecord.useMutation({
  context: {
    idempotencyKey: 'custom-key-123'
  }
});
```

#### Server-side Context

```typescript
// The middleware automatically extracts idempotency key from context
export const createRecord = protectedProcedure
  .input(createRecordSchema)
  .mutation(async ({ input, ctx }) => {
    // Your mutation logic here
    // Idempotency is handled automatically by middleware
  });
```

### Idempotency Key Best Practices

#### Key Generation

```typescript
// Good: Include relevant identifiers
const key = `create-record-${orgId}-${userId}-${Date.now()}`;

// Good: Include request content hash
const contentHash = crypto.createHash('sha256')
  .update(JSON.stringify(requestBody))
  .digest('hex')
  .substring(0, 8);
const key = `create-record-${orgId}-${contentHash}`;

// Avoid: Random keys (defeats purpose)
const key = Math.random().toString(36); // Don't do this
```

#### Key Scope

- **Per-operation**: Each operation type gets its own key space
- **Per-organization**: Keys are scoped to organizations
- **Per-user**: Keys are scoped to users
- **Time-bound**: Keys expire after 24 hours

#### Error Handling

```typescript
try {
  const response = await fetch('/api/v1/records', {
    method: 'POST',
    headers: {
      'Idempotency-Key': 'create-record-123',
      // ... other headers
    },
    body: JSON.stringify(data)
  });
  
  if (response.status === 409) {
    // Idempotency key conflict - different request with same key
    console.error('Idempotency key already used with different request');
  }
} catch (error) {
  // Handle network errors, retry with same key
}
```

## Rate Limiting

### What is Rate Limiting?

Rate limiting controls how many requests can be made within a time window. This prevents:

- **API abuse**: Malicious or buggy clients overwhelming the server
- **Resource exhaustion**: Protecting server resources
- **Fair usage**: Ensuring all users get fair access

### How It Works

1. **Request arrives** with IP address and organization ID
2. **Rate limiter checks** current usage for `IP:ORG:ROUTE` bucket
3. **If under limit**: Request proceeds, counter incremented
4. **If over limit**: Request blocked with 429 status and retry info
5. **Window resets** after the time period expires

### Rate Limit Headers

All responses include rate limit information:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2024-01-01T12:00:00Z
Retry-After: 60
```

### Per-Route Limits

#### REST API Limits

| Route | Method | Limit | Window |
|-------|--------|-------|--------|
| `/api/v1/orgs` | GET | 60/min | 1 minute |
| `/api/v1/orgs` | POST | 10/min | 1 minute |
| `/api/v1/records` | GET | 120/min | 1 minute |
| `/api/v1/records` | POST | 60/min | 1 minute |
| `/api/v1/records/{id}` | PATCH | 60/min | 1 minute |
| `/api/v1/records/{id}` | DELETE | 30/min | 1 minute |
| `/api/v1/reminders` | GET | 120/min | 1 minute |
| `/api/v1/reminders` | POST | 60/min | 1 minute |
| `/api/v1/billing/subscription` | GET | 30/min | 1 minute |
| `/api/v1/billing/checkout` | POST | 10/min | 1 minute |
| `/api/v1/audit` | GET | 60/min | 1 minute |

#### tRPC Limits

| Procedure | Limit | Window |
|-----------|-------|--------|
| `org.createOrg` | 10/min | 1 minute |
| `org.listOrgs` | 60/min | 1 minute |
| `org.setCurrent` | 120/min | 1 minute |
| `records.createRecord` | 60/min | 1 minute |
| `records.updateRecord` | 60/min | 1 minute |
| `records.deleteRecord` | 30/min | 1 minute |
| `scheduling.createReminder` | 60/min | 1 minute |
| `scheduling.completeReminder` | 120/min | 1 minute |
| `billing.createCheckout` | 10/min | 1 minute |
| `billing.openPortal` | 10/min | 1 minute |
| `audit.list` | 60/min | 1 minute |

### Handling Rate Limits

#### REST API

```typescript
const response = await fetch('/api/v1/records', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Org-ID': orgId,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
});

if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  
  console.log(`Rate limited. Retry after ${retryAfter} seconds`);
  console.log(`Limit: ${limit}, Remaining: ${remaining}`);
  
  // Wait and retry
  await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
  // Retry the request
}
```

#### tRPC

```typescript
const createRecord = api.records.createRecord.useMutation({
  onError: (error) => {
    if (error.data?.code === 'TOO_MANY_REQUESTS') {
      const retryAfter = error.data?.retryAfter;
      console.log(`Rate limited. Retry after ${retryAfter} seconds`);
      
      // Show user-friendly message
      toast.error(`Too many requests. Please wait ${retryAfter} seconds.`);
    }
  }
});
```

### Rate Limit Strategies

#### Exponential Backoff

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        const delay = retryAfter * Math.pow(2, attempt); // Exponential backoff
        
        console.log(`Rate limited. Waiting ${delay} seconds before retry ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
}
```

#### Request Queuing

```typescript
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private rateLimitDelay = 0;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Apply rate limit delay
          if (this.rateLimitDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            this.rateLimitDelay = 0;
          }
          
          const result = await request();
          resolve(result);
        } catch (error) {
          if (error.status === 429) {
            this.rateLimitDelay = parseInt(error.headers?.get('Retry-After') || '60') * 1000;
            // Re-queue the request
            this.queue.unshift(request);
          }
          reject(error);
        }
      });
      
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) await request();
    }
    this.processing = false;
  }
}
```

## Configuration

### Environment Variables

```bash
# Rate Limiting
RATE_LIMIT_DEFAULT_PER_MIN=60
RATE_LIMIT_WINDOW_MS=60000

# Idempotency
IDEMPOTENCY_TTL_MIN=1440  # 24 hours

# Template Mode
TEMPLATE_OFFLINE=1
```

### Custom Rate Limits

```typescript
// Override default rate limits
export const CUSTOM_RATE_LIMITS = {
  '/api/v1/special-endpoint': {
    POST: { limit: 5, windowMs: 60000 }, // 5 req/min
  },
  'special.procedure': {
    POST: { limit: 1, windowMs: 60000 }, // 1 req/min
  },
};
```

## Offline Mode

When `TEMPLATE_OFFLINE=1` or Supabase is not configured:

- **Idempotency**: Uses in-memory store with 24-hour TTL
- **Rate Limiting**: Uses in-memory token bucket
- **Deterministic**: Same behavior across restarts
- **No Database**: No external dependencies required

### Offline Mode Behavior

```typescript
// In offline mode, rate limits are more lenient
const offlineLimits = {
  default: { limit: 1000, windowMs: 60000 }, // 1000 req/min
  strict: { limit: 100, windowMs: 60000 },   // 100 req/min
};

// Idempotency keys are stored in memory
const memoryStore = new Map<string, IdempotencyRecord>();
```

## Monitoring & Debugging

### Rate Limit Headers

Monitor these headers in your responses:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2024-01-01T12:00:00Z
Retry-After: 60
```

### Idempotency Headers

```http
X-Idempotency-Key: idem_abc123_1640995200000
X-Idempotency-Status: cached|executed
```

### Logging

```typescript
// Enable debug logging
console.log('Rate limit check:', {
  bucket: '192.168.1.1:org-123:records.createRecord',
  limit: 60,
  remaining: 45,
  reset: '2024-01-01T12:00:00Z'
});

console.log('Idempotency check:', {
  key: 'idem_abc123_1640995200000',
  cached: true,
  status: 200
});
```

## Best Practices

### Idempotency

1. **Use meaningful keys**: Include operation type and relevant IDs
2. **Include content hash**: Ensure same content = same key
3. **Handle conflicts**: Different content with same key should return 409
4. **Set appropriate TTL**: 24 hours is usually sufficient
5. **Monitor usage**: Track idempotency hit rates

### Rate Limiting

1. **Set appropriate limits**: Balance between usability and protection
2. **Use different limits**: Stricter for sensitive operations
3. **Implement backoff**: Don't retry immediately on 429
4. **Monitor headers**: Track rate limit usage
5. **Graceful degradation**: Handle rate limits gracefully in UI

### General

1. **Test both modes**: Online and offline behavior
2. **Monitor performance**: Track middleware overhead
3. **Handle errors**: Proper error handling for both systems
4. **Document limits**: Make rate limits visible to users
5. **Plan for scale**: Consider distributed rate limiting for production

## Troubleshooting

### Common Issues

#### Idempotency Key Conflicts

**Problem**: Getting 409 errors with idempotency keys
**Solution**: Ensure same key is used for identical requests only

```typescript
// Bad: Different content, same key
const key1 = 'create-record-123';
const request1 = { name: 'John' };
const request2 = { name: 'Jane' }; // Different content!

// Good: Include content in key
const key1 = `create-record-${hash(request1)}`;
const key2 = `create-record-${hash(request2)}`;
```

#### Rate Limit False Positives

**Problem**: Legitimate requests being rate limited
**Solution**: Check if limits are too strict, implement proper backoff

```typescript
// Check current limits
const config = getRateLimitConfigForRoute('/api/v1/records', 'POST');
console.log('Current limit:', config.limit, 'per', config.windowMs, 'ms');
```

#### Memory Usage in Offline Mode

**Problem**: High memory usage with many requests
**Solution**: Implement cleanup for in-memory stores

```typescript
// Cleanup expired entries
setInterval(() => {
  cleanupIdempotencyRecords();
  cleanupRateLimits();
}, 5 * 60 * 1000); // Every 5 minutes
```

### Debug Mode

Enable debug logging:

```typescript
// Set environment variable
process.env.DEBUG_IDEMPOTENCY = '1';
process.env.DEBUG_RATE_LIMIT = '1';

// Or in your code
console.log('Idempotency debug:', {
  key: 'test-key',
  exists: await checkIdempotency(key),
  cached: result.fromCache
});
```

## API Reference

### REST Endpoints

All mutating REST endpoints support idempotency and rate limiting:

- `POST /api/v1/orgs` - Create organization
- `POST /api/v1/records` - Create record
- `PATCH /api/v1/records/{id}` - Update record
- `DELETE /api/v1/records/{id}` - Delete record
- `POST /api/v1/reminders` - Create reminder
- `POST /api/v1/reminders/{id}/complete` - Complete reminder
- `POST /api/v1/billing/checkout` - Create checkout session

### tRPC Procedures

All tRPC mutations automatically include idempotency and rate limiting:

- `org.createOrg`
- `org.updateMemberRole`
- `org.removeMember`
- `org.invite`
- `records.createRecord`
- `records.updateRecord`
- `records.deleteRecord`
- `scheduling.createReminder`
- `scheduling.completeReminder`
- `billing.createCheckout`
- `billing.openPortal`
- `audit.append`

### Configuration Files

- `apps/web/src/server/rest/ratelimit.config.ts` - Rate limit configurations
- `apps/web/src/server/rest/middleware.ts` - tRPC middleware
- `apps/web/src/server/rest/idempotency.ts` - Idempotency utilities
- `apps/web/src/server/rest/ratelimit.ts` - Rate limiting utilities
