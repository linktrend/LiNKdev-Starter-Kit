'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Check, Clock, Calendar, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReminderForm } from '@/components/scheduling/ReminderForm';
import { api } from '@/trpc/react';

export default function ReminderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const reminderId = params.id as string;

  const { data: reminder, isLoading: reminderLoading } = api.scheduling.getReminder.useQuery({
    id: reminderId,
  });

  const completeReminderMutation = api.scheduling.completeReminder.useMutation({
    onSuccess: () => {
      router.push('/reminders');
    },
  });

  const snoozeReminderMutation = api.scheduling.snoozeReminder.useMutation({
    onSuccess: () => {
      router.push('/reminders');
    },
  });

  const deleteReminderMutation = api.scheduling.deleteReminder.useMutation({
    onSuccess: () => {
      router.push('/reminders');
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Optionally refresh the reminder data
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleComplete = async () => {
    setIsDeleting(true);
    try {
      await completeReminderMutation.mutateAsync({ id: reminderId });
    } catch (error) {
      console.error('Failed to complete reminder:', error);
      setIsDeleting(false);
    }
  };

  const handleSnooze = async () => {
    try {
      await snoozeReminderMutation.mutateAsync({ id: reminderId, minutes: 60 });
    } catch (error) {
      console.error('Failed to snooze reminder:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReminderMutation.mutateAsync({ id: reminderId });
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'snoozed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleString();
  };

  const isOverdue = (reminder: any) => {
    if (!reminder.due_at || reminder.status !== 'pending') return false;
    return new Date(reminder.due_at) < new Date();
  };

  if (reminderLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-full bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reminder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Reminder Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Reminder not found</h3>
              <p className="text-muted-foreground mt-2">
                The reminder you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button asChild className="mt-4">
                <a href="/reminders">Back to Reminders</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Reminder</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <ReminderForm
              orgId={reminder.org_id}
              initialData={{
                title: reminder.title,
                notes: reminder.notes,
                due_at: reminder.due_at,
                priority: reminder.priority,
                record_id: reminder.record_id,
              }}
              onSave={handleSave}
              onCancel={handleCancel}
              isEditing={true}
              reminderId={reminder.id}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{reminder.title}</h1>
            <p className="text-muted-foreground">
              Reminder details and actions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {reminder.status === 'pending' && (
            <>
              <Button onClick={handleComplete} disabled={isDeleting}>
                <Check className="mr-2 h-4 w-4" />
                {isDeleting ? 'Completing...' : 'Complete'}
              </Button>
              <Button variant="outline" onClick={handleSnooze}>
                <Clock className="mr-2 h-4 w-4" />
                Snooze 1h
              </Button>
            </>
          )}
          <Button 
            variant="destructive" 
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Reminder Details */}
        <Card>
          <CardHeader>
            <CardTitle>Reminder Details</CardTitle>
            <CardDescription>
              Information about this reminder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Title
              </label>
              <div className="p-3 bg-muted rounded-md">
                {reminder.title}
              </div>
            </div>

            {reminder.notes && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Notes
                </label>
                <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                  {reminder.notes}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Priority
                </label>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${getPriorityColor(reminder.priority)}`}>
                    {getPriorityIcon(reminder.priority)}
                    <span className="capitalize font-medium">{reminder.priority}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div>
                  <Badge className={getStatusColor(reminder.status)}>
                    {reminder.status}
                  </Badge>
                  {isOverdue(reminder) && (
                    <Badge variant="destructive" className="ml-2">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Due Date
              </label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(reminder.due_at)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>
              System information about this reminder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
                <div className="text-sm">
                  {new Date(reminder.created_at).toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Updated
                </div>
                <div className="text-sm">
                  {new Date(reminder.updated_at).toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Created by
                </div>
                <div className="text-sm">
                  {reminder.created_by}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Reminder ID
                </div>
                <div className="text-sm font-mono">
                  {reminder.id}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
