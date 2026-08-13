-- Hardens the updated_at trigger against role-search_path hijacking
-- (Supabase advisor: function_search_path_mutable).
-- Applied live 2026-08-13.

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