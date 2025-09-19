import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/api/root';
import { 
  CreateRecordTypeInput,
  UpdateRecordTypeInput,
  CreateRecordInput,
  UpdateRecordInput,
  ListRecordsInput,
  RecordType,
  RecordData,
  RecordSearchResult
} from '@/types/records';
import { recordsStore } from '../mocks/records.store';
import { assertEntitlement, assertWithinLimit } from '@/utils/billing/guards';

const isOfflineMode = process.env.TEMPLATE_OFFLINE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const recordsRouter = createTRPCRouter({
  // Record Types Management
  createRecordType: protectedProcedure
    .input(z.object({
      key: z.string().min(1, 'Key is required').max(50, 'Key too long'),
      display_name: z.string().min(1, 'Display name is required').max(100, 'Display name too long'),
      description: z.string().optional(),
      config: z.object({
        fields: z.array(z.object({
          key: z.string(),
          label: z.string(),
          type: z.enum(['text', 'number', 'email', 'url', 'date', 'boolean', 'select', 'textarea']),
          required: z.boolean().optional(),
          placeholder: z.string().optional(),
          description: z.string().optional(),
          options: z.array(z.string()).optional(),
          validation: z.object({
            min: z.number().optional(),
            max: z.number().optional(),
            pattern: z.string().optional(),
            custom: z.string().optional(),
          }).optional(),
        })),
        is_public: z.boolean().optional(),
        permissions: z.object({
          can_create: z.array(z.string()).optional(),
          can_read: z.array(z.string()).optional(),
          can_update: z.array(z.string()).optional(),
          can_delete: z.array(z.string()).optional(),
        }).optional(),
        validation: z.object({
          schema: z.record(z.any()).optional(),
          custom_rules: z.array(z.string()).optional(),
        }).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const recordType = recordsStore.createRecordType(input, ctx.user.id);
        
        // Analytics
        ctx.posthog?.capture({
          distinctId: ctx.user.id,
          event: 'record_type_created',
          properties: {
            record_type_id: recordType.id,
            record_type_key: recordType.key,
          },
        });
        
        return recordType;
      }

      // Supabase implementation
      const { data: recordType, error } = await ctx.supabase
        .from('record_types')
        .insert({
          key: input.key,
          display_name: input.display_name,
          description: input.description,
          config: input.config,
          created_by: ctx.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create record type',
        });
      }

      // Analytics
      ctx.posthog?.capture({
        distinctId: ctx.user.id,
        event: 'record_type_created',
        properties: {
          record_type_id: recordType.id,
          record_type_key: recordType.key,
        },
      });

      return recordType;
    }),

  listRecordTypes: protectedProcedure
    .query(async ({ ctx }) => {
      if (isOfflineMode) {
        return recordsStore.listRecordTypes(ctx.user.id);
      }

      // Supabase implementation
      const { data: recordTypes, error } = await ctx.supabase
        .from('record_types')
        .select('*')
        .or(`created_by.eq.${ctx.user.id},config->is_public.eq.true`);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch record types',
        });
      }

      return recordTypes || [];
    }),

  getRecordType: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return recordsStore.getRecordType(input.id);
      }

      // Supabase implementation
      const { data: recordType, error } = await ctx.supabase
        .from('record_types')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record type not found',
        });
      }

      return recordType;
    }),

  getRecordTypeByKey: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return recordsStore.getRecordTypeByKey(input.key);
      }

      // Supabase implementation
      const { data: recordType, error } = await ctx.supabase
        .from('record_types')
        .select('*')
        .eq('key', input.key)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record type not found',
        });
      }

      return recordType;
    }),

  updateRecordType: protectedProcedure
    .input(z.object({
      id: z.string(),
      display_name: z.string().min(1).max(100).optional(),
      description: z.string().optional(),
      config: z.object({
        fields: z.array(z.object({
          key: z.string(),
          label: z.string(),
          type: z.enum(['text', 'number', 'email', 'url', 'date', 'boolean', 'select', 'textarea']),
          required: z.boolean().optional(),
          placeholder: z.string().optional(),
          description: z.string().optional(),
          options: z.array(z.string()).optional(),
          validation: z.object({
            min: z.number().optional(),
            max: z.number().optional(),
            pattern: z.string().optional(),
            custom: z.string().optional(),
          }).optional(),
        })),
        is_public: z.boolean().optional(),
        permissions: z.object({
          can_create: z.array(z.string()).optional(),
          can_read: z.array(z.string()).optional(),
          can_update: z.array(z.string()).optional(),
          can_delete: z.array(z.string()).optional(),
        }).optional(),
        validation: z.object({
          schema: z.record(z.any()).optional(),
          custom_rules: z.array(z.string()).optional(),
        }).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const updates = {
          display_name: input.display_name,
          description: input.description,
          config: input.config,
        };
        return recordsStore.updateRecordType(input.id, updates);
      }

      // Supabase implementation
      const { data: recordType, error } = await ctx.supabase
        .from('record_types')
        .update({
          display_name: input.display_name,
          description: input.description,
          config: input.config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('created_by', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update record type',
        });
      }

      return recordType;
    }),

  deleteRecordType: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return recordsStore.deleteRecordType(input.id);
      }

      // Supabase implementation
      const { error } = await ctx.supabase
        .from('record_types')
        .delete()
        .eq('id', input.id)
        .eq('created_by', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete record type',
        });
      }

      return { success: true };
    }),

  // Records Management
  createRecord: protectedProcedure
    .input(z.object({
      type_id: z.string(),
      org_id: z.string().optional(),
      user_id: z.string().optional(),
      data: z.record(z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check entitlements for record creation
      if (input.org_id) {
        // Check if organization can create records
        await assertEntitlement(input.org_id, 'max_records', ctx.supabase);
        
        // Check if organization has exceeded record limit
        // Note: In a real implementation, you'd count existing records first
        // For demo purposes, we'll skip the count check
        // await assertWithinLimit(input.org_id, 'max_records', currentRecordCount, ctx.supabase);
      }

      if (isOfflineMode) {
        const record = recordsStore.createRecord(input, ctx.user.id);
        
        // Analytics
        ctx.posthog?.capture({
          distinctId: ctx.user.id,
          event: 'record_created',
          properties: {
            record_id: record.id,
            record_type_id: record.type_id,
            org_id: record.org_id,
            user_id: record.user_id,
          },
        });
        
        return record;
      }

      // Supabase implementation
      const { data: record, error } = await ctx.supabase
        .from('records')
        .insert({
          type_id: input.type_id,
          org_id: input.org_id,
          user_id: input.user_id,
          data: input.data,
          created_by: ctx.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create record',
        });
      }

      // Analytics
      ctx.posthog?.capture({
        distinctId: ctx.user.id,
        event: 'record_created',
        properties: {
          record_id: record.id,
          record_type_id: record.type_id,
          org_id: record.org_id,
          user_id: record.user_id,
        },
      });

      return record;
    }),

  getRecord: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return recordsStore.getRecord(input.id);
      }

      // Supabase implementation
      const { data: record, error } = await ctx.supabase
        .from('records')
        .select(`
          *,
          record_types (*)
        `)
        .eq('id', input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record not found',
        });
      }

      return record;
    }),

  listRecords: protectedProcedure
    .input(z.object({
      type_id: z.string().optional(),
      org_id: z.string().optional(),
      user_id: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      search: z.string().optional(),
      sort_by: z.string().optional(),
      sort_order: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      if (isOfflineMode) {
        return recordsStore.listRecords(input);
      }

      // Supabase implementation
      let query = ctx.supabase
        .from('records')
        .select(`
          *,
          record_types (*)
        `, { count: 'exact' });

      if (input.type_id) {
        query = query.eq('type_id', input.type_id);
      }
      if (input.org_id) {
        query = query.eq('org_id', input.org_id);
      }
      if (input.user_id) {
        query = query.eq('user_id', input.user_id);
      }

      // Search in JSONB data
      if (input.search) {
        query = query.textSearch('data', input.search);
      }

      // Sorting
      if (input.sort_by) {
        query = query.order(input.sort_by, { ascending: input.sort_order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      query = query.range(input.offset, input.offset + input.limit - 1);

      const { data: records, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch records',
        });
      }

      return {
        records: records || [],
        total: count || 0,
        has_more: (input.offset + input.limit) < (count || 0),
      };
    }),

  updateRecord: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.record(z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const record = recordsStore.updateRecord(input.id, input);
        
        // Analytics
        ctx.posthog?.capture({
          distinctId: ctx.user.id,
          event: 'record_updated',
          properties: {
            record_id: input.id,
          },
        });
        
        return record;
      }

      // Supabase implementation
      const { data: record, error } = await ctx.supabase
        .from('records')
        .update({
          data: input.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update record',
        });
      }

      // Analytics
      ctx.posthog?.capture({
        distinctId: ctx.user.id,
        event: 'record_updated',
        properties: {
          record_id: input.id,
        },
      });

      return record;
    }),

  deleteRecord: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (isOfflineMode) {
        const success = recordsStore.deleteRecord(input.id);
        
        // Analytics
        ctx.posthog?.capture({
          distinctId: ctx.user.id,
          event: 'record_deleted',
          properties: {
            record_id: input.id,
          },
        });
        
        return { success };
      }

      // Supabase implementation
      const { error } = await ctx.supabase
        .from('records')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete record',
        });
      }

      // Analytics
      ctx.posthog?.capture({
        distinctId: ctx.user.id,
        event: 'record_deleted',
        properties: {
          record_id: input.id,
        },
      });

      return { success: true };
    }),
});
