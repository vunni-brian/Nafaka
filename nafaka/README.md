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
- **Situation** — a multi-signal read on top of state (under pressure / income uncertain / commitment-heavy / cash rich / building a buffer / recovering / still learning) that makes the model's verdicts easier to explain; every read carries its own confidence, evidence, sample size, observation window and reason
- **Transition stability** — hysteresis on state and situation reads: worsening moves apply immediately, improvements only stick after the better read persists across days, and UNKNOWN never erases a held read (no "stable Monday → pressure Tuesday → recovering Wednesday")
- **Rule-based insights** — emitted only when a signal is confident enough to coach from
- **Predictions** — forward-looking watches (may run short before next income, post-deposit spending spike) surfaced as honest, confidence-gated outlook cards
- **Outcome tracking** — prediction → action → outcome: each weekly focus is measured against the user's own earlier behavior (72h post-deposit spending, commitment follow-through, weekly balance movement) once the window closes and is attributable
- **Adaptive coaching** — a coaching log records every focus instance; per-focus stats (times recommended, times improved, success rate) re-rank which focus gets picked, so Nafaka prefers what has actually worked for this person
- **Knowledge ladder** — the UI distinguishes what Nafaka knows, suspects, and doesn't know yet ("We're still learning your pattern" → "This is a strong pattern")

Live in the prototype: the Financial Personality screen renders entirely from the model with confidence %, Life Events marks commitments paid/missed so `commitmentReliability` becomes real behavioral evidence, the **Health Score** is a confidence-weighted blend of five signal-driven components (sub-50% confidence components show as "still learning" and never drag the score), the **Weekly Review** is a four-beat coaching page (What changed → What Nafaka noticed → What it means → One focus) computed from real weekly income/spending plus the brain's first confident insight, the **Safe-to-Spend** card explains itself ("Your next expected income is in ~5 days… UGX X/day keeps you on track"), the Health Score ends with a "One focus" block naming the weakest confident component, the **Chat** answers affordability, income-timing, commitment-reliability, weekday and "why" questions from the model, and the dashboard prefers calm over noise — when nothing urgent changed it says "You're on track" instead of inventing a reason to come back. Weekly balance snapshots feed `savingsConsistency`. The dashboard's **Looking ahead** card shows model predictions — "watch" or "all-clear" outlooks like running short before the next income — each with its window, evidence, and confidence; the **Chat** can explain ("What happens next?") from the same predictions, and the Weekly Review's third beat is situation-aware ("You're on track" / "Your income is uncertain" / "Your commitments are eating into your balance").

Every coaching statement is backed by a machine-readable **decision log** (`lib/brain/decisions.ts`): each entry records the decision (`SAFE_TO_SPEND` / `HEALTH_SCORE` / `WEEKLY_FOCUS`), its value, machine-readable inputs, the signals it was drawn from, an overall confidence, and a written reason. The chat's "why" answers quote the log, and the LLM snapshot (`buildLlmContext`) includes the log so the AI explains evidence rather than inventing it — financial engine → decision → evidence → explanation.

Coaching is measured, not promised: `lib/brain/outcomes.ts` compares each focus against the user's own earlier behavior (e.g. "You spent UGX 51,000 in the 72h after your last deposit, vs your usual UGX 85,000 — that's 40% less"), and `lib/brain/coaching.ts` tracks per-focus effectiveness (`recommended`, `improved`, `successRate`) that re-ranks which focus the Weekly Review and decision log pick next (`lib/brain/focus.ts`). State and situation reads pass through a hysteresis guard (`lib/brain/stabilize.ts`) so verdicts can't flicker day to day. The Weekly Review's fifth beat ("Did it work?") and the chat ("Has my focus worked?") both report from the same outcome records.

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
