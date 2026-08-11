import { confidenceFor } from './confidence'
import { clamp, cv, mean, sum, toISODate } from './stats'
import type {
  BrainCommitment,
  BrainSnapshot,
  BrainTransaction,
  SignalValue,
} from './types'

const DISCRETIONARY_CATEGORIES = ['shopping', 'other']
const ESSENTIAL_CATEGORIES = ['food', 'transport']
const DEBT_CATEGORY = 'debt'

const insufficient = (): SignalValue => ({ value: 0, confidence: 0, sampleSize: 0 })

function incomeEvents(txs: BrainTransaction[]): BrainTransaction[] {
  return txs
    .filter((t) => t.type === 'income' && t.amount > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
}

function expenseDays(txs: BrainTransaction[]): Map<string, BrainTransaction[]> {
  const byDay = new Map<string, BrainTransaction[]>()
  for (const t of txs) {
    if (t.type !== 'expense' || t.amount <= 0) continue
    const list = byDay.get(t.date) ?? []
    list.push(t)
    byDay.set(t.date, list)
  }
  return byDay
}

export function incomeRegularitySignal(txs: BrainTransaction[]): SignalValue {
  const events = incomeEvents(txs)
  if (events.length < 2) return insufficient()

  const gaps: number[] = []
  for (let i = 1; i < events.length; i++) {
    const gap = (new Date(events[i].date).getTime() - new Date(events[i - 1].date).getTime()) / 86400000
    gaps.push(Math.round(gap))
  }
  const spread = cv(gaps)
  const value = clamp(100 * (1 - Math.min(1, spread)), 0, 100)
  return { value, confidence: confidenceFor(events.length, 12, spread), sampleSize: events.length }
}

export function incomeSourceDependenceSignal(txs: BrainTransaction[]): SignalValue {
  const events = incomeEvents(txs)
  if (events.length === 0) return insufficient()

  const bySource = new Map<string, number>()
  for (const t of events) {
    const key = t.source ?? 'Unspecified'
    bySource.set(key, (bySource.get(key) ?? 0) + t.amount)
  }
  const total = sum([...bySource.values()])
  const largest = Math.max(...bySource.values())
  const value = clamp(100 * (largest / total), 0, 100)
  return { value, confidence: confidenceFor(events.length, 10), sampleSize: events.length }
}

export function spendingStabilitySignal(txs: BrainTransaction[]): SignalValue {
  const byDay = expenseDays(txs)
  if (byDay.size < 2) return insufficient()

  const dailyTotals = [...byDay.values()].map((list) => sum(list.map((t) => t.amount)))
  const spread = cv(dailyTotals)
  const value = clamp(100 * (1 - Math.min(1, spread)), 0, 100)
  return { value, confidence: confidenceFor(byDay.size, 14, spread), sampleSize: byDay.size }
}

export function discretionaryShareSignal(txs: BrainTransaction[]): SignalValue {
  const expenses = txs.filter((t) => t.type === 'expense' && t.amount > 0)
  if (expenses.length === 0) return insufficient()

  const total = sum(expenses.map((t) => t.amount))
  const discretionary = sum(
    expenses.filter((t) => DISCRETIONARY_CATEGORIES.includes(t.category ?? '')).map((t) => t.amount),
  )
  const value = clamp(100 * (discretionary / total), 0, 100)
  return { value, confidence: confidenceFor(expenses.length, 14), sampleSize: expenses.length }
}

export function postIncomeAccelerationSignal(txs: BrainTransaction[]): SignalValue {
  const events = incomeEvents(txs)
  const byDay = expenseDays(txs)
  if (events.length < 2 || byDay.size === 0) return insufficient()

  const dailyTotals = [...byDay.values()].map((list) => sum(list.map((t) => t.amount)))
  const baseline = mean(dailyTotals)
  if (baseline <= 0) return insufficient()

  const evaluated: number[] = []
  for (const event of events) {
    let post = 0
    let days = 0
    for (let d = 1; d <= 3; d++) {
      const day = new Date(event.date)
      day.setDate(day.getDate() + d)
      const key = toISODate(day)
      const list = byDay.get(key)
      if (list) {
        post += sum(list.map((t) => t.amount))
        days++
      }
    }
    if (days > 0) evaluated.push((post / days) / baseline)
  }
  if (evaluated.length === 0) return insufficient()

  const ratio = mean(evaluated)
  const value = clamp(100 * ratio, 0, 400)
  return { value, confidence: confidenceFor(evaluated.length, 10, cv(evaluated)), sampleSize: evaluated.length }
}

export function savingsConsistencySignal(snapshots: BrainSnapshot[]): SignalValue {
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date))
  if (sorted.length < 2) return insufficient()

  const deltas: number[] = []
  for (let i = 1; i < sorted.length; i++) deltas.push(sorted[i].balance - sorted[i - 1].balance)
  const positive = deltas.filter((d) => d > 0).length
  const value = clamp(100 * (positive / deltas.length), 0, 100)
  return { value, confidence: confidenceFor(sorted.length, 8, cv(deltas.map((d) => Math.abs(d)))), sampleSize: sorted.length }
}

export function commitmentReliabilitySignal(commitments: BrainCommitment[]): SignalValue {
  const evaluated = commitments.filter((c) => c.fulfilled !== null)
  if (evaluated.length === 0) return insufficient()

  const fulfilled = evaluated.filter((c) => c.fulfilled).length
  const value = clamp(100 * (fulfilled / evaluated.length), 0, 100)
  return { value, confidence: confidenceFor(evaluated.length, 6), sampleSize: evaluated.length }
}

export function debtPressureSignal(txs: BrainTransaction[]): SignalValue {
  const incomeTotal = sum(incomeEvents(txs).map((t) => t.amount))
  if (incomeTotal <= 0) return insufficient()

  const debtTx = txs.filter((t) => t.type === 'expense' && t.category === DEBT_CATEGORY)
  const debtTotal = sum(debtTx.map((t) => t.amount))
  const value = clamp(100 * (debtTotal / incomeTotal), 0, 100)
  return { value, confidence: confidenceFor(Math.max(debtTx.length, 1), 10), sampleSize: debtTx.length }
}

export function financialResilienceSignal(txs: BrainTransaction[], balance: number): SignalValue {
  const byDay = expenseDays(txs)
  if (byDay.size === 0) return insufficient()

  const dailyEssential = mean(
    [...byDay.values()].map((list) =>
      sum(list.filter((t) => ESSENTIAL_CATEGORIES.includes(t.category ?? '')).map((t) => t.amount)),
    ),
  )
  if (dailyEssential <= 0) return insufficient()

  const runwayDays = balance / dailyEssential
  const value = clamp(100 * (runwayDays / 30), 0, 100)
  return { value, confidence: confidenceFor(byDay.size, 10), sampleSize: byDay.size }
}

export function essentialCostPerDay(txs: BrainTransaction[]): number {
  const byDay = expenseDays(txs)
  if (byDay.size === 0) return 0
  return mean(
    [...byDay.values()].map((list) =>
      sum(list.filter((t) => ESSENTIAL_CATEGORIES.includes(t.category ?? '')).map((t) => t.amount)),
    ),
  )
}
