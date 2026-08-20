import type { HealthComponent, HealthComponentKey } from './health'
import type { BehaviorModel, BehaviorSignalKey, FinancialState } from './types'

export type WeekFocus = {
  key: BehaviorSignalKey | 'state' | 'record'
  title: string
  body: string
}

export type FocusCandidate = WeekFocus & {
  /** lower = safer/more important */
  priority: number
}

const RISKY_STATES: FinancialState[] = ['EMERGENCY', 'SURVIVAL']

/**
 * All focuses that match the current evidence, in priority order.
 * Safety reads (state, debt) are hard priorities; behavioral focuses are
 * candidates for adaptive re-ranking by coaching success rate.
 */
export function focusCandidates(model: BehaviorModel): FocusCandidate[] {
  const s = model.signals
  const candidates: FocusCandidate[] = []

  if (RISKY_STATES.includes(model.state)) {
    candidates.push({
      key: 'state',
      title: 'Protect essentials first',
      body: 'Cash is tight. Food and shelter come before everything else this week.',
      priority: 0,
    })
  }

  const debt = s.debtPressure
  if (debt.confidence >= 0.5 && debt.value >= 50) {
    candidates.push({
      key: 'debtPressure',
      title: 'Keep repayments on schedule',
      body: 'Debt absorbs a big share of your income — an on-time repayment this week counts double.',
      priority: 1,
    })
  }

  const rel = s.commitmentReliability
  if (rel.confidence >= 0.5 && rel.value <= 50) {
    candidates.push({
      key: 'commitmentReliability',
      title: 'Win the next commitment',
      body: 'Start with the most important obligation and protect it — reliability builds from one payment at a time.',
      priority: 2,
    })
  }

  const post = s.postIncomeAcceleration
  if (post.confidence >= 0.5 && post.value >= 130) {
    candidates.push({
      key: 'postIncomeAcceleration',
      title: 'Protect the first 48 hours after income',
      body: 'When income arrives, move a fixed amount to savings on day one — before the post-deposit window.',
      priority: 3,
    })
  }

  const save = s.savingsConsistency
  if (save.confidence >= 0.5 && save.value < 70) {
    candidates.push({
      key: 'savingsConsistency',
      title: 'Save something on every deposit',
      body: 'Small, consistent saving beats occasional big saving — pick an amount you will not miss.',
      priority: 4,
    })
  }

  const res = s.financialResilience
  if (res.confidence >= 0.5 && res.value <= 20) {
    candidates.push({
      key: 'financialResilience',
      title: 'Let the buffer breathe',
      body: "Use today's safe-to-spend as the ceiling — the buffer is your protection, not an extra allowance.",
      priority: 5,
    })
  }

  if (model.insights.length > 0) {
    candidates.push({
      key: model.insights[0].signal,
      title: 'Keep the pattern going',
      body: model.insights[0].text,
      priority: 6,
    })
  }

  candidates.push({
    key: 'record',
    title: 'Record what happens',
    body: "The more Nafaka observes, the sharper next week's focus will be.",
    priority: 7,
  })

  return candidates
}

/**
 * Pick the focus for this week. Pass `successRates` (per-key coaching
 * success) to make it adaptive: among matching behavioral candidates the
 * engine prefers what has actually worked for this person, while safety
 * reads always win.
 */
export function weeklyFocus(model: BehaviorModel, opts?: { successRates?: Record<string, number> }): WeekFocus {
  const candidates = focusCandidates(model)
  const rates = opts?.successRates
  if (rates !== undefined && Object.keys(rates).length > 0) {
    const sorted = [...candidates].sort((a, b) => {
      const aSafety = a.priority < 2
      const bSafety = b.priority < 2
      if (aSafety !== bSafety) return aSafety ? -1 : 1
      // measured success rates win; unmeasured candidates get a neutral 0.5
      // so a focus that has consistently failed ranks below unexplored ones
      const aScore = typeof rates[a.key] === 'number' ? rates[a.key] : 0.5
      const bScore = typeof rates[b.key] === 'number' ? rates[b.key] : 0.5
      if (aScore !== bScore) return bScore - aScore
      return a.priority - b.priority
    })
    return { key: sorted[0].key, title: sorted[0].title, body: sorted[0].body }
  }
  const top = candidates[0]
  return { key: top.key, title: top.title, body: top.body }
}

export function weakestReadyComponent(components: HealthComponent[]): HealthComponent | null {
  const ready = components.filter((c) => c.ready)
  if (ready.length === 0) return null
  return [...ready].sort((a, b) => a.value - b.value)[0]
}

export function componentSuggestion(key: HealthComponentKey): string {
  switch (key) {
    case 'consistency':
      return 'Keep daily spending close to your average — one steady week visibly moves this.'
    case 'commitment':
      return 'Treat the next commitment as the test of your streak.'
    case 'savings':
      return 'Move a fixed amount to savings the day income arrives.'
    case 'debt':
      return 'Keep repayments on schedule; every on-time payment raises this.'
    case 'resilience':
      return "Don't tap the buffer for discretionary spending — let it grow."
  }
}
