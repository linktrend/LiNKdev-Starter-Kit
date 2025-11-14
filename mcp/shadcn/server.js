#!/usr/bin/env node

/**
 * Shadcn/UI MCP Server
 * 
 * Provides Model Context Protocol tools for interacting with shadcn/ui components:
 * - ping: Health check
 * - listComponents: List all available shadcn/ui components
 * - getComponent: Get detailed information about a specific component
 * 
 * No environment variables required - reads from local shadcn/ui installation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create MCP server
const server = new Server(
  {
    name: 'shadcn-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Common shadcn/ui components
const SHADCN_COMPONENTS = [
  'accordion',
  'alert',
  'alert-dialog',
  'aspect-ratio',
  'avatar',
  'badge',
  'button',
  'calendar',
  'card',
  'checkbox',
  'collapsible',
  'command',
  'context-menu',
  'dialog',
  'dropdown-menu',
  'form',
  'hover-card',
  'input',
  'label',
  'menubar',
  'navigation-menu',
  'popover',
  'progress',
  'radio-group',
  'scroll-area',
  'select',
  'separator',
  'sheet',
  'skeleton',
  'slider',
  'switch',
  'table',
  'tabs',
  'textarea',
  'toast',
  'toggle',
  'tooltip',
];

// Helper function to find component in project
function findComponentPath(componentName) {
  const possiblePaths = [
    // Web app components
    join(__dirname, '../../apps/web/src/components/ui', `${componentName}.tsx`),
    // Shared UI package
    join(__dirname, '../../packages/ui/src', `${componentName}.tsx`),
    // Alternative naming
    join(__dirname, '../../apps/web/src/components/ui', `${componentName}.ts`),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  return null;
}

// Helper function to list installed components
function listInstalledComponents() {
  const componentDirs = [
    join(__dirname, '../../apps/web/src/components/ui'),
    join(__dirname, '../../packages/ui/src'),
  ];

  const installedComponents = new Set();

  for (const dir of componentDirs) {
    if (existsSync(dir)) {
      try {
        const files = readdirSync(dir);
        files.forEach(file => {
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const componentName = file.replace(/\.(tsx|ts)$/, '');
            installedComponents.add(componentName);
          }
        });
      } catch (error) {
        // Directory not accessible, skip
      }
    }
  }

  return Array.from(installedComponents);
}

// Tool definitions
const TOOLS = [
  {
    name: 'ping',
    description: 'Health check for Shadcn/UI MCP server',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'listComponents',
    description: 'List all available shadcn/ui components (both standard and installed)',
    inputSchema: {
      type: 'object',
      properties: {
        installedOnly: {
          type: 'boolean',
          description: 'Only show components installed in the project',
          default: false,
        },
      },
    },
  },
  {
    name: 'getComponent',
    description: 'Get detailed information about a specific shadcn/ui component',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name (e.g., "button", "dialog")',
        },
      },
      required: ['name'],
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
        const installedCount = listInstalledComponents().length;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'ok',
                server: 'shadcn-mcp-server',
                version: '1.0.0',
                installedComponents: installedCount,
                availableComponents: SHADCN_COMPONENTS.length,
              }, null, 2),
            },
          ],
        };
      }

      case 'listComponents': {
        const { installedOnly = false } = args;

        if (installedOnly) {
          const installed = listInstalledComponents();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  count: installed.length,
                  components: installed.sort(),
                  type: 'installed',
                }, null, 2),
              },
            ],
          };
        }

        const installed = listInstalledComponents();
        const componentsWithStatus = SHADCN_COMPONENTS.map(comp => ({
          name: comp,
          installed: installed.includes(comp),
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                count: SHADCN_COMPONENTS.length,
                installedCount: installed.length,
                components: componentsWithStatus,
              }, null, 2),
            },
          ],
        };
      }

      case 'getComponent': {
        const { name: componentName } = args;

        if (!componentName) {
          throw new Error('Component name is required');
        }

        const componentPath = findComponentPath(componentName);

        if (!componentPath) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  name: componentName,
                  installed: false,
                  available: SHADCN_COMPONENTS.includes(componentName),
                  message: `Component "${componentName}" not found in project. Install it using: npx shadcn-ui@latest add ${componentName}`,
                }, null, 2),
              },
            ],
          };
        }

        const componentCode = readFileSync(componentPath, 'utf-8');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                name: componentName,
                installed: true,
                path: componentPath,
                code: componentCode,
                lines: componentCode.split('\n').length,
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
  console.error('Shadcn/UI MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});














