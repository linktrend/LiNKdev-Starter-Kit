# Automation Bridge (n8n Integration)

The Automation Bridge provides reliable event delivery to n8n and other external automation systems. It uses an outbox pattern with retry logic and HMAC signing for secure webhook delivery.

## Features

- **Reliable Delivery**: Outbox pattern with exponential backoff retry
- **HMAC Security**: Signed webhooks with timestamp validation
- **Template Mode**: Works offline with in-memory store
- **Analytics**: Delivery attempt/success/failure tracking
- **Cron Integration**: Scheduled delivery processing

## Environment Variables

```bash
# n8n Webhook Integration (Optional - Template works without these)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/hikari
N8N_WEBHOOK_SECRET=your-n8n-webhook-secret

# Cron Security (for automation delivery endpoint)
CRON_SECRET=your-cron-secret

# Template Mode (set to 1 for offline development)
TEMPLATE_OFFLINE=1
```

## API Endpoints

### Cron Delivery Endpoint

**POST** `/api/cron/automation-delivery`

Processes pending events from the outbox. Call this endpoint periodically (e.g., every minute) to deliver events.

**Headers:**
```
Authorization: Bearer your-cron-secret
```

**Response:**
```json
{
  "success": true,
  "message": "Delivery tick completed",
  "processed": 5,
  "successful": 4,
  "failed": 1,
  "duration": 1250,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### n8n Webhook Receiver

**POST** `/api/hooks/n8n`

Receives events from n8n (example implementation). Validates HMAC signature and logs events.

**Headers:**
```
Content-Type: application/json
X-Hikari-Signature: hex-encoded-hmac-signature
X-Hikari-Timestamp: unix-timestamp-seconds
```

## tRPC API

### `automation.enqueue`
Enqueue an event for delivery.

```typescript
const result = await trpc.automation.enqueue.mutate({
  event: 'user_created',
  payload: { user_id: '123', email: 'user@example.com' },
  orgId: 'org-123'
});
```

### `automation.runDeliveryTick`
Manually trigger delivery processing.

```typescript
const result = await trpc.automation.runDeliveryTick.mutate();
```

### `automation.listPending`
List pending events.

```typescript
const result = await trpc.automation.listPending.query({
  orgId: 'org-123',
  limit: 50
});
```

### `automation.getStats`
Get delivery statistics.

```typescript
const stats = await trpc.automation.getStats.query({
  orgId: 'org-123'
});
```

## Event Emission

### Generic Event Emitter

```typescript
import { emitAutomationEvent } from '@/utils/automation/event-emitter';

// Emit any custom event
const eventId = await emitAutomationEvent(
  { supabase, posthog, user: { id: userId } },
  orgId,
  'custom_event',
  { data: 'value' }
);
```

### Convenience Wrappers

```typescript
import { 
  emitReminderEvent, 
  emitOrganizationEvent, 
  emitRecordEvent,
  emitScheduleEvent 
} from '@/utils/automation/event-emitter';

// Reminder events
await emitReminderEvent(context, orgId, 'reminder_created', 'rem-123', 'Review report', 'high');

// Organization events
await emitOrganizationEvent(context, orgId, 'org_created', { name: 'New Org' });

// Record events
await emitRecordEvent(context, orgId, 'record_created', 'rec-123', 'contact');

// Schedule events
await emitScheduleEvent(context, orgId, 'schedule_created', 'sched-123', 'Daily Standup');
```

## Webhook Security

Events are signed using HMAC-SHA256 with the following format:

```
signature = HMAC-SHA256(secret, "${timestamp}.${body}")
```

**HTTP Headers:**
```
Content-Type: application/json
X-Hikari-Signature: a1b2c3d4e5f6... (64 hex characters)
X-Hikari-Timestamp: 1640995200 (unix timestamp)
User-Agent: Hikari-Automation-Bridge/1.0
```

**Timestamp Validation:**
- Rejects requests with timestamp skew > 300 seconds (±5 minutes)
- Uses timing-safe comparison to prevent timing attacks

## Retry Logic

Events are retried with exponential backoff:

1. **1 minute** (1st retry)
2. **5 minutes** (2nd retry)
3. **15 minutes** (3rd retry)
4. **1 hour** (4th retry)
5. **6 hours** (5th retry)
6. **24 hours** (6th, 7th, 8th retries)

Maximum 8 attempts. After 8 attempts, events are marked as failed.

## Offline Mode

When `TEMPLATE_OFFLINE=1` or Supabase is not configured:

- Events are stored in memory
- Delivery is simulated (90% success rate)
- All functionality works without external dependencies
- Perfect for development and template usage

## n8n Workflow Example

Here's a simple n8n workflow to receive Hikari events:

```json
{
  "name": "Hikari Event Receiver",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "hikari",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict"
          },
          "conditions": [
            {
              "id": "signature-valid",
              "leftValue": "={{ $json.headers['x-hikari-signature'] }}",
              "rightValue": "valid-signature-here",
              "operator": {
                "type": "string",
                "operation": "equals"
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "id": "signature-check",
      "name": "Verify Signature",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"success\": true, \"event\": $json.event, \"timestamp\": $json.timestamp } }}",
        "options": {}
      },
      "id": "success-response",
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [680, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"error\": \"Invalid signature\" } }}",
        "responseCode": 401,
        "options": {}
      },
      "id": "error-response",
      "name": "Error Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [680, 400]
    },
    {
      "parameters": {
        "operation": "log",
        "message": "={{ $json }}"
      },
      "id": "log-event",
      "name": "Log Event",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [900, 200]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Verify Signature",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Verify Signature": {
      "main": [
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          },
          {
            "node": "Log Event",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Testing

### Manual Testing

```bash
# Test cron endpoint
curl -X POST http://localhost:3000/api/cron/automation-delivery \
  -H "Authorization: Bearer your-cron-secret"

# Test n8n webhook (with proper signature)
curl -X POST http://localhost:3000/api/hooks/n8n \
  -H "Content-Type: application/json" \
  -H "X-Hikari-Signature: your-signature" \
  -H "X-Hikari-Timestamp: 1640995200" \
  -d '{"event":"test","payload":{"test":true}}'
```

### Unit Tests

```bash
# Run automation tests
pnpm test src/utils/automation/
pnpm test src/server/automation/
```

## Monitoring

The system emits analytics events for monitoring:

- `automation.event_emitted` - Event successfully enqueued
- `automation.event_emit_failed` - Event emission failed
- `automation.delivery_tick` - Delivery batch completed
- `automation.delivery_tick_failed` - Delivery batch failed

Check your analytics dashboard for delivery metrics and error rates.

## Troubleshooting

### Common Issues

1. **Events not delivering**: Check `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET`
2. **Signature validation fails**: Verify timestamp is within 5 minutes
3. **Cron not running**: Ensure `CRON_SECRET` is set and endpoint is called
4. **Template mode issues**: Set `TEMPLATE_OFFLINE=1` for offline development
5. **403 Forbidden on cron**: Missing or incorrect `CRON_SECRET` in Authorization header
6. **Timestamp skew errors**: Check system clock synchronization (±5 min tolerance)

### Debug Logging

Enable debug logging to see detailed event flow:

```bash
DEBUG=1 pnpm dev
```

Look for `AUTOMATION:` prefixed logs in the console.

### n8n Integration Steps

1. **Create Webhook Node** in n8n workflow
2. **Set URL** to your Hikari webhook endpoint: `https://your-app.com/api/hooks/n8n`
3. **Configure Headers** (n8n will receive these automatically):
   - `Content-Type: application/json`
   - `X-Hikari-Signature: [auto-generated]`
   - `X-Hikari-Timestamp: [auto-generated]`
4. **Add Response Node** to return `200 OK` status
5. **Test** with sample payload from Hikari

**Minimal n8n Response Node Configuration:**
```json
{
  "respondWith": "json",
  "responseBody": "={{ { \"success\": true, \"event\": $json.event, \"timestamp\": $json.timestamp } }}",
  "responseCode": 200
}
```
