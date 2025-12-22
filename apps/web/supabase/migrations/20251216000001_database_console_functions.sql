-- Migration: Database Console Helper Functions
-- Description: Creates RPC functions for database statistics and table information
-- Date: 2025-12-16

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

-- Function to execute read-only queries
CREATE OR REPLACE FUNCTION execute_read_only_query(query_text TEXT)
RETURNS SETOF JSON AS $$
DECLARE
  result_row RECORD;
  result_json JSON;
BEGIN
  -- Execute the query and return results as JSON
  FOR result_row IN EXECUTE query_text LOOP
    result_json := row_to_json(result_row);
    RETURN NEXT result_json;
  END LOOP;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_size() TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_connections() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cache_hit_ratio() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_list() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_schema(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_slow_queries() TO authenticated;
GRANT EXECUTE ON FUNCTION execute_read_only_query(TEXT) TO authenticated;
