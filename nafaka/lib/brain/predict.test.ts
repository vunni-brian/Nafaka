import { describe, it, expect } from 'vitest'
import { buildBehaviorModel } from './index'
import { predict } from './predict'
import { explainSafeToSpend } from './safetospend'
import type { BrainCommitment, BrainTransaction } from './types'

function iso(dayOffset: number): string {
  const d = new Date('2026-01-10T12:00:00')
  d.setDate(d.getDate() + dayOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const NOW = new Date('2026-01-10T12:00:00')

function incomes(n: number): BrainTransaction[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    type: 'income',
    amount: 100000,
    source: 'Freelance',
    date: iso(-i * 7),
  }))
}

function foodExpenses(n: number, amount = 20000): BrainTransaction[] {
  return Array.from({ length: n }, (_, i) => ({
    id: 100 + i,
    type: 'expense',
    amount,
    category: 'food',
    date: iso(-(i * 7 + 2)),
  }))
}

function commitments(...amounts: number[]): BrainCommitment[] {
  return amounts.map((amount, i) => ({
    id: i + 1,
    label: 'Cell meeting',
    amount,
    dueDate: iso(3 + i),
    fulfilled: null,
  }))
}

function run(opts: { transactions: BrainTransaction[]; commitments?: BrainCommitment[]; balance: number }) {
  const model = buildBehaviorModel({ transactions: opts.transactions, commitments: opts.commitments ?? [], snapshots: [], balance: opts.balance })
  const explanation = explainSafeToSpend({ transactions: opts.transactions, commitments: opts.commitments ?? [], safeToSpend: Math.max(0, opts.balance), now: NOW })
  return predict({ model, balance: opts.balance, explanation, now: NOW })
}

describe('predict', () => {
  it('emits nothing without sufficient evidence', () => {
    const result = run({ transactions: [], balance: 10000 })
    expect(result).toEqual([])
  })

  it('predicts running short before the next income', () => {
    const result = run({ transactions: [...incomes(12), ...foodExpenses(6)], balance: 50000 })
    const danger = result.find((p) => p.id === 'RUN_SHORT')
    expect(danger).toBeDefined()
    expect(danger?.severity).toBe('watch')
    expect(danger?.windowDays).toBe(7)
    expect(danger?.reason).toContain('run short')
    expect(danger?.reason).toContain('3 days of essentials')
    expect(danger?.evidence.length).toBeGreaterThanOrEqual(4)
    expect(danger?.confidence).toBeGreaterThanOrEqual(0.5)
  })

  it('reassures when the buffer outlasts the income gap', () => {
    const result = run({ transactions: [...incomes(12), ...foodExpenses(6)], balance: 500000 })
    const calm = result.find((p) => p.id === 'INCOME_BEFORE_BUFFER')
    expect(calm).toBeDefined()
    expect(calm?.severity).toBe('all-clear')
    expect(calm?.reason).toContain('stay covered')
    expect(result.some((p) => p.id === 'RUN_SHORT')).toBe(false)
  })

  it('warns about the post-deposit window with a confident signal', () => {
    const postDays: { id: number; date: string }[] = []
    const quietDays: { id: number; date: string }[] = []
    for (let i = 0; i < 8; i++) {
      postDays.push({ id: 1100 + i * 2, date: iso(-(i * 7 - 1)) })
      postDays.push({ id: 1101 + i * 2, date: iso(-(i * 7 - 2)) })
      quietDays.push({ id: 1200 + i * 2, date: iso(-(i * 7 - 3)) })
      quietDays.push({ id: 1201 + i * 2, date: iso(-(i * 7 - 4)) })
    }
    const transactions: BrainTransaction[] = [
      ...incomes(8),
      ...postDays.map((d) => ({ id: d.id, type: 'expense' as const, amount: 150000, category: 'other' as const, date: d.date })),
      ...quietDays.map((d) => ({ id: d.id, type: 'expense' as const, amount: 5000, category: 'other' as const, date: d.date })),
    ]
    const result = run({ transactions, balance: 500000 })
    const spike = result.find((p) => p.id === 'POST_INCOME_SPIKE')
    expect(spike).toBeDefined()
    expect(spike?.windowDays).toBe(3)
    expect(spike?.reason).toContain('3 days after a deposit')
  })

  it('confirms commitments are covered', () => {
    const result = run({ transactions: [...incomes(12), ...foodExpenses(6)], commitments: commitments(50000, 10000), balance: 300000 })
    const covered = result.find((p) => p.id === 'COMMITMENTS_COVERED')
    expect(covered).toBeDefined()
    expect(covered?.severity).toBe('info')
    expect(covered?.reason).toContain('covers the')
  })

  it('keeps the watch prediction first when cash is tight and commitments loom', () => {
    const result = run({ transactions: [...incomes(12), ...foodExpenses(6)], commitments: commitments(40000), balance: 50000 })
    expect(result[0].id).toBe('RUN_SHORT')
  })
})