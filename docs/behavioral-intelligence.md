# Nafaka — Behavioral Intelligence Architecture (Layer 0: Learn)

The Layer 0 design: **what Nafaka learns about a person, what data it needs, how behavioral signals are calculated, how confidence changes over time, and how signals feed Patterns → Score → Coach → Chat.**

The product thesis this architecture serves:

> Nafaka doesn't ask users to define themselves financially. It learns who they are financially.

The behavior model is the foundation everything else reads from and writes to. It is not a screen — it is a system.

---

## Principles

1. **Never punish financial difference.** Irregular income isn't bad. High spending isn't automatically bad. Borrowing isn't automatically bad. Supporting family, giving, or having a low income isn't bad. The AI's job is to understand *context + behavior + consequences*.
2. **Behavior over transactions.** "You spent UGX 80,000 on food" is a transaction fact. "Your food spending rises when income arrives irregularly" is a behavioral signal.
3. **Confidence gates everything.** A signal without confidence is a guess. No signal is shown to a user, fed into a score, or turned into coaching below its confidence threshold.
4. **Probability, not promises.** The model outputs tendencies with confidence, never certainties.
5. **Context is part of the signal.** The same spending amount means different things in different states (EMERGENCY vs GROWTH).

---

## Architecture

```
                    USER FINANCIAL ACTIVITY
                            │
             ┌──────────────┴──────────────┐
             │                             │
        Transactions                 Commitments + Snapshots
             │                             │
             └──────────────┬──────────────┘
                            ▼
                   ┌─────────────────┐
                   │   LAYER 0       │
                   │  LEARN / BRAIN  │   deterministic, pure
                   └────────┬────────┘
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
          Behavioral Signals      Confidence
                 │                     │
                 └──────────┬──────────┘
                            ▼
                    Financial State
             EMERGENCY → STABILITY → GROWTH
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
              Patterns     Score     Coaching
                 │          │          │
                 └──────────┼──────────┘
                            ▼
                    LLM interpretation
                         (language only)
                            │
                         AI Chat
```

**One architectural rule: the brain is deterministic and explainable.** The LLM never calculates signals, confidence, state, or scores. The pipeline is always:

```
Transactions → Deterministic Brain → Signals + Confidence + State → LLM → natural-language coaching
```

The AI interprets the financial intelligence; it never invents it. That buys consistency, testability, explainability, and trust.

---

## What Nafaka Learns About a Person

Nine behavioral signals, each normalized to 0–100 unless noted. Each signal carries a `value`, a `confidence` (0–1), and a `sampleSize`.

| # | Signal | Question it answers | Output meaning |
|---|--------|--------------------|----------------|
| 1 | `incomeRegularity` | How predictable is income arrival? | 100 = perfectly regular intervals |
| 2 | `incomeSourceDependence` | How reliant is one source? | 100 = all income from one source |
| 3 | `spendingStability` | How much does daily spending swing? | 100 = very steady |
| 4 | `discretionaryShare` | How much spending is non-essential? | 100 = all discretionary |
| 5 | `postIncomeAcceleration` | Does spending spike after deposits? | 100 = same as baseline; 150 = 50% above |
| 6 | `savingsConsistency` | Is saving a habit or an accident? | 100 = saved every period |
| 7 | `commitmentReliability` | Do commitments get fulfilled? | 100 = fulfilled everything on time |
| 8 | `debtPressure` | How much of income goes to debt? | 100 = all income absorbed by debt |
| 9 | `financialResilience` | How long could you survive with no income? | 100 = 30+ days of essential costs |

**Deliberately not scored:** how much someone earns, how much they have, what they spend on. Those are context for signals, not signals themselves.

---

## Data Model

The engine works on a richer data shape than the current store. The store adapter (`lib/brain/adapters.ts`) maps current records into it; Phase 1 persistence should store the real thing.

```
BrainTransaction {
  id, type: 'income' | 'expense',
  amount, category?, source?,   // source = income source label
  date                          // ISO yyyy-mm-dd
}

BrainCommitment {
  id, label, amount,
  dueDate,                      // ISO
  fulfilled: boolean | null     // null = not yet due
}

BrainSnapshot {
  date, balance                 // periodic wallet snapshots (weekly in Phase 1)
}
```

Engine input: `{ transactions, commitments, snapshots, balance }`.

---

## Signal Calculations (v1)

Pure functions over the data model; no randomness, no I/O. All in `lib/brain/signals.ts`.

Let `cv(x)` = coefficient of variation of a set (stddev / mean).

### 1. Income regularity

- Take income events sorted by date; compute gaps between consecutive arrivals (days).
- If fewer than 2 income events → insufficient data (`sampleSize: 0`).
- `regularity = 100 · (1 − min(1, cv(gaps)))`
- `sampleSize = number of income events`

### 2. Income source dependence

- Group income by `source`; `largestShare` = largest group total ÷ total income.
- `dependence = 100 · largestShare`

### 3. Spending stability

- Daily expense totals across all days that had any spending.
- `stability = 100 · (1 − min(1, cv(dailyTotals)))`
- Zero-spend days are excluded — the signal measures swing among spending days, not frequency.

### 4. Discretionary share

- Discretionary categories: `shopping`, `other` (not `food`, `transport`, `giving`, `debt`).
- `share = 100 · discretionaryTotal ÷ expenseTotal`
- Giving is **never** treated as discretionary — it is a commitment.

### 5. Post-income acceleration

- For each income event, sum spending on the following 3 days (excluding the income day itself) and average per evaluated event.
- `baseline` = average daily spending across all spending days.
- `acceleration = 100 · postIncomeDaily ÷ baseline` (clamped to 400; if baseline is 0, ratio = 100).

This is the "72-hour spending window" signal from the prototype — now computable.

### 6. Savings consistency

- Requires 2+ chronological `BrainSnapshot`s.
- Positive week-over-week balance deltas ÷ total deltas × 100.

### 7. Commitment reliability

- Only evaluated on commitments with `fulfilled ≠ null` (past due).
- `reliability = 100 · fulfilled ÷ evaluated`

### 8. Debt pressure

- `pressure = 100 · min(1, debtExpenseTotal ÷ incomeTotal)`

### 9. Financial resilience

- Daily essential cost = average daily spending on `food` + `transport`.
- `runwayDays = balance ÷ dailyEssentialCost`
- `resilience = 100 · min(1, runwayDays ÷ 30)` — 30 days of essentials = full score.

---

## Confidence Model

Each signal gets a confidence from two factors: **how much data exists** and **how consistent the observations are**.

```
confidence(n, halfLife, spread) = (1 − e^(−n / halfLife)) · (1 − min(0.6, spread))
```

- `n` = observation count for the signal
- `halfLife` = observations needed to reach ~63% confidence (per-signal constant)
- `spread` = normalized variance of the observations (0 = perfectly consistent, 1 = chaotic)

| Signal | halfLife (observations) |
|--------|------------------------|
| incomeRegularity | 12 |
| incomeSourceDependence | 10 |
| spendingStability | 14 |
| discretionaryShare | 14 |
| postIncomeAcceleration | 10 |
| savingsConsistency | 8 |
| commitmentReliability | 6 |
| debtPressure | 10 |
| financialResilience | 10 |

### Confidence tiers

| Tier | Range | Meaning |
|------|-------|---------|
| exploring | 0 – 0.2 | Too little data to say anything |
| learning | 0.2 – 0.5 | Early shape, may shift |
| confident | 0.5 – 0.8 | Stable enough to coach from |
| mature | 0.8 – 1.0 | High certainty, compounding over time |

**Overall model confidence** = mean of all non-zero signal confidences. It is the number the UI surfaces ("I'm getting to know your money — this improves as you record more"). A signal below 0.5 must not drive user-facing claims.

---

## The Knowledge Ladder

Nafaka must distinguish **what it knows, what it suspects, and what it doesn't know yet** — and say so. Confidence tiers map to a language ladder, never stronger than the evidence:

| Tier | How Nafaka talks |
|------|------------------|
| exploring / learning | "We're noticing higher Sunday spending, but we're still learning your pattern." |
| confident | "Your Sunday spending is consistently higher than your weekly average." |
| mature | "Sundays are your highest-spending day — typically 38% above your weekly average." |

Every claim shown to the user carries its confidence ("From 42 events · 81% confidence"). This is what makes the AI feel trustworthy: it never overstates what it knows. Implemented in `lib/brain/describe.ts` (`tierLabel`, `tierCopy`, `confidencePhrase`, value→label helpers).

---

## Commitment Lifecycle (real behavioral evidence)

A commitment is not stored as a fact ("Tithe — UGX 20,000"). It lives a lifecycle, and each stage produces evidence:

```
Created
   ↓
Due
   ↓
Fulfilled / Partially fulfilled / Missed
   ↓
Observed behavior → commitmentReliability signal
```

`commitmentReliability` is therefore a measurement of *follow-through*, not a count of obligations. Nafaka can distinguish:

> "You have commitments." — fact

from:

> "You consistently follow through on your commitments." — observed behavior

Implementation (Phase 0): `Commitment.status: 'upcoming' | 'fulfilled' | 'missed'` in the store; Life Events screen exposes "Mark paid / Mark missed" controls; the adapter maps status → `fulfilled: true | false | null` for the brain. When Phase 1 arrives, status transitions automatically from payment events instead of manual marks.

---

## Weekly Behavioral Snapshots

The model answers "what does the user look like now?" — but Nafaka's promise is "how are you becoming better over time?" That requires **historical snapshots**:

```
Week 1   spendingConsistency: 0.42   commitmentReliability: 0.60   savingsConsistency: 0.20
Week 2   spendingConsistency: 0.48   commitmentReliability: 0.71   savingsConsistency: 0.35
Week 3   spendingConsistency: 0.57   commitmentReliability: 0.80   savingsConsistency: 0.51
```

With history, Nafaka can say:

> "You've improved your financial consistency for three consecutive weeks."

That is far more meaningful than "Your balance is UGX 150,000."

Implementation (Phase 0): the store keeps weekly balance snapshots (seeded history; the current week is derived from the live balance, so it always reflects the latest state). They feed `savingsConsistency`, which is read by the Health Score's "Savings rate" component and by Weekly Review; trend lines ("improved for three consecutive weeks") are future work.

---

## Financial State (context layer)

The model also classifies the user's current situation — the context that interprets signals:

```
EMERGENCY  balance ≤ 0
SURVIVAL   runway < 3 days
RECOVERY   runway ≥ 3 but balance < upcoming commitments
STABLE     runway ≥ 14 days, commitments covered
GROWTH     runway ≥ 90 days
```

`runway = balance ÷ dailyEssentialCost`. The same signals are read differently per state (see feed-through).

---

## Insight Rules (v1)

Rule-based insights generated only when the relevant signal has `confidence ≥ 0.5`. Each insight has a severity: `info` / `watch` / `action`.

| Trigger | Insight (paraphrase) | Severity |
|---------|----------------------|----------|
| `postIncomeAcceleration` ≥ 130 | "When you receive a larger payment, discretionary spending tends to rise in the first 3 days. Your commitments stay protected — this window is where spending accelerates." | watch |
| `commitmentReliability` ≥ 80 | "Your commitment payments are highly reliable — they've rarely been missed." | info |
| `commitmentReliability` ≤ 50 | "Commitment payments have been missed recently. Protect the most important one first." | action |
| `savingsConsistency` ≥ 70 | "You save consistently. That consistency matters more than the amount." | info |
| `incomeRegularity` ≤ 30 | "Your income arrives irregularly. Fixed budgets won't fit — safe-to-spend adapts daily instead." | info |
| `debtPressure` ≥ 50 | "Debt repayments absorb a significant share of your income." | watch |
| `financialResilience` ≤ 20 | "Your buffer is thin — under 3 days of essential costs. Protecting food and shelter comes first." | action |
| State = RECOVERY or worse | "Cash is tight. Priorities: essentials → commitments → everything else." | action |

The non-judgmental rule: every insight names **context + behavior + consequence**. None of them label the person. ("You have a thin buffer" — never "you're bad with money.")

---

## Feed-Through: How Signals Drive the Product

### Layer 2 — Understand (Patterns, Financial Personality)

- `incomeRegularity` + `incomeSourceDependence` → the income-pattern hero ("Highly irregular · Freelancing" becomes a data-driven claim).
- `postIncomeAcceleration` → the "72-hour spending window" note.
- `spendingStability` + `discretionaryShare` → spending-behavior cards.
- Every claim on this screen must show its confidence ("From 42 events" instead of fake "94 days").

### Layer 3 — Analyze (Health Score)

Score components map 1:1 to signals, each weighted by its confidence:

| Score component | Driven by | Weight |
|-----------------|-----------|--------|
| Consistency | incomeRegularity + spendingStability | 25% |
| Commitment reliability | commitmentReliability | 25% |
| Savings rate | savingsConsistency | 20% |
| Debt management | 100 − debtPressure | 20% |
| Resilience | financialResilience | 10% |

Overall score = confidence-weighted mean of component scores. If a component has confidence < 0.5 it is shown as "still learning" and does not drag the score down.

### Layer 4 — Coach (Weekly Review, AI Chat)

- Weekly review builds on **one week's signals** (change vs. the model's baseline) and states the behavioral takeaway: "You spent more this week, but most of the increase was rent. Discretionary spending fell 12% — nothing to correct here."
- Chat answers read the model: "Can I afford this today?" uses balance + commitments + runway. "Why did I overspend on Sunday?" uses `postIncomeAcceleration` / day-of-week breakdown.
- Coaching never says "you overspent by 18%" without context; it always attaches the consequence.

### Layer 0 itself (Learn)

The model is updated after every recorded transaction, commitment outcome, or snapshot. Over time the same person's signals tighten (spread ↓) while confidence rises (n ↑) — the model literally learns the person.

---

## Implementation Map

| File | Contents |
|------|----------|
| `lib/brain/types.ts` | BrainTransaction, BrainCommitment, BrainSnapshot, BehaviorModel, SignalValue, tiers |
| `lib/brain/stats.ts` | mean, stddev, sum, clamp, toISODate |
| `lib/brain/signals.ts` | 9 signal functions (pure) |
| `lib/brain/confidence.ts` | confidenceFor(), tier(), overallConfidence() |
| `lib/brain/state.ts` | classifyState() |
| `lib/brain/insights.ts` | rule-based insight generation |
| `lib/brain/describe.ts` | knowledge-ladder copy: tier labels, confidence phrases, value→label helpers |
| `lib/brain/index.ts` | buildBehaviorModel() — assembles everything |
| `lib/brain/adapters.ts` | store → brain adapters (transactions, commitment status, snapshots) |
| `lib/brain/brain.test.ts` | vitest coverage |
| `lib/store.tsx` | commitment lifecycle (`status`), weekly snapshots, exposes `behaviorModel` |
| `app/FinancialPersonality` | renders live from behaviorModel with uncertainty language |
| `app/LifeEvents` | mark commitment paid / missed controls |

---

## Roadmap Beyond v1

1. **Real dates + snapshots** (Phase 1 persistence) — commit actual dates into `BrainTransaction`; `savingsConsistency` and time-based signals become fully live.
2. **Automatic commitment outcomes** — Phase 0 has manual mark paid/missed; Phase 1 transitions status automatically from recorded payments.
3. **Decay** — weight recent observations higher (exponential time decay) so the model follows behavior change instead of averaging it away.
4. **Bayesian signal updates** — replace the static formula with prior/posterior updates; confidence becomes a principled probability.
5. **LLM augmentation** — rule-based insights give the AI structured context; the LLM composes language, never invents signals (the deterministic-brain rule).
6. **Per-screen confidence UI** — "Based on 42 events" and tier language (done for Financial Personality, Health Score components, chat greeting; extend to every remaining surface).
7. **Improvement surfaces** — week-over-week signal deltas feeding Health Score trend and Weekly Review ("improved consistency for 3 consecutive weeks").

## Example

From 90 days of data, the model for "Brian" would output, in part:

```
signals.postIncomeAcceleration = { value: 142, confidence: 0.81, sampleSize: 11 }
signals.commitmentReliability = { value: 96, confidence: 0.92, sampleSize: 12 }
signals.financialResilience   = { value: 18, confidence: 0.74, sampleSize: 10 }
state = STABLE
insights = [
  "When you receive a larger-than-usual payment, discretionary spending
   tends to rise in the first 3 days. Your commitments stay protected —
   this window is where spending accelerates." (watch)
]
```

Which is exactly the intelligence the product thesis promises: *not* "income 500k, expenses 420k" but "commitment failure isn't Brian's risk — post-income spending acceleration is."

---

## v1.5 — Situation reads, stability, outcomes, adaptive coaching

Built on the deterministic engine (engine → decision → evidence → explanation), the v1.5 layer adds four things:

### 1. Situation reads carry their own evidence (`lib/brain/situation.ts`)

`readSituation()` returns `{ situation, confidence, evidence[], sampleSize, windowDays, reason }` for every verdict. The situation is still deterministic rules over signals — no LLM classification — but now every read is explainable:

```
state: UNDER_PRESSURE
confidence: 0.71
evidence: ["debt absorbs 60% of income (8 repayments)", "balance UGX 500,000"]
sampleSize: 8
reason: "Cash is tight right now — …"
```

Two new situations: **RECOVERING** (state RECOVERY: thin runway that is stabilizing) and **UNKNOWN** ("Nafaka is still learning your financial rhythm") — returned instead of forcing a verdict when fewer than 4 data points exist or no signal has reached 0.3 confidence. EMERGENCY stays factual (balance ≤ 0 or runway < 2 days) and outranks everything.

### 2. Transition stability / hysteresis (`lib/brain/stabilize.ts`)

State and situation reads now pass through a memory-guarded stabilizer:

- **Worsening moves apply immediately** (safety first — pressure is never hidden).
- **Improvements only stick** after the better read has been observed on 3 distinct days (`minHoldingDays`), so the model cannot whiplash: "stable Monday → under pressure Tuesday → recovering Wednesday" is impossible; a flicker between calm and pressure leaves the held read on pressure.
- **UNKNOWN never downgrades a held read** — missing evidence doesn't erase a known situation.
- The memory (`held`, `holdingSince`, `candidate`, streak fields) persists in `finance_states` / localStorage and is fed back into `buildBehaviorModel(…, { stateMemory, situationMemory })`. `model.stateChanged` / `situationChanged` report when a held read actually flipped.

### 3. Outcome tracking — prediction → action → outcome (`lib/brain/outcomes.ts`)

`measureOutcomes()` compares each coaching focus against the user's own earlier behavior and only reports when a window is attributable:

- **postIncomeAcceleration** — spending in the 72h after the latest deposit vs the mean of earlier deposit windows (the "85k → 51k, that's 40% less" case). The window must be closed and the outcome must postdate the recommendation before it counts.
- **commitmentReliability** — the most recent Paid/Missed outcome vs the historical follow-through rate.
- **savingsConsistency** — this week's balance movement vs the mean of earlier weeks (from weekly snapshots).
- **state** — balance held or grew this week.
- debt, resilience, record — honestly reported as "not yet measurable" until the data exists.

### 4. Coaching effectiveness + adaptive coaching (`lib/brain/coaching.ts`, `lib/brain/focus.ts`)

Every recommended focus opens a **coaching record** (id = `${focusKey}-${date}`). `syncCoaching()` closes instances after a 7-day window with an attributable outcome (or when the focus moves on), then opens a fresh instance. `coachingStats()` then produces per-focus effectiveness:

```
focus: postIncomeAcceleration
recommended: 3   improved: 2   pending: 1   successRate: 0.67
```

`weeklyFocus(model, { successRates })` re-ranks matching candidates so the engine prefers what has worked for this person: safety reads (state, debt) always win; among behavioral candidates, measured success rates rank first (unmeasured candidates sit at neutral 0.5, so a focus that has consistently failed sinks below unexplored ones).

### Wiring

- `lib/store.tsx` — persists `coachingLog` + `stateMemory` + `situationMemory`; exposes `focus`, `outcomes`, `coachingStats`, `lastCoachingOutcome`; state/situation are stabilized per user.
- Weekly Review — beat 5 "Did it work?" reports the closed outcome ("You changed the pattern" / "Still building the habit") plus the coaching track record and days the situation read has held steady.
- Chat — "Has my focus worked?" answers from the latest outcome.
- LLM context (`buildLlmContext`) — adds `coaching` so Gemini explains the measured outcome rather than inventing one.

Tests: `situation.test.ts` (read evidence), `stabilize.test.ts` (transition matrix + flicker), `outcomes.test.ts`, `coaching.test.ts`, `focus.test.ts` (adaptive ranking).
