#!/usr/bin/env node

/**
 * Supabase MCP Server
 * 
 * Provides Model Context Protocol tools for interacting with Supabase:
 * - ping: Health check
 * - listTables: List all tables in specified schemas
 * - listSchemas: List all schemas in the database
 * - select: Execute SELECT queries
 * - executeSQL: Execute arbitrary SQL statements
 * 
 * Environment Variables Required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (bypasses RLS)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from common locations (optional convenience).
// Credentials must come from the environment; never hardcode keys in-repo.
for (const envPath of [join(__dirname, '../../.env'), join(process.cwd(), '.env')]) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables for Supabase MCP server:');
  console.error('- SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Create MCP server
const server = new Server(
  {
    name: 'supabase-mcp-server',
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
    description: 'Health check for Supabase MCP server',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'listTables',
    description: 'List all tables in specified schemas',
    inputSchema: {
      type: 'object',
      properties: {
        schemas: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of schemas to query (defaults to ["public"])',
          default: ['public'],
        },
      },
    },
  },
  {
    name: 'listSchemas',
    description: 'List all schemas in the database',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'select',
    description: 'Execute a SELECT query on a table',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table name to query',
        },
        columns: {
          type: 'string',
          description: 'Columns to select (comma-separated, or "*" for all)',
          default: '*',
        },
        filter: {
          type: 'object',
          description: 'Filter conditions (e.g., {"id": 1})',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of rows to return',
          default: 100,
        },
      },
      required: ['table'],
    },
  },
  {
    name: 'executeSQL',
    description: 'Execute arbitrary SQL statement (use with caution)',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SQL query to execute',
        },
      },
      required: ['query'],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'ping': {
        if (!supabase) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  status: 'error',
                  server: 'supabase-mcp-server',
                  version: '1.0.0',
                  error: 'Environment variables not set',
                  required: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
                }, null, 2),
              },
            ],
          };
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'ok',
                server: 'supabase-mcp-server',
                version: '1.0.0',
                supabaseUrl: SUPABASE_URL,
                connected: true,
              }, null, 2),
            },
          ],
        };
      }

      case 'listTables': {
        if (!supabase) {
          throw new Error('Supabase client not initialized. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
        }

        const schemas = args.schemas || ['public'];
        
        // Use direct SQL query via Supabase REST API
        const query = `
          SELECT 
            table_schema,
            table_name,
            table_type
          FROM information_schema.tables
          WHERE table_schema = ANY(ARRAY[${schemas.map((_, i) => `$${i + 1}`).join(',')}])
          ORDER BY table_schema, table_name;
        `;
        
        try {
          // Use Supabase's from() with a raw SQL query
          const { data, error } = await supabase
            .from('information_schema.tables')
            .select('table_schema,table_name,table_type')
            .in('table_schema', schemas)
            .order('table_schema')
            .order('table_name');

          if (error) {
            throw new Error(`Failed to list tables: ${error.message}`);
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  schemas,
                  count: data?.length || 0,
                  tables: data || [],
                }, null, 2),
              },
            ],
          };
        } catch (err) {
          throw new Error(`Failed to list tables: ${err.message}`);
        }
      }

      case 'listSchemas': {
        if (!supabase) {
          throw new Error('Supabase client not initialized. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
        }

        // Note: information_schema views are not directly accessible via Supabase REST API
        // Return common schemas as a workaround
        const commonSchemas = [
          { schema_name: 'public', description: 'Default public schema' },
          { schema_name: 'auth', description: 'Supabase auth schema' },
          { schema_name: 'storage', description: 'Supabase storage schema' },
          { schema_name: 'extensions', description: 'PostgreSQL extensions' },
        ];

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                note: 'Common Supabase schemas (information_schema not directly accessible via REST API)',
                schemas: commonSchemas,
              }, null, 2),
            },
          ],
        };
      }

      case 'select': {
        if (!supabase) {
          throw new Error('Supabase client not initialized. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
        }

        const { table, columns = '*', filter, limit = 100 } = args;

        if (!table) {
          throw new Error('Table name is required');
        }

        let query = supabase.from(table).select(columns);

        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
          throw new Error(`SELECT failed: ${error.message}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                table,
                count: data?.length || 0,
                rows: data || [],
              }, null, 2),
            },
          ],
        };
      }

      case 'executeSQL': {
        if (!supabase) {
          throw new Error('Supabase client not initialized. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
        }

        const { query } = args;

        if (!query) {
          throw new Error('SQL query is required');
        }

        // Note: Direct SQL execution requires a custom RPC function in your Supabase project
        // You need to create a function like:
        // CREATE OR REPLACE FUNCTION execute_sql(query text)
        // RETURNS json AS $$
        // BEGIN
        //   RETURN query_to_json(query);
        // END;
        // $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        try {
          const { data, error } = await supabase.rpc('execute_sql', { query });

          if (error) {
            throw new Error(`SQL execution failed: ${error.message}. Note: You may need to create an execute_sql RPC function in your Supabase project.`);
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  query,
                  result: data || { success: true },
                }, null, 2),
              },
            ],
          };
        } catch (err) {
          throw new Error(`SQL execution failed: ${err.message}`);
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            tool: name,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Supabase MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

