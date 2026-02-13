# MCP Servers - LiNKdev Starter Kit

This directory contains all Model Context Protocol (MCP) servers for the LiNKdev Starter Kit. Each server is a standalone Node.js module that provides tools for interacting with external services through Cursor's MCP integration.

## Directory Structure

```
mcp/
├── supabase/          # Supabase database operations
│   ├── package.json
│   └── server.js
├── stripe/            # Stripe payment operations
│   ├── package.json
│   └── server.js
├── figma/             # Figma design file access
│   ├── package.json
│   └── server.js
├── shadcn/            # Shadcn/UI component management
│   ├── package.json
│   └── server.js
├── .env.example       # Environment variable template
└── README.md          # This file
```

## MCP Servers Overview

### 1. Supabase MCP Server

**Location:** `mcp/supabase/`

**Purpose:** Provides tools for interacting with your Supabase database.

**Tools:**
- `ping` - Health check and connection verification
- `listTables` - List all tables in specified schemas
- `listSchemas` - List all database schemas
- `select` - Execute SELECT queries on tables
- `executeSQL` - Execute arbitrary SQL statements (use with caution)

**Environment Variables Required:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (bypasses RLS)

**Usage Example:**
```
# In Cursor, use MCP tools:
call SupabaseMCP.ping
call SupabaseMCP.listTables {"schemas": ["public"]}
call SupabaseMCP.select {"table": "users", "limit": 10}
```

### 2. Stripe MCP Server

**Location:** `mcp/stripe/`

**Purpose:** Provides tools for interacting with Stripe payment APIs.

**Tools:**
- `ping` - Health check and API version verification
- `listProducts` - List all Stripe products
- `listCustomers` - List all Stripe customers

**Environment Variables Required:**
- `STRIPE_SECRET_KEY` - Your Stripe secret key

**Usage Example:**
```
call StripeMCP.ping
call StripeMCP.listProducts {"limit": 20, "active": true}
call StripeMCP.listCustomers {"limit": 10}
```

### 3. Figma MCP Server

**Location:** `mcp/figma/`

**Purpose:** Provides tools for accessing Figma design files and projects.

**Tools:**
- `ping` - Health check and authentication verification
- `listFiles` - List files in a Figma project
- `getFile` - Get detailed information about a specific file

**Environment Variables Required:**
- `FIGMA_ACCESS_TOKEN` - Your Figma personal access token

**Usage Example:**
```
call FigmaMCP.ping
call FigmaMCP.listFiles {"projectId": "123456"}
call FigmaMCP.getFile {"fileId": "abc123def456", "depth": 2}
```

### 4. Shadcn/UI MCP Server

**Location:** `mcp/shadcn/`

**Purpose:** Provides tools for managing shadcn/ui components in your project.

**Tools:**
- `ping` - Health check and component count
- `listComponents` - List all available shadcn/ui components
- `getComponent` - Get source code for a specific component

**Environment Variables Required:**
- None (reads from local installation)

**Usage Example:**
```
call ShadcnMCP.ping
call ShadcnMCP.listComponents {"installedOnly": true}
call ShadcnMCP.getComponent {"name": "button"}
```

## Installation

### 1. Install Dependencies

Each MCP server needs its dependencies installed:

```bash
# From the repository root
cd mcp/supabase && npm install && cd ../..
cd mcp/stripe && npm install && cd ../..
cd mcp/figma && npm install && cd ../..
cd mcp/shadcn && npm install && cd ../..
```

Or use this one-liner:

```bash
for dir in mcp/*/; do (cd "$dir" && npm install); done
```

### 2. Set Environment Variables

MCP servers load environment variables from your shell environment. You must set these **before launching Cursor**.

#### Option A: Set in Shell Profile (Recommended)

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# Supabase
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Stripe
export STRIPE_SECRET_KEY="your_stripe_secret_key"

# Figma
export FIGMA_ACCESS_TOKEN="your_figma_access_token"
```

Then reload your shell:

```bash
source ~/.zshrc  # or ~/.bashrc
```

#### Option B: Set Before Launching Cursor

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export STRIPE_SECRET_KEY="your_stripe_secret_key"
export FIGMA_ACCESS_TOKEN="your_figma_access_token"

# Launch Cursor from this shell
open -a Cursor
```

### 3. Configure Cursor

The MCP configuration file is located at `.cursor/mcp.json` in the repository root. This file is **gitignored** to prevent accidental secret commits.

The configuration uses `${VAR_NAME}` syntax to reference environment variables:

```json
{
  "mcpServers": {
    "SupabaseMCP": {
      "command": "node",
      "args": ["mcp/supabase/server.js"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
    // ... other servers
  }
}
```

### 4. Restart Cursor

After setting environment variables and configuring MCP servers:

1. **Quit Cursor completely** (Cmd+Q on macOS)
2. Launch Cursor from a shell with environment variables set
3. Open the LiNKdev Starter Kit project

## How Cursor Attaches to MCP Servers

When Cursor starts:

1. It reads `.cursor/mcp.json` in your project
2. For each server, it spawns a Node.js process running the server script
3. Environment variables are passed from your shell to the server process
4. The server connects via stdio (standard input/output)
5. Cursor communicates with servers using the MCP protocol
6. Tools become available in Cursor's command palette and AI assistant

## Testing MCP Servers

### Check Available Servers

In Cursor's AI chat or command palette:

```
mcp servers
```

This should list: SupabaseMCP, StripeMCP, FigmaMCP, ShadcnMCP

### Test Each Server

Run ping commands to verify connectivity:

```
call SupabaseMCP.ping
call StripeMCP.ping
call FigmaMCP.ping
call ShadcnMCP.ping
```

Expected responses:
- **SupabaseMCP:** `{"status": "ok", "supabaseUrl": "..."}`
- **StripeMCP:** `{"status": "ok", "stripeApiVersion": "..."}`
- **FigmaMCP:** `{"status": "ok", "authenticated": true}`
- **ShadcnMCP:** `{"status": "ok", "installedComponents": N}`

### Test Specific Tools

```
# Supabase: List tables
call SupabaseMCP.listTables

# Stripe: List products
call StripeMCP.listProducts {"limit": 5}

# Figma: Check authentication
call FigmaMCP.ping

# Shadcn: List installed components
call ShadcnMCP.listComponents {"installedOnly": true}
```

## Troubleshooting

### Server Not Found

**Problem:** `Error: MCP server "SupabaseMCP" not found`

**Solutions:**
1. Check `.cursor/mcp.json` exists and is valid JSON
2. Restart Cursor completely (Cmd+Q, then relaunch)
3. Verify the server paths are correct relative to project root

### Environment Variable Not Set

**Problem:** `Error: SUPABASE_URL must be set`

**Solutions:**
1. Verify environment variables are set in your shell: `echo $SUPABASE_URL`
2. Launch Cursor from a shell with variables set
3. Add variables to your shell profile (`~/.zshrc` or `~/.bashrc`)
4. Restart your terminal and Cursor

### Authentication Failed

**Problem:** `Error: 401 Unauthorized` or `authenticated: false`

**Solutions:**
1. Verify your API keys/tokens are correct and not expired
2. Check for extra whitespace in environment variable values
3. For Supabase: Ensure you're using the **service role key**, not anon key
4. For Stripe: Use the **secret key** (starts with `sk_`), not publishable key
5. For Figma: Generate a new personal access token if needed

### Server Crashes on Startup

**Problem:** Server starts but immediately crashes

**Solutions:**
1. Check server logs in Cursor's Developer Tools (Help > Toggle Developer Tools)
2. Verify all dependencies are installed: `cd mcp/[server] && npm install`
3. Test the server manually: `node mcp/[server]/server.js`
4. Check for syntax errors in server.js files

### Tools Not Appearing

**Problem:** Server connects but tools don't show up

**Solutions:**
1. Wait 10-15 seconds after Cursor starts for servers to initialize
2. Check MCP logs in Developer Tools Console
3. Try calling tools directly: `call ServerName.toolName`
4. Restart Cursor and wait for full initialization

### Permission Denied

**Problem:** `Error: EACCES: permission denied`

**Solutions:**
1. Make server scripts executable: `chmod +x mcp/*/server.js`
2. Check file ownership: `ls -la mcp/`
3. Ensure Node.js is installed and accessible: `which node`

## Security Best Practices

1. **Never commit secrets** - `.cursor/mcp.json` is gitignored for this reason
2. **Use service/secret keys** - Not public/publishable keys
3. **Rotate keys regularly** - Especially after team member changes
4. **Limit key permissions** - Use read-only keys when possible
5. **Monitor API usage** - Watch for unexpected activity in service dashboards

## Updating MCP Servers

To update a server's dependencies:

```bash
cd mcp/[server-name]
npm update
npm install
```

To modify a server's tools, edit the `server.js` file and restart Cursor.

## Adding New MCP Servers

1. Create a new directory: `mcp/new-service/`
2. Add `package.json` with dependencies
3. Create `server.js` implementing MCP protocol
4. Add configuration to `.cursor/mcp.json`
5. Install dependencies: `cd mcp/new-service && npm install`
6. Restart Cursor

## Additional Resources

- [Cursor MCP Rules](.cursor/12-mcp-rules.mdc) - MCP integration guidelines for Cursor
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Cursor MCP Guide](https://docs.cursor.com/mcp)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [Shadcn/UI Documentation](https://ui.shadcn.com/)

## Support

For issues with:
- **MCP servers**: Check this README and troubleshooting section
- **Cursor integration**: See Cursor documentation
- **API errors**: Check service-specific documentation
- **Project-specific issues**: See main project README

---

**Last Updated:** 2025-01-13  
**Maintained By:** LiNKdev Starter Kit Team
