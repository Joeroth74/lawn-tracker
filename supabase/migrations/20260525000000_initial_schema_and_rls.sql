create extension if not exists pgcrypto with schema extensions;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  name text not null,
  phone text,
  email text,
  address text not null,
  default_price numeric(10, 2) not null,
  notes text
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  client_id uuid references public.clients(id) on delete cascade,
  scheduled_date date not null,
  price_charged numeric(10, 2) not null,
  job_notes text,
  is_completed boolean not null default false,
  is_paid boolean not null default false
);

create index if not exists jobs_scheduled_date_idx
  on public.jobs (scheduled_date);

create index if not exists jobs_client_id_idx
  on public.jobs (client_id);

alter table public.clients enable row level security;
alter table public.jobs enable row level security;

drop policy if exists "Authenticated users can manage clients"
  on public.clients;

create policy "Authenticated users can manage clients"
  on public.clients
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can manage jobs"
  on public.jobs;

create policy "Authenticated users can manage jobs"
  on public.jobs
  for all
  to authenticated
  using (true)
  with check (true);
