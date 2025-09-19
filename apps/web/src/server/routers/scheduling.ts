import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/api/root';
import { 
  CreateReminderInput,
  UpdateReminderInput,
  SnoozeReminderInput,
  CompleteReminderInput,
  CreateScheduleInput,
  UpdateScheduleInput,
  ListRemindersInput,
  ListSchedulesInput,
  Reminder,
  Schedule,
  ReminderStatus,
  ReminderPriority
} from '@/types/scheduling';
import { schedulingStore } from '../mocks/scheduling.store';
import { emitReminderEvent, emitScheduleEvent, emitDueRemindersEvent } from '@/utils/scheduling/event-emitter';

const isOfflineMode = process.env.TEMPLATE_OFFLINE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const schedulingRouter = createTRPCRouter({
  // Reminders Management
  createReminder: protectedProcedure
    .input(z.object({
      org_id: z.string().uuid(),
      record_id: z.string().uuid().optional(),
      title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
      notes: z.string().optional(),
      due_at: z.string().datetime().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const reminder = schedulingStore.createReminder(input, ctx.user.id);
        
        // Emit event
        await emitReminderEvent(
          ctx,
          input.org_id,
          'reminder_created',
          reminder.id,
          reminder.title,
          reminder.priority,
          reminder.due_at
        );
        
        return reminder;
      }

      // Supabase implementation
      const { data: reminder, error } = await ctx.supabase
        .from('reminders')
        .insert({
          org_id: input.org_id,
          record_id: input.record_id,
          title: input.title,
          notes: input.notes,
          due_at: input.due_at,
          priority: input.priority,
          created_by: ctx.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create reminder',
        });
      }

      // Emit event
      await emitReminderEvent(
        ctx,
        input.org_id,
        'reminder_created',
        reminder.id,
        reminder.title,
        reminder.priority,
        reminder.due_at
      );

      return reminder;
    }),

  listReminders: protectedProcedure
    .input(z.object({
      org_id: z.string().uuid(),
      status: z.enum(['pending', 'sent', 'completed', 'snoozed', 'cancelled']).optional(),
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
      q: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return schedulingStore.listReminders(input);
      }

      // Supabase implementation
      let query = ctx.supabase
        .from('reminders')
        .select('*', { count: 'exact' })
        .eq('org_id', input.org_id);

      if (input.status) {
        query = query.eq('status', input.status);
      }
      if (input.from) {
        query = query.gte('due_at', input.from);
      }
      if (input.to) {
        query = query.lte('due_at', input.to);
      }
      if (input.q) {
        query = query.or(`title.ilike.%${input.q}%,notes.ilike.%${input.q}%`);
      }

      query = query
        .order('due_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      const { data: reminders, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch reminders',
        });
      }

      return {
        reminders: reminders || [],
        total: count || 0,
        has_more: (input.offset + input.limit) < (count || 0),
      };
    }),

  getReminder: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return schedulingStore.getReminder(input.id);
      }

      // Supabase implementation
      const { data: reminder, error } = await ctx.supabase
        .from('reminders')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reminder not found',
        });
      }

      return reminder;
    }),

  updateReminder: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(200).optional(),
      notes: z.string().optional(),
      due_at: z.string().datetime().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      status: z.enum(['pending', 'sent', 'completed', 'snoozed', 'cancelled']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      
      if (isOfflineMode) {
        const reminder = schedulingStore.updateReminder(id, updates as UpdateReminderInput);
        
        if (reminder) {
          // Emit event
          await emitReminderEvent(
            ctx,
            reminder.org_id,
            'reminder_updated',
            reminder.id,
            reminder.title,
            reminder.priority,
            reminder.due_at
          );
        }
        
        return reminder;
      }

      // Supabase implementation
      const { data: reminder, error } = await ctx.supabase
        .from('reminders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update reminder',
        });
      }

      // Emit event
      await emitReminderEvent(
        ctx,
        reminder.org_id,
        'reminder_updated',
        reminder.id,
        reminder.title,
        reminder.priority,
        reminder.due_at
      );

      return reminder;
    }),

  snoozeReminder: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      minutes: z.number().min(1).max(10080), // Max 1 week
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const reminder = schedulingStore.snoozeReminder(input.id, input.minutes);
        
        if (reminder) {
          // Emit event
          await emitReminderEvent(
            ctx,
            reminder.org_id,
            'reminder_snoozed',
            reminder.id,
            reminder.title,
            reminder.priority,
            reminder.snoozed_until
          );
        }
        
        return reminder;
      }

      // Supabase implementation
      const snoozedUntil = new Date(Date.now() + input.minutes * 60 * 1000);
      const { data: reminder, error } = await ctx.supabase
        .from('reminders')
        .update({
          status: 'snoozed',
          snoozed_until: snoozedUntil.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to snooze reminder',
        });
      }

      // Emit event
      await emitReminderEvent(
        ctx,
        reminder.org_id,
        'reminder_snoozed',
        reminder.id,
        reminder.title,
        reminder.priority,
        reminder.snoozed_until
      );

      return reminder;
    }),

  completeReminder: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const reminder = schedulingStore.completeReminder(input.id);
        
        if (reminder) {
          // Emit event
          await emitReminderEvent(
            ctx,
            reminder.org_id,
            'reminder_completed',
            reminder.id,
            reminder.title,
            reminder.priority
          );
        }
        
        return reminder;
      }

      // Supabase implementation
      const { data: reminder, error } = await ctx.supabase
        .from('reminders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to complete reminder',
        });
      }

      // Emit event
      await emitReminderEvent(
        ctx,
        reminder.org_id,
        'reminder_completed',
        reminder.id,
        reminder.title,
        reminder.priority
      );

      return reminder;
    }),

  deleteReminder: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return schedulingStore.deleteReminder(input.id);
      }

      // Supabase implementation
      const { error } = await ctx.supabase
        .from('reminders')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete reminder',
        });
      }

      return { success: true };
    }),

  // Schedules Management
  createSchedule: protectedProcedure
    .input(z.object({
      org_id: z.string().uuid(),
      name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
      description: z.string().optional(),
      cron: z.string().optional(),
      rule: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const schedule = schedulingStore.createSchedule(input, ctx.user.id);
        
        // Emit event
        await emitScheduleEvent(
          ctx,
          input.org_id,
          'schedule_created',
          schedule.id,
          schedule.name
        );
        
        return schedule;
      }

      // Supabase implementation
      const { data: schedule, error } = await ctx.supabase
        .from('schedules')
        .insert({
          org_id: input.org_id,
          name: input.name,
          description: input.description,
          cron: input.cron,
          rule: input.rule,
          created_by: ctx.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create schedule',
        });
      }

      // Emit event
      await emitScheduleEvent(
        ctx,
        input.org_id,
        'schedule_created',
        schedule.id,
        schedule.name
      );

      return schedule;
    }),

  listSchedules: protectedProcedure
    .input(z.object({
      org_id: z.string().uuid(),
      active: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return schedulingStore.listSchedules(input);
      }

      // Supabase implementation
      let query = ctx.supabase
        .from('schedules')
        .select('*')
        .eq('org_id', input.org_id);

      if (input.active !== undefined) {
        query = query.eq('active', input.active);
      }

      query = query.order('created_at', { ascending: false });

      const { data: schedules, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch schedules',
        });
      }

      return schedules || [];
    }),

  updateSchedule: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().optional(),
      cron: z.string().optional(),
      rule: z.record(z.any()).optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      
      if (isOfflineMode) {
        const schedule = schedulingStore.updateSchedule(id, updates as UpdateScheduleInput);
        
        if (schedule) {
          // Emit event
          await emitScheduleEvent(
            ctx,
            schedule.org_id,
            'schedule_updated',
            schedule.id,
            schedule.name
          );
        }
        
        return schedule;
      }

      // Supabase implementation
      const { data: schedule, error } = await ctx.supabase
        .from('schedules')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update schedule',
        });
      }

      // Emit event
      await emitScheduleEvent(
        ctx,
        schedule.org_id,
        'schedule_updated',
        schedule.id,
        schedule.name
      );

      return schedule;
    }),

  deleteSchedule: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const schedule = schedulingStore.getSchedule(input.id);
        const success = schedulingStore.deleteSchedule(input.id);
        
        if (success && schedule) {
          // Emit event
          await emitScheduleEvent(
            ctx,
            schedule.org_id,
            'schedule_deleted',
            schedule.id,
            schedule.name
          );
        }
        
        return { success };
      }

      // Supabase implementation
      const { error } = await ctx.supabase
        .from('schedules')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete schedule',
        });
      }

      return { success: true };
    }),

  // Utility procedures
  getReminderStats: protectedProcedure
    .input(z.object({ org_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return schedulingStore.getReminderStats(input.org_id);
      }

      // Supabase implementation
      const { data: reminders, error } = await ctx.supabase
        .from('reminders')
        .select('status, due_at')
        .eq('org_id', input.org_id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch reminder stats',
        });
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const stats = {
        total: reminders.length,
        pending: reminders.filter(r => r.status === 'pending').length,
        completed: reminders.filter(r => r.status === 'completed').length,
        overdue: reminders.filter(r => 
          r.status === 'pending' && 
          r.due_at && 
          new Date(r.due_at) < now
        ).length,
        due_today: reminders.filter(r => 
          r.status === 'pending' && 
          r.due_at && 
          new Date(r.due_at) >= today && 
          new Date(r.due_at) < tomorrow
        ).length,
      };

      return stats;
    }),

  emitDueReminders: protectedProcedure
    .input(z.object({ org_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const dueReminders = schedulingStore.getDueReminders(input.org_id);
        
        // Emit event for due reminders
        await emitDueRemindersEvent(ctx, input.org_id, dueReminders.length);
        
        return { count: dueReminders.length };
      }

      // Supabase implementation
      const now = new Date().toISOString();
      const { data: dueReminders, error } = await ctx.supabase
        .from('reminders')
        .select('id, title, priority')
        .eq('org_id', input.org_id)
        .eq('status', 'pending')
        .lte('due_at', now);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch due reminders',
        });
      }

      // Emit event for due reminders
      await emitDueRemindersEvent(ctx, input.org_id, dueReminders.length);

      return { count: dueReminders.length };
    }),
});
