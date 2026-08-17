import { addDays, mean } from './stats'
import type { WeekFocus } from './focus'
import type { BehaviorModel, BrainCommitment, BrainSnapshot, BrainTransaction } from './types'

export type CoachingOutcome = {
  focusKey: WeekFocus['key']
  measured: boolean
  /** what was compared */
  metric: string
  /** this user's own historical baseline before the coaching instance */
  before: number | null
  /** the value measured in this instance */
  after: number | null
  /** relative change, negative = the desired direction (e.g. less spending) */
  deltaPct: number | null
  /** did behavior move the right way */
  improved: boolean | null
  /** human copy — quoted by the chat and the LLM */
  text: string
  /** date the measured window ended; used for attribution */
  measuredAt: string
  sampleSize: number
}

function unmeasured(focusKey: WeekFocus['key'], text: string): CoachingOutcome {
  return {
    focusKey,
    measured: false,
    metric: '',
    before: null,
    after: null,
    deltaPct: null,
    improved: null,
    text,
    measuredAt: '',
    sampleSize: 0,
  }
}

function incomeEvents(txs: BrainTransaction[]): BrainTransaction[] {
  return txs
    .filter((t) => t.type === 'income' && t.amount > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
}

function expenseTotalsByDay(txs: BrainTransaction[]): Map<string, number> {
  const byDay = new Map<string, number>()
  for (const t of txs) {
    if (t.type !== 'expense' || t.amount <= 0) continue
    byDay.set(t.date, (byDay.get(t.date) ?? 0) + t.amount)
  }
  return byDay
}

/**
 * Prediction → action → outcome. Each focus type that can be measured gets
 * a comparison against the user's own earlier behavior, so Nafaka can say
 * "you changed the pattern" or "not yet" with real numbers — and eventually
 * learn which coaching works for this person.
 */
export function measureOutcomes(opts: {
  model: BehaviorModel
  transactions: BrainTransaction[]
  commitments: BrainCommitment[]
  snapshots: BrainSnapshot[]
  now?: Date
}): CoachingOutcome[] {
  const { model, transactions, commitments, snapshots } = opts
  const now = opts.now ?? new Date()

  return [
    postIncomeOutcome(transactions, now),
    commitmentOutcome(model, commitments),
    savingsOutcome(snapshots),
    stateOutcome(snapshots),
    unmeasured('debtPressure', 'Nafaka measures this once a repayment is recorded after the focus was set.'),
    unmeasured('financialResilience', 'Measured when the next weekly snapshot lands.'),
    unmeasured('record', 'Recording is the goal — every entry counts.'),
  ]
}

function postIncomeOutcome(transactions: BrainTransaction[], now: Date): CoachingOutcome {
  const events = incomeEvents(transactions)
  if (events.length < 2) {
    return unmeasured(
      'postIncomeAcceleration',
      'There is only one deposit on record — Nafaka needs a few more to build a post-income baseline.',
    )
  }

  const byDay = expenseTotalsByDay(transactions)
  const windowSpend = (event: BrainTransaction): number => {
    let total = 0
    for (let d = 1; d <= 3; d++) total += byDay.get(addDays(event.date, d)) ?? 0
    return total
  }

  const last = events[events.length - 1]
  const after = windowSpend(last)
  const windowEnd = addDays(last.date, 3)
  if (now.getTime() < new Date(windowEnd).getTime()) {
    return unmeasured(
      'postIncomeAcceleration',
      'The 72-hour window after your latest income is still open — Nafaka will measure it once it closes.',
    )
  }

  const prior = events.slice(0, -1).map(windowSpend)
  const before = mean(prior)
  if (before <= 0) {
    return unmeasured(
      'postIncomeAcceleration',
      'Earlier deposit windows had no recorded spending, so there is no baseline to compare yet.',
    )
  }

  const deltaPct = Math.round(((after - before) / before) * 100)
  const improved = after < before
  const abs = Math.abs(deltaPct)
  const text =
    improved === true
      ? `You spent ${fmt(after)} in the 72 hours after your last deposit, vs your usual ${fmt(before)} — that's ${abs}% less.`
      : deltaPct === 0
        ? `You spent ${fmt(after)} in the 72 hours after your last deposit — about the same as your usual ${fmt(before)}.`
        : `You spent ${fmt(after)} in the 72 hours after your last deposit, vs your usual ${fmt(before)} — ${abs}% more.`

  return {
    focusKey: 'postIncomeAcceleration',
    measured: true,
    metric: 'post-income 72h spending',
    before,
    after,
    deltaPct,
    improved,
    text,
    measuredAt: windowEnd,
    sampleSize: prior.length,
  }
}

function commitmentOutcome(model: BehaviorModel, commitments: BrainCommitment[]): CoachingOutcome {
  const evaluated = commitments
    .filter((c) => c.fulfilled !== null)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  if (evaluated.length === 0) {
    return unmeasured(
      'commitmentReliability',
      'Mark a commitment Paid or Missed in Life Events and Nafaka will measure follow-through.',
    )
  }

  const last = evaluated[evaluated.length - 1]
  const before = model.signals.commitmentReliability.value
  const after = last.fulfilled ? 100 : 0
  const improved = last.fulfilled === true
  const text = improved
    ? `The last commitment ("${last.label}") was paid on time — follow-through at 100% this time.`
    : `The last commitment ("${last.label}") was missed — the next one is the comeback.`

  return {
    focusKey: 'commitmentReliability',
    measured: true,
    metric: 'commitment follow-through',
    before,
    after,
    deltaPct: Math.round(after - before),
    improved,
    text,
    measuredAt: last.dueDate,
    sampleSize: evaluated.length,
  }
}

function snapshotDeltas(snapshots: BrainSnapshot[]): { deltas: number[]; endDate: string } | null {
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date))
  if (sorted.length < 2) return null
  const deltas: number[] = []
  for (let i = 1; i < sorted.length; i++) deltas.push(sorted[i].balance - sorted[i - 1].balance)
  return { deltas, endDate: sorted[sorted.length - 1].date }
}

function savingsOutcome(snapshots: BrainSnapshot[]): CoachingOutcome {
  const delta = snapshotDeltas(snapshots)
  if (delta === null) {
    return unmeasured('savingsConsistency', 'Nafaka needs two weekly snapshots to see whether saving improved.')
  }
  if (delta.deltas.length === 1) {
    return unmeasured('savingsConsistency', 'Nafaka needs one more weekly snapshot to see whether saving improved.')
  }

  const before = mean(delta.deltas.slice(0, -1))
  const after = delta.deltas[delta.deltas.length - 1]
  const improved = after > before
  const deltaPct = before > 0 ? Math.round(((after - before) / before) * 100) : null
  const text = `Your balance moved ${fmt(after)} this week, vs an average of ${fmt(before)} per week before.${
    improved ? " That's an improvement." : ''
  }`

  return {
    focusKey: 'savingsConsistency',
    measured: true,
    metric: 'weekly balance movement',
    before,
    after,
    deltaPct,
    improved,
    text,
    measuredAt: delta.endDate,
    sampleSize: delta.deltas.length - 1,
  }
}

function stateOutcome(snapshots: BrainSnapshot[]): CoachingOutcome {
  const delta = snapshotDeltas(snapshots)
  if (delta === null || delta.deltas.length < 2) {
    return unmeasured('state', 'Measured when the next weekly snapshot lands.')
  }
  const before = mean(delta.deltas.slice(0, -1))
  const after = delta.deltas[delta.deltas.length - 1]
  const improved = after >= 0
  const text = improved
    ? `Your balance held steady or grew this week (${fmt(after)}).`
    : `Your balance dropped ${fmt(Math.abs(after))} this week — essentials stay the priority.`

  return {
    focusKey: 'state',
    measured: true,
    metric: 'weekly balance direction',
    before,
    after,
    deltaPct: before > 0 ? Math.round(((after - before) / before) * 100) : null,
    improved,
    text,
    measuredAt: delta.endDate,
    sampleSize: delta.deltas.length - 1,
  }
}

export function outcomeFor(focusKey: WeekFocus['key'], outcomes: CoachingOutcome[]): CoachingOutcome | null {
  return outcomes.find((o) => o.focusKey === focusKey) ?? null
}

function fmt(n: number): string {
  return `UGX ${Math.round(n).toLocaleString()}`
}
