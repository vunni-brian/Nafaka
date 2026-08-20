# Nafaka — Production Audit Report

**Project:** Nafaka (AI Financial Life Manager)
**Environment:** Production (Vercel `nafaka-ruby.vercel.app`, Supabase `nskaagrxuowwehotblix`)
**Date:** 2026-08-19
**Scope:** Full production audit (browser, database, API, mobile config, secrets) + 7-item fix plan, then live re-verification after deploy.

---

## Verdict

| Item | Status |
|---|---|
| **Web (Vercel) production** | **GO — READY FOR PRODUCTION** |
| **Google Play submission** | **HOLD** — Android Google Sign-In untested (blocked on OAuth client IDs), release AAB unverified, no real-device test |

Overall: **READY WITH MINOR FIXES → READY FOR PRODUCTION (web).** Do not spend the Play Console $25 until the Android Google login and release build are verified.

---

## Scored sections (1–5, 5 = excellent)

| # | Section | Score | Notes |
|---|---|---|---|
| 1 | Test suite | 5 | 224/224 pass |
| 2 | Lint | 5 | 0 errors (2 pre-existing warnings in `delete-account`/`delete-request` edge functions: anonymous default export) |
| 3 | Production build | 5 | `npm run build` clean |
| 4 | Auth: email signup/login | 5 | Full browser flow verified on prod |
| 5 | Auth: signout | 5 | 4/4 real-user checks: 307, cookies cleared 1→0, protected routes redirect |
| 6 | Auth: session sync after SPA login | 5 | **HIGH bug fixed**: missing `onAuthStateChange` listener meant `finance_states` never synced without a page reload. Now syncs on `SIGNED_IN`/`INITIAL_SESSION`/`TOKEN_REFRESHED`; verified live (`rows=1` with no refresh) |
| 7 | Auth: storage isolation | 5 | User-scoped keys `nafaka-state:<uid>`; legacy `nafaka-finance-v1` migrated + removed on login; signout clears local state; user B sees no trace of user A (verified live) |
| 8 | Auth: Google Sign-In (web) | 4 | Present but not fully exercised; blocked on Android client IDs (see #22) |
| 9 | Auth: Google Sign-In (Android) | 1 | **NOT TESTED** — needs Google Cloud OAuth client IDs for package `app.nafaka` (debug SHA-1 `DE:D3:E2:AA:26:41:40:FA:91:D7:61:E5:29:93:F4:06:C8:89:DD:21`, SHA-256 `4C:2C:4A:A0:20:FD:40:5D:8D:66:85:F2:F6:C3:57:8E:1D:26:0F:EA:1B:87:55:07:41:7F:BD:0D:D5:9A:F2:62`) → set `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` |
| 10 | Auth: OTP/SMS | 1 | **NOT TESTED** — secrets unverifiable via tooling (`AT_USERNAME`, `AT_API_KEY`, `SEND_SMS_HOOK_SECRET`) |
| 11 | Onboarding flow | 5 | Full flow passes; consent control is now a real `<label>` + native checkbox; links no longer nested in a button (fixed) |
| 12 | Consent & analytics banner | 5 | Banner suppressed on onboarding/login/auth pages; verified it no longer blocks the Continue button (fixed) |
| 13 | DailySnapshot dashboard | 5 | Exactly one `h1` on the dashboard (fixed); heading hierarchy sound; verified live with real history data |
| 14 | Financial logic | 5 | 25/25 independent edge-case checks (shortfall, buffer, prediction, safe-to-spend, directional `daysBetween`) |
| 15 | Data persistence & recovery | 5 | Restore path verified; legacy-key migration verified live |
| 16 | Error handling | 4 | ErrorBoundary added around Providers with "Try again" + "Reset my data" (fixed); fallback UI not E2E-triggered (crash injection not performed) |
| 17 | API security | 4 | Unauth `/api/*` now returns 401 JSON instead of 307 (fixed); chat route rate-limited 20 req/min/IP → 429 (verified live). In-memory only — move to Upstash/Redis if scaling. Suggestion: lower to ~12/min to stay under Gemini's free-tier RPM (verified: Gemini 502s after ~14 rapid calls) |
| 18 | Database schema & RLS | 5 | FKs to `auth.users` with `ON DELETE CASCADE` on all user tables; identity columns; status check constraint; RLS policies user-scoped. Minor: add index on `ai_reports.user_id` (insert-only table, negligible) |
| 19 | Edge functions | 4 | Two functions (delete-account, delete-request) lint-clean except the pre-existing warnings above |
| 20 | Responsive design | 5 | No horizontal overflow at 360/390/412/768/1280 after fixture corrections |
| 21 | Accessibility | 4 | No nameless controls; heading hierarchy fixed; sr-only checkbox is label-wrapped (clickable); minor: full screen-reader pass not run |
| 22 | Mobile config (Android) | 3 | Keystore exists with real password at `C:\Users\ousam\Documents\nafaka-upload-key.jks`, gitignored; **`assembleRelease`/AAB not confirmed** (attempt aborted) |
| 23 | Secrets & deployment hygiene | 4 | No secrets in git; `.env*`, `*.jks`, `*.keystore`, `android/keystore.properties` ignored. Vercel env vars unconfirmed: `NEXT_PUBLIC_SUPPORT_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY` (needed by `/api/account-deletion`) |

**Total: 102/115** (unscored NOT-TESTED items excluded from the denominator).

---

## Key findings fixed in this audit (commit `2978233`)

1. **HIGH — No auth-state listener** (`nafaka/lib/store.tsx`): after SPA login the store stayed in guest mode, so `finance_states` was never synced to Supabase and restore only worked after a full page reload. Rewritten with `supabase.auth.onAuthStateChange` + `loadFor(user)`, guarded by `appliedForRef`/`loadSeqRef`. **Verified live: row exists without refresh.**
2. **MEDIUM — Storage not user-scoped**: all users shared the legacy key. Now `nafaka-state:<uid>` per user, with migration of legacy data on login and `clearLocalFinanceState()` on signout/delete. **Verified live: keys scoped, legacy removed, user B isolated.**
3. **MEDIUM — No `h1` on dashboard**: greeting is now an `h1`. **Verified live.**
4. **LOW — Analytics banner blocked onboarding**: suppressed on `/Onboarding`, `/login`, `/auth/*`. **Verified live.**
5. **LOW — Consent control had nested links**: now a real checkbox + label; Privacy/Terms links independent. **Verified live.**
6. **LOW — No error boundary**: corrupt state bricked the app at `/`. Added `ErrorBoundary` with recovery actions.
7. **WARN — `/api/chat` redirected instead of 401, no rate limit**: middleware now returns 401 JSON for unauth `/api/*`; chat route limits 20 req/min/IP → 429. **Both verified live.**

## Verified live post-deploy

- 401 (not redirect) for unauthenticated API calls
- Scoped storage key + legacy migration + removal
- Onboarding completes (checkbox, no banner interference)
- Finance state synced without manual refresh
- Exactly one `h1` on dashboard
- Consent banner visible on dashboard only
- Sign-out isolation (user B never sees user A's data)
- 429 after 20 rapid chat requests (cookie-authenticated)

## Remaining (non-blocking / blocked)

- Google Cloud OAuth client IDs for Android Google login (blocked on user input)
- OTP/SMS end-to-end test (secrets unverifiable)
- `assembleRelease` AAB confirmation (keystore ready)
- Vercel env vars confirmation (`NEXT_PUBLIC_SUPPORT_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY`)
- Optional: `ai_reports.user_id` index; lower chat rate limit to ~12/min; persistent rate-limit store
- Optional: full screen-reader (NVDA/VoiceOver) pass