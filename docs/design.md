# Nafaka — Design Document (Phase 0 Prototype)

Design reference for the Phase 0 prototype in `nafaka/`. Describes the visual system, layout rules, component patterns, and screen-by-screen design as implemented. This prototype is the starting point for Nafaka 2.0 — the changes ahead are positioning and generalization, not a rebuild.

---

## Design Goals

1. **Calm and trustworthy.** Money is stressful. The UI is dark, quiet, and steady — no loud colors, no alert-heavy styling. The AI's voice and the visuals both aim for "wise older friend."
2. **A phone app feel on the web.** Everything is a `max-w-sm` mobile column. The prototype should feel like a native app because the product is ultimately mobile-first (Mobile Money, SMS check-ins).
3. **Numbers first, stories second.** Balances and safe-to-spend are the hero content. Insights and coaching text support them.
4. **Non-judgmental by default.** Red is reserved for destructive actions (delete) only. Money deficits are never shown as "bad" — they're framed as "recovery" or "what to protect."
5. **Prove the mental model, not the polish.** Every screen exists to validate the "track → understand → analyze → coach" loop over a "learn" foundation (Layer 0). Visual design supports that loop; it doesn't distract from it.
6. **The AI discovers who you are from data, not a box.** The system asks *"how does money behave in your life?"* — not *"what type of person are you?"* Onboarding and UI copy must avoid boxing users into archetypes.

---

## Visual System

### Theme

Dark theme defined in `app/globals.css` via Tailwind v4 `@theme inline`.

| Token | Value | Use |
|-------|-------|-----|
| `background` | `hsl(228 8% 12%)` | App background — deep slate |
| `foreground` | `hsl(210 20% 98%)` | Body text |
| `card` | `hsl(228 8% 16%)` | Cards, nav bar |
| `muted` | `hsl(228 8% 20%)` | Hover fills, track bars |
| `muted-foreground` | `hsl(228 8% 60%)` | Secondary text, placeholders |
| `accent` | `hsl(228 8% 22%)` | Insight containers |
| `border` | `hsl(228 8% 24%)` | Hairline borders |
| `primary` | `hsl(25 95% 53%)` | Warm orange — actions, expenses, CTA |
| `secondary` | `hsl(160 60% 45%)` | Green — income, success, positive states |
| `destructive` | `hsl(0 70% 50%)` | Delete only |
| `radius` | `1rem` | Base card radius |

Chart palette (`chart-1`…`chart-5`) reuses primary/secondary plus blue, purple, and rose.

**Color semantics:**
- **Orange (primary)** = money movement that costs you (expenses, spending bars) and primary actions ("Get started", "Continue").
- **Green (secondary)** = money coming in (income, owed-to-you) and positive framing (insight icons, "Up 4 points").
- Selection rings use `bg-primary/10` + `border-primary`; commitment toggles use green to signal they're "protected."

### Typography

- **Fraunces (serif, `--font-display`)** — display font for headlines and all money amounts. Gives figures a warm, editorial, human feel.
- **Manrope (sans, `--font-sans`)** — UI body: labels, buttons, lists, inputs.
- Loaded via `next/font/google` in `lib/fonts.ts`; applied per-component through the `useGoogleFont()` hook so each page picks its fonts explicitly.

### Shape & Depth

- Cards: `rounded-2xl` (base) / `rounded-3xl` (hero panels), `border border-border`, flat fills — no drop shadows except the bottom nav.
- Icon chips: 36–40px circles (`w-9 h-9`, `rounded-full`) with 15% tinted backgrounds (`bg-primary/15`, `bg-secondary/15`) and matching icon color.
- Primary buttons: full-width pills (`rounded-full`, `py-4`), with a subtle `shadow-lg shadow-primary/20`.
- Disabled buttons: `bg-muted text-muted-foreground`, `cursor-not-allowed`.
- Hero panels (balance card, coaching insight): solid primary/secondary fill with a soft decorative circle (`rounded-full bg-*-foreground/10`) bleeding off the top corner.
- Welcome screen uses large blurred radial glows (`blur-3xl`, 20–40% opacity) for atmosphere. No other screen uses them — functional screens stay flat and calm.

### Layout

- Every screen: `min-h-screen bg-background`, content in `max-w-sm mx-auto px-6 pt-8–10`, `pb-32` on tabbed screens to clear the fixed bottom nav.
- **Bottom nav** (`components/BottomNav.tsx`): fixed, centered, `max-w-sm`, floating pill (`bg-card/95 backdrop-blur`, `rounded-2xl`, `shadow-lg`). 5 tabs:
  - Today → `/DailySnapshot` (Home) — *What should I know today?*
  - Patterns → `/FinancialPersonality` (Sparkles) — *What is my money teaching me?*
  - Score → `/HealthScore` (Gauge) — *Am I becoming financially better?*
  - Coach → `/WeeklyReview` (NotebookText) — *What should I focus on this week?*
  - Chat → `/AIChat` (MessageCircle) — *Let me ask my financial AI*
  - Active tab: orange icon + `bg-primary/15` circle + label.
- **Sub-screen headers**: back chevron in a 36px bordered circle + title in Fraunces (`text-lg`). Detail screens also carry a small uppercase layer label (e.g. "Layer 3 · Analyze").
- Content density: generous whitespace (large `mb-8` section gaps); lists are stacked full-width rows, not dense tables.

---

## Component Patterns

| Pattern | Spec |
|---------|------|
| Stat card | `bg-card border` `rounded-2xl p-4`, small icon + label row, Fraunces amount, tiny caption |
| List row | 36px icon chip, label + sub-label stack, right-aligned amount (green `+` / default `-`) |
| Insight card | `bg-accent/50` border, green sparkle chip, "Today's insight" eyebrow, body text |
| Progress bar | 8–10px `bg-muted rounded-full` track, tinted fill, `%` caption |
| Empty state | Centered dashed `border-dashed` card, icon, "No X yet" + one-line pointer |
| Form card | `bg-card border rounded-2xl p-5–6`, `uppercase tracking-wide` labels |
| Segmented control | `bg-muted rounded-full p-1`, active segment `bg-card shadow-sm` (used in Support Network: lent/borrowed) |
| Chip row | Horizontal scroll of `rounded-full` suggestion pills (AI chat) |
| Toast/confirmation | Full-screen centered check icon + headline + "Updated insight" card (Add flows) |

### Inputs

- Amount entry: label + inline `UGX` prefix + large Fraunces input, `inputMode="numeric"`, strips non-digits (`replace(/[^0-9]/g, '')`).
- Text inputs: `bg-background border rounded-xl px-4 py-3`, `focus:border-primary`.
- Category/source pickers: grid of bordered tiles (2 cols income, 3 cols expense) with icon + label, selected = tinted border.

### Charts (Recharts)

- Wrapped by `components/ui/chart.tsx` (`ChartContainer` + `ChartTooltipContent`).
- Weekly income vs spending: grouped bar chart (`BarChart`, `barGap={4}`), grid `stroke="var(--border)"`, tiny 11px axis ticks, no axis lines.
- Spending by category: single-series bars with `radius={[6,6,0,0]}`.
- AI chat inline chart: mini bar chart inside a message bubble.
- Health score: radial gauge (`RadialBarChart`, `startAngle 90`, `endAngle -270`, `cornerRadius 20`), score number overlaid center with negative margin.

---

## Screen Walkthrough

### `/` — Welcome
Logo pill (orange, Sparkles) + wordmark. Fraunces headline: *"Your money changes. Your plan should too."* (orange italic final line). Supporting copy + two feature rows ("Learns your patterns, not just your categories" / "Respects tithe, cell meetings, and family support"). Full-width "Get started" pill; caption "Takes about 2 minutes · No bank connection needed."

### `/Onboarding` — 6-step stepper
Progress bar (orange fill, 500ms transitions) + back circle. Steps:
1. **How does money move in your life?** — income-situation grid (e.g. allowance, salary, freelance, business, irregular support, combination). Currently implemented as a 2×2 archetype grid (Student / Employee / Freelancer / Business owner) — **Nafaka 2.0 reframe**: describe how money behaves in your life, don't pick a rigid identity box. The AI should discover the pattern from data.
2. **What matters most?** — list of 5 priorities, max 3 selected (check badge on select).
3. **Your balance** — big amount card ("What's in your wallet or mobile money right now? Just an estimate is fine.").
4. **Quick commitments** — toggle rows (Cell meeting / Tithe-offering / Rent / Debt repayment), green switch.
5. **Stay in the loop** — notification permission mock ("Good morning. Here's your safe-to-spend for today."), yes/no pills.
6. **You're set up** — success state + "First insight" card, "Enter Nafaka" CTA.
Continue button disabled until the current step is valid.

### `/DailySnapshot` — Home (tab: Today)
- Header: date + "Hey {name}", bell (orange dot) + profile avatar (initial in green circle).
- **Balance hero**: orange rounded-3xl card — "Current balance" (Fraunces 4xl), divider, "Safe to spend today" + "After commitments" pill.
- Two quick actions: Add income (green `+`) / Add expense (orange `−`).
- Today's insight card (green sparkle).
- Support network row (link).
- **Coming up**: commitment rows (icon from label keywords: cell→Users, tithe/church→Church, rent→Home, debt→Landmark) + "See all" → LifeEvents.
- **Recent activity**: expandable transaction rows (tap to reveal Delete), income green `+` / expense orange `−` amounts.
- Empty states for no commitments / no transactions.

### `/AddIncome` & `/AddExpense`
- Sub-header, amount card (autofocus), source/category tile grids, optional note, full-width save pill (income = green, expense = orange).
- On save → full-screen confirmation: check icon, "Income recorded", updated insight ("Cell and offering commitments protected first"), "Back to home".

### `/LifeEvents` — Upcoming commitments
Intro line: "These are protected first when we calculate what's safe to spend each day. Mark what you've followed through on — it's how Nafaka learns your commitment reliability." Commitment rows now carry a status (Paid / Missed badges) and per-row controls: "Mark paid" (green) / "Mark missed" (red), tapping the active state returns it to upcoming. Status flows through the adapter into the `commitmentReliability` signal. "Add a commitment" dashed button → inline form (label / when / amount) with validation-gated "Add commitment."

### `/SupportNetwork`
Intro: "Money moves between people who care about each other. Keeping track helps without keeping score." Two stat cards (Owed to you / You owe), people list (initials avatar, relationship · last entry, green `+` / orange `−` balance), segmented lent/borrowed control + "Log a give or borrow" form.

### `/Notifications`
Unread rows tinted `border-primary/30 bg-accent/40` with orange dot; "Mark all read" action; tap row to mark read. Items: offering due, pattern detected, cell reminder, repayment update, debt upcoming.

### `/Profile`
Avatar + editable name (inline edit with check), "Demo account" caption, Financial archetype card (2.0: replaced by a data-driven "your money profile" once Layer 0 exists), Priorities as chips, "View notifications" row.

### `/FinancialPersonality` — tab: Patterns
- "Layer 2 · Understand", subtitle now data-driven: "Based on {N} records · Nafaka is developing your money."
- **Model confidence card** (accent): BrainCircuit icon, overall confidence %, active-signal count, tier copy from `describe.ts`.
- **Income pattern hero** (green): pattern label from `incomeRegularity` signal (Regular / Semi-regular / Irregular, or "Still learning" when insufficient data), with honest copy + "From N income events · X% confidence". Facts grid computed from recorded transactions (total recorded, event count, largest/smallest received) — no fake "94 days".
- Explainer card: why fixed budgets don't fit.
- "Spending behaviors we've noticed": three cards (After income arrives / Daily spending rhythm / Savings habit) rendered from signals — each shows the value-driven copy when there's evidence, "We're still learning this pattern" when there isn't, plus "X% confidence · N observations".
- **Knowledge-ladder honesty block**: "Nafaka distinguishes what it knows, what it suspects, and what it doesn't know yet."
- Dashed link → Pattern Dashboard; row → Support Network.

### `/PatternDashboard`
Back to personality. Sections: 30-day income heatmap (10-col grid of intensity squares with Less/More legend), savings goal progress bars, spending-by-category bar chart, "Recurring expenses detected" rows with frequency + amount.

### `/HealthScore` — tab: Score
- "Layer 3 · Analyze". "Not about wealth — about consistency."
- Radial gauge card: score from the brain (`computeHealthScore`), with "— / score still developing" when no component is confident yet. Pill reads "X of 5 components confident".
- Positioning card: "A student with UGX 20,000 can score higher than someone with millions…" + explainer that sub-50%-confidence components count as "still learning" and never drag the score down.
- Component breakdown from `lib/brain/health.ts`: Consistency (incomeRegularity + spendingStability, 25%), Commitment reliability (25%), Savings rate (20%), Debt management (100 − debtPressure, 20%), Resilience (10%). Each row shows value + confidence pill ("80% confident" / "still learning") with an n= sample size note, or "No data yet — record … to start."

### `/WeeklyReview` — tab: Coach
- "Layer 4 · Coach", date range from `formatWeekRange`.
- Income / Spending stat pair computed from real transactions for this and the previous 7-day window (`weeklyTotals`), with honest captions: "% vs last week", "First week of data", "Nothing recorded yet".
- Income vs spending grouped bar chart (last 7 days, `dailyTotals`).
- **Coaching insight hero** (orange): renders the brain's first confident insight (e.g. commitments-strong, savings-habit) with the current state line ("Currently stable — your buffer covers roughly 15 days of essentials"); falls back to an honest "Nafaka is still learning your patterns this week" when no insight has reached confidence.
- "Looking ahead to next week" card: probabilistic phrasing driven by `incomeRegularity` (regularity copy when enough income events, otherwise "still learning your income rhythm") plus upcoming commitments total.

### `/AIChat` — tab: Chat
- "Ask your coach" header with back link. Personalized greeting built from the brain (`buildGreeting`: records seen + confidence tier).
- Message bubbles: AI = card with green sparkle avatar, `rounded-bl-sm`; user = orange, right-aligned, `rounded-br-sm`. AI messages can embed charts (last-7-days spending mini bar chart from real data).
- Suggestion chips (scrollable): "Can I afford this today?" / "Why did I overspend on Sunday?" / "When will I likely get paid next?" / "How is my Cell reliability doing?"
- Answers via `answerQuestion` in `lib/brain/chat.ts`: afford (parses amounts, compares to safe-to-spend), weekday breakdown (honest when < 3 days of data), income timing (refuses to guess dates until the rhythm is learned), commitment reliability (real reliability %), and an overview fallback (state + balance + safe-to-spend). 600ms simulated delay; footer shows current state, runway and confidence.

### `/Feedback` (floating button on all pages)
`components/FeedbackButton.tsx` — persistent floating feedback entry point for testers (per `testing-session-script.md`).

---

## State & Data (Design Implications)

- **`lib/store.tsx`** — React Context (`FinancialProvider`) with pure money math (`computeBalance`, `computeUpcomingTotal`, `computeSafeToSpend`) in `lib/utils.ts`; tests in `lib/money.test.ts`. Also: commitment lifecycle (`status: upcoming | fulfilled | missed`), weekly balance snapshots (6 seeded past weeks + current week derived from live balance), and `behaviorModel` computed from the brain.
- **Safe-to-spend is the single most important number in the UI** and is surfaced on the dashboard hero, onboarding insight, and both Add flows' confirmation copy.
- **Honesty by design:** Health Score, Weekly Review, and AI Chat render what the brain actually knows, with confidence %, sample sizes and "still learning" states instead of invented demo facts. Marking a commitment paid/missed changes the real `commitmentReliability` signal and moves the Health Score.
- No persistence: hardcoded demo data (Freelancer profile, 3 transactions, 7 commitments incl. past outcomes, 2 goals, 3 network people, 6 past snapshots). State resets on refresh — acceptable for Phase 0.
- Deleting a transaction is a two-step pattern (tap row → Delete) to prevent accidental loss.

---

## Deferred / Known Gaps

- Real AI (canned responses in chat; static insights elsewhere) — Layer 0 behavior model is the future home of this
- Notifications are a static mock (bell dot is cosmetic)
- No onboarding persistence → profile always starts as demo "Freelancer"; archetype remains a fixed box until onboarding is reframed ("how does money behave in your life?")
- No charts on FinancialPersonality (insight cards only)
- Heatmap is a hardcoded 30-day array, not derived from store
- Health Score trend ("Up 4 points") is a future improvement surface — score currently renders from signals without week-over-week trend history
- Animations are minimal (progress bar, hover transitions) — no page transitions, no skeleton loaders
- Uganda-specific commitment labels are hardcoded; contextual commitment library (global intelligence + local context) is future work

---

## Design Decisions Log

| Decision | Rationale |
|----------|-----------|
| Dark theme | Calm, "serious money" mood; orange/green pop on slate without shouting |
| Fraunces for numbers | Editorial serif makes amounts feel considered rather than transactional |
| Green = income, orange = spending | Instantly readable directionality; reinforces "protect commitments" (green) |
| Max 3 priorities in onboarding | Forces focus; matches "one week's focus" coaching model |
| "Safe to spend" replaces "budget" | The core product principle: no fixed budgets, adaptive guidance |
| Probabilistic language everywhere | "There's a good chance…" — product principle: probability, not promises |
| Single-column mobile layout on desktop | Prototype mirrors the phone experience testers will actually use |
| Onboarding describes money behavior, not identity | "How does money behave in your life?" — the AI discovers who you are from data (Layer 0), not a box you pick |
| Five tabs kept, meaning refined | Today = what should I know? · Patterns = what is my money teaching me? · Score = am I improving? · Coach = what to focus on? · Chat = ask my AI |
| Uganda features are contextual, not removed | Global financial intelligence + local financial context — commitment library, currency, and rails configure per market |
