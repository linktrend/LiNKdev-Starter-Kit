// Audit Log Integration Hooks
// Non-breaking helpers for existing modules to log audit events

import { TRPCError } from '@trpc/server';
import { AuditContext, AuditEventData } from '@/types/audit';

/**
 * Log an organization-related event
 */
export async function logOrgEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // This would be called from tRPC context
    // For now, just log the event
    console.log('AUDIT: Org event logged', {
      orgId: context.orgId,
      actorId: context.actorId,
      action,
      entityId,
      metadata,
    });
    
    // In a real implementation, this would call the audit router
    // await auditRouter.append.mutate({
    //   orgId: context.orgId,
    //   action,
    //   entityType: 'org',
    //   entityId,
    //   metadata: metadata || {},
    // });
  } catch (error) {
    console.error('Error logging org event:', error);
    // Don't throw - audit failures shouldn't break main flows
  }
}

/**
 * Log a record-related event
 */
export async function logRecordEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    console.log('AUDIT: Record event logged', {
      orgId: context.orgId,
      actorId: context.actorId,
      action,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error('Error logging record event:', error);
  }
}

/**
 * Log a reminder-related event
 */
export async function logReminderEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    console.log('AUDIT: Reminder event logged', {
      orgId: context.orgId,
      actorId: context.actorId,
      action,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error('Error logging reminder event:', error);
  }
}

/**
 * Log a billing-related event
 */
export async function logBillingEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    console.log('AUDIT: Billing event logged', {
      orgId: context.orgId,
      actorId: context.actorId,
      action,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error('Error logging billing event:', error);
  }
}

/**
 * Log a member-related event
 */
export async function logMemberEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    console.log('AUDIT: Member event logged', {
      orgId: context.orgId,
      actorId: context.actorId,
      action,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error('Error logging member event:', error);
  }
}

/**
 * Log a schedule-related event
 */
export async function logScheduleEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    console.log('AUDIT: Schedule event logged', {
      orgId: context.orgId,
      actorId: context.actorId,
      action,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error('Error logging schedule event:', error);
  }
}

/**
 * Log an automation-related event
 */
export async function logAutomationEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    console.log('AUDIT: Automation event logged', {
      orgId: context.orgId,
      actorId: context.actorId,
      action,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error('Error logging automation event:', error);
  }
}

/**
 * Generic audit log helper
 */
export async function logAuditEvent(
  context: AuditContext,
  eventData: AuditEventData
): Promise<void> {
  try {
    console.log('AUDIT: Generic event logged', {
      orgId: context.orgId,
      actorId: context.actorId,
      ...eventData,
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}
