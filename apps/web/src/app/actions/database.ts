'use server';

/**
 * Database Console Server Actions
 * Provides secure, admin-only access to database query execution and statistics
 */

import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth/server';
import { env } from '@/env';
import type { Database } from '@/types/database.types';
import {
  validateQuery,
  sanitizeErrorMessage,
  getMaxResultLimit,
} from '@/lib/database/query-validator';
import {
  getDatabaseStatistics,
  getTableList,
  getTableSchema,
  getSlowQueries,
  type DatabaseStats,
  type TableInfo,
  type TableSchema,
  type SlowQuery,
} from '@/lib/database/stats';

export interface QueryResult {
  success: boolean;
  data?: Record<string, any>[];
  error?: string;
  rowCount?: number;
  executionTime?: number;
  columns?: string[];
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  executedAt: string;
  duration: number;
  rowCount: number;
  status: 'success' | 'error';
  error?: string;
}

// Create service role client for admin operations
function getServiceRoleClient() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase service role environment variables are not set');
  }

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Execute a read-only SQL query
 */
export async function executeQuery(query: string): Promise<QueryResult> {
  try {
    // Verify admin access
    await requireAdmin();

    // Validate query
    const validation = validateQuery(query);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const supabase = getServiceRoleClient();
    const startTime = Date.now();

    // Execute query with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query execution timed out after 10 seconds')), 10000);
    });

    const queryPromise = supabase.rpc('execute_read_only_query' as any, {
      query_text: validation.sanitizedQuery,
    });

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    const executionTime = Date.now() - startTime;

    if (error) {
      const sanitizedError = sanitizeErrorMessage(error);
      return {
        success: false,
        error: sanitizedError,
        executionTime,
      };
    }

    // Ensure data is an array
    const resultData = Array.isArray(data) ? data : [];

    // Limit results to max allowed
    const maxLimit = getMaxResultLimit();
    const limitedData = resultData.slice(0, maxLimit);

    // Extract column names from first row
    const columns = limitedData.length > 0 ? Object.keys(limitedData[0]) : [];

    return {
      success: true,
      data: limitedData,
      rowCount: limitedData.length,
      executionTime,
      columns,
    };
  } catch (error) {
    const sanitizedError = sanitizeErrorMessage(error);
    return {
      success: false,
      error: sanitizedError,
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  try {
    await requireAdmin();
    const supabase = getServiceRoleClient();
    return await getDatabaseStatistics(supabase);
  } catch (error) {
    console.error('Error fetching database stats:', error);
    return {
      status: 'offline',
      totalTables: 0,
      totalRows: 0,
      databaseSize: '0 MB',
      activeConnections: 0,
      cacheHitRatio: 0,
      timestamp: Date.now(),
    };
  }
}

/**
 * Get list of all tables
 */
export async function getTables(): Promise<TableInfo[]> {
  try {
    await requireAdmin();
    const supabase = getServiceRoleClient();
    const tables = await getTableList(supabase);
    return tables;
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
}

/**
 * Get schema for a specific table
 */
export async function getTableSchemaInfo(tableName: string): Promise<TableSchema[]> {
  try {
    await requireAdmin();

    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Invalid table name');
    }

    const supabase = getServiceRoleClient();
    const schema = await getTableSchema(supabase, tableName);
    return schema;
  } catch (error) {
    console.error('Error fetching table schema:', error);
    return [];
  }
}

/**
 * Get slow queries
 */
export async function getSlowQueriesInfo(): Promise<SlowQuery[]> {
  try {
    await requireAdmin();
    const supabase = getServiceRoleClient();
    const slowQueries = await getSlowQueries(supabase);
    return slowQueries;
  } catch (error) {
    console.error('Error fetching slow queries:', error);
    return [];
  }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const supabase = getServiceRoleClient();

    // Simple query to test connection
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      return {
        success: false,
        error: sanitizeErrorMessage(error),
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: sanitizeErrorMessage(error),
    };
  }
}
