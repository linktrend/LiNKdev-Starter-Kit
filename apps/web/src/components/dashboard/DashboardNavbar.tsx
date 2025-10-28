'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';

interface DashboardNavbarProps {
  userDetails: any;
}

/**
 * DashboardNavbar component displays the top navigation bar with notification bell
 */
export function DashboardNavbar({ userDetails }: DashboardNavbarProps) {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <div className="w-full flex-1">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotificationPanelOpen(true)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge (optional - show if there are unread notifications) */}
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {userDetails?.full_name || 'User'}
          </span>
        </div>
      </header>

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </>
  );
}
