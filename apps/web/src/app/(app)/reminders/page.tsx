'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Bell, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReminderTable } from '@/components/scheduling/ReminderTable';
import { api } from '@/trpc/react';

export default function RemindersPage() {
  const [orgId] = useState('org-1'); // In real app, get from context
  
  const { data: remindersData, isLoading: remindersLoading } = api.scheduling.listReminders.useQuery({
    org_id: orgId,
    limit: 50,
  });

  const { data: stats, isLoading: statsLoading } = api.scheduling.getReminderStats.useQuery({
    org_id: orgId,
  });

  const reminders = remindersData?.reminders || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'completed': return 'text-green-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reminders</h1>
          <p className="text-muted-foreground">
            Manage your team's reminders and notifications
          </p>
        </div>
        <Button asChild>
          <Link href="/reminders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Reminder
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Stats Overview */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All reminders
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting action
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  Finished tasks
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                <p className="text-xs text-muted-foreground">
                  Past due date
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Reminders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Reminders</CardTitle>
            <CardDescription>
              {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReminderTable
              reminders={reminders}
              isLoading={remindersLoading}
              onEdit={(reminder) => {
                // Navigate to edit page
                window.location.href = `/reminders/${reminder.id}/edit`;
              }}
              onComplete={(reminder) => {
                // Refresh the page or update local state
                window.location.reload();
              }}
              onSnooze={(reminder) => {
                // Refresh the page or update local state
                window.location.reload();
              }}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common reminder management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild>
                <Link href="/reminders/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Reminder
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/schedules">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Schedules
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <Bell className="mr-2 h-4 w-4" />
                Check Due Reminders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
