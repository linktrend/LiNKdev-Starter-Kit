# Migration Complete ✅

**Date:** November 19, 2025  
**Status:** Successfully migrated from `/Users/carlossalas/Projects/LTM-Starter-Kit` to `/Users/carlossalas/Projects/Dev_Apps/templates/ltm-starter-kit`

## What Was Done

### ✅ Phase 1: Configuration Updates

1. **Updated `.cursor/mcp.json`**
   - Changed absolute paths to relative paths (`mcp/supabase/server.js` instead of `/Users/carlossalas/Projects/LTM-Starter-Kit/mcp/...`)
   - Changed command from `/opt/homebrew/bin/node` to `node` (uses system PATH)
   - Added Supabase environment variables (hardcoded, app-specific)
   - Configured Stripe and Figma to use environment variables from shell

2. **Created `.env` file**
   - Location: `/Users/carlossalas/Projects/Dev_Apps/templates/ltm-starter-kit/.env`
   - Contains Supabase credentials (app-specific)
   - File is gitignored (as expected)

3. **Updated `~/.zshrc`**
   - Added `STRIPE_SECRET_KEY` (shared across all apps)
   - Added `FIGMA_ACCESS_TOKEN` (shared across all apps)
   - Existing Supabase variables remain (for backward compatibility)

### ✅ Phase 2: Git/GitHub Migration

1. **Verified new location Git remotes**
   - `origin`: `https://github.com/linktrendmedia/LTM-Starter-Kit.git` ✅
   - `upstream`: `https://github.com/antoineross/Hikari.git` ✅

2. **Unlinked original location**
   - Removed `origin` remote from `/Users/carlossalas/Projects/LTM-Starter-Kit`
   - Removed `upstream` remote from `/Users/carlossalas/Projects/LTM-Starter-Kit`
   - Prevents accidental pushes from old location

### ✅ Phase 3: Archive Original

1. **Renamed original folder**
   - `/Users/carlossalas/Projects/LTM-Starter-Kit` → `/Users/carlossalas/Projects/LTM-Starter-Kit-old`
   - Original folder preserved as backup
   - Can be safely deleted after verification period

## Current Configuration

### MCP Servers Configuration

**File:** `.cursor/mcp.json`

- **SupabaseMCP:** Uses hardcoded credentials (app-specific)
  - URL: `https://YOUR_PROJECT_REF.supabase.co`
  - Service Role Key: Configured
  
- **StripeMCP:** Uses environment variable `${STRIPE_SECRET_KEY}`
  - Loaded from shell profile
  
- **FigmaMCP:** Uses environment variable `${FIGMA_ACCESS_TOKEN}`
  - Loaded from shell profile
  
- **ShadcnMCP:** No credentials needed
  - Reads from local installation

### Environment Variables

**Shell Profile (`~/.zshrc`):**
```bash
# Shared Stripe account (same for all apps)
export STRIPE_SECRET_KEY=sk_***REDACTED***

# Shared Figma account (same for all apps)
export FIGMA_ACCESS_TOKEN=figd_***REDACTED***
```

**Application `.env` file:**
```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Next Steps

### 1. Reload Shell Environment
```bash
source ~/.zshrc
```

### 2. Close Old Workspace in Cursor
- Close the workspace at `/Users/carlossalas/Projects/LTM-Starter-Kit-old` (if still open)

### 3. Open New Workspace
- Open `/Users/carlossalas/Projects/Dev_Apps/templates/ltm-starter-kit` in Cursor
- **Important:** Restart Cursor completely (Cmd+Q) to load new environment variables

### 4. Verify MCP Servers
After restarting Cursor, test MCP servers:
```
mcp servers
call SupabaseMCP.ping
call StripeMCP.ping
call FigmaMCP.ping
call ShadcnMCP.ping
```

All should return `{"status": "ok", ...}`

### 5. Verify Git Status
```bash
cd /Users/carlossalas/Projects/Dev_Apps/templates/ltm-starter-kit
git remote -v
git status
```

Should show:
- `origin` pointing to `https://github.com/linktrendmedia/LTM-Starter-Kit.git`
- `upstream` pointing to `https://github.com/antoineross/Hikari.git`
- Clean working directory (or your current branch state)

## Important Notes

### About the Old Location
- The original folder has been renamed to `LTM-Starter-Kit-old`
- Git remotes have been removed (prevents accidental pushes)
- You can safely delete it after verifying everything works in the new location

### About Environment Variables
- **Stripe and Figma:** Shared across all apps (set in shell profile)
- **Supabase:** App-specific (set in `.env` file and `.cursor/mcp.json`)
- **Shadcn:** No credentials needed (reads from local installation)

### About MCP Configuration
- MCP servers use relative paths (work from any location)
- Supabase credentials are hardcoded in `.cursor/mcp.json` (app-specific)
- Stripe and Figma use environment variables (shared)
- `.cursor/mcp.json` is gitignored (as configured)

## Troubleshooting

### If MCP servers don't work:
1. Ensure you've restarted Cursor completely (Cmd+Q)
2. Verify environment variables are set: `echo $STRIPE_SECRET_KEY`
3. Check `.cursor/mcp.json` paths are relative
4. Verify `.env` file exists with Supabase credentials

### If Git doesn't work:
1. Verify remotes: `git remote -v`
2. Check you're in the correct directory
3. Ensure you have network access

### If you need to rollback:
1. The original folder is at `/Users/carlossalas/Projects/LTM-Starter-Kit-old`
2. You can restore Git remotes if needed
3. All configurations are preserved

---

**Migration completed successfully!** 🎉

The new primary location is: `/Users/carlossalas/Projects/Dev_Apps/templates/ltm-starter-kit`

