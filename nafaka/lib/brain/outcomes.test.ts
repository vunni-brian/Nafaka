import { describe, it, expect } from 'vitest'
import { buildBehaviorModel } from './index'
import { measureOutcomes, outcomeFor } from './outcomes'
import { addDays } from './stats'
import type { BrainCommitment, BrainSnapshot, BrainTransaction } from './types'

const NOW = new Date('2026-01-10T12:00:00')

function iso(dayOffset: number): string {
  const d = new Date('2026-01-10T12:00:00')
  d.setDate(d.getDate() + dayOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function deposits(n: number): BrainTransaction[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    type: 'income',
    amount: 100000,
    source: 'Freelance',
    date: iso(-7 - i * 7),
  }))
}

function windowSpend(depositDate: string, total: number, idBase: number): BrainTransaction[] {
  const thirds = [Math.round(total / 3), Math.round(total / 3), total - 2 * Math.round(total / 3)]
  return thirds.map((amount, i) => ({
    id: idBase + i,
    type: 'expense',
    amount,
    category: 'other',
    date: addDays(depositDate, i + 1),
  }))
}

function commitment(label: string, dueOffset: number, fulfilled: boolean | null, amount = 10000): BrainCommitment {
  return { id: Math.abs(dueOffset), label, amount, dueDate: iso(dueOffset), fulfilled }
}

function snapshots(balances: number[], dayStep = 7): BrainSnapshot[] {
  return balances.map((balance, i) => ({ date: iso(-(balances.length - i) * dayStep), balance }))
}

function run(opts: { transactions: BrainTransaction[]; commitments?: BrainCommitment[]; snapshots?: BrainSnapshot[]; balance?: number }) {
  const model = buildBehaviorModel({
    transactions: opts.transactions,
    commitments: opts.commitments ?? [],
    snapshots: opts.snapshots ?? [],
    balance: opts.balance ?? 200000,
  })
  return measureOutcomes({
    model,
    transactions: opts.transactions,
    commitments: opts.commitments ?? [],
    snapshots: opts.snapshots ?? [],
    now: NOW,
  })
}

describe('measureOutcomes — post-income window', () => {
  it('measures the 72h window against earlier windows (the 85k → 51k case)', () => {
    const prior: BrainTransaction[] = []
    for (let i = 1; i < 8; i++) prior.push(...windowSpend(iso(-7 - i * 7), 85000, 1000 + i * 10))
    const last: BrainTransaction[] = windowSpend(iso(-7), 51000, 9000)
    const outcomes = run({ transactions: [...deposits(8), ...prior, ...last] })
    const o = outcomeFor('postIncomeAcceleration', outcomes)

    expect(o?.measured).toBe(true)
    expect(o?.before).toBe(85000)
    expect(o?.after).toBe(51000)
    expect(o?.deltaPct).toBe(-40)
    expect(o?.improved).toBe(true)
    expect(o?.text).toContain('40% less')
    expect(o?.sampleSize).toBe(7)
  })

  it('reports higher spending honestly when the pattern did not improve', () => {
    const prior: BrainTransaction[] = []
    for (let i = 1; i < 8; i++) prior.push(...windowSpend(iso(-7 - i * 7), 50000, 1000 + i * 10))
    const last: BrainTransaction[] = windowSpend(iso(-7), 90000, 9000)
    const outcomes = run({ transactions: [...deposits(8), ...prior, ...last] })
    const o = outcomeFor('postIncomeAcceleration', outcomes)

    expect(o?.measured).toBe(true)
    expect(o?.improved).toBe(false)
    expect(o?.deltaPct).toBe(80)
    expect(o?.text).toContain('80% more')
  })

  it('holds judgment while the latest window is still open', () => {
    const transactions: BrainTransaction[] = [
      ...deposits(2),
      ...windowSpend(iso(-14), 50000, 1000),
    ]
    // last deposit two days ago — window ends tomorrow
    transactions.push({ id: 50, type: 'income', amount: 100000, source: 'Freelance', date: iso(-2) })
    const outcomes = run({ transactions })
    const o = outcomeFor('postIncomeAcceleration', outcomes)
    expect(o?.measured).toBe(false)
    expect(o?.text).toContain('still open')
  })

  it('needs a baseline before measuring', () => {
    const outcomes = run({ transactions: [deposits(1)[0]] })
    const o = outcomeFor('postIncomeAcceleration', outcomes)
    expect(o?.measured).toBe(false)
  })
})

describe('measureOutcomes — commitments and savings', () => {
  it('measures the last commitment outcome against the historical rate', () => {
    const outcomes = run({
      transactions: [],
      commitments: [commitment('Cell', -10, false), commitment('Cell', -3, true)],
    })
    const o = outcomeFor('commitmentReliability', outcomes)
    expect(o?.measured).toBe(true)
    expect(o?.improved).toBe(true)
    expect(o?.after).toBe(100)
    expect(o?.before).toBe(50)
    expect(o?.text).toContain('paid on time')
  })

  it('flags a missed commitment honestly', () => {
    const outcomes = run({
      transactions: [],
      commitments: [commitment('Cell', -10, true), commitment('Cell', -3, false)],
    })
    const o = outcomeFor('commitmentReliability', outcomes)
    expect(o?.measured).toBe(true)
    expect(o?.improved).toBe(false)
    expect(o?.after).toBe(0)
    expect(o?.text).toContain('missed')
  })

  it('needs a recorded outcome before measuring commitments', () => {
    const outcomes = run({
      transactions: [],
      commitments: [commitment('Cell', 3, null)],
    })
    expect(outcomeFor('commitmentReliability', outcomes)?.measured).toBe(false)
  })

  it('compares this week\u2019s saving against earlier weeks', () => {
    const outcomes = run({
      transactions: [],
      snapshots: snapshots([60000, 63000, 66000, 76000]),
    })
    const o = outcomeFor('savingsConsistency', outcomes)
    expect(o?.measured).toBe(true)
    expect(o?.before).toBe(3000)
    expect(o?.after).toBe(10000)
    expect(o?.improved).toBe(true)
    expect(o?.text).toContain('improvement')
  })

  it('needs a trend before measuring savings', () => {
    const outcomes = run({ transactions: [], snapshots: snapshots([60000, 63000]) })
    expect(outcomeFor('savingsConsistency', outcomes)?.measured).toBe(false)
  })

  it('marks coaching-only focuses as not yet measurable', () => {
    const outcomes = run({ transactions: deposits(4) })
    expect(outcomeFor('debtPressure', outcomes)?.measured).toBe(false)
    expect(outcomeFor('financialResilience', outcomes)?.measured).toBe(false)
    expect(outcomeFor('record', outcomes)?.measured).toBe(false)
  })
})