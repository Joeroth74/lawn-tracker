-- Activate workspace-scoped access only after the one-time setup has created
-- at least one membership and assigned every existing row to a workspace.

do $$
begin
  if not exists (select 1 from public.workspace_members) then
    raise exception 'Shared workspace is not configured: add workspace members before applying this migration';
  end if;

  if exists (select 1 from public.clients where workspace_id is null) then
    raise exception 'Shared workspace is incomplete: clients without a workspace remain';
  end if;

  if exists (select 1 from public.jobs where workspace_id is null) then
    raise exception 'Shared workspace is incomplete: jobs without a workspace remain';
  end if;
end;
$$;

alter table public.clients
  alter column workspace_id set not null;

alter table public.jobs
  alter column workspace_id set not null;

drop policy if exists "Workspace members can view their workspaces"
  on public.workspaces;

create policy "Workspace members can view their workspaces"
  on public.workspaces
  for select
  to authenticated
  using (private.is_workspace_member(id));

drop policy if exists "Workspace members can view membership"
  on public.workspace_members;

create policy "Workspace members can view membership"
  on public.workspace_members
  for select
  to authenticated
  using (private.is_workspace_member(workspace_id));

drop policy if exists "Authenticated users can manage clients"
  on public.clients;
drop policy if exists "Workspace members can manage clients"
  on public.clients;

create policy "Workspace members can manage clients"
  on public.clients
  for all
  to authenticated
  using (private.is_workspace_member(workspace_id))
  with check (private.is_workspace_member(workspace_id));

drop policy if exists "Authenticated users can manage jobs"
  on public.jobs;
drop policy if exists "Workspace members can manage jobs"
  on public.jobs;

create policy "Workspace members can manage jobs"
  on public.jobs
  for all
  to authenticated
  using (private.is_workspace_member(workspace_id))
  with check (private.is_workspace_member(workspace_id));
