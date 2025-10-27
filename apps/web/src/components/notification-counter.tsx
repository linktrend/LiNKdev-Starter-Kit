'use client';

import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Database } from '@starter/types';

interface NotificationCounterProps {
  className?: string;
}

/**
 * Real-time notification counter component
 * Shows the count of pending notifications for the current organization
 */
export function NotificationCounter({ className }: NotificationCounterProps) {
  const params = useParams();
  const orgId = params?.orgId as string;
  const [notificationCount, setNotificationCount] = useState(0);

  // Real-time subscription for notifications outbox
  const { isConnected, error } = useRealtimeSubscription({
    table: 'notifications_outbox',
    orgId,
    enabled: !!orgId,
    onInsert: useCallback((payload: RealtimePostgresChangesPayload<Database['public']['Tables']['notifications_outbox']['Row']>) => {
      console.log('New notification received:', payload);
      if (payload.new) {
        setNotificationCount(prev => prev + 1);
      }
    }, []),
    onUpdate: useCallback((payload: RealtimePostgresChangesPayload<Database['public']['Tables']['notifications_outbox']['Row']>) => {
      // If notification is marked as delivered, decrease count
      const newRecord = payload.new as Database['public']['Tables']['notifications_outbox']['Row'];
      const oldRecord = payload.old as Database['public']['Tables']['notifications_outbox']['Row'];
      if (newRecord?.delivered_at && !oldRecord?.delivered_at) {
        setNotificationCount(prev => Math.max(0, prev - 1));
      }
    }, []),
  });

  if (!orgId) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Bell className="h-5 w-5 text-muted-foreground" />
      {notificationCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {notificationCount > 99 ? '99+' : notificationCount}
        </Badge>
      )}
      {error && (
        <div className="absolute -bottom-6 left-0 text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}
