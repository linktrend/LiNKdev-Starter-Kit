#!/bin/bash

# MCP Setup Verification Script
# This script verifies that all MCP servers are properly installed and configured

set -e

echo "🔍 MCP Setup Verification"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "mcp" ]; then
    echo -e "${RED}❌ Error: mcp directory not found${NC}"
    echo "Please run this script from the repository root"
    exit 1
fi

echo "✅ Found mcp directory"
echo ""

# Check MCP server directories
echo "📁 Checking MCP server directories..."
for server in supabase stripe figma shadcn; do
    if [ -d "mcp/$server" ]; then
        echo -e "  ${GREEN}✓${NC} mcp/$server"
    else
        echo -e "  ${RED}✗${NC} mcp/$server (missing)"
    fi
done
echo ""

# Check for required files
echo "📄 Checking required files..."
files=(
    "mcp/supabase/package.json"
    "mcp/supabase/server.js"
    "mcp/stripe/package.json"
    "mcp/stripe/server.js"
    "mcp/figma/package.json"
    "mcp/figma/server.js"
    "mcp/shadcn/package.json"
    "mcp/shadcn/server.js"
    "mcp/README.md"
    "mcp/SETUP_GUIDE.md"
    "mcp/.env.example"
    ".cursor/mcp.json"
    ".cursor/12-mcp-rules.mdc"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file (missing)"
    fi
done
echo ""

# Check for node_modules
echo "📦 Checking dependencies..."
for server in supabase stripe figma shadcn; do
    if [ -d "mcp/$server/node_modules" ]; then
        count=$(ls -1 "mcp/$server/node_modules" | wc -l | tr -d ' ')
        echo -e "  ${GREEN}✓${NC} mcp/$server/node_modules ($count packages)"
    else
        echo -e "  ${YELLOW}⚠${NC} mcp/$server/node_modules (not installed)"
        echo "    Run: cd mcp/$server && npm install"
    fi
done
echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
vars=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "STRIPE_SECRET_KEY"
    "FIGMA_ACCESS_TOKEN"
)

missing_vars=()
for var in "${vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "  ${YELLOW}⚠${NC} $var (not set)"
        missing_vars+=("$var")
    else
        # Show first 10 characters of the value
        value="${!var}"
        preview="${value:0:10}..."
        echo -e "  ${GREEN}✓${NC} $var (set: $preview)"
    fi
done
echo ""

# Check Node.js
echo "🔧 Checking Node.js..."
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo -e "  ${GREEN}✓${NC} Node.js installed ($node_version)"
else
    echo -e "  ${RED}✗${NC} Node.js not found"
    echo "    Install Node.js from https://nodejs.org/"
fi
echo ""

# Summary
echo "📊 Summary"
echo "=========="

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All environment variables are set${NC}"
else
    echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "To set them, add to your ~/.zshrc or ~/.bashrc:"
    echo ""
    for var in "${missing_vars[@]}"; do
        echo "export $var=\"your-value-here\""
    done
    echo ""
    echo "Then run: source ~/.zshrc (or ~/.bashrc)"
fi
echo ""

# Check if .cursor/mcp.json is gitignored
if grep -q "\.cursor/" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✅ .cursor/ directory is gitignored${NC}"
else
    echo -e "${YELLOW}⚠️  .cursor/ directory is NOT gitignored${NC}"
    echo "   Add '.cursor/' to .gitignore to prevent secret leakage"
fi
echo ""

# Final instructions
echo "🚀 Next Steps"
echo "============="
echo "1. Install missing dependencies (if any)"
echo "2. Set missing environment variables (if any)"
echo "3. Restart Cursor completely (Cmd+Q, then relaunch)"
echo "4. Wait 10-15 seconds for MCP servers to initialize"
echo "5. Test with: mcp servers"
echo "6. Test each server: call SupabaseMCP.ping"
echo ""
echo "📚 Documentation"
echo "================"
echo "- Quick setup: mcp/SETUP_GUIDE.md"
echo "- Full docs: mcp/README.md"
echo "- Cursor rules: .cursor/12-mcp-rules.mdc"
echo ""

exit 0

