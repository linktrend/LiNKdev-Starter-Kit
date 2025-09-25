# GitHub MCP Server Setup for Cursor

This document provides complete instructions for setting up the GitHub MCP (Model Context Protocol) Server with Cursor IDE.

## ✅ Installation Complete

The GitHub MCP Server has been successfully installed and configured. Here's what was done:

### 1. Binary Installation
- Downloaded GitHub MCP Server v0.15.0 for Darwin ARM64
- Installed to `~/bin/github-mcp-server`
- Made executable and tested successfully

### 2. Cursor Configuration
- Created MCP configuration file at: `~/Library/Application Support/Cursor/User/mcp_servers.json`
- Configured to use the local binary instead of Docker

## 🔧 Required Setup Steps

### Step 1: Get GitHub Personal Access Token

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "Cursor MCP Server"
4. Set expiration as needed
5. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
   - `read:user` (Read user profile data)
   - `user:email` (Access user email addresses)
   - `read:project` (Read project boards)
   - `read:discussion` (Read team discussions)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again)

### Step 2: Configure the Token

Edit the MCP configuration file:

```bash
nano ~/Library/Application\ Support/Cursor/User/mcp_servers.json
```

Replace `YOUR_GITHUB_TOKEN_HERE` with your actual GitHub token:

```json
{
  "mcpServers": {
    "github": {
      "command": "/Users/carlossalas/bin/github-mcp-server",
      "args": ["stdio"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_actual_token_here"
      }
    }
  }
}
```

### Step 3: Restart Cursor

1. Close Cursor completely
2. Reopen Cursor
3. Open a project or workspace

## 🧪 Testing the Integration

### Method 1: Check MCP Tools
1. Open Cursor
2. Go to Agent mode (Cmd+L or Ctrl+L)
3. Ask: "List available MCP tools"
4. You should see GitHub-related tools like:
   - `create_repository`
   - `get_repository`
   - `list_repositories`
   - `create_issue`
   - `get_issue`
   - `list_issues`
   - And many more...

### Method 2: Test a Simple Command
Try asking the agent:
- "Show me my GitHub repositories"
- "Create a new issue in [repository]"
- "List recent commits in [repository]"

## 🛠️ Available Tools

The GitHub MCP Server provides access to:

### Repository Management
- Create, read, update, delete repositories
- Manage branches, tags, and releases
- Handle repository settings and permissions

### Issue & Pull Request Management
- Create, update, and manage issues
- Create and manage pull requests
- Handle comments and reviews
- Manage labels and milestones

### Code Management
- Read and search code
- Manage file contents
- Handle commits and branches
- View diffs and changes

### Organization & Team Management
- Manage organization settings
- Handle team memberships
- Manage project boards

### Security & Compliance
- View security advisories
- Manage secrets and variables
- Handle code scanning results

## 🔧 Configuration Options

### Toolset Selection
You can limit which tools are available by modifying the configuration:

```json
{
  "mcpServers": {
    "github": {
      "command": "/Users/carlossalas/bin/github-mcp-server",
      "args": ["stdio", "--toolsets", "repos,issues,pull_requests"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

Available toolsets:
- `repos` - Repository management
- `issues` - Issue management
- `pull_requests` - Pull request management
- `actions` - GitHub Actions
- `code_security` - Security features
- `experiments` - Experimental features

### Read-Only Mode
For security, you can run in read-only mode:

```json
{
  "mcpServers": {
    "github": {
      "command": "/Users/carlossalas/bin/github-mcp-server",
      "args": ["stdio", "--read-only"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Dynamic Toolsets
Enable dynamic tool discovery:

```json
{
  "mcpServers": {
    "github": {
      "command": "/Users/carlossalas/bin/github-mcp-server",
      "args": ["stdio", "--dynamic-toolsets"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"GITHUB_PERSONAL_ACCESS_TOKEN not set"**
   - Make sure you've replaced `YOUR_GITHUB_TOKEN_HERE` with your actual token
   - Restart Cursor after making changes

2. **"Command not found"**
   - Verify the binary exists: `ls -la ~/bin/github-mcp-server`
   - Check the path in the configuration file

3. **"Permission denied"**
   - Make sure the binary is executable: `chmod +x ~/bin/github-mcp-server`

4. **MCP tools not appearing**
   - Check Cursor's MCP logs in the Developer Tools
   - Verify the configuration file syntax
   - Restart Cursor completely

### Debug Mode
Enable logging to troubleshoot issues:

```json
{
  "mcpServers": {
    "github": {
      "command": "/Users/carlossalas/bin/github-mcp-server",
      "args": ["stdio", "--enable-command-logging", "--log-file", "/tmp/github-mcp.log"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 📚 Additional Resources

- [Official GitHub MCP Server Repository](https://github.com/github/github-mcp-server)
- [GitHub MCP Server Setup Guide](https://cursorideguide.com/guides/github-mcp-setup-guide)
- [GitHub Docs - Using the GitHub MCP Server](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/use-the-github-mcp-server)
- [Video Tutorial](https://www.youtube.com/watch?v=TrDW2Puhw0Y)

## 🔄 Updates

To update the GitHub MCP Server:

1. Download the latest release from the [GitHub releases page](https://github.com/github/github-mcp-server/releases)
2. Replace the binary: `cp ~/Downloads/github-mcp-server ~/bin/github-mcp-server`
3. Make it executable: `chmod +x ~/bin/github-mcp-server`
4. Restart Cursor

---

**Status**: ✅ Installation Complete - Ready for GitHub token configuration
