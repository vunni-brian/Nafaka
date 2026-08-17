import { addDays, daysBetween, mean, round, sum, toISODate } from './stats'
import type { BrainCommitment, BrainTransaction, SignalValue } from './types'

export type SafeToSpendExplanation = {
  incomeExpected: boolean
  incomeEventCount: number
  averageGapDays: number | null
  daysToNextIncome: number | null
  commitmentsBeforeNext: number
  pacePerDay: number | null
  lines: string[]
}

function incomeEvents(txs: BrainTransaction[]): BrainTransaction[] {
  return txs
    .filter((t) => t.type === 'income' && t.amount > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function averageIncomeGap(txs: BrainTransaction[]): number | null {
  const events = incomeEvents(txs)
  if (events.length < 2) return null
  const gaps: number[] = []
  for (let i = 1; i < events.length; i++) {
    gaps.push(daysBetween(events[i - 1].date, events[i].date))
  }
  return round(mean(gaps))
}

export function explainSafeToSpend(opts: {
  transactions: BrainTransaction[]
  commitments: BrainCommitment[]
  safeToSpend: number
  postIncomeAcceleration?: SignalValue
  now?: Date
}): SafeToSpendExplanation {
  const { transactions, commitments, safeToSpend } = opts
  const now = opts.now ?? new Date()
  const today = toISODate(now)

  const events = incomeEvents(transactions)
  const incomeExpected = events.length >= 2
  const averageGapDays = incomeExpected ? averageIncomeGap(transactions) : null
  const daysToNextIncome = averageGapDays !== null ? averageGapDays : null

  const pending = commitments.filter((c) => c.fulfilled === null)
  const windowEnd = daysToNextIncome !== null ? addDays(today, daysToNextIncome) : null
  const commitmentsBeforeNext = windowEnd !== null
    ? sum(pending.filter((c) => c.dueDate <= windowEnd).map((c) => c.amount))
    : sum(pending.map((c) => c.amount))

  const pacePerDay =
    daysToNextIncome !== null && daysToNextIncome > 0 && safeToSpend > 0
      ? Math.floor(safeToSpend / daysToNextIncome / 100) * 100
      : null

  const lines: string[] = []
  if (incomeExpected && daysToNextIncome !== null) {
    lines.push(`Your next expected income is in ~${daysToNextIncome} days, based on ${events.length} income events.`)
  } else {
    lines.push('Income timing is still unclear — Nafaka is working from your known commitments.')
  }
  if (commitmentsBeforeNext > 0) {
    lines.push(
      windowEnd !== null
        ? `${fmt(commitmentsBeforeNext)} in commitments is due before then.`
        : `${fmt(commitmentsBeforeNext)} in commitments is on the horizon.`,
    )
  }
  if (pacePerDay !== null) {
    lines.push(`${fmt(pacePerDay)}/day keeps you on track until then.`)
  }
  const post = opts.postIncomeAcceleration
  if (post !== undefined && post.confidence >= 0.5 && post.value >= 130) {
    lines.push('After a large deposit, spending tends to rise for 3 days — watch the window this time.')
  }

  return {
    incomeExpected,
    incomeEventCount: events.length,
    averageGapDays,
    daysToNextIncome,
    commitmentsBeforeNext,
    pacePerDay,
    lines,
  }
}

export function fmt(n: number): string {
  return `UGX ${Math.round(n).toLocaleString()}`
}