# Database Operations — Cloud-Only Policy

## Overview
This project enforces **cloud-only** Supabase usage. Local database instances are **prohibited** for production data.

## Migration Flow
All database changes must go through the cloud migration process:

1. **Create Migration**: Write SQL in `apps/web/supabase/migrations/`
2. **Apply via MCP**: Use MCP tools to apply migrations to cloud
3. **Verify**: Check migration status and rollback if needed
4. **Document**: Update `docs/DB_MIGRATION_RUN.md` with results

**Source**: See `docs/DB_MIGRATION_RUN.md` for detailed migration procedures.

## Prohibited Commands
❌ **Never run these locally:**
- `supabase start`
- `supabase stop` 
- `supabase db reset`
- `supabase db push`
- `supabase db pull`
- Any localhost:5432 or 127.0.0.1:5432 connections

## Allowed Operations
✅ **Use these instead:**
- MCP tools for migrations and queries
- CI pipeline for automated migrations
- Cloud Supabase Dashboard for inspection
- `supabase link` (to connect CLI to cloud project)

## Emergency Procedures
If a destructive change is needed:

1. **Open PR** with migration file and clear description
2. **Run via MCP** with explicit confirmation
3. **Document** the change and rollback procedure
4. **Notify team** before applying destructive changes

## Seeds Policy
- **No destructive resets** in cloud
- Use idempotent inserts: `INSERT ... ON CONFLICT DO NOTHING`
- Apply seeds via MCP, not local commands
- See `docs/DB_SEEDS.md` for patterns

## Types Generation
- Types are generated from **Cloud** database
- Do not point CLI to local DB
- Use MCP or cloud-linked CLI for type generation
- See `scripts/supabase-types.README.md` for procedures

## Guardrails
- CI will fail if local Supabase commands are detected
- Pre-commit hooks check for localhost references
- Package scripts redirect to cloud-only alternatives

## Troubleshooting
- **Connection issues**: Check cloud project status
- **Migration failures**: Use MCP rollback capabilities
- **Type mismatches**: Regenerate from cloud schema
- **RLS issues**: Verify policies in cloud dashboard
