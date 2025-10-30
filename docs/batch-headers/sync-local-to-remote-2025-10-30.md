## Batch Header: Sync local repo to remote (source of truth)

- **Scope**: 1–2 hours; commit all local changes, push to remote, prepare PR link
- **Inputs**:
  - Repo at `LTM-Starter-Kit`
  - Git remotes and current branch info
- **Plan**:
  - Inspect git status, current branch, and remotes
  - Stage and commit all changes using conventional commit
  - If working tree was dirty, create a new branch for the commit
  - Push branch to `origin`
  - Generate PR URL (GitHub format) targeting `main`
- **Risks & Assumptions**:
  - Assumes remote provider is GitHub and default base branch is `main`
  - No force pushes will be performed without explicit approval
  - If `gh` CLI isn’t authenticated, we’ll provide a PR URL instead
- **Script Additions**: none
