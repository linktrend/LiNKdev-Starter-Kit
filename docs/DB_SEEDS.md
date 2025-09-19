# Database Seeds Policy — Cloud-Only

## Overview
This project uses **idempotent seeds** for cloud database initialization. No destructive resets are allowed in production.

## Core Principles
- **No destructive resets** in cloud
- **Idempotent inserts** only
- **One-time execution** via MCP
- **Safe for re-runs** without side effects

## Seed Patterns

### Basic Idempotent Insert
```sql
INSERT INTO public.organizations (id, name, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Org', NOW())
ON CONFLICT (id) DO NOTHING;
```

### Conditional Data
```sql
INSERT INTO public.users (id, email, name)
SELECT '00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User'
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001'
);
```

### Reference Data
```sql
INSERT INTO public.roles (id, name, description)
VALUES 
  ('admin', 'Administrator', 'Full system access'),
  ('user', 'User', 'Standard user access'),
  ('viewer', 'Viewer', 'Read-only access')
ON CONFLICT (id) DO NOTHING;
```

## Execution Process

### Via MCP (Recommended)
1. Create seed SQL file in `apps/web/supabase/seeds/`
2. Use MCP tools to execute seeds
3. Verify data was inserted correctly
4. Document seed execution

### One-Time Setup
```sql
-- Example: Demo organization setup
INSERT INTO public.organizations (id, name, slug, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 'demo-org', NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Test Company', 'test-company', NOW())
ON CONFLICT (id) DO NOTHING;

-- Example: Demo users
INSERT INTO public.users (id, email, name, organization_id)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@demo.com', 'Demo Admin', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 'user@demo.com', 'Demo User', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
```

## Prohibited Patterns
❌ **Never use these in cloud:**
- `TRUNCATE` statements
- `DELETE` without WHERE conditions
- `DROP` statements
- Any destructive operations

## Verification
After seeding:
1. Check record counts: `SELECT COUNT(*) FROM table_name;`
2. Verify data integrity
3. Test application functionality
4. Document seed results

## Rollback
If seeds cause issues:
1. Identify problematic data
2. Create targeted cleanup SQL
3. Execute via MCP
4. Verify cleanup success

## Best Practices
- Use UUIDs for all primary keys
- Include `created_at` timestamps
- Test seeds in development first
- Keep seeds minimal and focused
- Document seed purposes clearly
