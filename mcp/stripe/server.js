#!/usr/bin/env node

/**
 * Stripe MCP Server
 * 
 * Provides Model Context Protocol tools for interacting with Stripe:
 * - ping: Health check
 * - listProducts: List all Stripe products
 * - listCustomers: List all Stripe customers
 * 
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY: Your Stripe secret key
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY must be set');
  process.exit(1);
}

// Initialize Stripe client
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// Create MCP server
const server = new Server(
  {
    name: 'stripe-mcp-server',
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
    description: 'Health check for Stripe MCP server',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'listProducts',
    description: 'List all Stripe products',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of products to return (default: 10, max: 100)',
          default: 10,
          minimum: 1,
          maximum: 100,
        },
        active: {
          type: 'boolean',
          description: 'Filter by active status',
        },
      },
    },
  },
  {
    name: 'listCustomers',
    description: 'List all Stripe customers',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of customers to return (default: 10, max: 100)',
          default: 10,
          minimum: 1,
          maximum: 100,
        },
        email: {
          type: 'string',
          description: 'Filter by customer email',
        },
      },
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
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'ok',
                server: 'stripe-mcp-server',
                version: '1.0.0',
                stripeApiVersion: stripe.getApiField('version'),
              }, null, 2),
            },
          ],
        };
      }

      case 'listProducts': {
        const { limit = 10, active } = args;
        
        const params = { limit };
        if (active !== undefined) {
          params.active = active;
        }

        const products = await stripe.products.list(params);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                count: products.data.length,
                hasMore: products.has_more,
                products: products.data,
              }, null, 2),
            },
          ],
        };
      }

      case 'listCustomers': {
        const { limit = 10, email } = args;
        
        const params = { limit };
        if (email) {
          params.email = email;
        }

        const customers = await stripe.customers.list(params);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                count: customers.data.length,
                hasMore: customers.has_more,
                customers: customers.data,
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
            type: error.type || 'unknown',
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
  console.error('Stripe MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});














