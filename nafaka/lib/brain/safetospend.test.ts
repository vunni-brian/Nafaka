import { describe, it, expect } from 'vitest'
import { averageIncomeGap, explainSafeToSpend } from './safetospend'
import type { BrainCommitment, BrainTransaction } from './types'

function iso(dayOffset: number): string {
  const d = new Date('2026-01-10T12:00:00')
  d.setDate(d.getDate() + dayOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function income(daysAgo: number, amount = 100000): BrainTransaction {
  return { id: daysAgo, type: 'income', amount, source: 'Freelance', date: iso(-daysAgo) }
}

const COMMITMENTS: BrainCommitment[] = [
  { id: 1, label: 'Rent', amount: 50000, dueDate: iso(2), fulfilled: null },
  { id: 2, label: 'Tithe', amount: 10000, dueDate: iso(7), fulfilled: null },
]

describe('averageIncomeGap', () => {
  it('returns null with fewer than 2 income events', () => {
    expect(averageIncomeGap([income(0)])).toBeNull()
  })

  it('averages gaps between income events', () => {
    expect(averageIncomeGap([income(0), income(4), income(10)])).toBe(5)
    expect(averageIncomeGap([income(0), income(3), income(9)])).toBe(5)
  })
})

describe('explainSafeToSpend', () => {
  it('predicts next income from the average gap', () => {
    const now = new Date('2026-01-10T12:00:00')
    const result = explainSafeToSpend({
      transactions: [income(0), income(4), income(10)],
      commitments: COMMITMENTS,
      safeToSpend: 15000,
      now,
    })
    expect(result.incomeExpected).toBe(true)
    expect(result.daysToNextIncome).toBe(5)
    expect(result.commitmentsBeforeNext).toBe(50000)
    expect(result.pacePerDay).toBe(3000)
  })

  it('clamps pace to the safe-to-spend that remains after commitments', () => {
    const result = explainSafeToSpend({
      transactions: [income(0), income(4), income(10)],
      commitments: COMMITMENTS,
      safeToSpend: 0,
      now: new Date('2026-01-10T12:00:00'),
    })
    expect(result.pacePerDay).toBeNull()
  })

  it('works from known commitments when income timing is unclear', () => {
    const now = new Date('2026-01-10T12:00:00')
    const result = explainSafeToSpend({
      transactions: [income(0)],
      commitments: COMMITMENTS,
      safeToSpend: 40000,
      now,
    })
    expect(result.incomeExpected).toBe(false)
    expect(result.daysToNextIncome).toBeNull()
    expect(result.commitmentsBeforeNext).toBe(60000)
    expect(result.pacePerDay).toBeNull()
    expect(result.lines.some((l) => l.includes('unclear'))).toBe(true)
  })

  it('warns about the post-deposit window when the signal is confident', () => {
    const result = explainSafeToSpend({
      transactions: [income(0), income(4), income(10)],
      commitments: COMMITMENTS,
      safeToSpend: 15000,
      postIncomeAcceleration: { value: 172, confidence: 0.92, sampleSize: 3 },
      now: new Date('2026-01-10T12:00:00'),
    })
    expect(result.lines.some((l) => l.includes('window'))).toBe(true)
  })

  it('omits the post-deposit warning until the signal is confident', () => {
    const result = explainSafeToSpend({
      transactions: [income(0), income(4), income(10)],
      commitments: COMMITMENTS,
      safeToSpend: 15000,
      postIncomeAcceleration: { value: 172, confidence: 0.3, sampleSize: 1 },
      now: new Date('2026-01-10T12:00:00'),
    })
    expect(result.lines.every((l) => !l.includes('window'))).toBe(true)
  })
})