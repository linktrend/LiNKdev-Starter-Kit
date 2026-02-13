# MCP Quick Setup Guide

This is a quick-start guide to get your MCP servers running in Cursor. For detailed information, see [README.md](README.md).

## Prerequisites

- Node.js installed
- Cursor IDE
- API keys/tokens for services you want to use

## Quick Setup (5 minutes)

### Step 1: Install Dependencies

From the repository root:

```bash
cd mcp/supabase && npm install && cd ../..
cd mcp/stripe && npm install && cd ../..
cd mcp/figma && npm install && cd ../..
cd mcp/shadcn && npm install && cd ../..
```

Or use this one-liner:

```bash
for dir in mcp/*/; do (cd "$dir" && npm install); done
```

### Step 2: Set Environment Variables

Add these to your `~/.zshrc` or `~/.bashrc`:

```bash
# Supabase
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Stripe
export STRIPE_SECRET_KEY="sk_test_..."

# Figma
export FIGMA_ACCESS_TOKEN="figd_..."
```

Then reload your shell:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

### Step 3: Restart Cursor

1. **Quit Cursor completely** (Cmd+Q on macOS)
2. Launch Cursor from your terminal (to ensure env vars are loaded)
3. Open the LiNKdev Starter Kit project
4. Wait 10-15 seconds for MCP servers to initialize

### Step 4: Test the Setup

In Cursor's AI chat, run:

```
mcp servers
```

You should see: SupabaseMCP, StripeMCP, FigmaMCP, ShadcnMCP

Test each server:

```
call SupabaseMCP.ping
call StripeMCP.ping
call FigmaMCP.ping
call ShadcnMCP.ping
```

All should return `{"status": "ok", ...}`

## Where to Get API Keys

### Supabase
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy "Project URL" → `SUPABASE_URL`
4. Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

### Stripe
1. Go to Stripe Dashboard
2. Navigate to Developers > API keys
3. Copy "Secret key" (starts with `sk_test_` or `sk_live_`)

### Figma
1. Go to Figma Settings
2. Navigate to Account > Personal access tokens
3. Click "Generate new token"
4. Copy the token (starts with `figd_`)

## Common Issues

### "Server not found"
- Restart Cursor completely (Cmd+Q, not just close window)
- Check `.cursor/mcp.json` exists in project root

### "Environment variable not set"
- Verify variables are set: `echo $SUPABASE_URL`
- Launch Cursor from terminal with variables set
- Check for typos in variable names

### "Authentication failed"
- Verify API keys are correct
- Check for extra whitespace
- Ensure you're using the correct key type (service role, secret key, etc.)

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [.cursor/12-mcp-rules.mdc](../.cursor/12-mcp-rules.mdc) for usage guidelines
- See [batch header](../docs/batch-headers/mcp-global-cleanup-restructure-20251113.md) for implementation details

## Available Tools

### Supabase
- `ping`, `listTables`, `listSchemas`, `select`, `executeSQL`

### Stripe
- `ping`, `listProducts`, `listCustomers`

### Figma
- `ping`, `listFiles`, `getFile`

### Shadcn
- `ping`, `listComponents`, `getComponent`

## Usage Examples

```
# List all database tables
call SupabaseMCP.listTables {"schemas": ["public"]}

# Get first 10 Stripe customers
call StripeMCP.listCustomers {"limit": 10}

# List installed Shadcn components
call ShadcnMCP.listComponents {"installedOnly": true}

# Get button component source
call ShadcnMCP.getComponent {"name": "button"}
```

---

**Need Help?** See [README.md](README.md) for comprehensive troubleshooting.

