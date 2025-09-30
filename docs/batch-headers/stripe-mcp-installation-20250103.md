# Stripe MCP Server Installation - 2025-01-03

## Scope
Install and configure the official Stripe MCP Server for local development and testing.

## Inputs
- Stripe MCP Documentation: https://docs.stripe.com/mcp
- Stripe Agent Toolkit: https://github.com/stripe/agent-toolkit
- Current project structure with existing Stripe integration

## Plan
1. Create batch header documentation
2. Install Stripe MCP Server using local setup with npx
3. Configure MCP server in .cursor/mcp.json
4. Test MCP server connection and verify tools are available
5. Verify Stripe API key configuration

## Risks & Assumptions
- Using local MCP server setup (not remote OAuth)
- Requires valid STRIPE_SECRET_KEY environment variable
- MCP server will be configured for development/testing
- Existing Stripe integration in billing router needs to be fixed after MCP setup

## Script Additions
- None (using npx for installation)

## Environment Variables Required
- STRIPE_SECRET_KEY (already exists in project)
