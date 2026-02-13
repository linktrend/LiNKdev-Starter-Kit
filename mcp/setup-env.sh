#!/bin/bash

# MCP Environment Setup Script
# This script helps you set up environment variables for MCP servers

echo "════════════════════════════════════════════════════════════"
echo "  MCP ENVIRONMENT SETUP"
echo "════════════════════════════════════════════════════════════"
echo ""

# Supabase URL (found in .env.local)
SUPABASE_URL="https://your-project.supabase.co"

echo "✓ Found Supabase URL: $SUPABASE_URL"
echo ""
echo "To complete setup, you need your SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "Get it from: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/settings/api"
echo ""
echo "Then run these commands:"
echo ""
echo "export SUPABASE_URL=\"$SUPABASE_URL\""
echo "export SUPABASE_SERVICE_ROLE_KEY=\"your-service-role-key-here\""
echo ""
echo "To make permanent, add to ~/.zshrc:"
echo ""
echo "echo 'export SUPABASE_URL=\"$SUPABASE_URL\"' >> ~/.zshrc"
echo "echo 'export SUPABASE_SERVICE_ROLE_KEY=\"your-service-role-key-here\"' >> ~/.zshrc"
echo "source ~/.zshrc"
echo ""
echo "After setting variables:"
echo "1. Quit Cursor (Cmd+Q)"
echo "2. Relaunch Cursor"
echo "3. Test with: call SupabaseMCP.ping"
echo ""
echo "════════════════════════════════════════════════════════════"







