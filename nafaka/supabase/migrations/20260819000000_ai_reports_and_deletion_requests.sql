create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_reports enable row level security;

create policy "users can insert their own ai reports"
  on public.ai_reports for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can read their own ai reports"
  on public.ai_reports for select
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.deletion_requests enable row level security;

create policy "anyone can submit a deletion request"
  on public.deletion_requests for insert
  to anon, authenticated
  with check (true);