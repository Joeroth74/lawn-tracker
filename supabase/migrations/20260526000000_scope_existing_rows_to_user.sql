-- This migration only prepares a shared workspace model. It deliberately does
-- not change the existing clients/jobs policies or move existing rows. The
-- workspace is activated after both users are added and existing rows are
-- assigned through a reviewed, one-time SQL step.

create schema if not exists private;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamp with time zone not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.clients
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

alter table public.jobs
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

create index if not exists workspace_members_user_id_idx
  on public.workspace_members (user_id);

create index if not exists clients_workspace_id_idx
  on public.clients (workspace_id);

create index if not exists jobs_workspace_id_idx
  on public.jobs (workspace_id);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

create or replace function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function private.current_workspace_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select workspace_id
  from public.workspace_members
  where user_id = (select auth.uid())
  order by workspace_id
  limit 1;
$$;

revoke all on function private.is_workspace_member(uuid) from public;
revoke all on function private.current_workspace_id() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.current_workspace_id() to authenticated;

alter table public.clients
  alter column workspace_id set default private.current_workspace_id();

alter table public.jobs
  alter column workspace_id set default private.current_workspace_id();
