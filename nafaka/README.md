# Nafaka — AI Financial Coach

> Nafaka is an AI-powered personal financial operating system that learns how you handle money. It studies your income, spending, commitments, saving, debt, and financial habits to uncover patterns you may not notice yourself. Instead of judging your wealth or forcing you into a fixed budget, Nafaka measures your financial consistency and helps you make better decisions — one week at a time.

The prototype is organized in five layers: **Learn** (the personal behavior model that underpins everything) → **Record** → **Understand** → **Analyze** → **Coach**. The AI discovers who you are from your behavior, not from a box you pick — irregular income is one thing the system understands, not the definition of the user.

Designed first for Uganda (UGX, Mobile Money, tithe, cell meetings, informal debt) and built on the principle **global financial intelligence + local financial context**.

Phase 0 status: prototype validating the mental model — users understand and trust the core flow before persistence or real AI is added.

## Routes

| Route | Screen | Purpose |
|-------|--------|---------|
| `/` | Welcome | Hero + CTA |
| `/Onboarding` | Onboarding | Archetype, priorities, balance, commitments |
| `/DailySnapshot` | Dashboard | Balance, safe-to-spend, recent activity, commitments |
| `/AddIncome` | Add income | Record a deposit |
| `/AddExpense` | Add expense | Record a spend |
| `/Profile` | Profile | Name, archetype, priorities |
| `/Notifications` | Notifications | Demo notification list |
| `/FinancialPersonality` | Financial personality | Generated spending insights |
| `/PatternDashboard` | Patterns | Income heatmap, spending by category, goals |
| `/SupportNetwork` | Support network | Track who you lent to / borrowed from |
| `/LifeEvents` | Commitments | Upcoming obligations (protected first) |
| `/HealthScore` | Health score | Financial health breakdown |
| `/WeeklyReview` | Weekly review | Income vs spending chart + coaching |
| `/AIChat` | AI chat | Q&A answered from the behavior model |
| `/Feedback` (via floating button) | Feedback | In-app feedback form for testers |

## How to test

```bash
npm install
npm run dev        # Start dev server
npm run lint       # Check for lint errors
npm run test       # Run money math tests
npm run build      # Production build
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.

## Authentication

- Email/password sign in and sign up on `/login` (Supabase Auth, RLS-protected)
- Google OAuth sign-in on `/login` (provider enabled on the hosted project; console OAuth client must allow the Supabase callback URL)
- `proxy.ts` refreshes sessions and redirects signed-out visitors to `/login`
- All routes except `/`, `/login`, and `/auth/*` require a session

## Persistence

Each signed-in user's prototype state — profile, transactions, commitments, goals, support network — is stored as one JSONB row in `finance_states` (see `supabase/schema.sql`) with row-level security scoped to `auth.uid()`. The provider hydrates from the remote row when signed in and falls back to `localStorage` demo data when signed out, so the prototype still works without an account.

The prototype uses hardcoded demo data as the default. Add income/expense, set commitments, and watch the safe-to-spend amount update in real time.

## Money math

Pure functions in `lib/store.tsx`:
- `computeBalance(transactions)` — sum of income minus expenses
- `computeUpcomingTotal(commitments)` — sum of upcoming obligations
- `computeSafeToSpend(balance, commitments)` — balance minus commitments (floor 0)

Tests in `lib/money.test.ts`.

## Behavior engine (Layer 0: Learn)

The v1 behavioral intelligence engine in `lib/brain/` builds a personal behavior model from transactions, commitments, and wallet snapshots:

- **9 behavioral signals** — income regularity, source dependence, spending stability, discretionary share, post-income acceleration, savings consistency, commitment reliability, debt pressure, financial resilience
- **Confidence model** — each signal carries a confidence that grows with observations (`1 − e^(−n/k)`) and shrinks with inconsistency; tiers: exploring → learning → confident → mature
- **Financial state** — EMERGENCY / SURVIVAL / RECOVERY / STABLE / GROWTH classification from runway and commitments
- **Rule-based insights** — emitted only when a signal is confident enough to coach from
- **Knowledge ladder** — the UI distinguishes what Nafaka knows, suspects, and doesn't know yet ("We're still learning your pattern" → "This is a strong pattern")

Live in the prototype: the Financial Personality screen renders entirely from the model with confidence %, Life Events marks commitments paid/missed so `commitmentReliability` becomes real behavioral evidence, the **Health Score** is a confidence-weighted blend of five signal-driven components (sub-50% confidence components show as "still learning" and never drag the score), the **Weekly Review** computes real weekly income/spending plus the brain's first confident insight, and the **Chat** answers affordability, income-timing, commitment-reliability and weekday questions from the model. Weekly balance snapshots feed `savingsConsistency`.

Exposed to screens as `behaviorModel` from `useFinance()`. Architecture in `docs/behavioral-intelligence.md`. Tests in `lib/brain/brain.test.ts`.

## Architecture

- Next.js 16 (App Router, Turbopack)
- Tailwind CSS v4 (dark theme)
- React Context for shared state (Supabase for auth + per-user persistence)
- Recharts for charts
- Lucide icons

## Layers

| Layer | Purpose |
|-------|---------|
| 0 · Learn | Personal financial behavior model (the real AI — not yet built) |
| 1 · Record | Income, expenses, commitments, goals, support network |
| 2 · Understand | Patterns, financial personality |
| 3 · Analyze | Health score, trends |
| 4 · Coach | Weekly review, insights, AI chat |

Navigation maps to these layers: **Today** (what should I know today?) · **Patterns** (what is my money teaching me?) · **Score** (am I becoming financially better?) · **Coach** (what should I focus on this week?) · **Chat** (let me ask my financial AI).

## What's deferred

- Bank connection / Open Banking
- Real AI chat (LLM integration — chat is currently rule-based over the behavior model)
- Push notifications (non-functional UI removed)
- Biometric lock / Log out
- Server-side persistence beyond the prototype `finance_states` row

Phase 0 goal: honest prototype that proves the mental model works.
