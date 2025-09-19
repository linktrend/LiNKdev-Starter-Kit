// Offline fallback store for Automation Bridge
// Used when TEMPLATE_OFFLINE=1 or Supabase is not configured

import { OutboxEvent } from '../automation/outbox';

interface AutomationStore {
  outbox: OutboxEvent[];
  stats: {
    total: number;
    delivered: number;
    pending: number;
    failed: number;
  };
}

class InMemoryAutomationStore {
  private store: AutomationStore = {
    outbox: [],
    stats: {
      total: 0,
      delivered: 0,
      pending: 0,
      failed: 0,
    },
  };

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some sample events for template mode
    const sampleEvents: OutboxEvent[] = [
      {
        id: 'evt-1',
        org_id: 'org-1',
        event: 'reminder_created',
        payload: {
          reminder_id: 'rem-1',
          title: 'Review quarterly report',
          priority: 'high',
          due_at: '2024-01-15T09:00:00Z',
          metadata: { event_type: 'reminder_created' },
        },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        delivered_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        attempt_count: 1,
      },
      {
        id: 'evt-2',
        org_id: 'org-1',
        event: 'org_created',
        payload: {
          org_id: 'org-1',
          metadata: { event_type: 'org_created' },
        },
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        attempt_count: 0,
      },
      {
        id: 'evt-3',
        org_id: 'org-2',
        event: 'record_created',
        payload: {
          record_id: 'rec-1',
          record_type: 'contact',
          metadata: { event_type: 'record_created' },
        },
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        attempt_count: 2,
        error: 'Connection timeout',
        next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      },
    ];

    this.store.outbox = sampleEvents;
    this.updateStats();
  }

  private updateStats() {
    const total = this.store.outbox.length;
    const delivered = this.store.outbox.filter(e => e.delivered_at).length;
    const failed = this.store.outbox.filter(e => e.attempt_count >= 8 && !e.delivered_at).length;
    const pending = total - delivered - failed;

    this.store.stats = { total, delivered, pending, failed };
  }

  // Enqueue an event
  enqueueEvent(orgId: string, event: string, payload: Record<string, any>): string {
    const eventId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newEvent: OutboxEvent = {
      id: eventId,
      org_id: orgId,
      event,
      payload,
      created_at: new Date().toISOString(),
      attempt_count: 0,
    };
    
    this.store.outbox.push(newEvent);
    this.updateStats();
    
    console.log('AUTOMATION STORE: Event enqueued (offline mode)', {
      eventId,
      event,
      orgId,
    });
    
    return eventId;
  }

  // Get pending events
  getPendingEvents(limit = 50): OutboxEvent[] {
    const now = new Date();
    
    return this.store.outbox
      .filter(event => {
        if (event.delivered_at) return false;
        if (event.attempt_count >= 8) return false;
        if (event.next_retry_at) {
          return new Date(event.next_retry_at) <= now;
        }
        return true;
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, limit);
  }

  // Simulate delivery of an event
  async deliverEvent(eventId: string): Promise<{ success: boolean; error?: string; statusCode?: number; latencyMs: number }> {
    const event = this.store.outbox.find(e => e.id === eventId);
    if (!event) {
      return { success: false, error: 'Event not found', latencyMs: 0 };
    }

    const startTime = Date.now();
    
    // Simulate delivery with 90% success rate
    const success = Math.random() > 0.1;
    const latencyMs = Date.now() - startTime;
    
    if (success) {
      // Mark as delivered
      event.delivered_at = new Date().toISOString();
      event.error = undefined;
      event.next_retry_at = undefined;
      
      console.log('AUTOMATION STORE: Event delivered successfully (simulated)', {
        eventId,
        latencyMs,
      });
      
      this.updateStats();
      
      return { success: true, statusCode: 200, latencyMs };
    } else {
      // Simulate failure
      event.attempt_count += 1;
      event.error = 'Simulated delivery failure';
      
      // Calculate next retry time
      const backoffDelays = [60, 300, 900, 3600, 21600, 86400, 86400, 86400];
      const delaySeconds = backoffDelays[Math.min(event.attempt_count - 1, backoffDelays.length - 1)];
      event.next_retry_at = new Date(Date.now() + delaySeconds * 1000).toISOString();
      
      console.log('AUTOMATION STORE: Event delivery failed (simulated)', {
        eventId,
        attemptCount: event.attempt_count,
        error: event.error,
        nextRetryAt: event.next_retry_at,
        latencyMs,
      });
      
      this.updateStats();
      
      return { 
        success: false, 
        error: event.error, 
        statusCode: 500, 
        latencyMs 
      };
    }
  }

  // Process all pending events
  async processPendingEvents(): Promise<{ processed: number; successful: number; failed: number }> {
    const pendingEvents = this.getPendingEvents();
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    console.log('AUTOMATION STORE: Processing pending events (offline mode)', {
      count: pendingEvents.length,
    });
    
    for (const event of pendingEvents) {
      const result = await this.deliverEvent(event.id);
      processed++;
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }
    
    console.log('AUTOMATION STORE: Batch processing complete (offline mode)', {
      processed,
      successful,
      failed,
    });
    
    return { processed, successful, failed };
  }

  // Get statistics
  getStats(orgId?: string) {
    let events = this.store.outbox;
    
    if (orgId) {
      events = events.filter(e => e.org_id === orgId);
    }
    
    const total = events.length;
    const delivered = events.filter(e => e.delivered_at).length;
    const failed = events.filter(e => e.attempt_count >= 8 && !e.delivered_at).length;
    const pending = total - delivered - failed;
    
    return {
      total,
      delivered,
      pending,
      failed,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
    };
  }

  // Get all events (for debugging)
  getAllEvents(orgId?: string): OutboxEvent[] {
    if (orgId) {
      return this.store.outbox.filter(e => e.org_id === orgId);
    }
    return [...this.store.outbox];
  }

  // Clear all events (for testing)
  clearAllEvents() {
    this.store.outbox = [];
    this.updateStats();
  }
}

// Export singleton instance
export const automationStore = new InMemoryAutomationStore();
