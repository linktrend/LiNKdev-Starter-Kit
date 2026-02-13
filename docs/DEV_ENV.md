# DEV Environment & Secrets — LiNKdev Starter Kit

## Purpose
Single source of truth for **environment variables**, **secret handling**, and **rotation**. This doc is for local dev, CI, and preview/prod.

---

## Secrets Inventory (Dev)
| Key | Scope | Used By | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client/server | Web app | Public base URL (safe to expose) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client/server | Web app | Public anon key (safe in browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** | API/server jobs | **Never** expose to client; used for RLS-bypassing ops |
| `DATABASE_URL` (optional) | server/CLI | tooling | Postgres connection string if needed |
| `WEBHOOK_TOLERANCE_SEC` | server | webhooks | e.g. `300` |
| `STRIPE_WEBHOOK_SECRET` | server | webhooks | Stripe verification |
| `FILES_BUCKET` | server | storage | Defaults to `files` |
| `STORAGE_SIGNED_URL_TTL` | server | storage | Defaults to `3600` |
| `STORAGE_OFFLINE` | server | storage | `false` in real envs |

> MCP: Supabase MCP is configured; do **not** commit live secrets. Use local `.env.local` for dev.

---

## Files Policy
- **Committed:** `.env.example` (placeholders only)  
- **Ignored:** `.env`, `.env.local`, `.env.*.local`  
- **Never commit** real secrets.

---

## Local Setup (Dev)
1. Copy `.env.example` → `.env.local`.  
2. Fill values from Supabase project:
   - `NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY = <anon key>`
   - `SUPABASE_SERVICE_ROLE_KEY = <service role key>`
3. Run app: `pnpm dev` (or repo script).
4. Verify by signing in and hitting a protected tRPC mutation.

---

## Rotation Playbook (Service Keys)
**When:** Quarterly or on incident.

**Steps (dev & prod):**
1. **Generate new key** in Supabase Dashboard (Service role).  
2. **Stage rollout**:
   - Update **Vercel**/CI env vars (keep old key live).
   - Update local `.env.local` (developers).  
3. **Redeploy** the app (new key in effect).  
4. **Revoke old key** in Supabase once traffic is stable.  
5. **Audit**: Post one-line note in CHANGELOG with date/key scope.

**Guardrails**
- Service Role key **never** in client bundles.  
- Public anon key is allowed in browser.  
- Use feature flags if rotation affects long-running jobs.

---

## MCP Notes
- MCP enables: migrations, RLS edits, seeds, verification.
- Keep live keys out of code; MCP fetches secure values via its channel.
- **Types are generated from Cloud. Do not point CLI to local DB.**

## Cloud-Only Policy
- **No local Supabase instances** for production data
- All database operations use Supabase Cloud via MCP
- See `docs/DB_OPERATIONS.md` for migration procedures
- CI enforces cloud-only usage

---

## Quick Troubleshooting
- 401s after rotation → env mismatch across environments.  
- RLS failures → confirm you used service client (server-side).  
- Signature errors → confirm webhook secrets & tolerance.
