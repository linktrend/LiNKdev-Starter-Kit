# Audit Operations (Production)

## Overview
- Audit logging captures create/update/delete/role-change actions for org-scoped resources plus user profile changes when an org context is present.
- 23 operations are audited across 6 routers (see CLEANUP-3 report for full matrix):
  - Organization (6): create, update, delete, addMember, removeMember, updateMemberRole
  - Records (6): create/update/delete record types; create/update/delete records
  - Scheduling (6): create/update/delete reminders; create/update/delete schedules
  - Billing (2): createCheckout, simulateEvent
  - Automation (1): enqueue
  - User (2): updateProfile, deleteAccount
- Query audit data primarily from `audit_logs` (live) and `audit_logs_export` (CSV outputs).

## Log Rotation Policy
- Recommended retention: **90 days**.
- Cleanup SQL:
```sql
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
```
- Cron example (daily at 02:15):
  - `15 2 * * * psql "$DATABASE_URL" -c "DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';"`
- Keep storage alerts tied to table size (see Monitoring).

## Monitoring Setup
- **Insertion failures:** alert on Supabase function errors or TRPC responses where `audit.append` fails.
- **Table growth:** track `pg_total_relation_size('audit_logs')`; alert when exceeding threshold (e.g., 10 GB) or slope change >25% week-over-week.
- **Throughput/perf:** monitor insert latency and RPC response times for `get_audit_stats`.
- Sample queries:
```sql
-- Size in MB
SELECT pg_total_relation_size('audit_logs') / 1024 / 1024 AS size_mb;

-- Failed inserts in last 24h (assuming errors captured)
SELECT count(*) FROM audit_logs_errors WHERE occurred_at > NOW() - INTERVAL '1 day';

-- Daily volume by action
SELECT action, date_trunc('day', created_at) AS day, count(*)
FROM audit_logs
GROUP BY action, day
ORDER BY day DESC;
```

## GDPR Compliance
- **Retention:** enforce 90-day purge (see Log Rotation).
- **User deletion:** when users request erasure, remove PII from `metadata` or anonymize actor_id where required by policy.
- **Anonymization:** consider hashing actor IDs for exports that leave the control plane.
- **Export:** provide CSV via `audit.exportCsv` for DSAR/subject access requests; scope by org and date window.
- **Org-level requests:** confirm org ownership before exporting or deleting data.

## Querying Audit Logs
- **Common patterns:** filter by `org_id`, `entity_type`, `action`, date ranges, and free-text `metadata::text`.
- **Pagination:** use cursor (`id`/`created_at`) for large result sets to avoid deep offsets.
- **Indexes:** ensure indexes on `(org_id, created_at)`, `(org_id, entity_type)`, `(org_id, action)`, and consider GIN on `metadata` if heavy JSON search.
- **Examples:**
```sql
-- Recent changes for a record
SELECT * FROM audit_logs
WHERE org_id = :orgId AND entity_type = 'record' AND entity_id = :recordId
ORDER BY created_at DESC
LIMIT 100;

-- Who changed roles last week
SELECT actor_id, count(*) AS changes
FROM audit_logs
WHERE org_id = :orgId AND action = 'role_changed' AND created_at > NOW() - INTERVAL '7 days'
GROUP BY actor_id
ORDER BY changes DESC;
```

## Monitoring & Alerting Playbook
- If insert failures spike: pause non-critical mutations, check DB connectivity, and replay queued events if applicable.
- If table size balloons: run rotation SQL, validate indexes, and cap CSV exports to manageable windows.
- If stats RPC slows: inspect `get_audit_stats` plan, refresh indexes, and reduce window size.

## Troubleshooting
- **No logs created:** verify middleware is attached (see CLEANUP-3 report), ensure `NEXT_PUBLIC_SUPABASE_URL` configured, and check Supabase service role permissions.
- **Missing orgId:** audit middleware requires org context; ensure client passes `orgId` and that access guards populate context.
- **CSV export empty:** confirm filters (`entity_type`, `action`, dates) and that at least one log matches.
- **Coverage gaps:** confirm new mutations wrap with `createAuditMiddleware` or the specialized audit helpers.

## Known Limitations

### User-Level Audit Logs

**Limitation:** User profile updates are only audited when the user is in an
organization context (orgId available). Profile changes outside of an org
context are not currently logged.

**Impact:** Personal profile updates by users not in any organization won't
appear in audit logs.

**Workaround:** Most users will be in at least one organization (personal org
created during onboarding), so this affects a small subset of users.

**Future Enhancement:** Consider implementing a separate `user_audit_logs`
table for user-level actions that aren't org-scoped.
