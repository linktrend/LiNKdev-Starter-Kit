import { describe, it, expect, beforeEach } from 'vitest';
import { automationStore } from '../automation.store';

describe('Automation Store (Offline)', () => {
  beforeEach(() => {
    // Clear all events before each test
    automationStore.clearAllEvents();
  });

  describe('enqueueEvent', () => {
    it('should enqueue an event successfully', () => {
      const eventId = automationStore.enqueueEvent('org-1', 'test_event', { test: 'data' });
      
      expect(eventId).toMatch(/^offline-\d+-[a-z0-9]+$/);
      
      const events = automationStore.getAllEvents('org-1');
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        org_id: 'org-1',
        event: 'test_event',
        payload: { test: 'data' },
        attempt_count: 0,
      });
    });

    it('should generate unique event IDs', () => {
      const eventId1 = automationStore.enqueueEvent('org-1', 'event1', {});
      const eventId2 = automationStore.enqueueEvent('org-1', 'event2', {});
      
      expect(eventId1).not.toBe(eventId2);
    });
  });

  describe('getPendingEvents', () => {
    it('should return only pending events', () => {
      // Add some events
      automationStore.enqueueEvent('org-1', 'event1', {});
      automationStore.enqueueEvent('org-1', 'event2', {});
      
      // Mark one as delivered
      const events = automationStore.getAllEvents('org-1');
      if (events[0]) {
        events[0].delivered_at = new Date().toISOString();
      }
      
      const pending = automationStore.getPendingEvents();
      expect(pending).toHaveLength(1);
    });

    it('should not return events at max attempts', () => {
      const eventId = automationStore.enqueueEvent('org-1', 'event1', {});
      
      // Simulate max attempts reached
      const events = automationStore.getAllEvents('org-1');
      if (events[0]) {
        events[0].attempt_count = 8;
      }
      
      const pending = automationStore.getPendingEvents();
      expect(pending).toHaveLength(0);
    });

    it('should respect retry timing', () => {
      const eventId = automationStore.enqueueEvent('org-1', 'event1', {});
      
      // Set retry time in the future
      const events = automationStore.getAllEvents('org-1');
      if (events[0]) {
        events[0].attempt_count = 1;
        events[0].next_retry_at = new Date(Date.now() + 1000).toISOString();
      }
      
      const pending = automationStore.getPendingEvents();
      expect(pending).toHaveLength(0);
    });

    it('should respect limit parameter', () => {
      // Add multiple events
      for (let i = 0; i < 10; i++) {
        automationStore.enqueueEvent('org-1', `event${i}`, {});
      }
      
      const pending = automationStore.getPendingEvents(5);
      expect(pending).toHaveLength(5);
    });
  });

  describe('deliverEvent', () => {
    it('should simulate successful delivery', async () => {
      const eventId = automationStore.enqueueEvent('org-1', 'test_event', {});
      
      const result = await automationStore.deliverEvent(eventId);
      
      expect(result.success).toBe(true);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      
      // Check that event was marked as delivered
      const events = automationStore.getAllEvents('org-1');
      expect(events[0].delivered_at).toBeDefined();
    });

    it('should simulate failed delivery', async () => {
      // Mock Math.random to return a value that triggers failure (0.05 < 0.1)
      const originalRandom = Math.random;
      Math.random = () => 0.05;
      
      const eventId = automationStore.enqueueEvent('org-1', 'test_event', {});
      
      const result = await automationStore.deliverEvent(eventId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Simulated delivery failure');
      
      // Check that attempt count was incremented
      const events = automationStore.getAllEvents('org-1');
      expect(events[0].attempt_count).toBe(1);
      expect(events[0].next_retry_at).toBeDefined();
      
      // Restore Math.random
      Math.random = originalRandom;
    });

    it('should return error for non-existent event', async () => {
      const result = await automationStore.deliverEvent('non-existent');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Event not found');
    });
  });

  describe('processPendingEvents', () => {
    it('should process all pending events', async () => {
      // Add some events
      automationStore.enqueueEvent('org-1', 'event1', {});
      automationStore.enqueueEvent('org-1', 'event2', {});
      automationStore.enqueueEvent('org-2', 'event3', {});
      
      const result = await automationStore.processPendingEvents();
      
      expect(result.processed).toBe(3);
      expect(result.successful + result.failed).toBe(3);
    });

    it('should handle mixed success/failure', async () => {
      // Mock Math.random to control success/failure
      const originalRandom = Math.random;
      let callCount = 0;
      Math.random = () => {
        callCount++;
        return callCount % 2 === 0 ? 0.05 : 0.5; // Alternate between failure and success
      };
      
      // Add events
      automationStore.enqueueEvent('org-1', 'event1', {});
      automationStore.enqueueEvent('org-1', 'event2', {});
      
      const result = await automationStore.processPendingEvents();
      
      expect(result.processed).toBe(2);
      expect(result.successful).toBeGreaterThan(0);
      expect(result.failed).toBeGreaterThan(0);
      
      // Restore Math.random
      Math.random = originalRandom;
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      // Add some events
      automationStore.enqueueEvent('org-1', 'event1', {});
      automationStore.enqueueEvent('org-1', 'event2', {});
      automationStore.enqueueEvent('org-2', 'event3', {});
      
      // Mark one as delivered
      const events = automationStore.getAllEvents();
      if (events[0]) {
        events[0].delivered_at = new Date().toISOString();
      }
      
      const stats = automationStore.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.delivered).toBe(1);
      expect(stats.pending).toBe(2);
      expect(stats.failed).toBe(0);
      expect(stats.deliveryRate).toBeCloseTo(33.33, 1);
    });

    it('should filter by organization', () => {
      // Add events for different orgs
      automationStore.enqueueEvent('org-1', 'event1', {});
      automationStore.enqueueEvent('org-2', 'event2', {});
      
      const stats = automationStore.getStats('org-1');
      
      expect(stats.total).toBe(1);
      expect(stats.pending).toBe(1);
    });
  });

  describe('clearAllEvents', () => {
    it('should clear all events', () => {
      // Add some events
      automationStore.enqueueEvent('org-1', 'event1', {});
      automationStore.enqueueEvent('org-2', 'event2', {});
      
      expect(automationStore.getAllEvents()).toHaveLength(2);
      
      automationStore.clearAllEvents();
      
      expect(automationStore.getAllEvents()).toHaveLength(0);
    });
  });
});
