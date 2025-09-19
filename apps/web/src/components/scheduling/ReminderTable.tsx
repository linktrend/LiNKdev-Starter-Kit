'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Edit, 
  Trash2, 
  Check, 
  Clock, 
  MoreHorizontal, 
  Search, 
  Filter,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Reminder, ReminderStatus, ReminderPriority } from '@/types/scheduling';
import { api } from '@/trpc/react';

interface ReminderTableProps {
  reminders: Reminder[];
  onEdit?: (reminder: Reminder) => void;
  onDelete?: (reminder: Reminder) => void;
  onComplete?: (reminder: Reminder) => void;
  onSnooze?: (reminder: Reminder) => void;
  isLoading?: boolean;
}

export function ReminderTable({ 
  reminders, 
  onEdit, 
  onDelete, 
  onComplete,
  onSnooze,
  isLoading = false 
}: ReminderTableProps) {
  const [deleteReminderId, setDeleteReminderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | 'all'>('all');

  const deleteReminderMutation = api.scheduling.deleteReminder.useMutation({
    onSuccess: () => {
      setDeleteReminderId(null);
      onDelete?.(reminders.find(r => r.id === deleteReminderId)!);
    },
  });

  const completeReminderMutation = api.scheduling.completeReminder.useMutation({
    onSuccess: () => {
      onComplete?.(reminders.find(r => r.id === deleteReminderId)!);
    },
  });

  const snoozeReminderMutation = api.scheduling.snoozeReminder.useMutation({
    onSuccess: () => {
      onSnooze?.(reminders.find(r => r.id === deleteReminderId)!);
    },
  });

  const handleDelete = async () => {
    if (deleteReminderId) {
      await deleteReminderMutation.mutateAsync({ id: deleteReminderId });
    }
  };

  const handleComplete = async (reminderId: string) => {
    await completeReminderMutation.mutateAsync({ id: reminderId });
  };

  const handleSnooze = async (reminderId: string) => {
    await snoozeReminderMutation.mutateAsync({ id: reminderId, minutes: 60 }); // 1 hour
  };

  // Filter reminders based on search and status
  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = !searchTerm || 
      reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reminder.notes && reminder.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ReminderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'snoozed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ReminderPriority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: ReminderPriority) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleString();
  };

  const isOverdue = (reminder: Reminder) => {
    if (!reminder.due_at || reminder.status !== 'pending') return false;
    return new Date(reminder.due_at) < new Date();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="border rounded-lg">
          <div className="h-12 bg-muted animate-pulse rounded-t-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 border-t bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reminders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReminderStatus | 'all')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="completed">Completed</option>
              <option value="snoozed">Snoozed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredReminders.length} reminder{filteredReminders.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReminders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No reminders match your filters' 
                        : 'No reminders found'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReminders.map((reminder) => (
                  <TableRow key={reminder.id} className={isOverdue(reminder) ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{reminder.title}</div>
                        {reminder.notes && (
                          <div className="text-sm text-muted-foreground">
                            {reminder.notes}
                          </div>
                        )}
                        {isOverdue(reminder) && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${getPriorityColor(reminder.priority)}`}>
                        {getPriorityIcon(reminder.priority)}
                        <span className="capitalize">{reminder.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(reminder.status)}>
                        {reminder.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(reminder.due_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(reminder)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {reminder.status === 'pending' && onComplete && (
                            <DropdownMenuItem onClick={() => handleComplete(reminder.id)}>
                              <Check className="mr-2 h-4 w-4" />
                              Complete
                            </DropdownMenuItem>
                          )}
                          {reminder.status === 'pending' && onSnooze && (
                            <DropdownMenuItem onClick={() => handleSnooze(reminder.id)}>
                              <Clock className="mr-2 h-4 w-4" />
                              Snooze 1h
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => setDeleteReminderId(reminder.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteReminderId} onOpenChange={() => setDeleteReminderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reminder? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
