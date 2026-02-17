# PRD -> Independent App Repo Workflow

Use this workflow every time you start a new app.

## Inputs Required

- App slug in kebab-case (example: `habit-hq`)
- PRD file (`.md`)
- Output parent directory (where the new repo should be created)
- Optional: new GitHub repo URL

## Step 1: Generate New App Repo

From LiNKdev Starter Kit root:

```bash
./scripts/create-app-repo.sh \
  --slug habit-hq \
  --name "Habit HQ" \
  --out /Users/linktrend/Projects \
  --prd /absolute/path/to/PRD.md \
  --remote https://github.com/<org>/habit-hq.git
```

Result:
- New independent repo at `/Users/linktrend/Projects/habit-hq`
- PRD copied to `/Users/linktrend/Projects/habit-hq/specify/PRD.md`
- Bootstrap context generated at `/Users/linktrend/Projects/habit-hq/specify/APP_BOOTSTRAP_CONTEXT.md`

## Step 2: Open New Repo and Install

```bash
cd /Users/linktrend/Projects/habit-hq
pnpm install
```

## Step 3: AI Build Pass (Mandatory Prompt)

Give your AI agent this instruction:

```text
Read specify/PRD.md and implement only what is required by the PRD.
Keep this app independent (auth, billing, database, deploy config).
Use default billing tiers Free/Pro/Business unless PRD overrides.
Include mobile app only if PRD requires mobile.
Do not break starter quality gates.
At the end, run:
- pnpm verify:web
- pnpm verify:mobile (if mobile in scope)
- pnpm --filter @starter/api test:unit
- pnpm --filter @starter/api test:integration
Then summarize changed files, migration steps, env vars, and deployment steps.
```

## Step 4: Configure App Services (Independent)

For this app repo:

1. Create a dedicated Supabase project.
2. Create app-specific Stripe products/prices in the shared Stripe account.
3. Configure app env vars in `.env.local` and deployment platform.
4. Run migrations and seed data.

## Step 5: Validate Before Deploy

```bash
./scripts/release-readiness.sh
```

If production-like E2E credentials are configured:

```bash
./scripts/release-readiness.sh --with-e2e
```

## Step 6: Deploy

Web:
- Create Vercel project for this app repo.
- Add env vars.
- Deploy main branch.

Mobile (if in PRD):
- Configure EAS project for this app repo.
- Build and distribute.

## Step 7: Handover Pack

Before handover, provide:

- Final PRD (`specify/PRD.md`)
- Env var checklist used
- SQL migrations applied
- Stripe products/price IDs used
- Deployment URLs
- Rollback procedure and last known good version
