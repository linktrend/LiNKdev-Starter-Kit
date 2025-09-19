import { createServerComponentClient } from '@/utils/supabase/server';
import { signPayload, createWebhookHeaders } from '@/utils/automation/signing';

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const MAX_ATTEMPTS = 8;
const BACKOFF_SCHEDULE = [
  60,      // 1 minute
  300,     // 5 minutes
  900,     // 15 minutes
  3600,    // 1 hour
  21600,   // 6 hours
  86400,   // 24 hours
  86400,   // 24 hours
  86400,   // 24 hours
];

export interface OutboxEvent {
  id: string;
  org_id: string;
  event: string;
  payload: Record<string, any>;
  created_at: string;
  delivered_at?: string;
  attempt_count: number;
  error?: string;
  next_retry_at?: string;
}

export interface DeliveryResult {
  success: boolean;
  error?: string;
  statusCode?: number;
  latencyMs: number;
}

/**
 * Calculate next retry delay based on attempt count
 */
export function calculateNextRetryDelay(attemptCount: number): number {
  if (attemptCount >= MAX_ATTEMPTS) {
    return 0; // No more retries
  }
  
  const delaySeconds = BACKOFF_SCHEDULE[Math.min(attemptCount, BACKOFF_SCHEDULE.length - 1)];
  return delaySeconds * 1000; // Convert to milliseconds
}

/**
 * Check if an event should be retried
 */
export function shouldRetry(event: OutboxEvent): boolean {
  if (event.delivered_at) {
    return false; // Already delivered
  }
  
  if (event.attempt_count >= MAX_ATTEMPTS) {
    return false; // Max attempts reached
  }
  
  if (event.next_retry_at) {
    const nextRetry = new Date(event.next_retry_at);
    const now = new Date();
    return now >= nextRetry;
  }
  
  return true; // First attempt or no retry scheduled
}

/**
 * Enqueue an event to the outbox
 */
export async function enqueueEvent(
  orgId: string,
  event: string,
  payload: Record<string, any>
): Promise<string> {
  const supabase = createServerComponentClient();
  
  const { data, error } = await supabase
    .from('notifications_outbox')
    .insert({
      org_id: orgId,
      event,
      payload,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('AUTOMATION: Failed to enqueue event', error);
    throw new Error(`Failed to enqueue event: ${error.message}`);
  }
  
  console.log('AUTOMATION: Event enqueued', {
    eventId: data.id,
    event,
    orgId,
  });
  
  return data.id;
}

/**
 * Get pending events that should be delivered
 */
export async function getPendingEvents(limit = 50): Promise<OutboxEvent[]> {
  const supabase = createServerComponentClient();
  
  const { data, error } = await supabase
    .from('notifications_outbox')
    .select('*')
    .is('delivered_at', null)
    .lte('attempt_count', MAX_ATTEMPTS)
    .order('created_at', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('AUTOMATION: Failed to get pending events', error);
    throw new Error(`Failed to get pending events: ${error.message}`);
  }
  
  // Filter events that should be retried
  return (data || []).filter(shouldRetry);
}

/**
 * Deliver a single event to the webhook
 */
export async function deliverEvent(event: OutboxEvent): Promise<DeliveryResult> {
  const startTime = Date.now();
  
  if (!WEBHOOK_URL) {
    console.warn('AUTOMATION: No webhook URL configured, simulating delivery');
    return {
      success: true,
      latencyMs: Date.now() - startTime,
    };
  }
  
  try {
    const body = JSON.stringify({
      event: event.event,
      payload: event.payload,
      timestamp: new Date().toISOString(),
    });
    
    const signedPayload = signPayload(body);
    const headers = createWebhookHeaders(signedPayload);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    const latencyMs = Date.now() - startTime;
    const success = response.ok;
    
    if (!success) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('AUTOMATION: Delivery failed', {
        eventId: event.id,
        statusCode: response.status,
        error: errorText,
        latencyMs,
      });
      
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        statusCode: response.status,
        latencyMs,
      };
    }
    
    console.log('AUTOMATION: Event delivered successfully', {
      eventId: event.id,
      statusCode: response.status,
      latencyMs,
    });
    
    return {
      success: true,
      statusCode: response.status,
      latencyMs,
    };
    
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('AUTOMATION: Delivery error', {
      eventId: event.id,
      error: errorMessage,
      latencyMs,
    });
    
    return {
      success: false,
      error: errorMessage,
      latencyMs,
    };
  }
}

/**
 * Update event after delivery attempt
 */
export async function updateEventAfterDelivery(
  eventId: string,
  result: DeliveryResult
): Promise<void> {
  const supabase = createServerComponentClient();
  
  if (result.success) {
    // Mark as delivered
    const { error } = await supabase
      .from('notifications_outbox')
      .update({
        delivered_at: new Date().toISOString(),
        error: null,
      })
      .eq('id', eventId);
    
    if (error) {
      console.error('AUTOMATION: Failed to mark event as delivered', error);
    }
  } else {
    // Update attempt count and schedule next retry
    const { data: eventData } = await supabase
      .from('notifications_outbox')
      .select('attempt_count')
      .eq('id', eventId)
      .single();
    
    if (eventData) {
      const newAttemptCount = eventData.attempt_count + 1;
      const nextRetryDelay = calculateNextRetryDelay(newAttemptCount);
      const nextRetryAt = nextRetryDelay > 0 
        ? new Date(Date.now() + nextRetryDelay).toISOString()
        : null;
      
      const { error } = await supabase
        .from('notifications_outbox')
        .update({
          attempt_count: newAttemptCount,
          error: result.error,
          next_retry_at: nextRetryAt,
        })
        .eq('id', eventId);
      
      if (error) {
        console.error('AUTOMATION: Failed to update event retry info', error);
      }
    }
  }
}

/**
 * Process a batch of pending events
 */
export async function processPendingEvents(): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  const events = await getPendingEvents();
  let processed = 0;
  let successful = 0;
  let failed = 0;
  
  console.log('AUTOMATION: Processing pending events', { count: events.length });
  
  for (const event of events) {
    try {
      const result = await deliverEvent(event);
      await updateEventAfterDelivery(event.id, result);
      
      processed++;
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('AUTOMATION: Error processing event', {
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      processed++;
      failed++;
    }
  }
  
  console.log('AUTOMATION: Batch processing complete', {
    processed,
    successful,
    failed,
  });
  
  return { processed, successful, failed };
}
