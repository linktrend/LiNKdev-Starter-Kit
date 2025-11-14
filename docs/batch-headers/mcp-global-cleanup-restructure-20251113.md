# MCP Global Cleanup and Restructure - 2025-11-13

## Scope
Complete restructuring of MCP (Model Context Protocol) servers into a unified `/mcp` directory with standardized implementations, secure environment variable handling, and comprehensive documentation. Target: 2-hour implementation.

## Inputs
- Existing MCP tool descriptors in `.cursor/projects/.../mcps/`
- Current MCP packages: `@jpisnice/shadcn-ui-mcp-server`, `figma-mcp-server`
- User requirements for unified MCP structure
- Security requirements: no hardcoded secrets, environment variable placeholders

## Plan
1. ✅ Create unified `/mcp` directory structure (supabase, stripe, figma, shadcn)
2. ✅ Implement Supabase MCP server with full operations (ping, listTables, listSchemas, select, executeSQL)
3. ✅ Implement Stripe MCP server with core tools (ping, listProducts, listCustomers)
4. ✅ Implement Figma MCP server with design file access (ping, listFiles, getFile)
5. ✅ Implement Shadcn MCP server for component management (ping, listComponents, getComponent)
6. ✅ Create secure `.cursor/mcp.json` with `${ENV_VAR}` placeholders
7. ✅ Create comprehensive `mcp/README.md` with setup, usage, and troubleshooting
8. ✅ Create `.cursor/12-mcp-rules.mdc` for Cursor integration guidelines
9. ✅ Create `mcp/.env.example` template for environment variables
10. ✅ Update `.gitignore` to ensure `.cursor/` directory is ignored
11. ✅ Install dependencies for all MCP servers

## Risks & Assumptions
- **Assumption**: User has environment variables set in shell before launching Cursor
- **Assumption**: `.cursor/mcp.json` is the correct location (not global Cursor settings)
- **Assumption**: MCP SDK version `^1.0.3` is compatible with Cursor's MCP implementation
- **Risk**: Environment variable substitution syntax may vary by Cursor version
- **Risk**: Supabase RPC functions (`execute_sql`, `list_tables_in_schemas`) may not exist, fallback to information_schema
- **Mitigation**: All servers include comprehensive error handling and fallback mechanisms

## Script Additions
None - MCP servers are standalone Node.js modules, not integrated into package.json scripts

## Implementation Details

### Directory Structure Created
```
mcp/
├── supabase/
│   ├── package.json
│   ├── server.js
│   └── node_modules/
├── stripe/
│   ├── package.json
│   ├── server.js
│   └── node_modules/
├── figma/
│   ├── package.json
│   ├── server.js
│   └── node_modules/
├── shadcn/
│   ├── package.json
│   ├── server.js
│   └── node_modules/
├── .env.example
└── README.md
```

### MCP Servers Implemented

#### 1. Supabase MCP Server
- **Tools**: ping, listTables, listSchemas, select, executeSQL
- **Dependencies**: @supabase/supabase-js, @modelcontextprotocol/sdk, dotenv
- **Environment**: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- **Features**: Full database operations, error handling, fallback queries

#### 2. Stripe MCP Server
- **Tools**: ping, listProducts, listCustomers
- **Dependencies**: stripe, @modelcontextprotocol/sdk, dotenv
- **Environment**: STRIPE_SECRET_KEY
- **Features**: Product/customer listing with filters and limits

#### 3. Figma MCP Server
- **Tools**: ping, listFiles, getFile
- **Dependencies**: node-fetch, @modelcontextprotocol/sdk, dotenv
- **Environment**: FIGMA_ACCESS_TOKEN
- **Features**: Figma API integration, file/project access

#### 4. Shadcn MCP Server
- **Tools**: ping, listComponents, getComponent
- **Dependencies**: @modelcontextprotocol/sdk, dotenv
- **Environment**: None (reads from local installation)
- **Features**: Component discovery, source code retrieval

### Configuration Files

#### `.cursor/mcp.json`
- Four server configurations (SupabaseMCP, StripeMCP, FigmaMCP, ShadcnMCP)
- All use `node` command with relative paths
- Environment variables use `${VAR_NAME}` placeholder syntax
- **SECURITY**: No hardcoded secrets, all from environment

#### `mcp/README.md`
- Complete setup instructions
- Tool documentation for all servers
- Environment variable configuration guide
- Testing procedures
- Comprehensive troubleshooting section
- Security best practices

#### `.cursor/12-mcp-rules.mdc`
- MCP server locations and structure
- Tool usage guidelines
- Environment variable requirements
- Restart procedures
- Development guidelines
- Best practices for MCP integration

#### `mcp/.env.example`
- Template for all required environment variables
- Instructions for setting in shell profile
- Clear documentation of purpose

### Dependencies Installed
- Supabase: 103 packages (0 vulnerabilities)
- Stripe: 94 packages (0 vulnerabilities)
- Figma: 97 packages (0 vulnerabilities, 1 deprecation warning)
- Shadcn: 91 packages (0 vulnerabilities)

### Security Measures
1. ✅ `.cursor/` directory added to `.gitignore`
2. ✅ No secrets in `.cursor/mcp.json` (only placeholders)
3. ✅ Environment variables loaded from shell, not files
4. ✅ Service role keys used for Supabase (not anon keys)
5. ✅ Secret keys used for Stripe (not publishable keys)
6. ✅ Documentation emphasizes security best practices

## Verification Steps

### 1. Verify Directory Structure
```bash
ls -la mcp/
# Should show: supabase/, stripe/, figma/, shadcn/, README.md, .env.example
```

### 2. Verify Dependencies Installed
```bash
for dir in mcp/*/; do echo "$dir:" && ls "$dir/node_modules" | wc -l; done
# Should show node_modules in each directory
```

### 3. Set Environment Variables
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export STRIPE_SECRET_KEY="sk_test_..."
export FIGMA_ACCESS_TOKEN="figd_..."
```

### 4. Test Servers Manually (Optional)
```bash
# Test each server individually
node mcp/supabase/server.js &
node mcp/stripe/server.js &
node mcp/figma/server.js &
node mcp/shadcn/server.js &
```

### 5. Restart Cursor
1. Quit Cursor completely (Cmd+Q)
2. Launch from shell with environment variables set
3. Wait 10-15 seconds for MCP servers to initialize

### 6. Test MCP Integration
```
# In Cursor AI chat:
mcp servers
# Should list: SupabaseMCP, StripeMCP, FigmaMCP, ShadcnMCP

call SupabaseMCP.ping
call StripeMCP.ping
call FigmaMCP.ping
call ShadcnMCP.ping
# All should return {"status": "ok", ...}
```

### 7. Test Specific Tools
```
call SupabaseMCP.listTables {"schemas": ["public"]}
call StripeMCP.listProducts {"limit": 5}
call FigmaMCP.ping
call ShadcnMCP.listComponents {"installedOnly": true}
```

## Environment Variables Required

### Supabase
- `SUPABASE_URL`: Project URL from Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (Settings > API)

### Stripe
- `STRIPE_SECRET_KEY`: Secret key from Stripe dashboard (starts with `sk_`)

### Figma
- `FIGMA_ACCESS_TOKEN`: Personal access token from Figma settings

### Shadcn
- None required

## Next Batch Suggestions

1. **MCP Tool Expansion**: Add more tools to existing servers based on usage patterns
2. **Error Monitoring**: Implement centralized logging for MCP server errors
3. **Performance Optimization**: Add caching for frequently accessed data
4. **Additional Servers**: Consider adding MCP servers for other services (GitHub, Linear, etc.)
5. **Testing Suite**: Create automated tests for MCP server tools
6. **Documentation**: Add video walkthrough or interactive tutorial
7. **CI Integration**: Add CI checks to verify MCP configuration validity

## Definition of Done Checklist

- [x] All acceptance criteria met
  - [x] Unified `/mcp` directory created
  - [x] All four MCP servers implemented
  - [x] Secure `.cursor/mcp.json` created
  - [x] Comprehensive documentation created
  - [x] Environment variable template provided
  - [x] `.gitignore` updated

- [x] Code quality checks
  - [x] All servers use @modelcontextprotocol/sdk pattern
  - [x] Error handling implemented in all tools
  - [x] Dependencies installed successfully
  - [x] No hardcoded secrets
  - [x] Consistent code style across servers

- [x] Documentation updated
  - [x] `mcp/README.md` created with full setup guide
  - [x] `.cursor/12-mcp-rules.mdc` created
  - [x] `mcp/.env.example` template created
  - [x] Batch header created

- [x] Security verified
  - [x] `.cursor/` directory gitignored
  - [x] No secrets in configuration files
  - [x] Environment variable placeholders used
  - [x] Security best practices documented

## Files Created/Modified

### Created
- `mcp/supabase/package.json`
- `mcp/supabase/server.js`
- `mcp/stripe/package.json`
- `mcp/stripe/server.js`
- `mcp/figma/package.json`
- `mcp/figma/server.js`
- `mcp/shadcn/package.json`
- `mcp/shadcn/server.js`
- `mcp/README.md`
- `mcp/.env.example`
- `.cursor/mcp.json`
- `.cursor/12-mcp-rules.mdc`
- `docs/batch-headers/mcp-global-cleanup-restructure-20251113.md`

### Modified
- `.gitignore` (added `.cursor/` directory)

## Notes

- All MCP servers follow the same pattern: Server → StdioServerTransport → Tool handlers
- Environment variables must be set before launching Cursor (not in project .env files)
- The `.cursor/mcp.json` file is gitignored to prevent secret leakage
- Each server is independent and can be updated/modified without affecting others
- Shadcn MCP server reads from local installation, no external API required
- Supabase MCP includes fallback queries for databases without custom RPC functions

---

**Status**: ✅ COMPLETE  
**Duration**: ~2 hours  
**Complexity**: High (multiple servers, security considerations, comprehensive documentation)  
**Impact**: Major improvement to development workflow and MCP integration

