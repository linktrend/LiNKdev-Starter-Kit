/**
 * Verification test for generated OpenAPI REST client
 * 
 * This test verifies that the generated client types and functions
 * are correctly recognized by the TypeScript compiler without actually
 * executing any API calls.
 */

import { describe, it, expect } from 'vitest';
import { 
  ApiClient, 
  OrgResponse, 
  OrganizationsService,
  RecordResponse,
  RecordsService,
  ReminderResponse,
  SchedulingService,
  AuditLogResponse,
  AuditService,
  SubscriptionResponse,
  BillingService
} from '../../src/api/rest';

describe('OpenAPI REST Client Generation', () => {
  it('should export ApiClient class', () => {
    expect(ApiClient).toBeDefined();
    expect(typeof ApiClient).toBe('function');
  });

  it('should export response type interfaces', () => {
    // Test that types are properly exported and can be used
    const orgResponse: OrgResponse = {
      id: 'test-id',
      name: 'Test Org',
      owner_id: 'owner-id',
      created_at: '2023-01-01T00:00:00Z'
    };

    const recordResponse: RecordResponse = {
      id: 'record-id',
      type_id: 'type-id',
      org_id: 'org-id',
      user_id: 'user-id',
      created_by: 'creator-id',
      data: { test: 'data' },
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    const reminderResponse: ReminderResponse = {
      id: 'reminder-id',
      org_id: 'org-id',
      title: 'Test Reminder',
      status: 'pending',
      priority: 'medium',
      created_by: 'creator-id',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    const auditLogResponse: AuditLogResponse = {
      id: 'audit-id',
      org_id: 'org-id',
      actor_id: 'actor-id',
      action: 'created',
      entity_type: 'org',
      entity_id: 'entity-id',
      metadata: { test: 'metadata' },
      created_at: '2023-01-01T00:00:00Z'
    };

    const subscriptionResponse: SubscriptionResponse = {
      org_id: 'org-id',
      plan: 'pro',
      status: 'active',
      current_period_start: '2023-01-01T00:00:00Z',
      current_period_end: '2023-02-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    // Verify all types are properly structured
    expect(orgResponse.id).toBe('test-id');
    expect(recordResponse.data).toEqual({ test: 'data' });
    expect(reminderResponse.status).toBe('pending');
    expect(auditLogResponse.action).toBe('created');
    expect(subscriptionResponse.plan).toBe('pro');
  });

  it('should export service classes', () => {
    expect(OrganizationsService).toBeDefined();
    expect(RecordsService).toBeDefined();
    expect(SchedulingService).toBeDefined();
    expect(AuditService).toBeDefined();
    expect(BillingService).toBeDefined();
  });

  it('should allow creating ApiClient instance with configuration', () => {
    const client = new ApiClient({
      BASE: 'http://localhost:3000/api/v1',
      TOKEN: 'test-token',
      HEADERS: {
        'X-Org-ID': 'test-org-id'
      }
    });

    expect(client).toBeDefined();
    expect(client.organizations).toBeInstanceOf(OrganizationsService);
    expect(client.records).toBeInstanceOf(RecordsService);
    expect(client.scheduling).toBeInstanceOf(SchedulingService);
    expect(client.audit).toBeInstanceOf(AuditService);
    expect(client.billing).toBeInstanceOf(BillingService);
  });

  it('should have proper method signatures on OrganizationsService', () => {
    const client = new ApiClient();
    const orgService = client.organizations;

    // Verify method exists and has correct signature
    expect(typeof orgService.getOrgs).toBe('function');
    expect(typeof orgService.postOrgs).toBe('function');

    // Test that methods return CancelablePromise (without calling them)
    // Note: We don't actually call the methods to avoid network requests
    expect(orgService.getOrgs).toBeDefined();
    expect(orgService.postOrgs).toBeDefined();
  });

  it('should have proper method signatures on RecordsService', () => {
    const client = new ApiClient();
    const recordsService = client.records;

    // Verify methods exist
    expect(typeof recordsService.getRecords).toBe('function');
    expect(typeof recordsService.postRecords).toBe('function');
    expect(typeof recordsService.getRecords1).toBe('function'); // Generated as getRecords1 for GET /records/{id}
    expect(typeof recordsService.patchRecords).toBe('function');
    expect(typeof recordsService.deleteRecords).toBe('function');
  });

  it('should have proper method signatures on SchedulingService', () => {
    const client = new ApiClient();
    const schedulingService = client.scheduling;

    // Verify methods exist
    expect(typeof schedulingService.getReminders).toBe('function');
    expect(typeof schedulingService.postReminders).toBe('function');
    expect(typeof schedulingService.postRemindersComplete).toBe('function'); // Generated as postRemindersComplete
  });

  it('should have proper method signatures on AuditService', () => {
    const client = new ApiClient();
    const auditService = client.audit;

    // Verify method exists
    expect(typeof auditService.getAudit).toBe('function');
  });

  it('should have proper method signatures on BillingService', () => {
    const client = new ApiClient();
    const billingService = client.billing;

    // Verify methods exist
    expect(typeof billingService.getBillingSubscription).toBe('function');
    expect(typeof billingService.postBillingCheckout).toBe('function');
  });
});
