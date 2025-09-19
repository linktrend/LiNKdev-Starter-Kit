import { enqueueEvent } from '@/server/automation/outbox';
// import { emitAnalyticsEvent } from '@/utils/analytics/posthog';

const isOfflineMode = process.env.TEMPLATE_OFFLINE === '1' || 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface AutomationEventPayload {
  [key: string]: any;
}

export interface AutomationContext {
  supabase?: any;
  posthog?: any;
  user: { id: string };
}

/**
 * Emit an automation event for delivery to n8n
 * This is the main entry point for all automation events
 */
export async function emitAutomationEvent(
  context: AutomationContext,
  orgId: string,
  event: string,
  payload: AutomationEventPayload
): Promise<string> {
  const startTime = Date.now();
  
  try {
    if (isOfflineMode) {
      // Offline mode: simulate event emission
      const eventId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('AUTOMATION: Event emitted (offline mode)', {
        eventId,
        event,
        orgId,
        payload,
      });
      
      // Emit analytics event (commented out for template)
      // if (context.posthog) {
      //   await emitAnalyticsEvent(context.user.id, 'automation.event_emitted', {
      //     org_id: orgId,
      //     event,
      //     event_id: eventId,
      //     mode: 'offline',
      //     latency_ms: Date.now() - startTime,
      //   });
      // }
      
      return eventId;
    }
    
    // Database mode: enqueue event
    const eventId = await enqueueEvent(orgId, event, payload);
    
    console.log('AUTOMATION: Event emitted (database mode)', {
      eventId,
      event,
      orgId,
      payload,
    });
    
    // Emit analytics event (commented out for template)
    // if (context.posthog) {
    //   await emitAnalyticsEvent(context.user.id, 'automation.event_emitted', {
    //     org_id: orgId,
    //     event,
    //     event_id: eventId,
    //     mode: 'database',
    //     latency_ms: Date.now() - startTime,
    //   });
    // }
    
    return eventId;
    
  } catch (error) {
    console.error('AUTOMATION: Failed to emit event', {
      event,
      orgId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Emit failure analytics (commented out for template)
    // if (context.posthog) {
    //   await emitAnalyticsEvent(context.user.id, 'automation.event_emit_failed', {
    //     org_id: orgId,
    //     event,
    //     error: error instanceof Error ? error.message : 'Unknown error',
    //     latency_ms: Date.now() - startTime,
    //   });
    // }
    
    throw error;
  }
}

/**
 * Emit a reminder-related automation event
 * Convenience wrapper for reminder events
 */
export async function emitReminderEvent(
  context: AutomationContext,
  orgId: string,
  event: 'reminder_created' | 'reminder_updated' | 'reminder_completed' | 'reminder_snoozed' | 'reminder_sent' | 'reminder_cancelled',
  reminderId: string,
  title: string,
  priority: string,
  dueAt?: string,
  metadata?: Record<string, any>
): Promise<string> {
  const payload: AutomationEventPayload = {
    reminder_id: reminderId,
    title,
    priority,
    due_at: dueAt,
    metadata: {
      event_type: event,
      ...metadata,
    },
  };
  
  return emitAutomationEvent(context, orgId, event, payload);
}

/**
 * Emit an organization-related automation event
 * Convenience wrapper for organization events
 */
export async function emitOrganizationEvent(
  context: AutomationContext,
  orgId: string,
  event: 'org_created' | 'org_updated' | 'org_deleted' | 'member_added' | 'member_removed' | 'member_role_changed' | 'invite_sent' | 'invite_accepted',
  metadata?: Record<string, any>
): Promise<string> {
  const payload: AutomationEventPayload = {
    org_id: orgId,
    metadata: {
      event_type: event,
      ...metadata,
    },
  };
  
  return emitAutomationEvent(context, orgId, event, payload);
}

/**
 * Emit a record-related automation event
 * Convenience wrapper for record events
 */
export async function emitRecordEvent(
  context: AutomationContext,
  orgId: string,
  event: 'record_created' | 'record_updated' | 'record_deleted',
  recordId: string,
  recordType: string,
  metadata?: Record<string, any>
): Promise<string> {
  const payload: AutomationEventPayload = {
    record_id: recordId,
    record_type: recordType,
    metadata: {
      event_type: event,
      ...metadata,
    },
  };
  
  return emitAutomationEvent(context, orgId, event, payload);
}

/**
 * Emit a schedule-related automation event
 * Convenience wrapper for schedule events
 */
export async function emitScheduleEvent(
  context: AutomationContext,
  orgId: string,
  event: 'schedule_created' | 'schedule_updated' | 'schedule_deleted' | 'schedule_triggered',
  scheduleId: string,
  scheduleName: string,
  metadata?: Record<string, any>
): Promise<string> {
  const payload: AutomationEventPayload = {
    schedule_id: scheduleId,
    schedule_name: scheduleName,
    metadata: {
      event_type: event,
      ...metadata,
    },
  };
  
  return emitAutomationEvent(context, orgId, event, payload);
}
