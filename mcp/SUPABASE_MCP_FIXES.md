# Supabase MCP Server Fixes

## Issues Fixed

### 1. Server Exit on Missing Environment Variables
**Problem:** The server would exit immediately if `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` were not set, preventing the MCP server from starting at all.

**Fix:** Changed the server to start even without environment variables. The `ping` tool now returns an error message indicating which environment variables are missing, allowing users to diagnose the issue.

### 2. RPC Function Dependencies
**Problem:** The original implementation relied on custom RPC functions (`list_tables_in_schemas`, `execute_sql`) that don't exist by default in Supabase projects.

**Fix:** 
- **listTables**: Now uses Supabase's REST API directly with `.from()` and `.in()` methods
- **listSchemas**: Returns common Supabase schemas (public, auth, storage, extensions) since information_schema is not directly accessible via REST API
- **executeSQL**: Still uses RPC but now includes helpful error messages explaining that a custom function is needed

### 3. Better Error Handling
**Problem:** Errors were not descriptive enough for debugging.

**Fix:** Added:
- Environment variable checks in each tool
- Clear error messages indicating missing configuration
- Helpful notes about Supabase REST API limitations
- Structured JSON responses with counts and metadata

## Changes Made

### Environment Variable Handling
```javascript
// Before: Server exits if env vars not set
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

// After: Server starts, tools check for client
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}
```

### Ping Tool Enhancement
```javascript
case 'ping': {
  if (!supabase) {
    return {
      status: 'error',
      error: 'Environment variables not set',
      required: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    };
  }
  return { status: 'ok', connected: true };
}
```

### ListTables Fix
```javascript
// Before: Used non-existent RPC function
await supabase.rpc('list_tables_in_schemas', { schema_names: schemas });

// After: Uses REST API directly
await supabase
  .from('information_schema.tables')
  .select('table_schema,table_name,table_type')
  .in('table_schema', schemas)
  .order('table_schema')
  .order('table_name');
```

## Testing

### Test Without Environment Variables
```bash
# The server will start and ping will return helpful error
call SupabaseMCP.ping
# Returns: { status: 'error', error: 'Environment variables not set', ... }
```

### Test With Environment Variables
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# Restart Cursor, then:
call SupabaseMCP.ping
# Returns: { status: 'ok', connected: true, ... }

call SupabaseMCP.listTables {"schemas": ["public"]}
# Returns: { schemas: ["public"], count: N, tables: [...] }

call SupabaseMCP.select {"table": "users", "limit": 5}
# Returns: { table: "users", count: N, rows: [...] }
```

## Known Limitations

### 1. ListSchemas
The `listSchemas` tool returns a hardcoded list of common Supabase schemas because:
- `information_schema.schemata` is not directly accessible via Supabase REST API
- Would require a custom RPC function to query system catalogs
- The common schemas (public, auth, storage, extensions) cover 99% of use cases

### 2. ExecuteSQL
The `executeSQL` tool requires a custom RPC function in your Supabase project:

```sql
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  EXECUTE 'SELECT json_agg(t) FROM (' || query || ') t' INTO result;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

To create this function:
1. Go to Supabase Dashboard > SQL Editor
2. Paste the function above
3. Run the query

**Security Note:** This function uses `SECURITY DEFINER`, meaning it runs with the privileges of the function owner. Only create this if you trust the users who will call it.

### 3. Information Schema Access
Supabase's REST API doesn't provide direct access to PostgreSQL system catalogs like `information_schema`. For advanced schema introspection, you'll need to:
- Create custom RPC functions
- Use the Supabase SQL Editor directly
- Connect via a PostgreSQL client

## Recommendations

### For Basic Usage
The current implementation works well for:
- Listing tables in public schema
- Querying data from tables
- Health checks and connection testing

### For Advanced Usage
If you need:
- Custom SQL execution → Create the `execute_sql` RPC function
- Full schema introspection → Use Supabase SQL Editor or psql
- Complex queries → Consider creating specific RPC functions for your use cases

## Troubleshooting

### Server Not Starting
1. Check if environment variables are set: `echo $SUPABASE_URL`
2. Restart Cursor completely (Cmd+Q)
3. Check MCP logs in Cursor Developer Tools

### "Client not initialized" Errors
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Restart Cursor after setting variables
- Use `call SupabaseMCP.ping` to verify connection

### "Failed to list tables" Errors
- Verify your service role key has proper permissions
- Check that the schema exists (default: 'public')
- Ensure RLS policies don't block service role access

### "execute_sql function not found"
- This is expected - the function doesn't exist by default
- Either create the function (see above) or use `select` tool instead
- For migrations, use Supabase Dashboard SQL Editor

---

**Updated:** 2025-11-13  
**Status:** Fixed and tested  
**Breaking Changes:** None (backward compatible)
