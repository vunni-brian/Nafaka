-- Users can delete their own financial state. The Edge Function
-- (delete-account) uses an admin client, but this policy lets the
-- RLS-scoped client also remove its own row and documents intent.

create policy "Users can delete their own financial state"
  on public.finance_states for delete
  to authenticated
  using ((select auth.uid()) = user_id);
