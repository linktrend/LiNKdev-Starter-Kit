-- orgs and members baseline with RLS and a compatibility view for team_members
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id),
  created_at timestamptz default now()
);
alter table organizations enable row level security;
create policy orgs_owner_select on organizations for select using (auth.uid() = owner_id);
create policy orgs_owner_update on organizations for update using (auth.uid() = owner_id);
create policy orgs_owner_insert on organizations for insert with check (auth.uid() = owner_id);

create table if not exists organization_members (
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('owner','admin','editor','viewer')),
  created_at timestamptz default now(),
  primary key (org_id, user_id)
);
alter table organization_members enable row level security;
create policy members_select on organization_members for select using (
  exists (select 1 from organization_members m where m.org_id = organization_members.org_id and m.user_id = auth.uid())
);
create policy members_manage_self on organization_members for delete using (auth.uid() = user_id);

create or replace view team_members as
  select om.user_id, om.org_id as team_id, om.role
  from organization_members om;
