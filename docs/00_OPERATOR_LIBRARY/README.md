# LiNKdev Operator Library (Official)

This is the single source of truth for how to use LiNKdev Starter Kit to generate and operate independent apps.

## Start Here

1. [`WORKFLOW_PRD_TO_APP_REPO.md`](./WORKFLOW_PRD_TO_APP_REPO.md) - End-to-end workflow from PRD to deployed app repo.
2. [`AI_OPERATOR_RUNBOOK.md`](./AI_OPERATOR_RUNBOOK.md) - Exact prompts and run sequence for AI-assisted delivery.
3. [`SYSTEM_OVERVIEW.md`](./SYSTEM_OVERVIEW.md) - Architecture and design decisions in plain English.
4. [`APP_LIFECYCLE_POLICY.md`](./APP_LIFECYCLE_POLICY.md) - How existing app repos receive starter-kit improvements.
5. [`RELEASE_GOVERNANCE.md`](./RELEASE_GOVERNANCE.md) - Release readiness checklist and gate criteria.
6. [`templates/PRD_TEMPLATE.md`](./templates/PRD_TEMPLATE.md) - PRD template for new apps.

## Core Operating Rules

- Every app is an independent repository.
- Every app has its own Supabase project (auth, database, storage).
- Stripe account is shared, but each app has separate Stripe products/prices.
- Default plans are `Free`, `Pro`, `Business`.
- Mobile is included when the PRD requires it.

## Required Automation Scripts

- Create app repo: `./scripts/create-app-repo.sh`
- Run release gates: `./scripts/release-readiness.sh`

## Legacy Docs

Older docs outside this folder may contain historical references (for example old branches or old plan tiers).  
For active operations, use this folder first.
