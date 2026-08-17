import { describe, it, expect } from 'vitest'
import { buildBehaviorModel } from './index'
import { componentSuggestion, weakestReadyComponent, weeklyFocus } from './focus'
import { computeHealthScore } from './health'
import type { BrainCommitment, BrainSnapshot, BrainTransaction } from './types'

function iso(dayOffset: number): string {
  const d = new Date('2026-01-10T12:00:00')
  d.setDate(d.getDate() + dayOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function model(opts: { transactions: BrainTransaction[]; commitments?: BrainCommitment[]; snapshots?: BrainSnapshot[]; balance?: number }) {
  return buildBehaviorModel({
    transactions: opts.transactions,
    commitments: opts.commitments ?? [],
    snapshots: opts.snapshots ?? [],
    balance: opts.balance ?? 200000,
  })
}

function incomes(n: number, amount = 100000): BrainTransaction[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    type: 'income',
    amount,
    source: 'Freelance',
    date: iso(-i * 7),
  }))
}

function expenses(n: number, amount = 30000): BrainTransaction[] {
  return Array.from({ length: n }, (_, i) => ({
    id: 100 + i,
    type: 'expense',
    amount,
    category: 'other',
    date: iso(-(i + 1)),
  }))
}

function commitments(n: number, fulfilled: number, amount = 5000): BrainCommitment[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    label: 'Cell meeting',
    amount,
    dueDate: iso(-(i + 1) * 7),
    fulfilled: i < fulfilled,
  }))
}

describe('weeklyFocus', () => {
  it('prioritizes essentials when cash is tight', () => {
    const m = model({ transactions: [], balance: -5000 })
    const focus = weeklyFocus(m)
    expect(focus.key).toBe('state')
    expect(focus.title.toLowerCase()).toContain('essentials')
  })

  it('flags debt pressure when debt absorbs income', () => {
    const m = model({
      transactions: [
        ...incomes(8, 100000),
        ...Array.from({ length: 8 }, (_, i) => ({
          id: 200 + i,
          type: 'expense' as const,
          amount: 60000,
          category: 'debt',
          date: iso(-(i * 7 + 1)),
        })),
      ],
      balance: 800000,
    })
    const focus = weeklyFocus(m)
    expect(focus.key).toBe('debtPressure')
  })

  it('flags post-income acceleration once confident', () => {
    const postDays: { id: number; date: string }[] = []
    const quietDays: { id: number; date: string }[] = []
    for (let i = 0; i < 8; i++) {
      postDays.push({ id: 1100 + i * 2, date: iso(-(i * 7 - 1)) })
      postDays.push({ id: 1101 + i * 2, date: iso(-(i * 7 - 2)) })
      quietDays.push({ id: 1200 + i * 2, date: iso(-(i * 7 - 3)) })
      quietDays.push({ id: 1201 + i * 2, date: iso(-(i * 7 - 4)) })
    }
    const m = model({
      transactions: [
        ...incomes(8),
        ...postDays.map((d) => ({ id: d.id, type: 'expense' as const, amount: 150000, category: 'other' as const, date: d.date })),
        ...quietDays.map((d) => ({ id: d.id, type: 'expense' as const, amount: 5000, category: 'other' as const, date: d.date })),
      ],
      balance: 500000,
    })
    const focus = weeklyFocus(m)
    expect(focus.key).toBe('postIncomeAcceleration')
  })

  it('falls back to a recording prompt when the model is still learning', () => {
    const m = model({ transactions: [incomes(1)[0]], balance: 200000 })
    const focus = weeklyFocus(m)
    expect(focus.key).toBe('record')
  })
})

describe('weeklyFocus — adaptive ranking', () => {
  function dualCandidateModel() {
    const postDays: { id: number; date: string }[] = []
    const quietDays: { id: number; date: string }[] = []
    for (let i = 0; i < 8; i++) {
      postDays.push({ id: 1100 + i * 2, date: iso(-(i * 7 - 1)) })
      postDays.push({ id: 1101 + i * 2, date: iso(-(i * 7 - 2)) })
      quietDays.push({ id: 1200 + i * 2, date: iso(-(i * 7 - 3)) })
      quietDays.push({ id: 1201 + i * 2, date: iso(-(i * 7 - 4)) })
    }
    const mixedSavings: BrainSnapshot[] = [2, 3, 4, 5, 6, 7, 8].map((w, i) => ({
      date: iso(-(w) * 7),
      balance: 100000 + (i % 2 === 0 ? 5000 : -2000),
    }))
    return model({
      transactions: [
        ...incomes(8),
        ...postDays.map((d) => ({ id: d.id, type: 'expense' as const, amount: 150000, category: 'other' as const, date: d.date })),
        ...quietDays.map((d) => ({ id: d.id, type: 'expense' as const, amount: 5000, category: 'other' as const, date: d.date })),
      ],
      snapshots: mixedSavings,
      balance: 500000,
    })
  }

  it('prefers the focus that has actually worked for this user', () => {
    const m = dualCandidateModel()
    const adaptive = weeklyFocus(m, { successRates: { postIncomeAcceleration: 0, savingsConsistency: 1 } })
    expect(adaptive.key).toBe('savingsConsistency')
  })

  it('sinks a focus that has consistently failed below unexplored ones', () => {
    const m = dualCandidateModel()
    const adaptive = weeklyFocus(m, { successRates: { savingsConsistency: 0 } })
    expect(adaptive.key).toBe('postIncomeAcceleration')
  })

  it('keeps safety focuses ahead of successful behavioral ones', () => {
    const m = model({ transactions: [], balance: -5000 })
    const adaptive = weeklyFocus(m, { successRates: { savingsConsistency: 1 } })
    expect(adaptive.key).toBe('state')
  })

  it('falls back to default ordering without rates', () => {
    const m = dualCandidateModel()
    expect(weeklyFocus(m).key).toBe('postIncomeAcceleration')
  })
})

describe('weakestReadyComponent', () => {
  it('returns the lowest-scoring confident component', () => {
    const m = model({ transactions: [...incomes(4), ...expenses(10)], commitments: commitments(6, 0), balance: 120000 })
    const health = computeHealthScore(m)
    const weakest = weakestReadyComponent(health.components)
    expect(weakest).not.toBeNull()
    const min = Math.min(...health.components.filter((c) => c.ready).map((c) => c.value))
    expect(weakest?.value).toBe(min)
  })

  it('returns null when nothing is confident yet', () => {
    const m = model({ transactions: [incomes(1)[0]], balance: 0 })
    const health = computeHealthScore(m)
    expect(weakestReadyComponent(health.components)).toBeNull()
  })
})

describe('componentSuggestion', () => {
  it('returns actionable coaching for every component', () => {
    for (const key of ['consistency', 'commitment', 'savings', 'debt', 'resilience'] as const) {
      expect(componentSuggestion(key).length).toBeGreaterThan(10)
    }
  })
})