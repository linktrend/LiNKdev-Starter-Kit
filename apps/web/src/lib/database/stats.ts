/**
 * Database Statistics Module
 * Queries PostgreSQL system tables for real-time database insights
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export interface DatabaseStats {
  status: 'online' | 'offline';
  totalTables: number;
  totalRows: number;
  databaseSize: string;
  activeConnections: number;
  cacheHitRatio: number;
  timestamp: number;
}

export interface TableInfo {
  name: string;
  schema: string;
  rows: number;
  size: string;
  sizeBytes: number;
  rls: boolean;
  description: string | null;
}

export interface TableSchema {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnDefault: string | null;
  description: string | null;
}

export interface SlowQuery {
  query: string;
  duration: string;
  calls: number;
  avgDuration: string;
}

// Cache for database statistics (5 minutes)
let statsCache: { data: DatabaseStats | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get comprehensive database statistics
 */
export async function getDatabaseStatistics(
  supabaseClient: ReturnType<typeof createClient<Database>>
): Promise<DatabaseStats> {
  // Check cache
  const now = Date.now();
  if (statsCache.data && now - statsCache.timestamp < CACHE_DURATION) {
    return statsCache.data;
  }

  try {
    // Get total tables count
    const { data: tablesData, error: tablesError } = await supabaseClient.rpc(
      'get_table_count' as any
    );

    // Get database size
    const { data: sizeData, error: sizeError } = await supabaseClient.rpc(
      'get_database_size' as any
    );

    // Get active connections
    const { data: connectionsData, error: connectionsError } = await supabaseClient.rpc(
      'get_active_connections' as any
    );

    // Get cache hit ratio
    const { data: cacheData, error: cacheError } = await supabaseClient.rpc(
      'get_cache_hit_ratio' as any
    );

    // If RPC functions don't exist, fall back to direct queries
    let totalTables = 0;
    let databaseSize = '0 MB';
    let activeConnections = 0;
    let cacheHitRatio = 0;

    if (!tablesError && tablesData !== null) {
      totalTables = tablesData as number;
    }

    if (!sizeError && sizeData !== null) {
      databaseSize = formatBytes(sizeData as number);
    }

    if (!connectionsError && connectionsData !== null) {
      activeConnections = connectionsData as number;
    }

    if (!cacheError && cacheData !== null) {
      cacheHitRatio = cacheData as number;
    }

    const stats: DatabaseStats = {
      status: 'online',
      totalTables,
      totalRows: 0, // Will be calculated from table list
      databaseSize,
      activeConnections,
      cacheHitRatio,
      timestamp: now,
    };

    // Cache the result
    statsCache = { data: stats, timestamp: now };

    return stats;
  } catch (error) {
    console.error('Error fetching database statistics:', error);
    return {
      status: 'offline',
      totalTables: 0,
      totalRows: 0,
      databaseSize: '0 MB',
      activeConnections: 0,
      cacheHitRatio: 0,
      timestamp: now,
    };
  }
}

/**
 * Get list of all tables with metadata
 */
export async function getTableList(
  supabaseClient: ReturnType<typeof createClient<Database>>
): Promise<TableInfo[]> {
  try {
    // Query information_schema for table information
    const { data, error } = await supabaseClient.rpc('get_table_list' as any);

    if (error) {
      console.error('Error fetching table list:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data as TableInfo[];
  } catch (error) {
    console.error('Error fetching table list:', error);
    return [];
  }
}

/**
 * Get schema information for a specific table
 */
export async function getTableSchema(
  supabaseClient: ReturnType<typeof createClient<Database>>,
  tableName: string
): Promise<TableSchema[]> {
  try {
    const { data, error } = await supabaseClient.rpc('get_table_schema' as any, {
      table_name: tableName,
    });

    if (error) {
      console.error('Error fetching table schema:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data as TableSchema[];
  } catch (error) {
    console.error('Error fetching table schema:', error);
    return [];
  }
}

/**
 * Get slow queries (requires pg_stat_statements extension)
 */
export async function getSlowQueries(
  supabaseClient: ReturnType<typeof createClient<Database>>
): Promise<SlowQuery[]> {
  try {
    const { data, error } = await supabaseClient.rpc('get_slow_queries' as any);

    if (error) {
      // Extension might not be enabled, return empty array
      return [];
    }

    if (!data) {
      return [];
    }

    return data as SlowQuery[];
  } catch (error) {
    // Extension not available
    return [];
  }
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Clear statistics cache (useful for testing or force refresh)
 */
export function clearStatsCache(): void {
  statsCache = { data: null, timestamp: 0 };
}

/**
 * SQL queries for creating helper RPC functions
 * These should be added to a migration file
 */
export const HELPER_FUNCTIONS_SQL = `
-- Function to get total table count
CREATE OR REPLACE FUNCTION get_table_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get database size
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS BIGINT AS $$
BEGIN
  RETURN pg_database_size(current_database());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active connections
CREATE OR REPLACE FUNCTION get_active_connections()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM pg_stat_activity
    WHERE datname = current_database()
    AND state = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cache hit ratio
CREATE OR REPLACE FUNCTION get_cache_hit_ratio()
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT ROUND(
      100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0),
      2
    )
    FROM pg_stat_database
    WHERE datname = current_database()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table list with metadata
CREATE OR REPLACE FUNCTION get_table_list()
RETURNS TABLE (
  name TEXT,
  schema TEXT,
  rows BIGINT,
  size TEXT,
  size_bytes BIGINT,
  rls BOOLEAN,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::TEXT AS name,
    t.schemaname::TEXT AS schema,
    COALESCE(s.n_live_tup, 0) AS rows,
    pg_size_pretty(pg_total_relation_size(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename)))::TEXT AS size,
    pg_total_relation_size(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename)) AS size_bytes,
    COALESCE(p.rowsecurity, false) AS rls,
    obj_description((quote_ident(t.schemaname) || '.' || quote_ident(t.tablename))::regclass, 'pg_class')::TEXT AS description
  FROM pg_tables t
  LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname AND t.schemaname = s.schemaname
  LEFT JOIN pg_class p ON t.tablename = p.relname
  WHERE t.schemaname = 'public'
  ORDER BY size_bytes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table schema
CREATE OR REPLACE FUNCTION get_table_schema(table_name TEXT)
RETURNS TABLE (
  column_name TEXT,
  data_type TEXT,
  is_nullable BOOLEAN,
  column_default TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.column_name::TEXT,
    c.data_type::TEXT,
    (c.is_nullable = 'YES') AS is_nullable,
    c.column_default::TEXT,
    pgd.description::TEXT
  FROM information_schema.columns c
  LEFT JOIN pg_catalog.pg_statio_all_tables st ON c.table_schema = st.schemaname AND c.table_name = st.relname
  LEFT JOIN pg_catalog.pg_description pgd ON pgd.objoid = st.relid AND pgd.objsubid = c.ordinal_position
  WHERE c.table_schema = 'public'
  AND c.table_name = get_table_schema.table_name
  ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get slow queries (requires pg_stat_statements extension)
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
  query TEXT,
  duration TEXT,
  calls BIGINT,
  avg_duration TEXT
) AS $$
BEGIN
  -- Check if pg_stat_statements extension exists
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    LEFT(s.query, 100)::TEXT AS query,
    (s.total_exec_time || 'ms')::TEXT AS duration,
    s.calls,
    (s.mean_exec_time || 'ms')::TEXT AS avg_duration
  FROM pg_stat_statements s
  WHERE s.mean_exec_time > 100
  ORDER BY s.mean_exec_time DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;
