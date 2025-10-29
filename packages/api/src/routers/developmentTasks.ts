/**
 * Development Tasks router for tRPC API
 * Handles CRUD operations for development tasks with optional Notion integration
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const isOfflineMode = process.env.TEMPLATE_OFFLINE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

// Input validation schemas
const taskStatusSchema = z.enum(['todo', 'in-progress', 'review', 'done', 'blocked']);
const taskPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

const createTaskInputSchema = z.object({
  org_id: z.string().uuid('Invalid organization ID'),
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().max(10000, 'Description too long').optional().nullable(),
  status: taskStatusSchema.optional().default('todo'),
  priority: taskPrioritySchema.optional().default('normal'),
  assignee_id: z.string().uuid('Invalid assignee ID').optional().nullable(),
  notion_page_id: z.string().optional().nullable(),
  notion_database_id: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().default({}),
  due_date: z.string().date().optional().nullable(),
});

const updateTaskInputSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
  title: z.string().min(1, 'Title is required').max(500, 'Title too long').optional(),
  description: z.string().max(10000, 'Description too long').optional().nullable(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assignee_id: z.string().uuid('Invalid assignee ID').optional().nullable(),
  notion_page_id: z.string().optional().nullable(),
  notion_database_id: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional(),
  due_date: z.string().date().optional().nullable(),
});

const listTasksInputSchema = z.object({
  org_id: z.string().uuid('Invalid organization ID'),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assignee_id: z.string().uuid('Invalid assignee ID').optional().nullable(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sort_by: z.enum(['created_at', 'updated_at', 'due_date', 'priority', 'status']).default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Development Tasks router
 */
export const developmentTasksRouter = createTRPCRouter({
  /**
   * List development tasks with filtering and pagination
   */
  list: protectedProcedure
    .input(listTasksInputSchema)
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        // Offline mode - return empty results
        return {
          tasks: [],
          total: 0,
          has_more: false,
        };
      }

      // Verify user is member of organization
      const { data: membership, error: membershipError } = await ctx.supabase
        .from('organization_members')
        .select('id')
        .eq('org_id', input.org_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (membershipError || !membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this organization',
        });
      }

      // Build query
      let query = ctx.supabase
        .from('development_tasks')
        .select(`
          *,
          assignee:assignee_id (
            id,
            email,
            raw_user_meta_data
          ),
          creator:created_by (
            id,
            email,
            raw_user_meta_data
          )
        `, { count: 'exact' })
        .eq('org_id', input.org_id);

      // Apply filters
      if (input.status) {
        query = query.eq('status', input.status);
      }

      if (input.priority) {
        query = query.eq('priority', input.priority);
      }

      if (input.assignee_id !== undefined) {
        if (input.assignee_id === null) {
          query = query.is('assignee_id', null);
        } else {
          query = query.eq('assignee_id', input.assignee_id);
        }
      }

      // Search in title and description
      if (input.search) {
        query = query.or(`title.ilike.%${input.search}%,description.ilike.%${input.search}%`);
      }

      // Sorting
      const sortField = input.sort_by === 'due_date' ? 'due_date' : input.sort_by;
      query = query.order(sortField, { 
        ascending: input.sort_order === 'asc',
        nullsFirst: sortField === 'due_date' && input.sort_order === 'desc',
      });

      // Pagination
      query = query.range(input.offset, input.offset + input.limit - 1);

      const { data: tasks, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch development tasks',
        });
      }

      return {
        tasks: tasks || [],
        total: count || 0,
        has_more: (input.offset + input.limit) < (count || 0),
      };
    }),

  /**
   * Get a single development task by ID
   */
  get: protectedProcedure
    .input(z.object({
      id: z.string().uuid('Invalid task ID'),
    }))
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      const { data: task, error } = await ctx.supabase
        .from('development_tasks')
        .select(`
          *,
          assignee:assignee_id (
            id,
            email,
            raw_user_meta_data
          ),
          creator:created_by (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('id', input.id)
        .single();

      if (error || !task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      // Verify user is member of organization
      const { data: membership } = await ctx.supabase
        .from('organization_members')
        .select('id')
        .eq('org_id', task.org_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this organization',
        });
      }

      return task;
    }),

  /**
   * Create a new development task
   */
  create: protectedProcedure
    .input(createTaskInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Offline mode not supported for task creation',
        });
      }

      // Verify user is member of organization
      const { data: membership, error: membershipError } = await ctx.supabase
        .from('organization_members')
        .select('id')
        .eq('org_id', input.org_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (membershipError || !membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this organization',
        });
      }

      // Create task
      const { data: task, error } = await ctx.supabase
        .from('development_tasks')
        .insert({
          org_id: input.org_id,
          title: input.title,
          description: input.description || null,
          status: input.status || 'todo',
          priority: input.priority || 'normal',
          assignee_id: input.assignee_id || null,
          created_by: ctx.user.id,
          notion_page_id: input.notion_page_id || null,
          notion_database_id: input.notion_database_id || null,
          metadata: input.metadata || {},
          due_date: input.due_date || null,
        })
        .select(`
          *,
          assignee:assignee_id (
            id,
            email,
            raw_user_meta_data
          ),
          creator:created_by (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create development task',
        });
      }

      return task;
    }),

  /**
   * Update an existing development task
   */
  update: protectedProcedure
    .input(updateTaskInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Offline mode not supported for task updates',
        });
      }

      // Get existing task to verify organization membership
      const { data: existingTask, error: fetchError } = await ctx.supabase
        .from('development_tasks')
        .select('org_id')
        .eq('id', input.id)
        .single();

      if (fetchError || !existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      // Verify user is member of organization
      const { data: membership, error: membershipError } = await ctx.supabase
        .from('organization_members')
        .select('id')
        .eq('org_id', existingTask.org_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (membershipError || !membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this organization',
        });
      }

      // Build update object
      const updateData: Record<string, any> = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.assignee_id !== undefined) updateData.assignee_id = input.assignee_id;
      if (input.notion_page_id !== undefined) updateData.notion_page_id = input.notion_page_id;
      if (input.notion_database_id !== undefined) updateData.notion_database_id = input.notion_database_id;
      if (input.metadata !== undefined) updateData.metadata = input.metadata;
      if (input.due_date !== undefined) updateData.due_date = input.due_date;

      // Update task
      const { data: task, error } = await ctx.supabase
        .from('development_tasks')
        .update(updateData)
        .eq('id', input.id)
        .select(`
          *,
          assignee:assignee_id (
            id,
            email,
            raw_user_meta_data
          ),
          creator:created_by (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update development task',
        });
      }

      return task;
    }),

  /**
   * Delete a development task
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.string().uuid('Invalid task ID'),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Offline mode not supported for task deletion',
        });
      }

      // Get existing task to verify organization membership
      const { data: existingTask, error: fetchError } = await ctx.supabase
        .from('development_tasks')
        .select('org_id')
        .eq('id', input.id)
        .single();

      if (fetchError || !existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      // Verify user is member of organization
      const { data: membership, error: membershipError } = await ctx.supabase
        .from('organization_members')
        .select('id')
        .eq('org_id', existingTask.org_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (membershipError || !membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this organization',
        });
      }

      // Delete task
      const { error } = await ctx.supabase
        .from('development_tasks')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete development task',
        });
      }

      return { success: true };
    }),

  /**
   * Sync tasks from Notion (optional feature)
   * This is a placeholder - actual Notion integration would require @notionhq/client
   */
  syncFromNotion: protectedProcedure
    .input(z.object({
      org_id: z.string().uuid('Invalid organization ID'),
      notion_database_id: z.string().min(1, 'Notion database ID is required'),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is member of organization
      const { data: membership, error: membershipError } = await ctx.supabase
        .from('organization_members')
        .select('id')
        .eq('org_id', input.org_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (membershipError || !membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this organization',
        });
      }

      // TODO: Implement Notion API integration
      // This would require:
      // 1. Notion API client setup
      // 2. Fetching pages from Notion database
      // 3. Converting Notion pages to development tasks
      // 4. Upserting tasks in Supabase

      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Notion integration is not yet implemented. Please configure Notion API credentials first.',
      });
    }),
});

