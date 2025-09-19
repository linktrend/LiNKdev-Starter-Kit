# REST API Usage Guide

Public REST API for Hikari - A comprehensive starter kit for web applications.

## Quickstart

### Authentication

All API requests require:
1. **JWT Bearer Token** in the `Authorization` header
2. **Organization ID** in the `X-Org-ID` header

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "X-Org-ID: org-123" \
     -H "Content-Type: application/json" \
     https://api.hikari.dev/v1/orgs
```

### Base URL

- **Production**: `https://api.hikari.dev/v1`
- **Development**: `http://localhost:3000/api/v1`

## Authentication

### Getting a JWT Token

JWT tokens are obtained through Supabase authentication:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

const token = data.session?.access_token;
```

### Organization Context

Every request must include the organization ID in the `X-Org-ID` header:

```bash
curl -H "X-Org-ID: org-123" \
     https://api.hikari.dev/v1/records
```

## Rate Limiting

API requests are rate limited per IP address and organization:

- **Read operations**: 120 requests/minute
- **Mutating operations**: 30 requests/minute  
- **Billing operations**: 10 requests/minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2024-01-01T12:00:00Z
Retry-After: 60
```

When rate limited, you'll receive a `429` status with retry information.

## Idempotency

Mutating operations (POST, PATCH, DELETE) support idempotency keys:

```bash
curl -X POST \
     -H "Idempotency-Key: unique-key-123" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-Org-ID: org-123" \
     -d '{"name": "New Organization"}' \
     https://api.hikari.dev/v1/orgs
```

**Important**: Use the same idempotency key for retries to ensure the operation is only performed once.

## Pagination

List endpoints support cursor-based pagination:

```bash
# First page
curl "https://api.hikari.dev/v1/records?limit=50"

# Next page using cursor
curl "https://api.hikari.dev/v1/records?limit=50&cursor=next-cursor-value"
```

### Pagination Parameters

- `limit`: Number of items to return (1-100, default: 50)
- `cursor`: Cursor for pagination (returned in previous response)

### Pagination Response

```json
{
  "data": [...],
  "nextCursor": "cursor-value",
  "total": 150
}
```

## API Endpoints

### Organizations

#### List Organizations
```bash
GET /api/v1/orgs
```

**Response:**
```json
[
  {
    "id": "org-123",
    "name": "Acme Corp",
    "owner_id": "user-456",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Organization
```bash
POST /api/v1/orgs
```

**Request:**
```json
{
  "name": "New Organization"
}
```

**Response:**
```json
{
  "id": "org-789",
  "name": "New Organization",
  "owner_id": "user-456",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Records

#### List Records
```bash
GET /api/v1/records?type_id=type-123&q=search&limit=50
```

**Query Parameters:**
- `type_id`: Filter by record type
- `q`: Search query
- `limit`: Number of records (1-100)
- `cursor`: Pagination cursor

#### Create Record
```bash
POST /api/v1/records
```

**Request:**
```json
{
  "type_id": "type-123",
  "org_id": "org-123",
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Get Record
```bash
GET /api/v1/records/{id}
```

#### Update Record
```bash
PATCH /api/v1/records/{id}
```

**Request:**
```json
{
  "data": {
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

#### Delete Record
```bash
DELETE /api/v1/records/{id}
```

### Scheduling

#### List Reminders
```bash
GET /api/v1/reminders?status=pending&priority=high&limit=50
```

**Query Parameters:**
- `record_id`: Filter by record
- `status`: Filter by status (`pending`, `sent`, `completed`, `snoozed`, `cancelled`)
- `priority`: Filter by priority (`low`, `medium`, `high`, `urgent`)
- `q`: Search query

#### Create Reminder
```bash
POST /api/v1/reminders
```

**Request:**
```json
{
  "org_id": "org-123",
  "record_id": "record-456",
  "title": "Follow up with client",
  "notes": "Call about project status",
  "due_at": "2024-01-15T14:00:00Z",
  "priority": "high"
}
```

#### Complete Reminder
```bash
POST /api/v1/reminders/{id}/complete
```

### Billing

#### Get Subscription
```bash
GET /api/v1/billing/subscription
```

**Response:**
```json
{
  "org_id": "org-123",
  "plan": "pro",
  "status": "active",
  "current_period_start": "2024-01-01T00:00:00Z",
  "current_period_end": "2024-02-01T00:00:00Z",
  "trial_end": null,
  "stripe_sub_id": "sub_123",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Create Checkout Session
```bash
POST /api/v1/billing/checkout
```

**Request:**
```json
{
  "org_id": "org-123",
  "plan": "pro",
  "success_url": "https://app.hikari.dev/success",
  "cancel_url": "https://app.hikari.dev/cancel"
}
```

**Response:**
```json
{
  "session_id": "cs_123",
  "url": "https://checkout.stripe.com/...",
  "offline": false
}
```

### Audit Logs

#### List Audit Logs
```bash
GET /api/v1/audit?entity_type=record&action=created&from=2024-01-01T00:00:00Z
```

**Query Parameters:**
- `q`: Search query
- `entity_type`: Filter by entity type (`org`, `record`, `reminder`, `subscription`, `member`, `invite`, `schedule`, `automation`)
- `action`: Filter by action (`created`, `updated`, `deleted`, `completed`, `cancelled`, etc.)
- `actor_id`: Filter by actor ID
- `from`: Filter from date (ISO 8601)
- `to`: Filter to date (ISO 8601)

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human readable error message",
    "details": {
      "field": ["Specific field error"]
    }
  }
}
```

### Common Error Codes

- `validation_error`: Request validation failed
- `invalid_token`: Invalid or expired JWT token
- `org_access_denied`: User not a member of organization
- `resource_not_found`: Requested resource not found
- `rate_limit_exceeded`: Rate limit exceeded
- `internal_error`: Internal server error

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Rate Limited
- `500`: Internal Server Error

## Offline Mode

When running in template mode (`TEMPLATE_OFFLINE=1`), the API returns deterministic mock data:

- All endpoints work without external dependencies
- Mock data is consistent across requests
- Rate limiting is more lenient
- Authentication uses mock context

### Example Offline Response

```json
{
  "data": [...],
  "offline": true
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
class HikariAPI {
  constructor(private token: string, private orgId: string) {}

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://api.hikari.dev/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'X-Org-ID': this.orgId,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  async listRecords(params: { type_id?: string; q?: string; limit?: number } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value.toString());
    });
    
    return this.request(`/records?${searchParams}`);
  }

  async createRecord(data: { type_id: string; data: any }) {
    return this.request('/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Usage
const api = new HikariAPI('your-jwt-token', 'org-123');
const records = await api.listRecords({ type_id: 'contact', limit: 50 });
```

### Python

```python
import requests
from typing import Optional, Dict, Any

class HikariAPI:
    def __init__(self, token: str, org_id: str, base_url: str = "https://api.hikari.dev/v1"):
        self.token = token
        self.org_id = org_id
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {token}",
            "X-Org-ID": org_id,
            "Content-Type": "application/json",
        }

    def request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        response = requests.request(
            method, 
            f"{self.base_url}{endpoint}", 
            headers=self.headers, 
            **kwargs
        )
        response.raise_for_status()
        return response.json()

    def list_records(self, type_id: Optional[str] = None, q: Optional[str] = None, limit: int = 50):
        params = {"limit": limit}
        if type_id:
            params["type_id"] = type_id
        if q:
            params["q"] = q
        
        return self.request("GET", "/records", params=params)

    def create_record(self, type_id: str, data: Dict[str, Any]):
        return self.request("POST", "/records", json={
            "type_id": type_id,
            "data": data
        })

# Usage
api = HikariAPI("your-jwt-token", "org-123")
records = api.list_records(type_id="contact", limit=50)
```

## Webhooks

The API supports webhooks for real-time updates. Configure webhook endpoints in your organization settings.

### Webhook Events

- `record.created`
- `record.updated`
- `record.deleted`
- `reminder.created`
- `reminder.completed`
- `subscription.updated`

### Webhook Payload

```json
{
  "event": "record.created",
  "data": {
    "id": "record-123",
    "type_id": "contact",
    "org_id": "org-123",
    "data": {...}
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## OpenAPI Specification

The complete API specification is available at `/openapi.yml` or view it online at [Swagger UI](https://api.hikari.dev/docs).

## Support

- **Documentation**: [docs.hikari.dev](https://docs.hikari.dev)
- **Support**: [support@hikari.dev](mailto:support@hikari.dev)
- **GitHub**: [github.com/hikari-dev/hikari](https://github.com/hikari-dev/hikari)
