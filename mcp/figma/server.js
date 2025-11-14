#!/usr/bin/env node

/**
 * Figma MCP Server
 * 
 * Provides Model Context Protocol tools for interacting with Figma:
 * - ping: Health check
 * - listFiles: List files in a Figma project
 * - getFile: Get detailed information about a specific Figma file
 * 
 * Environment Variables Required:
 * - FIGMA_ACCESS_TOKEN: Your Figma personal access token
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_API_BASE = 'https://api.figma.com/v1';

if (!FIGMA_ACCESS_TOKEN) {
  console.error('Error: FIGMA_ACCESS_TOKEN must be set');
  process.exit(1);
}

// Create MCP server
const server = new Server(
  {
    name: 'figma-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to make Figma API requests
async function figmaRequest(endpoint) {
  const response = await fetch(`${FIGMA_API_BASE}${endpoint}`, {
    headers: {
      'X-Figma-Token': FIGMA_ACCESS_TOKEN,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Figma API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Tool definitions
const TOOLS = [
  {
    name: 'ping',
    description: 'Health check for Figma MCP server',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'listFiles',
    description: 'List files in a Figma project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the Figma project',
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'getFile',
    description: 'Get detailed information about a specific Figma file',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the Figma file (from the file URL)',
        },
        depth: {
          type: 'number',
          description: 'Depth of the document tree to retrieve (default: 1)',
          default: 1,
        },
      },
      required: ['fileId'],
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
        // Test the token by making a simple API call
        try {
          await figmaRequest('/me');
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  status: 'ok',
                  server: 'figma-mcp-server',
                  version: '1.0.0',
                  authenticated: true,
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  status: 'error',
                  server: 'figma-mcp-server',
                  version: '1.0.0',
                  authenticated: false,
                  error: error.message,
                }, null, 2),
              },
            ],
          };
        }
      }

      case 'listFiles': {
        const { projectId } = args;

        if (!projectId) {
          throw new Error('projectId is required');
        }

        const data = await figmaRequest(`/projects/${projectId}/files`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                projectId,
                files: data.files || [],
              }, null, 2),
            },
          ],
        };
      }

      case 'getFile': {
        const { fileId, depth = 1 } = args;

        if (!fileId) {
          throw new Error('fileId is required');
        }

        const data = await figmaRequest(`/files/${fileId}?depth=${depth}`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                fileId,
                name: data.name,
                lastModified: data.lastModified,
                thumbnailUrl: data.thumbnailUrl,
                version: data.version,
                document: data.document,
                components: data.components,
                styles: data.styles,
              }, null, 2),
            },
          ],
        };
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
  console.error('Figma MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});














