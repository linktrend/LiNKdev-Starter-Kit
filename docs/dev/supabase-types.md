# Supabase Types Generation (Cloud)

## Overview
Types are generated from the **Supabase Cloud** database, not local instances.

## Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Project linked to cloud: `supabase link --project-ref <project_ref>`
- Valid project reference from Supabase Dashboard

## Generation Process

### Method 1: MCP (Recommended)
Use MCP tools to generate types directly from cloud:
- No local CLI setup required
- Secure, no secrets in local environment
- Integrated with CI/CD pipeline

### Method 2: Cloud-Linked CLI
If you have the project linked locally:

```bash
# Link to cloud project (one-time setup)
supabase link --project-ref <your-project-ref>

# Generate types from cloud
supabase gen types typescript --linked --schema public > apps/web/src/types/supabase.ts
```

## Important Notes
- **Never** use `--local` flag (points to local DB)
- **Never** commit service keys or project refs
- Types should reflect the current cloud schema
- Run this after schema changes via migrations

## CI Integration
Types generation is handled automatically in CI:
- Runs after successful migrations
- Updates type files in pull requests
- Validates type consistency

## Troubleshooting
- **Link errors**: Verify project ref and permissions
- **Type mismatches**: Ensure cloud schema is up to date
- **Missing types**: Check if migrations were applied successfully
