'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type NotificationType = 'urgent' | 'normal' | 'system';
export type NotificationStatus = 'read' | 'unread';

export interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  timestamp: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'normal',
    status: 'unread',
    title: 'Project Updated',
    message: 'Website Redesign project has been updated with new design files. The team has added comprehensive...',
    timestamp: '5 minutes ago',
  },
  {
    id: '2',
    type: 'normal',
    status: 'unread',
    title: 'Task Completed',
    message: 'Your team member completed the API Integration task',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    type: 'system',
    status: 'unread',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight at 2 AM UTC',
    timestamp: '3 hours ago',
  },
  {
    id: '4',
    type: 'normal',
    status: 'read',
    title: 'New Team Member',
    message: 'Sarah Johnson has joined your team',
    timestamp: '1 day ago',
  },
  {
    id: '5',
    type: 'normal',
    status: 'read',
    title: 'Payment Received',
    message: 'Monthly subscription payment has been processed successfully',
    timestamp: '2 days ago',
  },
  {
    id: '6',
    type: 'urgent',
    status: 'read',
    title: 'Security Alert',
    message: 'New login detected from an unrecognized device. Please verify this was you.',
    timestamp: '3 days ago',
  },
  {
    id: '7',
    type: 'normal',
    status: 'read',
    title: 'Feature Released',
    message: 'New dashboard analytics feature is now available for all users',
    timestamp: '5 days ago',
  },
  {
    id: '8',
    type: 'system',
    status: 'read',
    title: 'Backup Completed',
    message: 'Your weekly data backup has been completed successfully',
    timestamp: '1 week ago',
  },
];

/**
 * NotificationPanel displays a comprehensive notification list with read/unread states,
 * delete functionality, and expandable messages
 */
export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, status: 'read' as NotificationStatus } : notif
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, status: 'read' as NotificationStatus }))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getNotificationDotColor = (type: NotificationType, status: NotificationStatus) => {
    if (status === 'read') return 'bg-gray-400';
    
    switch (type) {
      case 'urgent':
        return 'bg-red-500';
      case 'system':
        return 'bg-yellow-500';
      case 'normal':
      default:
        return 'bg-blue-500';
    }
  };

  const shouldShowExpandButton = (message: string) => {
    // Show expand button if message is longer than ~100 characters (roughly 2 lines)
    return message.length > 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-background border-l shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const isExpanded = expandedIds.has(notification.id);
                  const showExpand = shouldShowExpandButton(notification.message);
                  const isUnread = notification.status === 'unread';

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 hover:bg-accent/50 transition-colors',
                        isUnread && 'bg-accent/20'
                      )}
                    >
                      <div className="flex gap-3">
                        {/* Dot indicator */}
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              getNotificationDotColor(notification.type, notification.status)
                            )}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={cn(
                              'text-sm mb-1',
                              isUnread ? 'font-bold' : 'font-normal'
                            )}
                          >
                            {notification.title}
                          </h3>
                          <p
                            className={cn(
                              'text-sm text-muted-foreground',
                              !isExpanded && 'line-clamp-2'
                            )}
                          >
                            {notification.message}
                          </p>
                          
                          {showExpand && (
                            <button
                              onClick={() => toggleExpand(notification.id)}
                              className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                            >
                              {isExpanded ? 'Collapse' : 'Expand Message'}
                              <ChevronDown
                                className={cn(
                                  'h-3 w-3 transition-transform',
                                  isExpanded && 'rotate-180'
                                )}
                              />
                            </button>
                          )}

                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.timestamp}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex gap-1">
                          {isUnread && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(notification.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && notifications.some((n) => n.status === 'unread') && (
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
