# Agent Workspace Guide

**Date**: Monday Dec 22, 2025  
**Purpose**: Guide for opening and working with agent worktrees

## Worktree Structure

```
linkdev-starter-kit/                    # Main repository (main branch)
└── _worktrees/
    ├── callisto/                   # callisto-cur-mb branch
    ├── europa/                     # europa-ag-mb branch
    ├── titan/                      # titan-cur-mm branch
    └── enceladus/                  # enceladus-ag-mm branch
```

## Opening Workspaces

### Main Repository (Orchestrator/Architect Work)
```bash
cursor /Users/carlossalas/Projects/Dev_Apps/templates/linkdev-starter-kit
```
- Branch: `main` (can switch to any branch)
- Use for: Orchestrator work, merging, releases

### Callisto Agent Workspace
```bash
cursor /Users/carlossalas/Projects/Dev_Apps/templates/linkdev-starter-kit/_worktrees/callisto
```
- Branch: `callisto-cur-mb` (locked)
- Use for: Callisto agent tasks

### Europa Agent Workspace
```bash
cursor /Users/carlossalas/Projects/Dev_Apps/templates/linkdev-starter-kit/_worktrees/europa
```
- Branch: `europa-ag-mb` (locked)
- Use for: Europa agent tasks

### Titan Agent Workspace
```bash
cursor /Users/carlossalas/Projects/Dev_Apps/templates/linkdev-starter-kit/_worktrees/titan
```
- Branch: `titan-cur-mm` (locked)
- Use for: Titan agent tasks

### Enceladus Agent Workspace
```bash
cursor /Users/carlossalas/Projects/Dev_Apps/templates/linkdev-starter-kit/_worktrees/enceladus
```
- Branch: `enceladus-ag-mm` (locked)
- Use for: Enceladus agent tasks

## How Worktrees Work

### Key Concepts
- Each worktree is locked to one branch — do not switch branches inside a worktree.
- Worktrees are isolated; changes stay within that branch’s worktree.
- All worktrees share git history; commits are visible everywhere.
- You can work in parallel across multiple Cursor windows.

### Typical Workflow

1. Open the agent's worktree in Cursor.
2. Work on tasks — you are already on the correct branch.
3. Commit changes:
   ```bash
   git add .
   git commit -m "feat: implement feature"
   ```
4. Push to remote:
   ```bash
   git push origin [branch-name]
   ```
5. No branch switching needed inside the worktree.

### Parallel Work Example

You can have 5 Cursor windows open simultaneously:
- Window 1: Main repo (orchestrator work)
- Window 2: Callisto worktree (Callisto tasks)
- Window 3: Europa worktree (Europa tasks)
- Window 4: Titan worktree (Titan tasks)
- Window 5: Enceladus worktree (Enceladus tasks)

## Git Operations

### In a Worktree
```bash
# Check current branch (fixed per worktree)
git branch --show-current

# Check status
git status

# Commit changes
git add .
git commit -m "feat: implement feature"

# Push to remote
git push origin [branch-name]

# Pull latest changes
git pull origin [branch-name]
```

### In Main Repository
```bash
# Switch branches (only in main repo)
git checkout main
git checkout callisto-cur-mb

# Merge agent work to main
git checkout main
git merge callisto-cur-mb
git push origin main
```

## Important Notes

**Do NOT**
- Try to switch branches within a worktree (it will fail).
- Delete worktree directories manually (use `git worktree remove`).
- Commit `_worktrees/` to git (it is ignored).

**Do**
- Open each worktree in a separate Cursor window.
- Commit and push from within each worktree.
- Use the main repo for branch management and merging.

## Troubleshooting

### Worktree not showing correct branch
```bash
cd _worktrees/[agent-name]
git branch --show-current
```
Should show the agent's branch. If not, the worktree may be corrupted.

### Recreate a worktree
```bash
# Remove the worktree
git worktree remove _worktrees/[agent-name]

# Recreate it
git worktree add _worktrees/[agent-name] [branch-name]
```

### List all worktrees
```bash
git worktree list
```

## Agent Branch Reference

| Agent | Branch | Worktree Path |
|-------|--------|---------------|
| Callisto | callisto-cur-mb | _worktrees/callisto |
| Europa | europa-ag-mb | _worktrees/europa |
| Titan | titan-cur-mm | _worktrees/titan |
| Enceladus | enceladus-ag-mm | _worktrees/enceladus |

---

**Last Updated**: Monday Dec 22, 2025  
**Maintained By**: Orchestrator
