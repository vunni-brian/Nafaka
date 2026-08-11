# AI Financial Operating System

## Product Vision

Most finance apps answer: *"Where did your money go?"*

This product answers: *"How do I become financially better over time?"*

It is not an expense tracker. It is not a budgeting app. It is an **AI-powered personal financial operating system** that learns how *you* handle money. It studies your income, spending, commitments, saving, debt, and financial habits to uncover patterns you may not notice yourself. Instead of judging your wealth or forcing you into a fixed budget, Nafaka measures your financial consistency and helps you make better decisions — one week at a time.

The system works for everyone — students, salaried employees, freelancers, business owners, high earners. The key isn't how much someone earns; it is **how consistently they make good financial decisions relative to their own situation**.

**Irregular income is a major differentiator, not a restriction.** The design is built first for people whose income is unpredictable — students, gig workers, freelancers, small traders — the group that fixed-budget tools fail. But the behavioral engine adapts to any financial life.

**The AI discovers who you are from data, not from a box you pick.** The onboarding mental model is not *"What type of person are you?"* but *"How does money behave in your life?"* A user can be an employee with a stable salary, an employee with side income, a student with allowances, a freelancer, a business owner, unemployed but receiving occasional support, or a combination — the system learns that from behavior over time.

---

## How It Works

Instead of:

```
Income → Expenses → Balance
```

The system is:

```
Money → Behavior → Patterns → Insights → Coaching → Better behavior
```

Because everyone's financial life is different, the AI adapts to the individual:

- **Student:** "You tend to spend heavily during the first three days after receiving money."
- **Employee:** "Your savings consistency drops toward the end of the month."
- **Freelancer:** "Your income is unpredictable, but your essential expenses are relatively stable."
- **Business owner:** "Your personal withdrawals increase when business revenue falls."
- **Parent:** "Family support is becoming a recurring expense rather than an occasional one."
- **High earner:** "Your income has increased, but your discretionary spending has increased at almost the same rate."

The AI never says *"you're bad with money."* It says: **"Here's what your behavior is telling us. Here's one thing you can improve this week."**

---

## Target Market

> **Anyone who wants to become better at managing money.**

Initial segments:

1. Students
2. Salaried employees
3. Freelancers & gig workers
4. Small-business owners
5. Commission / income-variable workers
6. Families
7. Anyone trying to improve their financial habits

**First market: Uganda** — UGX, Mobile Money, local giving practices, family obligations, informal debt, SACCOs, tithe, cell meetings. Later, the same behavioral engine adapts to other countries and currencies.

---

## Global Intelligence + Local Context

Uganda-specific features are not removed for the broader market — they become **contextual**.

**Financial commitments** (Uganda first):

- Rent
- Tithe / offering
- Cell / fellowship
- School fees
- Family support
- Debt repayment
- SACCO contribution
- Savings group
- Airtime / data
- Transport

Users in other markets have different equivalents. The architecture is therefore:

> **Global financial intelligence + local financial context.**

The behavioral engine (income patterns, commitment reliability, consistency scoring, coaching) is market-agnostic. The commitment library, currency, payment rails, and cultural examples are configured per market. Nafaka keeps its authentic Ugandan roots while the intelligence stays portable.

---

## The Core Product Loop

**Track → Understand → Coach → Improve → Learn**

1. **Track** — income, expenses, mobile money transactions, debts, savings, giving/tithe, recurring commitments
2. **Understand** — irregular income patterns, spending habits, financial pressure periods, commitment reliability, recurring financial leaks
3. **Coach** — one week's focus, explained *why* it matters, no shame, no unrealistic budgeting, adapted to the user's actual behavior
4. **Improve** — consistency, saving behavior, reduced unnecessary spending, debt repayment reliability, ability to handle income fluctuations
5. **Learn** — the AI continually learns the user's financial behavior; advice becomes increasingly personalized

---

## What Makes It Different

| Traditional expense tracker | This product |
| --------------------------- | ------------ |
| "You spent UGX 80,000 on food." | "Your food spending increases when income arrives irregularly." |
| Tracks transactions | Studies behavior |
| Static budgets | Adaptive guidance |
| Assumes fixed salary | Designed for irregular income |
| Focuses on spending | Focuses on financial decisions |
| Monthly reports | Weekly coaching |
| Generic categories | Context-aware commitments |
| Measures wealth | Measures consistency |
| Tells you what happened | Helps you decide what to do next |

---

## The Moat: A Personal Financial Behavior Model

The most valuable part is not expense tracking. It is building a **personal financial behavior model** for each user — the AI progressively understands *how that person responds to money*. That model is what makes the coaching feel earned and specific, and it compounds: the longer the relationship, the better the AI knows the user, the harder it is to leave.

---

## The Five-Layer Architecture

```
┌─────────────────────────────────────────────┐
│  Layer 4: COACH                              │
│  Timely insights, behavior change,           │
│  weekly reviews, annual story                │
├─────────────────────────────────────────────┤
│  Layer 3: ANALYZE                            │
│  Trends, risk detection, forecasting,        │
│  financial health score                      │
├─────────────────────────────────────────────┤
│  Layer 2: UNDERSTAND                         │
│  Pattern detection, income personality,      │
│  spending habits, commitment reliability     │
├─────────────────────────────────────────────┤
│  Layer 1: RECORD                             │
│  Income, expenses, commitments, goals,       │
│  wallet snapshots, support network           │
├─────────────────────────────────────────────┤
│  Layer 0: LEARN (foundation)                 │
│  The personal financial behavior model —     │
│  who you are financially, built from your    │
│  behavior over time. The real AI.            │
└─────────────────────────────────────────────┘
```

Each layer depends on the one below it. You cannot coach without analyzing. You cannot analyze without understanding patterns. You cannot understand patterns without recording data. And **nothing is personalized without Layer 0** — the behavioral model that every layer reads from and writes to. That is where the real AI intelligence lives.

---

## Core Beliefs

1. **Income irregularity is normal** — the product is built for freelancers, students, and anyone without a fixed salary. Fixed-budget tools do not work for them.

2. **Giving, faith, and community commitments matter** — tithe, cell meetings, church offerings are not optional extras. They are priorities that the product must respect.

3. **Debt to people is different from debt to institutions** — social debt is flexible, personal, and emotionally charged. The product treats it differently.

4. **Financial health is not about wealth** — a student with UGX 20,000 can have a higher financial health score than someone with UGX 2,000,000 if their decisions are consistent.

5. **The AI must never judge** — its tone is calm, practical, and respectful. It acknowledges what the user does right before suggesting changes.

---

## Primary User

**University student / young adult with irregular income**

- Receives money from parents occasionally
- Does freelance work
- Income varies: UGX 0 some days, UGX 100,000 others
- Has: food expenses, transport, church commitments, debt, savings goals, unexpected expenses
- Uses UGX (Ugandan Shillings)
- Culturally: cell meetings, tithe, family support are normal

---

## User Journey Over Time

### Day 1: Onboarding

```
1. Welcome screen → "Your money changes. Your plan should too."
2. How does money move in your life? → Describe your situation (income sources, rhythm), not a rigid archetype
3. What matters? → Pick top 3 priorities (survive, debt, save, give, emergency fund)
4. Your balance → First wallet snapshot
5. Quick commitments → Cell, church, rent, debt
6. Permission → Daily check-in notifications
7. Done → First insight generated
```

### Week 1: Daily Check-ins

Each morning: "What's your balance today?" + AI calculates safe spending.

Each evening: Summary of what happened, what changed, what to watch.

End of week 1: Weekly review — income, spending, patterns, prediction for next week.

### Month 1: Pattern Discovery

AI identifies:
- Income frequency (weekly / monthly / irregular / specific days of week)
- Regular expenses (transport every weekday, data every month)
- Commitment reliability (does the user consistently attend Cell?)
- Spending spikes (Sundays after church, exam weeks)

### Month 3: Financial Personality

```
Financial Personality

Income Pattern: Highly irregular
Main income source: Freelancing
Average daily income: UGX 18,500
Days without income: 42%
Largest income received: UGX 250,000
Smallest: UGX 2,000

Spending Pattern:
- Sundays: 38% above average (post-service meals)
- Wednesdays: Consistent (Cell meeting)
- Transport spikes during exam weeks
- 72-hour cash leakage after large deposits
```

### Month 6: Behavior Coaching

```
"You spent UGX 180,000 on impulse purchases this month.
At this rate, that's UGX 2.16M per year.
Reducing by 30% would get you to your laptop goal 3 months earlier."
```

### Year 1: Financial Story

An annual narrative: total income, total spending, savings growth, debt reduced, biggest achievement, strongest habit, biggest challenge, areas for next year.

---

## Screen Map

### Layer 1: Record (Weeks 1-4)

| Screen | Purpose |
|--------|---------|
| Daily Snapshot | Balance + upcoming + safe-to-spend |
| Add Income | Quick entry: amount, source, note |
| Add Expense | Quick entry: amount, category, note |
| Life Events | Upcoming commitments (Cell, church, birthdays) |
| Goals | Progress on savings targets |
| Support Network | Family/friends who can help |
| AI Chat | Ask questions about your situation |

### Layer 2: Understand (Weeks 5-8)

| Screen | Purpose |
|--------|---------|
| Financial Personality | Income/spending behavior summary |
| Pattern Dashboard | Detected routines, regular expenses, income days |
| Commitment Tracker | Reliability on Cell, church, debt payments |

### Layer 3: Analyze (Weeks 9-12)

| Screen | Purpose |
|--------|---------|
| Financial Health Score | 0-100 based on consistency, not wealth |
| Trend Analysis | Week-over-week changes in income, spending, savings |
| Risk Forecast | Predicts deficits before they happen |
| Debt Analysis | Borrowing patterns, reasons, frequency |

### Layer 4: Coach (Ongoing)

| Screen | Purpose |
|--------|---------|
| Weekly Review | Narrative summary + coaching insight |
| Monthly Report | Story with wins, warnings, recommendations |
| Annual Review | Full year financial story |
| Behavior Insights | Personalized suggestions based on tracked data |

### Layer 0: Learn (Underlying)

The personal financial behavior model. Not a screen — a system that reads all recorded data and every layer's outputs to answer: *"Who are you financially, based on your behavior over time?"* Updated continuously, consumed by every layer above.

---

## Navigation (Prototype → Product)

The current five-tab navigation is kept, with refined meaning:

| Tab | Prototype label | Broader meaning |
|-----|-----------------|-----------------|
| Today | Dashboard / safe-to-spend | What should I know today? |
| Patterns | Financial personality | What is my money teaching me? |
| Score | Financial health score | Am I becoming financially better? |
| Coach | Weekly review | What should I focus on this week? |
| Chat | AI chat | Let me ask my financial AI |

That framing — daily awareness, learning, progress, focus, and conversation — is far more powerful than an expense tracker's tabs, and the Phase 0 structure already supports it.

---

## Database Tables

### Core (Layer 1)
```
profiles
  id, created_at, archetype, currency, notification_enabled, onboarding_completed

wallet_snapshots
  id, profile_id, balance, recorded_at

transactions
  id, profile_id, amount, type (income/expense),
  category, description, source, recorded_at

income_sources
  id, profile_id, name, frequency, last_amount, last_received,
  confidence (0-1), next_expected_date

life_events
  id, profile_id, title, expected_amount, date,
  recurrence (none/weekly/monthly), category, completed

goals
  id, profile_id, title, target_amount, current_amount,
  priority, deadline, category, status (active/paused/completed)

support_network
  id, profile_id, name, relation, average_help,
  last_contacted, can_help (boolean)
```

### Pattern (Layer 2)
```
expense_patterns
  id, profile_id, category, avg_amount, frequency,
  confidence_score, last_occurrence, day_of_week, notes

income_patterns
  id, profile_id, source_id, avg_amount, interval_days,
  confidence_score, next_expected, typical_days (e.g. ["Thursday","Saturday"])

behavioral_insights
  id, profile_id, insight_type, title, description,
  severity, generated_at, acknowledged (boolean)

financial_personality
  id, profile_id, generated_at,
  income_pattern, irregular_days_pct, avg_daily_income,
  largest_income, smallest_income,
  spending_notes (JSON of detected behaviors)
```

### Analysis (Layer 3)
```
financial_health_scores
  id, profile_id, score, components (JSON),
  recorded_at (weekly)

trends
  id, profile_id, period_start, period_end,
  income_total, expense_total, savings_total,
  income_change_pct, expense_change_pct, savings_change_pct

debt_analysis
  id, profile_id, period, borrow_count,
  reasons (JSON), total_borrowed, avg_per_borrow
```

### Coaching (Layer 4)
```
coaching_insights
  id, profile_id, type (weekly/monthly/behavior),
  content (text), generated_at, delivered (boolean)

annual_reviews
  id, profile_id, year,
  total_income, total_spending, savings_growth,
  debt_reduced, biggest_achievement, strongest_habit,
  biggest_challenge, next_year_focus
```

---

## AI Modules

### Module 1: State Detection (Built — `financial-state-engine.js`)
Classifies current situation: Emergency / Survival / Recovery / Stable / Growth

### Module 2: Daily Check-in (Layer 1)
Input: Latest balance + upcoming events + patterns
Output: Safe-to-spend amount + warning flags

### Module 3: Pattern Detector (Layer 2)
Input: Transaction history (30+ days)
Output: Income frequency, regular expenses, spending spikes, large-deposit behavior

### Module 4: Financial Personality Generator (Layer 2)
Input: All transaction data (90+ days)
Output: Structured personality profile (income behavior, spending habits, commitment reliability)

### Module 5: Trend Analyzer (Layer 3)
Input: Weekly snapshots
Output: Week-over-week changes, forecasts, risk flags

### Module 6: Health Score Calculator (Layer 3)
Input: Behavior metrics (consistency, commitment reliability, savings rate, debt management)
Output: Score 0-100 with component breakdown

### Module 7: Coaching Engine (Layer 4)
Input: All user data + patterns + trends + health score
Output: Personalized weekly insight, monthly report, annual story

### Module 8: Emergency Detector (Layer 1)
Input: Balance < essential commitments
Output: Survival plan + support network suggestions

---

## Build Phases

### Phase 0: Validation (Current — Week 1)
- Brain prototype (React + state engine)
- Test with 20 people
- Measure: understanding (70%+), trust (60%+), weekly interest (50%+)

### Phase 1: Persistence (Weeks 2-3)
- Supabase project setup
- Auth + profiles + wallet_snapshots + transactions + life_events + goals
- User can create account, add data, come back, see history

### Phase 2: Understanding (Weeks 4-6)
- Expense pattern detection
- Income pattern detection
- Financial personality screen
- Commitment tracking

### Phase 3: Analysis (Weeks 7-9)
- Financial health score
- Trend analysis
- Risk forecasting
- Debt analysis

### Phase 4: Coaching (Weeks 10+)
- Weekly review with AI insight
- Monthly report
- Behavior recommendations
- Annual financial story

---

## Validation Gates

### Gate 0 (Week 1)
Do people feel understood by the AI's advice? (70%+ on "understood" question)

### Gate 1 (Week 3)
Do people come back daily after creating an account? (40%+ day-7 retention)

### Gate 2 (Week 6)
Do people engage with their Financial Personality? (50%+ view it)

### Gate 3 (Week 9)
Does the Health Score motivate behavior change? (score increases over 4 weeks)

### Gate 4 (Month 6)
Do people refer others? (NPS 40+)

If any gate fails → pivot or cut scope.

---

## Product Principles

1. **No fixed budgets.** The product works with irregular income. It suggests, never mandates.

2. **Behavior over categories.** Understanding "you overspend after 4 PM Sunday service" is more useful than "Food = UGX 500,000."

3. **Probability, not promises.** The AI says "there's a good chance you'll receive income in the next few days based on your pattern" — not "you will receive income."

4. **The coaching insight is the product.** The end-of-week insight is what makes this unforgettable: "This week you stayed within your food budget despite earning less. That consistency is reducing your reliance on borrowing."

5. **No judgment.** The AI never criticizes. It observes, contextualizes, and suggests.

---

## Testing Status

✅ Brain prototype deployed (Vite + React + Tailwind + state engine)
✅ Scenarios: Broke Student, Irregular Freelancer, Unexpected Money, No Money Period
✅ Feedback system: 5-question form + export
✅ Session script: structured testing protocol

**Current: Testing with 20 users. Results will shape Phase 1.**

---

## One Sentence

> "An AI that studies how you handle money, shows you patterns you didn't notice, and helps you make better financial decisions — one week at a time."

## Product Statement

> "Nafaka is an AI-powered personal financial operating system that learns how you handle money. It studies your income, spending, commitments, saving, debt, and financial habits to uncover patterns you may not notice yourself. Instead of judging your wealth or forcing you into a fixed budget, Nafaka measures your financial consistency and helps you make better decisions — one week at a time."

Short version:

> "Nafaka — your AI financial coach that learns how you handle money and helps you get better at it."
