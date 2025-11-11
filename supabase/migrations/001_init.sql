create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  status text not null default 'open',
  due_at timestamptz null,
  calendar_event_id text null,
  created_at timestamptz not null default now()
);

-- ensure uuid generator is available
create extension if not exists pgcrypto with schema public;

create table if not exists public.user_google_tokens (
  user_id uuid primary key,
  access_token text,
  refresh_token text,
  expiry_date timestamptz,
  scope text,
  token_type text,
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
alter table public.user_google_tokens enable row level security;

create policy "tasks owner can read"
  on public.tasks for select
  using (auth.uid() = user_id);

-- insert: only with check (no USING for INSERT)
create policy "tasks owner can insert"
  on public.tasks for insert
  with check (auth.uid() = user_id);

-- update: must be owner for row visibility and new values
create policy "tasks owner can update"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- delete: only owner can delete
create policy "tasks owner can delete"
  on public.tasks for delete
  using (auth.uid() = user_id);

create policy "user tokens owner can read"
  on public.user_google_tokens for select
  using (auth.uid() = user_id);

-- writes to user_google_tokens are handled by service role in functions


