# Permission & Authorization Model

This document outlines the hybrid **RBAC (Role-Based Access Control)** and **ABAC (Attribute-Based Access Control)** system used in the application.

## 1. Overview
The system uses a dual-layer permission model:
1.  **Platform Level:** Controls access to the application and global administrative features.
2.  **Organization Level:** Controls access to resources within a specific workspace (Organization).

Additionally, **Feature Gating** (Entitlements) limits actions based on the organization's subscription plan.

---

## 2. Role-Based Access Control (RBAC)

### A. Platform Roles
Stored in `users.account_type`.
| Role | Description |
| :--- | :--- |
| `super_admin` | Full system access (Developer/Owner). |
| `admin` | Platform administrator. Can manage user accounts. |
| `user` | Standard user. Can belong to or own organizations. |

### B. Organization Roles
Stored in `organization_members.role`.
| Role | Description | Permissions |
| :--- | :--- | :--- |
| `owner` | Creator of the organization. | Manage Billing, Delete Org, Manage Roles. |
| `admin` | Workspace administrator. | Manage Members, Update Settings, Invite Users. |
| `editor` | Standard contributor. | Create/Edit/Delete Resources (Records, Posts). |
| `viewer` | Read-only access. | View Resources only. |

---

## 3. Attribute-Based Access Control (ABAC) & Entitlements

Beyond roles, the system checks **attributes** (Plans & Usage) before authorizing sensitive actions.

### A. Feature Gating
Access to features is determined by the Organization's active subscription (`org_subscriptions`).
- **Source of Truth:** `plan_features` table.
- **Mechanism:** The system checks if the `feature_key` is enabled for the current `plan_name`.

**Example:**
> A user with `owner` role *cannot* invite a 6th member if their Plan Limit is 5 seats.

### B. Usage Limits
Usage is metered via the `usage_events` table.
- **Mechanism:** Before creating a resource (e.g., a new Record), the system:
    1.  Aggregates current usage for the period.
    2.  Compares it against the Plan Limit.
    3.  Blocks the action if the limit is exceeded.

---

## 4. Authorization Flow

When a request reaches the API (Server Actions or tRPC):

1.  **Authentication:**
    - Validate the User's JWT (Supabase Auth).
    - Ensure the user is active.

2.  **Context Resolution (Middleware):**
    - Extract `X-Org-ID` header.
    - **CRITICAL:** Verify the User is a member of this Organization (`organization_members` check).

3.  **Role Guard:**
    - Check if the User's Org Role is sufficient for the endpoint (e.g., `requireRole('admin')`).

4.  **Entitlement Guard:**
    - Check if the Organization's Plan allows the feature (e.g., `assertEntitlement('max_seats')`).

5.  **Row Level Security (Database):**
    - Final line of defense. Postgres policies ensure users never see data outside their permitted scope, even if the API layer fails.

---

## 5. Database Implementation
- **RLS Policies:** All tables (`users`, `organizations`, `usage_events`) have RLS enabled.
- **Triggers:** `handle_new_user` automatically creates a "Personal Organization" for every new signup, ensuring they are the `owner` of at least one workspace.
