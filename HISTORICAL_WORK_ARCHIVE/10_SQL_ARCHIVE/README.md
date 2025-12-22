# SQL Archive

**Archive Date:** December 22, 2025  
**Purpose:** Historical SQL files and migration scripts

---

## Overview

This directory is intended to store historical SQL files that were referenced in documentation but may have been moved, deleted, or consolidated into other locations.

---

## Expected Files

Based on historical documentation, the following SQL files were referenced:

### 1. CONSOLIDATED_MIGRATIONS.sql
**Status:** Not found in current repository  
**Original Location:** `docs/CONSOLIDATED_MIGRATIONS.sql`  
**Purpose:** Consolidated database migration scripts

**Note:** This file may have been:
- Moved to `apps/web/supabase/migrations/`
- Consolidated into individual migration files
- Removed after migrations were applied to production

### 2. create-admin-account.sql
**Status:** Not found in current repository  
**Original Location:** `docs/create-admin-account.sql`  
**Purpose:** Script to create initial admin account

**Note:** This file may have been:
- Moved to a different location
- Integrated into seed scripts
- Removed after initial setup

---

## Current Migration Location

Active database migrations are located in:
```
apps/web/supabase/migrations/
```

This directory contains all production migration files in chronological order.

---

## Seed Scripts

Database seed scripts are located in:
```
apps/web/supabase/seed.sql
```

---

## How to Find SQL Content

If you need to find SQL content that was previously documented:

### 1. Check Migration Files
```bash
ls -la apps/web/supabase/migrations/
```

### 2. Search for SQL Content
```bash
# Search for specific SQL patterns
grep -r "CREATE TABLE" apps/web/supabase/migrations/
grep -r "INSERT INTO" apps/web/supabase/
```

### 3. Check Documentation
```bash
# Search documentation for SQL references
grep -r "\.sql" docs/
```

### 4. Check Git History
```bash
# Find when files were moved or deleted
git log --all --full-history -- "docs/*.sql"
git log --all --full-history -- "**/*.sql"
```

---

## Archive Purpose

This directory serves as a placeholder for historical SQL files that were referenced in documentation but are no longer in their original locations. If you have copies of these files or find them in git history, they can be placed here for reference.

---

## Related Documentation

For current database schema and migration information, see:
- `HISTORICAL_WORK_ARCHIVE/06_DATABASE_WORK/DATABASE_HISTORY.md`
- `apps/web/supabase/migrations/` - Active migration files
- `docs/DB_MIGRATION_INVENTORY.md` - Migration inventory
- `docs/SCHEMA_EXPANSION_SUMMARY.md` - Schema expansion details

---

**Note:** This is an archive directory for historical reference. Active SQL files should be maintained in their proper locations within the project structure.
