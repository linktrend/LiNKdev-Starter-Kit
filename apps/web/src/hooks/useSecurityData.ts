'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrgMembers, getActiveSessions, getSecurityEvents, getSecurityStats } from '@/app/actions/security';
import type { OrgMember } from '@/components/console/UserManagementTable';
import type { ActiveSession } from '@/components/console/ActiveSessionsList';
import type { SecurityEvent } from '@/components/console/SecurityEventsList';

interface SecurityStats {
  last24h: number;
  last7d: number;
  last30d: number;
}

interface UseSecurityDataOptions {
  orgId: string;
  autoRefreshSessions?: boolean;
  sessionRefreshInterval?: number; // in milliseconds
}

interface UseSecurityDataReturn {
  // Data
  members: OrgMember[];
  sessions: ActiveSession[];
  events: SecurityEvent[];
  stats: SecurityStats | null;

  // Loading states
  isLoadingMembers: boolean;
  isLoadingSessions: boolean;
  isLoadingEvents: boolean;
  isLoadingStats: boolean;

  // Errors
  membersError: string | null;
  sessionsError: string | null;
  eventsError: string | null;
  statsError: string | null;

  // Refresh functions
  refreshMembers: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export function useSecurityData({
  orgId,
  autoRefreshSessions = true,
  sessionRefreshInterval = 30000, // 30 seconds
}: UseSecurityDataOptions): UseSecurityDataReturn {
  // Members state
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  // Events state
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch members
  const refreshMembers = useCallback(async () => {
    if (!orgId) return;

    setIsLoadingMembers(true);
    setMembersError(null);

    try {
      const result = await getOrgMembers({ orgId });
      if (result.success && result.members) {
        setMembers(result.members as any);
      } else {
        setMembersError(result.error || 'Failed to load members');
      }
    } catch (error) {
      setMembersError(error instanceof Error ? error.message : 'Failed to load members');
    } finally {
      setIsLoadingMembers(false);
    }
  }, [orgId]);

  // Fetch sessions
  const refreshSessions = useCallback(async () => {
    if (!orgId) return;

    setIsLoadingSessions(true);
    setSessionsError(null);

    try {
      const result = await getActiveSessions({ orgId });
      if (result.success && result.sessions) {
        setSessions(result.sessions);
      } else {
        setSessionsError(result.error || 'Failed to load sessions');
      }
    } catch (error) {
      setSessionsError(error instanceof Error ? error.message : 'Failed to load sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  }, [orgId]);

  // Fetch events
  const refreshEvents = useCallback(async () => {
    if (!orgId) return;

    setIsLoadingEvents(true);
    setEventsError(null);

    try {
      const result = await getSecurityEvents({
        orgId,
        limit: 50,
        offset: 0,
      });
      if (result.success && result.events) {
        setEvents(result.events);
      } else {
        setEventsError(result.error || 'Failed to load events');
      }
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : 'Failed to load events');
    } finally {
      setIsLoadingEvents(false);
    }
  }, [orgId]);

  // Fetch stats
  const refreshStats = useCallback(async () => {
    if (!orgId) return;

    setIsLoadingStats(true);
    setStatsError(null);

    try {
      const result = await getSecurityStats({ orgId });
      if (result.success && result.stats) {
        setStats(result.stats);
      } else {
        setStatsError(result.error || 'Failed to load stats');
      }
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : 'Failed to load stats');
    } finally {
      setIsLoadingStats(false);
    }
  }, [orgId]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshMembers(),
      refreshSessions(),
      refreshEvents(),
      refreshStats(),
    ]);
  }, [refreshMembers, refreshSessions, refreshEvents, refreshStats]);

  // Initial data load
  useEffect(() => {
    if (orgId) {
      // Call individual refresh functions to avoid dependency on refreshAll
      refreshMembers();
      refreshSessions();
      refreshEvents();
      refreshStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]); // Only run on orgId change

  // Auto-refresh sessions
  useEffect(() => {
    if (!autoRefreshSessions || !orgId) return;

    const interval = setInterval(() => {
      refreshSessions();
    }, sessionRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshSessions, orgId, sessionRefreshInterval, refreshSessions]);

  return {
    // Data
    members,
    sessions,
    events,
    stats,

    // Loading states
    isLoadingMembers,
    isLoadingSessions,
    isLoadingEvents,
    isLoadingStats,

    // Errors
    membersError,
    sessionsError,
    eventsError,
    statsError,

    // Refresh functions
    refreshMembers,
    refreshSessions,
    refreshEvents,
    refreshStats,
    refreshAll,
  };
}
