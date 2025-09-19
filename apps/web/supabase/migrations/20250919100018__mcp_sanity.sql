-- MCP Sanity Test migration (safe to keep)
create extension if not exists pgcrypto;

create table if not exists public.mcp_sanity (
  id uuid primary key default gen_random_uuid(),
  note text not null,
  created_at timestamptz not null default now()
);

comment on table public.mcp_sanity is 'Tiny table for MCP sanity checks (dev-safe).';
