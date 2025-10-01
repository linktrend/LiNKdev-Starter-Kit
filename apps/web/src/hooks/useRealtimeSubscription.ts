"use client";

import { useEffect, useState, useRef } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { Database } from '@starter/types';

type TableName = keyof Database['public']['Tables'];
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];

interface UseRealtimeSubscriptionOptions<T extends TableName> {
  table: T;
  orgId: string;
  enabled?: boolean;
  onInsert?: (payload: RealtimePostgresChangesPayload<TableRow<T>>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<TableRow<T>>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<TableRow<T>>) => void;
}

interface UseRealtimeSubscriptionReturn<T extends TableName> {
  data: TableRow<T> | null;
  isConnected: boolean;
  error: string | null;
}

/**
 * Custom hook for real-time subscriptions to Supabase tables with org_id filtering
 * 
 * @param table - The table name to subscribe to
 * @param orgId - Organization ID for multi-tenancy filtering
 * @param enabled - Whether the subscription should be active
 * @param onInsert - Callback for insert events
 * @param onUpdate - Callback for update events  
 * @param onDelete - Callback for delete events
 * @returns Latest data, connection status, and error state
 */
export function useRealtimeSubscription<T extends TableName>({
  table,
  orgId,
  enabled = true,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeSubscriptionOptions<T>): UseRealtimeSubscriptionReturn<T> {
  const [data, setData] = useState<TableRow<T> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<unknown>(null);

  useEffect(() => {
    if (!enabled || !orgId) {
      return;
    }

    const supabase = supabaseBrowser();
    
    // Create subscription with org_id filtering
    const subscription = supabase
      .channel(`realtime-${table}-${orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `org_id=eq.${orgId}`,
        },
        (payload: RealtimePostgresChangesPayload<TableRow<T>>) => {
          // Realtime event received

          // Update local state with the latest data
          if (payload.new) {
            setData(payload.new as TableRow<T>);
          }

          // Call appropriate callback
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe((status) => {
        // Realtime subscription status updated
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'CHANNEL_ERROR') {
          setError('Failed to subscribe to real-time updates');
        } else if (status === 'TIMED_OUT') {
          setError('Subscription timed out');
        } else {
          setError(null);
        }
      });

    subscriptionRef.current = subscription;

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        // Cleaning up realtime subscription
        supabase.removeChannel(subscriptionRef.current as any);
        subscriptionRef.current = null;
      }
    };
  }, [table, orgId, enabled, onInsert, onUpdate, onDelete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        const supabase = supabaseBrowser();
        supabase.removeChannel(subscriptionRef.current as any);
      }
    };
  }, []);

  return {
    data,
    isConnected,
    error,
  };
}
