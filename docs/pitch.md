# Nafaka — The AI Financial Coach (Pitch)

> Nafaka isn't a budgeting app. It's an AI financial coach for people whose income doesn't behave like a salary.

It learns how you earn, spend, save, borrow, and meet your commitments, then turns those patterns into simple weekly guidance. **No rigid budgets. No financial shame. Just one better decision at a time.**

## The problem

Budgeting apps were built for people with fixed salaries. They answer *"where did your money go?"* — too late for the billions of people with irregular income: students, freelancers, gig workers, small traders. Fixed budgets fail them, shame-based trackers get deleted, and they're left borrowing after paydays, overspending in the 72 hours after a deposit, and never saving.

## The core loop

**Observe → Understand → Predict → Coach → Learn**

Nafaka doesn't record your money — it learns your financial behavior and influences better decisions. The user experience is:

> **"Nafaka knows me."**

Instead of a wall of transactions, the user sees **Your money this week** — income, essential vs. flexible spending, saved, committed, and safe-to-spend today — and the AI explains *why*:

> "You received your allowance on Monday. Historically, you spend 35–45% of incoming money within the first 72 hours. You're at 28% — better than your normal pattern."

## The killer feature: Safe-to-Spend

Not "your entertainment budget is UGX 100,000." Instead:

> **Safe to spend today: UGX 7,800**
> Your next expected income is in ~5 days. You have UGX 54,000 in commitments before then. Based on your normal pattern, UGX 7,800/day keeps you on track.

The number updates in real time as income arrives, commitments change, or the user veers off pattern. For irregular-income users, this is more valuable than any budget.

## The moat: a Financial Behavior Model

Nine behavioral signals — income regularity, income source dependence, spending stability, discretionary share, post-income acceleration, savings consistency, commitment reliability, debt pressure, financial resilience. Each carries a **confidence score** from real observation:

> **Post-income acceleration: high confidence** — based on 14 income events over 11 weeks.

The model compounds: the longer you stay, the better Nafaka knows you, the better the coaching, the harder it is to leave.

## The Financial Health Score

Not income minus expenses. The score measures **behavior relative to your own circumstances** — a student with UGX 20,000 can outscore someone with UGX 2,000,000 if their decisions are consistent. Components stay "still learning" (and never drag the score) until confidence grows.

## The weekly review is the heart

Four beats, no dashboard dump:

1. **What changed?** — "You spent 14% less than your usual week."
2. **What did Nafaka notice?** — "You usually spend heavily within 72 hours of income. This week you slowed down."
3. **What does it mean?** — "That gave you 3 more days of cash coverage."
4. **One focus, one action.** — "Protect your first 48 hours after income. Move UGX 10,000 to savings when your next deposit arrives."

## Built local-first: Uganda

Not a Western app with the currency swapped. Nafaka natively understands Mobile Money flows, community obligations (tithe, cell contributions, family support), informal finance (friend debt, SACCOs, savings groups), and irregular income. Architecture is **global financial intelligence + local financial context** — the behavior engine is market-agnostic and portable.

## Architecture: the LLM explains, it never invents

The deterministic backend computes `post_income_acceleration = 0.72, confidence = 0.91, sample_size = 14, trend = improving`; the LLM writes the sentence. Intelligence stays verifiable and financially safe; AI adds warmth and clarity.

## Traction — built, not pitched

Working prototype with real users in validation: behavior engine with confidence model, health score, weekly reviews, persistence, and AI chat (rule-based over the behavior model, with a Gemini-powered coach and deterministic fallback) are live and tested. The system never says *"you're bad with money"* — it observes, contextualizes, and suggests one improvement at a time.

## One sentence

> "An AI that studies how you handle money, shows you patterns you didn't notice, and helps you make better financial decisions — one week at a time."