# Nafaka — UI/UX Review Report

**Project:** Nafaka (AI Financial Life Manager) · **Report date:** 2026-08-20
**Mode:** full · **Verdict: Block** (7 HIGH findings) — **all 15 findings (7 HIGH + 7 MEDIUM + 1 LOW) implemented and verified on 2026-08-20; remaining work is the manual device pass (320px, keyboard, screen reader, iOS input zoom) → Needs changes (all findings closed)**

---

## Implementation status (2026-08-20)

All HIGH findings are fixed and verified (lint clean, `tsc --noEmit` clean, 224/224 tests pass):

| Finding | Fixed in |
| --- | --- |
| F1 login errors/success never rendered | `app/login/page.tsx` — `role="alert"` now renders in every mode; signup success is a `role="status"` panel with "Resend confirmation link" (`supabase.auth.resend`) |
| F2/F3 contrast tokens | `app/globals.css` — `brand-600`/`primary` `#0d9a68 → #0d8257` (4.8:1), `accent-600` `#e0620a → #c6530a` (4.5:1), `ink-400` `#848fa5 → #616d85` (5.2:1 white, 4.8:1 on ink-50); onboarding placeholder `ink-300 → ink-400` |
| F4 reduced motion | `app/globals.css` — `@media (prefers-reduced-motion: reduce)` override for all animation/transition/scroll |
| F5 modal a11y | `components/proto/ui.tsx` — `role="dialog"` + `aria-modal` + `aria-label`, Tab trap, focus move-in/restore, `aria-label="Close"` on the X, `overscroll-contain`; `app/AIChat/page.tsx` — report dialog gets the same trap + Escape |
| F6 hydration/loading blanks | `lib/providers.tsx` — branded shimmer skeleton with `aria-busy` on protected routes; `app/delete-account/page.tsx` — pulse skeleton until auth resolves; `app/login/page.tsx` — branded Suspense fallback |
| F7 silent chat fallback | `app/AIChat/page.tsx` — `role="status"` banner: "Offline mode — answers come from your local data until the connection recovers"; clears on next successful reply |

All remaining findings (F8–F15) are now implemented too. Verification rerun after the second pass: lint 0 errors, `tsc --noEmit` clean, 224/224 tests pass.

| Finding | Fixed in |
| --- | --- |
| F8 toast/live-region system | `components/Toast.tsx` — `ToastProvider` + `useToast`; success toasts auto-dismiss (3.5s) with `role="status"`, errors persist until dismissed with `role="alert"`; wired into AddTransaction ("Income/Expense saved"), AIChat ("Report submitted"), LifeEvents ("Commitment added"), SupportNetwork ("Added to your network"), Profile sign-out (error toast on network failure); provider mounted in `lib/providers.tsx` |
| F9 16px inputs (iOS zoom) | `app/globals.css` `.input` → `text-base sm:text-sm`; `app/login/page.tsx` (4 inputs), `app/AIChat/page.tsx`, `app/delete-account/page.tsx`, `components/FeedbackButton.tsx` textarea — all `text-base sm:text-sm` |
| F10 tabular numbers | `tabular-nums` added to: hero balance + week totals + safe-to-spend + transaction amounts + SignalChip + growth pill (DailySnapshot), Ring label + ConfidenceBar (proto/ui), donut center + SVG chart values (proto/charts), WeeklyReview deltas/highlights/confidence, HealthScore dimension scores, FinancialPersonality signal values, PatternDashboard goal/commitment figures, Profile amounts, LifeEvents amounts, SupportNetwork totals, AddTransaction amount input, Notifications timestamps |
| F11 notification read-state | `app/Notifications/page.tsx` — read IDs and first-seen timestamps persisted to localStorage; unread dots survive remounts; fake "Just now" replaced with real relative timestamps ("Just now" / "Xm ago" / "Xh ago" / date) driven by a `useSyncExternalStore` clock (recomputes every 60s) |
| F12 offline detection | `components/OfflineBanner.tsx` — fixed banner on `offline` event: "You're offline — your entries will sync when you're back online."; mounted in `lib/providers.tsx`; `lib/store.tsx` re-upserts the last saved state to Supabase on `online` |
| F13 empty sections | `app/FinancialPersonality/page.tsx` — confirmed / emerging / all-signals sections now render centered empty states ("No confirmed patterns yet…", "No emerging patterns yet…", "No behavioral signals yet…") instead of vanishing (PatternDashboard already had empty states) |
| F14 chart text alternatives | `components/proto/charts.tsx` — `role="img"` + `aria-label` with per-point values on AreaChart/BarChart/DonutSegments; `components/proto/ui.tsx` Sparkline; AIChat and PatternDashboard recharts wrapped in `role="img"` with value summaries; PatternDashboard heatmap gains an `aria-label` summary |
| F15 skip link + heading levels | `app/layout.tsx` — "Skip to content" link (`sr-only focus:not-sr-only`, first focusable element) targeting `#main`; `id="main"` added to every page's `<main>` (DailySnapshot ×2, HealthScore ×2, FinancialPersonality ×2, AIChat, WeeklyReview, LifeEvents, SupportNetwork, Notifications, Profile, PatternDashboard, ErrorBoundary); `SectionTitle` and LearningState section titles `h3 → h2` |

All 15 findings are closed. Remaining caveats (from the report): rendered-at-320px, live keyboard traversal, and screen-reader output still need a manual device pass; sync failures are `console.error`-only and could surface via toasts in a future pass.

---

## Scope and Coverage

**Scope:** the entire app in `nafaka/` — all 17 routes (`/`, DailySnapshot, AddIncome, AddExpense, AIChat, WeeklyReview, HealthScore, FinancialPersonality, PatternDashboard, LifeEvents, SupportNetwork, Notifications, Profile, Onboarding, login, delete-account, terms/privacy), shared components (`components/proto/*`, BottomNav, AppHeader, ErrorBoundary, AnalyticsConsent, FeedbackButton), the store (`lib/store.tsx`), and design tokens (`app/globals.css`).

**Boundary:** `prototypes/nafaka1` (superseded Vite prototype) and the Android/Tauri shells were not reviewed.

**Stack:** Next.js 16 · React 19 · Tailwind CSS v4 (`@theme` tokens in `app/globals.css`) · lucide-react · recharts · custom `proto/` components (no component library). Custom fonts: Plus Jakarta Sans + Fraunces (Google Fonts import).

**Conventions found:** none — no `AGENTS.md`, `CONTRIBUTING.md`, or design-system doc. The previous `UIUX-REPORT.md` (2026-08-19, state-design focus) was reviewed; several of its findings (H1 login errors, H4 hydration blank, H3 chat fallback, L2 modal focus trap, M4 notification state) are confirmed below with current line numbers.

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | All screens + shared components; form labeling, modals, live regions, motion, hit areas, headings | 7 findings |
| Layout | All screens; hydration/offline/degraded states, breakpoints, fixed chrome, async branch flashes | 2 findings |
| Writing | All user-facing copy; errors, empty states, buttons, feedback paths, timestamps | 3 findings |
| Typography | Type scale, input sizes, money figures, line-heights, font loading | 2 findings |
| Colors | Full token ramp measured against usage; rendered pairs computed (WCAG relative luminance) | 2 findings |
| UI | Press states, transitions, icons, modals, motion language, chip/ring/chart polish | 0 findings (`Clear`) |

---

## Findings

Ordered by severity, then reach and leverage.

| # | Severity | Domain | Location | Before | After | Why |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | HIGH | Accessibility | `app/login/page.tsx:135` (also :117) | `{error && mode === 'phone' && <p role="alert">…}` — errors set but only rendered in phone mode; signup success stored in `message` and never rendered | Render the alert banner in every mode; show the signup confirmation as a success panel with a resend-link affordance | Email/Google failures are invisible and successful signup looks like failure — the user has no recovery path and may abandon sign-in |
| 2 | HIGH | Colors | `app/globals.css:11,19` (`.btn-primary` :173) | White 14px semibold labels on `#0d9a68` = **3.6:1** and on `#e0620a` = **3.55:1** — every primary button, category pill (`components/proto/AddTransaction.tsx:125`), "Mark missed" (`app/LifeEvents/page.tsx:117`) | Darken brand-600/accent-600 (adjust L, keep C/H) so button labels reach ≥ 4.5:1 | Control text fails WCAG AA across the entire app — the single most repeated rendered pair |
| 3 | HIGH | Colors | `app/globals.css:33` | `ink-400 #848fa5` = **3.25:1** on white used for 10–12px captions (timestamps `app/DailySnapshot/page.tsx:294`, `app/Notifications/page.tsx:72`, hints, footers); `placeholder:text-ink-300` = **2.01:1** (`app/Onboarding/page.tsx:283`) | Darken ink-400 to ≥ 4.5:1 on white; raise placeholder contrast to ≥ 3:1 | Small body text fails the required ratio — caption-sized text is still WCAG "normal text" |
| 4 | HIGH | Accessibility | `app/globals.css:69-125` | `fade-up`, `scale-in`, `shimmer`, `pulse-soft`, `spin-slow` run unconditionally; zero `prefers-reduced-motion` anywhere in the app | Wrap all entrance/ambient motion in `@media (prefers-reduced-motion: no-preference)` and cross-fade under the preference | Motion ignores the user's system preference app-wide (WCAG 2.3.3) |
| 5 | HIGH | Accessibility | `components/proto/ui.tsx:28-44` (also `app/AIChat/page.tsx:280`) | Modal: Escape closes, but no focus trap, no focus move-in/restore, no `aria-modal`, background never inert; the X close button (`ui.tsx:33`) is an icon-only control with **no accessible name** | Add `role="dialog" aria-modal="true"`, trap focus, restore focus to the trigger, `aria-label="Close"` on the X | Keyboard and screen-reader users can tab into the page behind the dialog and hit an unnamed control — used by the AddTransaction and delete-account flows |
| 6 | HIGH | Layout | `lib/providers.tsx:23`, `app/delete-account/page.tsx:22-27`, `app/login/page.tsx:147` | Async auth/storage resolution renders `null` (blank screen on every protected route) or the signed-out branch before resolving | Branded skeleton with `aria-busy="true"` while pending; render nothing until the delete-account auth check resolves | A blank screen is indistinguishable from a broken one, and the delete-account flash can start users typing the wrong form |
| 7 | HIGH | Writing | `app/AIChat/page.tsx:123-135` | `.catch(() => answer(answerQuestion(question, ctx), 600))` — every API failure (429, 502, network) is answered by the local rule-based brain with zero indication | Show a subtle persistent banner: "Offline mode — answers from your local data until the connection recovers" + retry | Users believe the AI coach is answering when it isn't — the fallback is a good pattern, it must just be visible |
| 8 | MEDIUM | Accessibility | app-wide — `lib/store.tsx:376` (sync failures → `console.error` only), `components/proto/AddTransaction.tsx:60-68` ("Saved" label swap only), `app/LifeEvents`/`app/SupportNetwork` (forms close with no confirmation) | No `role="status"`/`role="alert"` live region or toast system anywhere; save, sync, report, and sign-out outcomes are silent or console-only | Add a lightweight toast system (`role="status"` success, `role="alert"` errors) and use it for add-transaction, sync failure, report submission, form saves | State changes and failures are never announced to anyone — sighted users get a label swap, screen-reader users get nothing |
| 9 | MEDIUM | Typography | `app/globals.css:179` (`.input` = `text-sm`), login inputs `app/login/page.tsx:134`, chat input `app/AIChat/page.tsx:258` | 14px input text on mobile viewports | `text-base sm:text-sm` on all inputs | iOS Safari zooms the whole page when an input focuses — breaks the primary web flow on the target audience's devices |
| 10 | MEDIUM | Typography | `app/DailySnapshot/page.tsx:182,208`, `Ring` (`components/proto/ui.tsx:109`), `fmtFull` values | Money figures and progress values rendered in Fraunces/Plus Jakarta proportional digits | `tabular-nums` on every changing value | Digits have different widths — balance, safe-to-spend, and percentages shift layout as they update |
| 11 | MEDIUM | Writing | `app/Notifications/page.tsx:32,72` | `readIds` state resets on every mount; every timestamp hardcodes "Just now" | Persist read ids (store or localStorage); compute relative timestamps from `recordedAt` | Unread dots reappear forever and timestamps mislead — undermines the trust the unread indicator builds |
| 12 | MEDIUM | Layout | app-wide | `navigator.onLine` is never used; offline loads produce the blank hydration screen and offline sync failures are silent | Online/offline listeners → persistent banner ("You're offline — your entries will sync when you're back") + sync on reconnect | Money data that silently fails to sync is a trust killer in a budgeting app |
| 13 | MEDIUM | Writing | `app/FinancialPersonality/page.tsx:128,157,195` (+ `app/PatternDashboard` equivalents) | `{confirmed.length > 0 && …}` — empty sections just vanish with no placeholder | Labeled mini empty states ("Nothing confirmed yet — keep recording") for every conditional section | Users can't tell whether data is missing or the app is broken (NN/g) |
| 14 | MEDIUM | Accessibility | `components/proto/charts.tsx:51`, donut in `app/DailySnapshot/page.tsx:379`, recharts in `app/AIChat/page.tsx:177`, `app/PatternDashboard` | SVG charts with no `role="img"`, `aria-label`, or text description | Add a concise text summary (values, trend) as the chart's accessible name/description | Every chart's data is invisible to screen-reader users in a data-centric app |
| 15 | LOW | Accessibility | `components/proto/ui.tsx:47` (SectionTitle `h3`), all pages | Pages go `h1` → `h3` (skipped level); repeated fixed header/nav with no skip link | Use `h2` for section titles; add "Skip to content" as the first focusable element with `scroll-margin-top` on `<main>` | Heading outline and landmark navigation are degraded |

---

## Considered but Rejected

| Location | Candidate | Rejected because |
| --- | --- | --- |
| `app/DailySnapshot/page.tsx:166-169` | Darken `text-white/40–60` hero labels | Measured against ink-900 they render at 8.7–15.7:1 — passes AA comfortably |
| `app/Onboarding/page.tsx:185` | Remove `transition-all` on the progress bar | It animates `width` deliberately, the one justified use of `transition-all` |
| `components/proto/format.ts:1` | Expand `fmt` "1.2M UGX" to full figures | `k`/`M` currency abbreviation is an established convention in the market; full figures exist via `fmtFull` |
| `app/Onboarding/page.tsx:202-207` | Rebuild the consent checkbox | The `sr-only` input inside a wrapping label is a valid accessible pattern with correct focus/state |
| `components/BottomNav.tsx:34-41` | Enlarge 36px icon targets | Row height (~48px) provides an adequate combined target; only the header settings icon (34px) is slightly undersized |

---

## Verification

Checks run:

- `npm run lint` (nafaka/) — 0 errors; 2 warnings in `supabase/functions/*` only (not UI code).
- `npm run test` — 20 files, 224 tests, all pass.
- Contrast — measured all rendered pairs with WCAG relative-luminance math: white/`#0d9a68` 3.6:1, white/`#e0620a` 3.55:1, `#848fa5`/white 3.25:1, `#65718a`/white 4.9:1 (passes), `#505a72`/white 6.9:1, `#0c7a56`/white 5.3:1, `#bc4a0b`/white 5.1:1, `placeholder #b0b7c6` 2.01:1.
- Grep — zero occurrences of `navigator.onLine`, `prefers-reduced-motion`, `aria-live`/`role="status"`, `focus-visible` overrides, or a toast library; confirms findings 4, 8, 12.

**Not verified:** rendered layout at 320px/200% zoom, live keyboard traversal, screen-reader output, and iOS input-zoom behavior are inferred from source, not observed in a browser. The 320px and keyboard claims should be re-checked with a device before sign-off; nothing in the code suggests a horizontal-scroll blocker, but the sticky headers/footers and chart containers were not visually tested.

---

## What Nafaka already does well (keep)

1. **LearningState partial-data state** (`components/proto/LearningState.tsx`) — shimmer skeleton, confidence bar, locked/unlocked rows, CTA. Fintech-2026 partial-state pattern done properly.
2. **ErrorBoundary with recovery** (`components/ErrorBoundary.tsx`) — "Try again" + "Reset my data", calm non-blaming copy.
3. **Destructive-action friction** — delete-account requires checkbox confirmation, disables mid-flight, and shows the deletion request-received panel.
4. **Button label swaps** — "Saved", "Deleting…", "Signing out…", "Submitting…" applied consistently.
5. **Empty states with next actions** — "No transactions yet — add your first one above", "No commitments yet", notifications empty state with orientation copy.
6. **Chat affordances** — typing indicator, greeting, suggestion chips, per-message report flow with `role="dialog"`/`aria-modal`.
7. **Onboarding** — personalized questions, in-context consent, progress bar, skip option, and demo data is cleared on completion (`lib/store.tsx:485-500`).
8. **A11y basics already in place** — `lang="en"`, `antialiased`, `sr-only` labels on login inputs, `aria-current` on nav, `aria-expanded` on "Why this amount?", `aria-label` on icon-only nav links.

---

## Priority order

| Priority | Item | Effort |
| --- | --- | --- |
| 1 | F2/F3 — fix the two contrast tokens (`brand-600`, `accent-600`, `ink-400`/`ink-300`) | S (token-level, fixes the whole app) |
| 2 | F1 — render login errors + signup success in all modes | S |
| 3 | F5 — modal focus trap + close-button name (proto Modal, used by 3 flows) | S |
| 4 | F6 — hydration skeleton + delete-account loading state | S |
| 5 | F7 — visible chat offline-mode banner | S |
| 6 | F4 — wrap motion in `prefers-reduced-motion` | S |
| 7 | F8 — toast system (everything else builds on it) | M |
| 8 | F9–F14 — input zoom, tabular numbers, notification state, offline mode, empty-section consistency, chart text alternatives | M each |
| 9 | F15 — skip link + heading levels | S |

**Recommended order:** the four `S`-effort fixes (F1, F5, F6, F7) and the two token fixes (F2, F3) are one focused pass — most are 30-minute changes that close every HIGH finding except reduced-motion (F4), which is one CSS block. Nothing here blocks the Play submission decision, but F1–F7 should land before the first real users arrive.