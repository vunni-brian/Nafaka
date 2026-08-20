-- Run this once in Supabase: SQL Editor -> New query -> Run.
-- It stores each signed-in person's current prototype state as one JSON value.

create table if not exists public.finance_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  schema_version int not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.finance_states enable row level security;

create policy "Users can read their own financial state"
  on public.finance_states for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own financial state"
  on public.finance_states for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own financial state"
  on public.finance_states for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.set_finance_states_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists finance_states_set_updated_at on public.finance_states;

create trigger finance_states_set_updated_at
  before update on public.finance_states
  for each row execute procedure public.set_finance_states_updated_at();
