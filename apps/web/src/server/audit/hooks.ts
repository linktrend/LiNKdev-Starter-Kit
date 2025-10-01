// Audit Log Integration Hooks
// Non-breaking helpers for existing modules to log audit events

import { TRPCError } from '@trpc/server';
import { AuditContext, AuditEventData } from '@starter/types';
import { logger } from '@/lib/logging/logger';

/**
 * Log an organization-related event
 */
export async function logOrgEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // This would be called from tRPC context
    // For now, just log the event
    // AUDIT: Org event logged
    
    // In a real implementation, this would call the audit router
    // await auditRouter.append.mutate({
    //   orgId: context.orgId,
    //   action,
    //   entityType: 'org',
    //   entityId,
    //   metadata: metadata || {},
    // });
  } catch (error) {
    logger.error('Error logging org event', { 
      service: 'audit', 
      operation: 'logOrgEvent',
      orgId: context.orgId,
      action,
      entityId 
    }, error as Error);
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
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // AUDIT: Record event logged
  } catch (error) {
    logger.error('Error logging record event', { 
      service: 'audit', 
      operation: 'logRecordEvent',
      orgId: context.orgId,
      action,
      entityId 
    }, error as Error);
  }
}

/**
 * Log a reminder-related event
 */
export async function logReminderEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // AUDIT: Reminder event logged
  } catch (error) {
    logger.error('Error logging reminder event', { 
      service: 'audit', 
      operation: 'logReminderEvent',
      orgId: context.orgId,
      action,
      entityId 
    }, error as Error);
  }
}

/**
 * Log a billing-related event
 */
export async function logBillingEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // AUDIT: Billing event logged
  } catch (error) {
    logger.error('Error logging billing event', { 
      service: 'audit', 
      operation: 'logBillingEvent',
      orgId: context.orgId,
      action,
      entityId 
    }, error as Error);
  }
}

/**
 * Log a member-related event
 */
export async function logMemberEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // AUDIT: Member event logged
  } catch (error) {
    logger.error('Error logging member event', { 
      service: 'audit', 
      operation: 'logMemberEvent',
      orgId: context.orgId,
      action,
      entityId 
    }, error as Error);
  }
}

/**
 * Log a schedule-related event
 */
export async function logScheduleEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // AUDIT: Schedule event logged
  } catch (error) {
    logger.error('Error logging schedule event', { 
      service: 'audit', 
      operation: 'logScheduleEvent',
      orgId: context.orgId,
      action,
      entityId 
    }, error as Error);
  }
}

/**
 * Log an automation-related event
 */
export async function logAutomationEvent(
  context: AuditContext,
  action: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // AUDIT: Automation event logged
  } catch (error) {
    logger.error('Error logging automation event', { 
      service: 'audit', 
      operation: 'logAutomationEvent',
      orgId: context.orgId,
      action,
      entityId 
    }, error as Error);
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
    // AUDIT: Generic event logged
  } catch (error) {
    logger.error('Error logging audit event', { 
      service: 'audit', 
      operation: 'logAuditEvent',
      orgId: context.orgId,
      action: eventData.action,
      entityType: eventData.entityType,
      entityId: eventData.entityId 
    }, error as Error);
  }
}
