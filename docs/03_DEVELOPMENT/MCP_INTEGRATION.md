# MCP Integration Guide

**Complete guide to Model Context Protocol (MCP) integration in the LiNKdev Starter Kit**

---

## Table of Contents

1. [MCP Overview](#mcp-overview)
2. [Available MCP Servers](#available-mcp-servers)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [Environment Variables](#environment-variables)
6. [Using MCP Tools](#using-mcp-tools)
7. [Testing MCP Servers](#testing-mcp-servers)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)
10. [Adding New MCP Servers](#adding-new-mcp-servers)

---

## MCP Overview

The **Model Context Protocol (MCP)** enables Cursor to interact with external services through standardized tools. The LiNKdev Starter Kit includes four MCP servers that provide seamless integration with Supabase, Stripe, Figma, and Shadcn/UI.

### What is MCP?

MCP is a protocol that allows AI assistants (like Cursor) to:
- Access external APIs and services
- Execute database queries
- Retrieve design files
- Manage components
- Perform operations through natural language commands

### Architecture

```
┌─────────────┐
│   Cursor    │
│     IDE     │
└──────┬──────┘
       │ JSON-RPC over stdio
       │
┌──────▼──────────────────────────────┐
│      MCP Protocol Layer              │
└──────┬───────────────────────────────┘
       │
   ┌───┴──────────────────────────┐
   │                              │
┌──▼──────────┐  ┌──────────────┐ │
│ SupabaseMCP │  │  StripeMCP   │ │
└─────────────┘  └──────────────┘ │
┌──────────────┐  ┌──────────────┐│
│  FigmaMCP    │  │  ShadcnMCP   ││
└──────────────┘  └──────────────┘│
```

### Benefits

- **Unified Interface**: Access multiple services through Cursor's AI chat
- **Type Safety**: Tools are strongly typed and validated
- **Security**: Environment variables keep secrets out of code
- **Extensibility**: Easy to add new MCP servers
- **Developer Experience**: Natural language tool invocation

---

## Available MCP Servers

### 1. Supabase MCP Server

**Location:** `mcp/supabase/`

**Purpose:** Database operations and queries for Supabase PostgreSQL.

**Tools:**

| Tool | Description | Parameters |
|------|-------------|------------|
| `ping` | Health check and connection verification | None |
| `listTables` | List all tables in specified schemas | `schemas: string[]` (default: `["public"]`) |
| `listSchemas` | List all database schemas | None |
| `select` | Execute SELECT queries on tables | `table: string`, `columns?: string[]`, `limit?: number`, `where?: object` |
| `executeSQL` | Execute arbitrary SQL statements | `sql: string` |

**Environment Variables:**
- `SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (bypasses RLS)

**Use Cases:**
- Querying database tables
- Inspecting schema structure
- Running migrations
- Debugging data issues
- Generating reports

### 2. Stripe MCP Server

**Location:** `mcp/stripe/`

**Purpose:** Payment and subscription management with Stripe.

**Tools:**

| Tool | Description | Parameters |
|------|-------------|------------|
| `ping` | Health check and API version verification | None |
| `listProducts` | List all Stripe products | `limit?: number` (default: 10, max: 100), `active?: boolean` |
| `listCustomers` | List all Stripe customers | `limit?: number` (default: 10, max: 100), `email?: string` |

**Environment Variables:**
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_test_` or `sk_live_`)

**Use Cases:**
- Viewing products and pricing
- Checking customer data
- Verifying subscription status
- Debugging payment issues

### 3. Figma MCP Server

**Location:** `mcp/figma/`

**Purpose:** Access Figma design files and projects.

**Tools:**

| Tool | Description | Parameters |
|------|-------------|------------|
| `ping` | Health check and authentication verification | None |
| `listFiles` | List files in a Figma project | `projectId: string` |
| `getFile` | Get detailed information about a specific file | `fileId: string`, `depth?: number` (default: 1) |

**Environment Variables:**
- `FIGMA_ACCESS_TOKEN` - Your Figma personal access token (starts with `figd_`)

**Use Cases:**
- Accessing design files
- Reviewing design specifications
- Extracting design tokens
- Checking component designs

### 4. Shadcn/UI MCP Server

**Location:** `mcp/shadcn/`

**Purpose:** Component discovery and source code retrieval for Shadcn/UI.

**Tools:**

| Tool | Description | Parameters |
|------|-------------|------------|
| `ping` | Health check and component count | None |
| `listComponents` | List all available Shadcn/UI components | `installedOnly?: boolean` (default: false) |
| `getComponent` | Get source code for a specific component | `name: string` |

**Environment Variables:**
- None (reads from local installation)

**Use Cases:**
- Discovering available components
- Viewing component source code
- Checking installed components
- Understanding component structure

---

## Installation & Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Cursor IDE** installed
- **API keys/tokens** for services you want to use

### Step 1: Install Dependencies

Install dependencies for all MCP servers:

```bash
# From repository root
for dir in mcp/*/; do (cd "$dir" && npm install); done
```

Or install individually:

```bash
cd mcp/supabase && npm install && cd ../..
cd mcp/stripe && npm install && cd ../..
cd mcp/figma && npm install && cd ../..
cd mcp/shadcn && npm install && cd ../..
```

### Step 2: Set Environment Variables

MCP servers load environment variables from your shell environment. You **must** set these before launching Cursor.

#### Option A: Shell Profile (Recommended)

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
open -a Cursor  # macOS
# or
cursor  # Linux/Windows
```

### Step 3: Verify Configuration

The MCP configuration file is located at `.cursor/mcp.json` (gitignored). It should reference environment variables using `${VAR_NAME}` syntax:

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
    },
    "StripeMCP": {
      "command": "node",
      "args": ["mcp/stripe/server.js"],
      "env": {
        "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}"
      }
    },
    "FigmaMCP": {
      "command": "node",
      "args": ["mcp/figma/server.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}"
      }
    },
    "ShadcnMCP": {
      "command": "node",
      "args": ["mcp/shadcn/server.js"]
    }
  }
}
```

### Step 4: Restart Cursor

**Important:** After setting environment variables:

1. **Quit Cursor completely** (Cmd+Q on macOS, not just close window)
2. Launch Cursor from a shell with environment variables set
3. Open the LiNKdev Starter Kit project
4. Wait 10-15 seconds for MCP servers to initialize

---

## Configuration

### How Cursor Attaches to MCP Servers

When Cursor starts:

1. Reads `.cursor/mcp.json` in your project root
2. For each server, spawns a Node.js process running the server script
3. Environment variables are passed from your shell to the server process
4. Server connects via stdio (standard input/output)
5. Cursor communicates with servers using JSON-RPC over stdio
6. Tools become available in Cursor's command palette and AI assistant

### Configuration File Structure

The `.cursor/mcp.json` file defines:

- **Server name**: Identifier used in tool calls (e.g., `SupabaseMCP`)
- **Command**: Node.js executable
- **Args**: Path to server script (relative to project root)
- **Env**: Environment variables (using `${VAR_NAME}` syntax)

### Updating Configuration

To modify server configuration:

1. Edit `.cursor/mcp.json`
2. Restart Cursor completely
3. Verify servers are loaded: `mcp servers`

---

## Environment Variables

### Required Variables

| Variable | Server | Description | Example |
|----------|--------|-------------|---------|
| `SUPABASE_URL` | SupabaseMCP | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | SupabaseMCP | Service role key (bypasses RLS) | `your-service-role-key` |
| `STRIPE_SECRET_KEY` | StripeMCP | Stripe secret key | `your_stripe_secret_key` |
| `FIGMA_ACCESS_TOKEN` | FigmaMCP | Figma personal access token | `your_figma_access_token` |

### Where to Get API Keys

#### Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings > API**
3. Copy **Project URL** → `SUPABASE_URL`
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **Important**: Use service role key, not anon key
   - Service role key bypasses Row Level Security

#### Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API keys**
3. Copy **Secret key** (starts with `sk_test_` or `sk_live_`)
   - ⚠️ **Important**: Use secret key, not publishable key

#### Figma

1. Go to [Figma Settings](https://www.figma.com/settings)
2. Navigate to **Account > Personal access tokens**
3. Click **Generate new token**
4. Copy the token (starts with `figd_`)

### Verifying Environment Variables

Check if variables are set:

```bash
echo $SUPABASE_URL
echo $STRIPE_SECRET_KEY
echo $FIGMA_ACCESS_TOKEN
```

If variables are not set, they won't be available to MCP servers.

---

## Using MCP Tools

### Basic Usage

MCP tools can be called in Cursor's AI chat using natural language or direct tool calls.

#### Natural Language

```
List all tables in the public schema
Show me the first 10 Stripe customers
Get the button component from Shadcn
```

#### Direct Tool Calls

```
call SupabaseMCP.listTables {"schemas": ["public"]}
call StripeMCP.listCustomers {"limit": 10}
call ShadcnMCP.getComponent {"name": "button"}
```

### Supabase Examples

#### List All Tables

```
call SupabaseMCP.listTables {"schemas": ["public"]}
```

Response:
```json
{
  "tables": [
    {"name": "users", "schema": "public"},
    {"name": "organizations", "schema": "public"},
    {"name": "billing_customers", "schema": "public"}
  ]
}
```

#### Query a Table

```
call SupabaseMCP.select {
  "table": "users",
  "columns": ["id", "email", "name"],
  "limit": 10
}
```

#### Execute SQL

```
call SupabaseMCP.executeSQL {
  "sql": "SELECT COUNT(*) as total_users FROM users"
}
```

⚠️ **Warning**: `executeSQL` can execute any SQL. Use with caution and only for read operations in production.

### Stripe Examples

#### List Products

```
call StripeMCP.listProducts {
  "limit": 20,
  "active": true
}
```

Response:
```json
{
  "products": [
    {
      "id": "prod_xxx",
      "name": "Pro Plan",
      "active": true,
      "description": "Professional features"
    }
  ]
}
```

#### List Customers

```
call StripeMCP.listCustomers {
  "limit": 10,
  "email": "user@example.com"
}
```

### Figma Examples

#### List Files in Project

```
call FigmaMCP.listFiles {
  "projectId": "1234567890"
}
```

#### Get File Details

```
call FigmaMCP.getFile {
  "fileId": "abc123def456",
  "depth": 2
}
```

### Shadcn Examples

#### List All Components

```
call ShadcnMCP.listComponents {"installedOnly": false}
```

#### List Installed Components Only

```
call ShadcnMCP.listComponents {"installedOnly": true}
```

#### Get Component Source

```
call ShadcnMCP.getComponent {"name": "button"}
```

Response:
```json
{
  "name": "button",
  "path": "components/ui/button.tsx",
  "source": "import * as React from 'react'\n..."
}
```

### Common Workflows

#### Database Inspection

```
# 1. Check connection
call SupabaseMCP.ping

# 2. List all schemas
call SupabaseMCP.listSchemas

# 3. List tables in public schema
call SupabaseMCP.listTables {"schemas": ["public"]}

# 4. Query a specific table
call SupabaseMCP.select {
  "table": "users",
  "limit": 5
}
```

#### Component Discovery

```
# 1. Check Shadcn installation
call ShadcnMCP.ping

# 2. List installed components
call ShadcnMCP.listComponents {"installedOnly": true}

# 3. Get component source
call ShadcnMCP.getComponent {"name": "card"}
```

#### Payment Verification

```
# 1. Check Stripe connection
call StripeMCP.ping

# 2. List active products
call StripeMCP.listProducts {"active": true, "limit": 10}

# 3. Find customer by email
call StripeMCP.listCustomers {"email": "user@example.com"}
```

---

## Testing MCP Servers

### Check Available Servers

In Cursor's AI chat or command palette:

```
mcp servers
```

Expected output:
- SupabaseMCP
- StripeMCP
- FigmaMCP
- ShadcnMCP

### Test Each Server

Run ping commands to verify connectivity:

```
call SupabaseMCP.ping
call StripeMCP.ping
call FigmaMCP.ping
call ShadcnMCP.ping
```

Expected responses:

- **SupabaseMCP**: `{"status": "ok", "supabaseUrl": "https://..."}`
- **StripeMCP**: `{"status": "ok", "stripeApiVersion": "2024-11-20.acacia"}`
- **FigmaMCP**: `{"status": "ok", "authenticated": true}`
- **ShadcnMCP**: `{"status": "ok", "installedComponents": 15}`

### Test Specific Tools

#### Supabase

```bash
# List tables
call SupabaseMCP.listTables

# Query users table
call SupabaseMCP.select {"table": "users", "limit": 5}
```

#### Stripe

```bash
# List products
call StripeMCP.listProducts {"limit": 5}

# List customers
call StripeMCP.listCustomers {"limit": 5}
```

#### Figma

```bash
# Verify authentication
call FigmaMCP.ping
```

#### Shadcn

```bash
# List installed components
call ShadcnMCP.listComponents {"installedOnly": true}

# Get button component
call ShadcnMCP.getComponent {"name": "button"}
```

### Manual Server Testing

You can test servers manually from the command line:

```bash
# Test Supabase server
cd mcp/supabase
node server.js

# Test Stripe server
cd mcp/stripe
node server.js
```

Note: Manual testing requires environment variables to be set in your shell.

---

## Troubleshooting

### Server Not Found

**Problem:** `Error: MCP server "SupabaseMCP" not found`

**Solutions:**
1. Check `.cursor/mcp.json` exists and is valid JSON
2. Restart Cursor completely (Cmd+Q, then relaunch)
3. Verify server paths are correct relative to project root
4. Ensure Node.js is installed: `which node`

### Environment Variable Not Set

**Problem:** `Error: SUPABASE_URL must be set` or `Error: Environment variable not set`

**Solutions:**
1. Verify variables are set: `echo $SUPABASE_URL`
2. Launch Cursor from a shell with variables set
3. Add variables to your shell profile (`~/.zshrc` or `~/.bashrc`)
4. Restart your terminal and Cursor
5. Check for typos in variable names

### Authentication Failed

**Problem:** `Error: 401 Unauthorized` or `authenticated: false`

**Solutions:**
1. Verify your API keys/tokens are correct and not expired
2. Check for extra whitespace in environment variable values
3. For Supabase: Ensure you're using the **service role key**, not anon key
4. For Stripe: Use the **secret key** (starts with `sk_`), not publishable key
5. For Figma: Generate a new personal access token if needed
6. Verify API keys have correct permissions

### Server Crashes on Startup

**Problem:** Server starts but immediately crashes

**Solutions:**
1. Check server logs in Cursor's Developer Tools (Help > Toggle Developer Tools)
2. Verify all dependencies are installed: `cd mcp/[server] && npm install`
3. Test the server manually: `node mcp/[server]/server.js`
4. Check for syntax errors in server.js files
5. Verify Node.js version: `node --version` (should be 18+)

### Tools Not Appearing

**Problem:** Server connects but tools don't show up

**Solutions:**
1. Wait 10-15 seconds after Cursor starts for servers to initialize
2. Check MCP logs in Developer Tools Console
3. Try calling tools directly: `call ServerName.toolName`
4. Restart Cursor and wait for full initialization
5. Verify server is responding: `call ServerName.ping`

### Permission Denied

**Problem:** `Error: EACCES: permission denied`

**Solutions:**
1. Make server scripts executable: `chmod +x mcp/*/server.js`
2. Check file ownership: `ls -la mcp/`
3. Ensure Node.js is installed and accessible: `which node`

### Connection Timeout

**Problem:** Tools timeout or hang

**Solutions:**
1. Check network connectivity
2. Verify API endpoints are accessible
3. Check for firewall or proxy issues
4. Review server logs for errors
5. Test API access directly (e.g., curl to Supabase URL)

### Invalid Tool Arguments

**Problem:** `Error: Invalid arguments` or tool returns error

**Solutions:**
1. Check tool parameter types and required fields
2. Verify JSON syntax in tool calls
3. Review tool documentation for correct parameters
4. Test with minimal parameters first (e.g., just `ping`)

---

## Security Best Practices

### 1. Never Commit Secrets

- `.cursor/mcp.json` is gitignored for this reason
- Never commit API keys or tokens
- Use environment variables for all secrets

### 2. Use Correct Key Types

- **Supabase**: Use service role key (not anon key)
- **Stripe**: Use secret key (not publishable key)
- **Figma**: Use personal access token (not OAuth tokens)

### 3. Rotate Keys Regularly

- Rotate API keys after team member changes
- Rotate keys if exposed or compromised
- Update environment variables when rotating

### 4. Limit Key Permissions

- Use read-only keys when possible
- Restrict API key scopes to minimum required
- Use separate keys for development and production

### 5. Monitor API Usage

- Watch for unexpected activity in service dashboards
- Set up alerts for unusual API usage patterns
- Review access logs regularly

### 6. Environment Variable Security

- Store environment variables in shell profile (not in code)
- Use secure secret management for production
- Never log environment variables
- Use different keys for different environments

### 7. Server Access Control

- Only authorized developers should have access to MCP servers
- Restrict access to `.cursor/mcp.json` configuration
- Use service accounts with minimal permissions

### 8. Code Review

- Review all changes to MCP server code
- Verify no hardcoded secrets are added
- Check that environment variables are used correctly

---

## Adding New MCP Servers

### Step 1: Create Server Directory

```bash
mkdir -p mcp/new-service
cd mcp/new-service
```

### Step 2: Initialize Package

Create `package.json`:

```json
{
  "name": "new-service-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "dotenv": "^16.0.0"
  }
}
```

### Step 3: Create Server Script

Create `server.js` following the standard pattern:

```javascript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.NEW_SERVICE_API_KEY;

if (!API_KEY) {
  console.error('Error: NEW_SERVICE_API_KEY must be set');
  process.exit(1);
}

// Initialize service client
// const client = new ServiceClient(API_KEY);

// Create MCP server
const server = new Server(
  {
    name: 'new-service-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const TOOLS = [
  {
    name: 'ping',
    description: 'Health check for New Service MCP server',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'exampleTool',
    description: 'Example tool description',
    inputSchema: {
      type: 'object',
      properties: {
        param: {
          type: 'string',
          description: 'Example parameter',
        },
      },
      required: ['param'],
    },
  },
];

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'ping':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'ok',
              service: 'new-service',
            }),
          },
        ],
      };

    case 'exampleTool':
      // Implement tool logic
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              result: 'success',
              data: args.param,
            }),
          },
        ],
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('New Service MCP server running on stdio');
}

main().catch(console.error);
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Add to Configuration

Add server to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "NewServiceMCP": {
      "command": "node",
      "args": ["mcp/new-service/server.js"],
      "env": {
        "NEW_SERVICE_API_KEY": "${NEW_SERVICE_API_KEY}"
      }
    }
  }
}
```

### Step 6: Set Environment Variable

Add to your shell profile:

```bash
export NEW_SERVICE_API_KEY="your-api-key"
```

### Step 7: Test Server

1. Restart Cursor
2. Test ping: `call NewServiceMCP.ping`
3. Test tools: `call NewServiceMCP.exampleTool {"param": "value"}`

### Step 8: Document Server

Update `mcp/README.md` with:
- Server description
- Available tools
- Required environment variables
- Usage examples

---

## Additional Resources

- **MCP Protocol**: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)
- **Cursor MCP Docs**: [https://docs.cursor.com/mcp](https://docs.cursor.com/mcp)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Stripe API**: [https://stripe.com/docs/api](https://stripe.com/docs/api)
- **Figma API**: [https://www.figma.com/developers/api](https://www.figma.com/developers/api)
- **Shadcn/UI**: [https://ui.shadcn.com/](https://ui.shadcn.com/)

---

## Related Documentation

- **Quick Setup**: [../../mcp/SETUP_GUIDE.md](../../mcp/SETUP_GUIDE.md)
- **MCP README**: [../../mcp/README.md](../../mcp/README.md)
- **Implementation Summary**: [../../MCP_IMPLEMENTATION_SUMMARY.md](../../MCP_IMPLEMENTATION_SUMMARY.md)
- **Development Guide**: [./DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

---

**Last Updated:** 2025-01-17  
**Maintained By:** LiNKdev Starter Kit Team
