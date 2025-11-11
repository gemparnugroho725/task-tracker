create extension if not exists "uuid-ossp";

create table if not exists public.local_users (
  user_id uuid primary key default uuid_generate_v4(),
  username text not null unique,
  password text not null,
  created_at timestamptz not null default now()
);

alter table public.local_users enable row level security;

-- Clean existing policies if they exist for idempotency
drop policy if exists "local_users owner select" on public.local_users;
drop policy if exists "local_users owner insert" on public.local_users;
drop policy if exists "local_users owner update" on public.local_users;

-- Owner can read own record
create policy "local_users owner select"
  on public.local_users
  for select
  using (auth.uid() = user_id);

-- Owner can insert own record
create policy "local_users owner insert"
  on public.local_users
  for insert
  with check (auth.uid() = user_id);

-- Owner can update own record
create policy "local_users owner update"
  on public.local_users
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);