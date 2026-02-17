# AI Operator Runbook

Use this sequence with Codex/Cursor/Openclaw when building an app from PRD.

## File Locations

- PRD: `specify/PRD.md`
- Implementation notes: `specify/IMPLEMENTATION_NOTES.md`
- Open decisions: `specify/OPEN_QUESTIONS.md`

## Prompt 1: Discovery and Plan

```text
Read specify/PRD.md and produce:
1) Scope map (what is in/out)
2) Technical plan by milestone
3) Risks/dependencies
4) Environment variables required
Do not edit code yet.
```

## Prompt 2: Build in Milestones

```text
Implement milestone 1 from the plan.
Run tests after changes.
Summarize files changed, commands run, and remaining work.
```

Repeat Prompt 2 for each milestone.

## Prompt 3: Final Validation

```text
Run the full verification gates for this repo and return:
- pass/fail per command
- blocking issues
- deployment checklist
```

Expected commands:

- `pnpm verify:web`
- `pnpm verify:mobile` (if mobile scope)
- `pnpm --filter @starter/api test:unit`
- `pnpm --filter @starter/api test:integration`
- `pnpm --filter ./apps/web e2e` (when env is available)

## Output Format Rule for AI Agents

Every response must include:

1. What changed
2. Why it changed
3. How it was verified
4. What is still pending

## Guardrails

- Do not introduce shared runtime coupling with other app repos.
- Keep billing plan defaults at Free/Pro/Business unless PRD says otherwise.
- Keep Stripe logic on by default.
- Keep each app deployable alone (web and mobile if applicable).
