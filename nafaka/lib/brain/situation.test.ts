import { describe, it, expect } from 'vitest'
import { buildBehaviorModel } from './index'
import { classifySituation, isCalm, readSituation, situationCopy, situationLabel } from './situation'
import type { BrainCommitment, BrainSnapshot, BrainTransaction } from './types'

function iso(dayOffset: number): string {
  const d = new Date('2026-01-10T12:00:00')
  d.setDate(d.getDate() + dayOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function incomes(n: number, gapDays = 7, amount = 100000): BrainTransaction[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    type: 'income',
    amount,
    source: 'Freelance',
    date: iso(-i * gapDays),
  }))
}

function foodExpenses(n: number, amount = 20000, gapDays = 7): BrainTransaction[] {
  return Array.from({ length: n }, (_, i) => ({
    id: 100 + i,
    type: 'expense',
    amount,
    category: 'food',
    date: iso(-(i * gapDays + 2)),
  }))
}

function commitment(amount: number, dueOffset = 3): BrainCommitment {
  return { id: 1, label: 'Rent', amount, dueDate: iso(dueOffset), fulfilled: null }
}

function snapshots(n: number): BrainSnapshot[] {
  return Array.from({ length: n }, (_, i) => ({ date: iso(-(n - i) * 7 + 1), balance: 100000 + i * 10000 }))
}

describe('classifySituation', () => {
  it('flags an emergency from the runway state', () => {
    const m = buildBehaviorModel({ transactions: foodExpenses(4), commitments: [], snapshots: [], balance: -5000 })
    expect(classifySituation(m)).toBe('EMERGENCY')
  })

  it('flags emergency when the runway covers under 2 days', () => {
    const m = buildBehaviorModel({ transactions: foodExpenses(4, 8000), commitments: [], snapshots: [], balance: 10000 })
    expect(classifySituation(m)).toBe('EMERGENCY')
  })

  it('flags under pressure when debt absorbs half of income', () => {
    const debt: BrainTransaction[] = Array.from({ length: 8 }, (_, i) => ({
      id: 300 + i,
      type: 'expense',
      amount: 60000,
      category: 'debt',
      date: iso(-(i * 7 + 1)),
    }))
    const m = buildBehaviorModel({ transactions: [...incomes(8), ...debt], commitments: [], snapshots: [], balance: 500000 })
    expect(classifySituation(m)).toBe('UNDER_PRESSURE')
  })

  it('flags under pressure on a thin runway', () => {
    const m = buildBehaviorModel({ transactions: foodExpenses(6, 20000), commitments: [], snapshots: [], balance: 100000 })
    expect(classifySituation(m)).toBe('UNDER_PRESSURE')
  })

  it('flags uncertain income before anything else calm', () => {
    const irregular: BrainTransaction[] = [
      { id: 1, type: 'income', amount: 100000, source: 'Freelance', date: iso(0) },
      { id: 2, type: 'income', amount: 80000, source: 'Freelance', date: iso(-2) },
      { id: 3, type: 'income', amount: 70000, source: 'Freelance', date: iso(-30) },
    ]
    const m = buildBehaviorModel({ transactions: [...irregular, ...foodExpenses(6)], commitments: [], snapshots: [], balance: 800000 })
    expect(classifySituation(m)).toBe('INCOME_UNCERTAIN')
  })

  it('flags commitment-heavy when commitments match half the balance', () => {
    const m = buildBehaviorModel({ transactions: incomes(12), commitments: [commitment(60000)], snapshots: [], balance: 100000 })
    expect(classifySituation(m)).toBe('COMMITMENT_HEAVY')
  })

  it('flags cash rich on a runway of two months or more', () => {
    const m = buildBehaviorModel({ transactions: foodExpenses(6, 30000), commitments: [], snapshots: [], balance: 2000000 })
    expect(classifySituation(m)).toBe('CASH_RICH')
  })

  it('flags building a buffer on solid runway and consistent saving', () => {
    const m = buildBehaviorModel({ transactions: foodExpenses(6, 20000), commitments: [], snapshots: snapshots(8), balance: 600000 })
    expect(classifySituation(m)).toBe('BUILDING_BUFFER')
  })

  it('returns stable as the calm default', () => {
    const m = buildBehaviorModel({ transactions: foodExpenses(6, 20000), commitments: [], snapshots: [], balance: 800000 })
    expect(classifySituation(m)).toBe('STABLE')
  })
})

describe('situation helpers', () => {
  it('calms only the calm situations', () => {
    expect(isCalm('STABLE')).toBe(true)
    expect(isCalm('CASH_RICH')).toBe(true)
    expect(isCalm('BUILDING_BUFFER')).toBe(true)
    expect(isCalm('UNDER_PRESSURE')).toBe(false)
    expect(isCalm('EMERGENCY')).toBe(false)
  })

  it('labels and describes every situation', () => {
    for (const s of ['EMERGENCY', 'UNDER_PRESSURE', 'INCOME_UNCERTAIN', 'COMMITMENT_HEAVY', 'RECOVERING', 'CASH_RICH', 'BUILDING_BUFFER', 'STABLE', 'UNKNOWN'] as const) {
      expect(situationLabel(s).length).toBeGreaterThan(0)
      expect(situationCopy(s).length).toBeGreaterThan(10)
    }
  })
})

describe('readSituation', () => {
  it('returns unknown instead of forcing a verdict on thin data', () => {
    const m = buildBehaviorModel({ transactions: [], commitments: [], snapshots: [], balance: 50000 })
    const read = readSituation(m)
    expect(read.situation).toBe('UNKNOWN')
    expect(read.confidence).toBe(1)
    expect(read.evidence.length).toBeGreaterThan(0)
    expect(read.reason).toContain('still learning')
  })

  it('keeps the emergency factual and high-confidence', () => {
    const m = buildBehaviorModel({ transactions: foodExpenses(4), commitments: [], snapshots: [], balance: -5000 })
    const read = readSituation(m)
    expect(read.situation).toBe('EMERGENCY')
    expect(read.confidence).toBeGreaterThan(0.9)
    expect(read.evidence.some((e) => e.includes('UGX'))).toBe(true)
  })

  it('carries the debt signal confidence and evidence into under pressure', () => {
    const debt: BrainTransaction[] = Array.from({ length: 8 }, (_, i) => ({
      id: 300 + i,
      type: 'expense',
      amount: 60000,
      category: 'debt',
      date: iso(-(i * 7 + 1)),
    }))
    const m = buildBehaviorModel({ transactions: [...incomes(8), ...debt], commitments: [], snapshots: [], balance: 500000 })
    const read = readSituation(m)
    expect(read.situation).toBe('UNDER_PRESSURE')
    expect(read.confidence).toBe(m.signals.debtPressure.confidence)
    expect(read.evidence.some((e) => e.includes('60% of income'))).toBe(true)
    expect(read.sampleSize).toBe(8)
    expect(read.reason).toContain('Cash is tight')
  })

  it('reports the observation window when transactions have dates', () => {
    const m = buildBehaviorModel({ transactions: foodExpenses(6, 20000), commitments: [], snapshots: [], balance: 800000 })
    const read = readSituation(m)
    expect(read.situation).toBe('STABLE')
    expect(read.windowDays).toBeGreaterThan(0)
    expect(read.confidence).toBeGreaterThanOrEqual(0.5)
    expect(read.reason.length).toBeGreaterThan(10)
  })

  it('flags recovering when the state is RECOVERY', () => {
    const commitments: BrainCommitment[] = [commitment(150000, 3)]
    const m = buildBehaviorModel({ transactions: foodExpenses(6, 20000), commitments, snapshots: [], balance: 140000 })
    expect(m.state).toBe('RECOVERY')
    expect(classifySituation(m)).toBe('RECOVERING')
  })
})