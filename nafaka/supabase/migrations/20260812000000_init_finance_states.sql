-- Run this once in Supabase: SQL Editor -> New query -> Run.
-- It stores each signed-in person's current prototype state as one JSON value.

create table if not exists public.finance_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
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
