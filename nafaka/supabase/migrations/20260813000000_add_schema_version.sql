-- Run this once in Supabase: SQL Editor -> New query -> Run.
-- Adds schema versioning + touch-stamp to finance_states so the client
-- can migrate old JSONB blobs instead of crashing on a missing field.

alter table public.finance_states
  add column if not exists schema_version int not null default 1;

alter table public.finance_states
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_finance_states_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists finance_states_set_updated_at on public.finance_states;

create trigger finance_states_set_updated_at
  before update on public.finance_states
  for each row execute procedure public.set_finance_states_updated_at();