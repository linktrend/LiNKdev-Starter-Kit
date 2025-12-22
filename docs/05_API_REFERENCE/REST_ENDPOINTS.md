# REST API Endpoints Reference

**Complete documentation of all REST API endpoints, request/response formats, and authentication**

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URLs](#base-urls)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [V1 Endpoints](#v1-endpoints)
   - [Records](#records)
   - [Organizations](#organizations)
   - [Billing](#billing)
   - [Audit](#audit)
   - [Reminders](#reminders)
8. [Utility Endpoints](#utility-endpoints)
   - [Health](#health)
   - [Features](#features)
   - [Users](#users)
   - [Webhooks](#webhooks)
9. [Examples](#examples)

---

## Overview

The REST API provides standard HTTP endpoints for external integrations and services that cannot use tRPC. All REST endpoints internally delegate to tRPC procedures for consistency.

### Key Features

- **Standard HTTP** - RESTful API using standard HTTP methods
- **JSON Format** - All requests and responses use JSON
- **Bearer Token Auth** - JWT token authentication
- **Organization Context** - All operations scoped to organizations
- **Rate Limited** - Built-in rate limiting per endpoint type
- **Type Safe** - Validated inputs and consistent response formats

---

## Authentication

### Required Headers

All REST API requests require:

1. **Authorization Header** - Bearer token
2. **X-Org-ID Header** - Organization ID
3. **Content-Type Header** - `application/json` for POST/PATCH requests

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "X-Org-ID: org-123" \
     -H "Content-Type: application/json" \
     https://api.example.com/v1/records
```

### Getting a JWT Token

JWT tokens are obtained through Supabase authentication:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

const token = data.session?.access_token;
```

### Authentication Errors

- `401 Unauthorized` - Missing or invalid token
- `400 Bad Request` - Missing X-Org-ID header
- `403 Forbidden` - User is not a member of the organization

---

## Base URLs

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

### API Versions

- **V1**: `/api/v1/*` - Stable API version
- **Legacy**: `/api/*` - Utility endpoints (no version prefix)

---

## Response Format

### Success Response

```json
{
  "data": {
    /* Resource data */
  },
  "meta": {
    "cursor": "next-page-cursor",
    "has_more": true,
    "total": 100
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Validation failed",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### HTTP Status Codes

- `200 OK` - Successful GET/PATCH request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Error Handling

### Error Codes

Standard error codes:

- `missing_token` - Authorization header required
- `invalid_token` - Invalid or expired token
- `missing_org_id` - X-Org-ID header required
- `org_access_denied` - User not a member of organization
- `invalid_request` - Invalid request data
- `resource_not_found` - Resource not found
- `resource_conflict` - Resource conflict
- `rate_limit_exceeded` - Rate limit exceeded
- `internal_error` - Internal server error

### Error Response Example

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Validation failed",
    "details": {
      "field": "email",
      "reason": "Invalid email format",
      "value": "not-an-email"
    }
  }
}
```

---

## Rate Limiting

### Rate Limits

Rate limits are applied per endpoint type:

- **GET requests**: 120 requests/minute
- **POST/PATCH/DELETE**: 30 requests/minute
- **Billing endpoints**: 10 requests/minute

### Rate Limit Headers

Responses include rate limit information:

```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T12:01:00Z
Retry-After: 60
```

### Rate Limit Error

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 120,
      "reset_at": "2024-01-01T12:01:00Z",
      "retry_after": 60
    }
  }
}
```

---

## V1 Endpoints

### Records

#### `GET /api/v1/records`

List records with filtering and pagination.

**Query Parameters**:
- `type_id` (string, optional) - Filter by record type
- `org_id` (string, optional) - Filter by organization (defaults to X-Org-ID)
- `user_id` (string, optional) - Filter by user
- `q` (string, optional) - Search query
- `sort_by` (string, optional) - Sort field
- `sort_order` (asc|desc, optional) - Sort order (default: desc)
- `limit` (number, optional) - Results per page (default: 50, max: 100)
- `cursor` (string, optional) - Pagination cursor

**Response**:
```json
{
  "data": [
    {
      "id": "rec-123",
      "type_id": "type-456",
      "org_id": "org-789",
      "user_id": "user-abc",
      "created_by": "user-abc",
      "data": { /* record data */ },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "cursor": "next-cursor",
    "has_more": true,
    "total": 100
  }
}
```

**Example**:
```bash
curl -X GET \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Org-ID: org-123" \
  "https://api.example.com/v1/records?limit=50&sort_by=created_at&sort_order=desc"
```

---

#### `POST /api/v1/records`

Create a new record.

**Request Body**:
```json
{
  "type_id": "type-456",
  "org_id": "org-789",
  "user_id": "user-abc",
  "data": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

**Response**: `201 Created`
```json
{
  "data": {
    "id": "rec-123",
    "type_id": "type-456",
    "org_id": "org-789",
    "user_id": "user-abc",
    "created_by": "user-abc",
    "data": { /* record data */ },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Example**:
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Org-ID: org-123" \
  -H "Content-Type: application/json" \
  -d '{"type_id":"type-456","data":{"name":"My Record"}}' \
  https://api.example.com/v1/records
```

---

#### `GET /api/v1/records/[id]`

Get a single record by ID.

**Path Parameters**:
- `id` (string, required) - Record UUID

**Response**: `200 OK`
```json
{
  "data": {
    "id": "rec-123",
    "type_id": "type-456",
    "org_id": "org-789",
    "user_id": "user-abc",
    "created_by": "user-abc",
    "data": { /* record data */ },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Errors**:
- `404 Not Found` - Record not found

---

#### `PATCH /api/v1/records/[id]`

Update a record.

**Path Parameters**:
- `id` (string, required) - Record UUID

**Request Body**:
```json
{
  "data": {
    "field1": "updated-value1",
    "field2": "updated-value2"
  }
}
```

**Response**: `200 OK` - Updated record object

**Errors**:
- `404 Not Found` - Record not found
- `403 Forbidden` - Insufficient permissions

---

#### `DELETE /api/v1/records/[id]`

Delete a record.

**Path Parameters**:
- `id` (string, required) - Record UUID

**Response**: `200 OK`
```json
{
  "data": {
    "success": true
  }
}
```

**Errors**:
- `404 Not Found` - Record not found
- `403 Forbidden` - Insufficient permissions

---

### Organizations

#### `GET /api/v1/orgs`

List organizations for the authenticated user.

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "org-123",
      "name": "My Organization",
      "owner_id": "user-abc",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### `POST /api/v1/orgs`

Create a new organization.

**Request Body**:
```json
{
  "name": "My Organization"
}
```

**Response**: `201 Created`
```json
{
  "data": {
    "id": "org-123",
    "name": "My Organization",
    "owner_id": "user-abc",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### Billing

#### `POST /api/v1/billing/checkout`

Create a Stripe checkout session.

**Request Body**:
```json
{
  "org_id": "org-123",
  "plan": "pro",
  "success_url": "https://app.example.com/success",
  "cancel_url": "https://app.example.com/cancel"
}
```

**Response**: `201 Created`
```json
{
  "data": {
    "session_id": "cs_test_123",
    "url": "https://checkout.stripe.com/c/pay/cs_test_123"
  }
}
```

**Rate Limit**: 10 requests/minute

---

#### `GET /api/v1/billing/subscription`

Get organization's current subscription.

**Response**: `200 OK`
```json
{
  "data": {
    "org_id": "org-123",
    "plan": "pro",
    "status": "active",
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "trial_end": null,
    "stripe_sub_id": "sub_123",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Errors**:
- `404 Not Found` - No subscription found

**Rate Limit**: 10 requests/minute

---

### Audit

#### `GET /api/v1/audit`

List audit logs with filtering and pagination.

**Query Parameters**:
- `org_id` (string, optional) - Filter by organization (defaults to X-Org-ID)
- `q` (string, optional) - Search query
- `entity_type` (string, optional) - Filter by entity type
- `action` (string, optional) - Filter by action
- `actor_id` (string, optional) - Filter by actor
- `from` (string, optional) - ISO datetime, start date
- `to` (string, optional) - ISO datetime, end date
- `limit` (number, optional) - Results per page (default: 50)
- `cursor` (string, optional) - Pagination cursor

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "audit-123",
      "org_id": "org-789",
      "actor_id": "user-abc",
      "action": "created",
      "entity_type": "record",
      "entity_id": "rec-123",
      "metadata": { /* additional data */ },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "cursor": "next-cursor",
    "has_more": true,
    "total": 100
  }
}
```

**Permissions**: Requires member role or higher

---

### Reminders

#### `GET /api/v1/reminders`

List reminders with filtering.

**Query Parameters**:
- `org_id` (string, optional) - Filter by organization (defaults to X-Org-ID)
- `record_id` (string, optional) - Filter by record
- `status` (string, optional) - Filter by status (pending|sent|completed|snoozed|cancelled)
- `priority` (string, optional) - Filter by priority (low|medium|high|urgent)
- `q` (string, optional) - Search query
- `limit` (number, optional) - Results per page (default: 50)
- `cursor` (string, optional) - Pagination cursor

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "rem-123",
      "org_id": "org-789",
      "record_id": "rec-123",
      "title": "Follow up",
      "notes": "Check status",
      "due_at": "2024-01-15T10:00:00Z",
      "status": "pending",
      "priority": "high",
      "created_by": "user-abc",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "cursor": "next-cursor",
    "has_more": true,
    "total": 50
  }
}
```

---

#### `POST /api/v1/reminders`

Create a new reminder.

**Request Body**:
```json
{
  "org_id": "org-123",
  "record_id": "rec-456",
  "title": "Follow up",
  "notes": "Check status",
  "due_at": "2024-01-15T10:00:00Z",
  "priority": "high"
}
```

**Response**: `201 Created` - Created reminder object

---

#### `POST /api/v1/reminders/[id]/complete`

Mark a reminder as completed.

**Path Parameters**:
- `id` (string, required) - Reminder UUID

**Response**: `200 OK` - Updated reminder object

---

## Utility Endpoints

### Health

#### `GET /api/health`

Check API health status.

**Authentication**: Not required

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

**Example**:
```bash
curl https://api.example.com/api/health
```

---

### Features

#### `GET /api/features/check`

Check feature access for an organization.

**Query Parameters**:
- `feature` (string, required) - Feature key
- `orgId` (string, optional) - Organization ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "reason": null
  }
}
```

**Authentication**: Required (session-based)

---

#### `GET /api/features/usage`

Get feature usage statistics.

**Query Parameters**:
- `orgId` (string, required) - Organization ID
- `feature` (string, optional) - Feature key

**Response**: `200 OK` - Usage statistics

**Authentication**: Required

---

### Users

#### `GET /api/users/search`

Search for users.

**Query Parameters**:
- `q` (string, required) - Search query (min 2, max 50 chars)
- `limit` (number, optional) - Results limit (default: 10, max: 20)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  ]
}
```

**Authentication**: Required (session-based)

**Rate Limit**: Default rate limiter applied

---

### Webhooks

#### `POST /api/webhooks/stripe`

Stripe webhook handler.

**Headers**:
- `stripe-signature` (required) - Stripe webhook signature

**Request Body**: Raw Stripe event payload

**Response**: `200 OK`
```json
{
  "received": true
}
```

**Authentication**: Signature verification (not Bearer token)

**Supported Events**:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

---

#### `POST /api/webhooks/[provider]`

Generic webhook handler for other providers.

**Path Parameters**:
- `provider` (string, required) - Provider name (e.g., "n8n", "zapier")

**Headers**: Provider-specific authentication

**Response**: `200 OK` - Provider-specific response

---

### Errors

#### `GET /api/errors/list`

List error logs (console endpoint).

**Query Parameters**:
- `orgId` (string, required) - Organization ID
- `severity` (string, optional) - Filter by severity
- `resolved` (boolean, optional) - Filter by resolved status
- `userId` (string, optional) - Filter by user
- `pageUrl` (string, optional) - Filter by page URL
- `search` (string, optional) - Search query
- `from` (string, optional) - Start date
- `to` (string, optional) - End date
- `sort` (string, optional) - Sort order (default: newest)
- `limit` (number, optional) - Results per page (default: 25)
- `offset` (number, optional) - Pagination offset (default: 0)

**Response**: `200 OK` - Error list

**Authentication**: Required (session-based)

---

#### `GET /api/errors/[id]`

Get error details by ID.

**Path Parameters**:
- `id` (string, required) - Error UUID

**Response**: `200 OK` - Error details

---

#### `POST /api/errors/resolve`

Mark an error as resolved.

**Request Body**:
```json
{
  "id": "error-123"
}
```

**Response**: `200 OK` - Success response

---

#### `DELETE /api/errors/delete`

Delete an error.

**Request Body**:
```json
{
  "id": "error-123"
}
```

**Response**: `200 OK` - Success response

---

#### `GET /api/errors/stats`

Get error statistics.

**Query Parameters**:
- `orgId` (string, required) - Organization ID
- `from` (string, optional) - Start date
- `to` (string, optional) - End date

**Response**: `200 OK` - Error statistics

---

## Examples

### Complete Example: Create and List Records

```bash
# 1. Authenticate and get token
TOKEN=$(curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  https://api.example.com/auth/login | jq -r '.token')

# 2. Create a record
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Org-ID: org-123" \
  -H "Content-Type: application/json" \
  -d '{
    "type_id": "type-456",
    "data": {
      "name": "My Record",
      "description": "Record description"
    }
  }' \
  https://api.example.com/v1/records

# 3. List records
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Org-ID: org-123" \
  "https://api.example.com/v1/records?limit=50"
```

### JavaScript/TypeScript Example

```typescript
const API_BASE = 'https://api.example.com';

async function createRecord(token: string, orgId: string, data: any) {
  const response = await fetch(`${API_BASE}/v1/records`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Org-ID': orgId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

async function listRecords(token: string, orgId: string, params?: any) {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(
    `${API_BASE}/v1/records?${queryString}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Org-ID': orgId,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

// Usage
const token = 'your-jwt-token';
const orgId = 'org-123';

// Create record
const newRecord = await createRecord(token, orgId, {
  type_id: 'type-456',
  data: { name: 'My Record' },
});

// List records
const records = await listRecords(token, orgId, {
  limit: 50,
  sort_by: 'created_at',
  sort_order: 'desc',
});
```

### Python Example

```python
import requests

API_BASE = 'https://api.example.com'

def create_record(token, org_id, data):
    response = requests.post(
        f'{API_BASE}/v1/records',
        headers={
            'Authorization': f'Bearer {token}',
            'X-Org-ID': org_id,
            'Content-Type': 'application/json',
        },
        json=data,
    )
    response.raise_for_status()
    return response.json()

def list_records(token, org_id, params=None):
    response = requests.get(
        f'{API_BASE}/v1/records',
        headers={
            'Authorization': f'Bearer {token}',
            'X-Org-ID': org_id,
        },
        params=params or {},
    )
    response.raise_for_status()
    return response.json()

# Usage
token = 'your-jwt-token'
org_id = 'org-123'

# Create record
new_record = create_record(token, org_id, {
    'type_id': 'type-456',
    'data': {'name': 'My Record'},
})

# List records
records = list_records(token, org_id, {
    'limit': 50,
    'sort_by': 'created_at',
    'sort_order': 'desc',
})
```

---

## Related Documentation

- [API Overview](./API_OVERVIEW.md) - API architecture and setup
- [tRPC Routers](./TRPC_ROUTERS.md) - tRPC API reference
- [Architecture](../02_ARCHITECTURE/ARCHITECTURE.md) - System architecture
- [Authentication Guide](../04_FEATURES/PERMISSIONS.md) - Authentication & authorization

---

**Last Updated**: 2025-01-17
