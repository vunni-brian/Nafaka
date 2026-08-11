# Supabase setup

The project URL and publishable key are configured in `.env.local` (which is ignored by Git).

1. In the Supabase dashboard, open **SQL Editor** and run [`../supabase/schema.sql`](../supabase/schema.sql).
2. Enable an authentication provider in **Authentication → Providers**. Email/password is sufficient for the first release.
3. Build the sign-up/sign-in screen before enabling remote sync. The schema has Row Level Security: a signed-in user can read and write only their own data.

Do not put a database password, service-role key, or connection string in `NEXT_PUBLIC_*` variables or browser code. The publishable key is the only credential this client needs.
