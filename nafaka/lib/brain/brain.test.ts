import { describe, it, expect } from 'vitest'
import { buildBehaviorModel } from './index'
import { confidenceFor, confidenceTier, overallConfidence } from './confidence'
import {
  commitmentReliabilitySignal,
  debtPressureSignal,
  discretionaryShareSignal,
  financialResilienceSignal,
  incomeRegularitySignal,
  incomeSourceDependenceSignal,
  postIncomeAccelerationSignal,
  savingsConsistencySignal,
  spendingStabilitySignal,
} from './signals'
import { classifyState } from './state'
import { storeCommitmentsToBrain, storeSnapshotsToBrain, storeTransactionsToBrain } from './adapters'
import { accelerationCopy, confidencePct, describeRegularity, tierCopy, tierLabel } from './describe'
import type { BrainCommitment, BrainTransaction } from './types'

function iso(dayOffset: number, from = '2026-01-01'): string {
  const d = new Date(`${from}T12:00:00`)
  d.setDate(d.getDate() + dayOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

describe('incomeRegularitySignal', () => {
  it('scores regular weekly income near 100', () => {
    const txs: BrainTransaction[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      type: 'income',
      amount: 50000,
      source: 'Freelance',
      date: iso(i * 7),
    }))
    const s = incomeRegularitySignal(txs)
    expect(s.sampleSize).toBe(8)
    expect(s.value).toBeGreaterThan(95)
  })

  it('scores irregular income much lower', () => {
    const txs: BrainTransaction[] = [
      { id: 1, type: 'income', amount: 50000, source: 'Freelance', date: iso(0) },
      { id: 2, type: 'income', amount: 20000, source: 'Freelance', date: iso(2) },
      { id: 3, type: 'income', amount: 80000, source: 'Freelance', date: iso(9) },
      { id: 4, type: 'income', amount: 30000, source: 'Freelance', date: iso(30) },
    ]
    const s = incomeRegularitySignal(txs)
    expect(s.value).toBeLessThan(40)
  })

  it('returns insufficient data for a single event', () => {
    const s = incomeRegularitySignal([{ id: 1, type: 'income', amount: 50000, date: iso(0) }])
    expect(s.sampleSize).toBe(0)
    expect(s.confidence).toBe(0)
  })
})

describe('incomeSourceDependenceSignal', () => {
  it('returns 100 for a single source', () => {
    const txs: BrainTransaction[] = [
      { id: 1, type: 'income', amount: 100000, source: 'Freelance', date: iso(0) },
      { id: 2, type: 'income', amount: 50000, source: 'Freelance', date: iso(7) },
    ]
    expect(incomeSourceDependenceSignal(txs).value).toBe(100)
  })

  it('returns the largest source share', () => {
    const txs: BrainTransaction[] = [
      { id: 1, type: 'income', amount: 150000, source: 'Freelance', date: iso(0) },
      { id: 2, type: 'income', amount: 50000, source: 'Family', date: iso(7) },
    ]
    expect(incomeSourceDependenceSignal(txs).value).toBe(75)
  })
})

describe('spendingStabilitySignal', () => {
  it('scores steady daily spending near 100', () => {
    const txs: BrainTransaction[] = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      type: 'expense',
      amount: 5000,
      category: 'food',
      date: iso(i),
    }))
    const s = spendingStabilitySignal(txs)
    expect(s.value).toBeGreaterThan(95)
  })
})

describe('discretionaryShareSignal', () => {
  it('computes the discretionary share of spending', () => {
    const txs: BrainTransaction[] = [
      { id: 1, type: 'expense', amount: 50000, category: 'food', date: iso(0) },
      { id: 2, type: 'expense', amount: 25000, category: 'transport', date: iso(1) },
      { id: 3, type: 'expense', amount: 25000, category: 'shopping', date: iso(2) },
    ]
    expect(discretionaryShareSignal(txs).value).toBe(25)
  })

  it('never counts giving as discretionary', () => {
    const txs: BrainTransaction[] = [
      { id: 1, type: 'expense', amount: 40000, category: 'giving', date: iso(0) },
      { id: 2, type: 'expense', amount: 10000, category: 'shopping', date: iso(1) },
    ]
    expect(discretionaryShareSignal(txs).value).toBe(20)
  })
})

describe('postIncomeAccelerationSignal', () => {
  it('detects the 72-hour spending window', () => {
    const txs: BrainTransaction[] = []
    let id = 0
    for (let w = 0; w < 10; w++) {
      const incomeDay = w * 7
      txs.push({ id: id++, type: 'income', amount: 100000, source: 'Freelance', date: iso(incomeDay) })
      for (let d = 0; d < 7; d++) {
        const day = incomeDay + d
        const spike = d >= 1 && d <= 3
        txs.push({ id: id++, type: 'expense', amount: spike ? 10000 : 5000, category: 'food', date: iso(day) })
      }
    }
    const s = postIncomeAccelerationSignal(txs)
    expect(s.sampleSize).toBe(10)
    expect(s.value).toBeGreaterThan(125)
    expect(s.value).toBeLessThan(200)
    expect(s.confidence).toBeGreaterThanOrEqual(0.5)
  })

  it('reports ~100 when spending does not react to income', () => {
    const txs: BrainTransaction[] = []
    let id = 0
    for (let w = 0; w < 10; w++) {
      txs.push({ id: id++, type: 'income', amount: 100000, source: 'Freelance', date: iso(w * 7) })
      for (let d = 0; d < 7; d++) {
        txs.push({ id: id++, type: 'expense', amount: 5000, category: 'food', date: iso(w * 7 + d) })
      }
    }
    const s = postIncomeAccelerationSignal(txs)
    expect(s.value).toBeGreaterThanOrEqual(95)
    expect(s.value).toBeLessThanOrEqual(105)
  })
})

describe('savingsConsistencySignal', () => {
  it('scores positive weekly deltas', () => {
    const snapshots = [
      { date: iso(0), balance: 100000 },
      { date: iso(7), balance: 120000 },
      { date: iso(14), balance: 130000 },
      { date: iso(21), balance: 150000 },
    ]
    const s = savingsConsistencySignal(snapshots)
    expect(s.value).toBe(100)
    expect(s.sampleSize).toBe(4)
  })

  it('returns insufficient data for fewer than 2 snapshots', () => {
    expect(savingsConsistencySignal([{ date: iso(0), balance: 100000 }]).sampleSize).toBe(0)
  })
})

describe('commitmentReliabilitySignal', () => {
  it('scores fulfilled commitments', () => {
    const commitments: BrainCommitment[] = [
      { id: 1, label: 'Cell', amount: 5000, dueDate: iso(-7), fulfilled: true },
      { id: 2, label: 'Offering', amount: 10000, dueDate: iso(-3), fulfilled: true },
      { id: 3, label: 'Rent', amount: 250000, dueDate: iso(-10), fulfilled: false },
    ]
    const s = commitmentReliabilitySignal(commitments)
    expect(s.value).toBeCloseTo(66.67, 1)
    expect(s.sampleSize).toBe(3)
  })

  it('ignores upcoming commitments', () => {
    const commitments: BrainCommitment[] = [
      { id: 1, label: 'Cell', amount: 5000, dueDate: iso(3), fulfilled: null },
    ]
    expect(commitmentReliabilitySignal(commitments).sampleSize).toBe(0)
  })
})

describe('debtPressureSignal', () => {
  it('computes debt as share of income', () => {
    const txs: BrainTransaction[] = [
      { id: 1, type: 'income', amount: 200000, source: 'Freelance', date: iso(0) },
      { id: 2, type: 'expense', amount: 60000, category: 'debt', date: iso(1) },
    ]
    expect(debtPressureSignal(txs).value).toBe(30)
  })
})

describe('financialResilienceSignal', () => {
  it('scores 100 for a 30-day runway', () => {
    const txs: BrainTransaction[] = Array.from({ length: 7 }, (_, i) => ({
      id: i,
      type: 'expense',
      amount: 2000,
      category: 'food',
      date: iso(i),
    }))
    const s = financialResilienceSignal(txs, 60000)
    expect(s.value).toBe(100)
  })

  it('scores low for a thin buffer', () => {
    const txs: BrainTransaction[] = Array.from({ length: 7 }, (_, i) => ({
      id: i,
      type: 'expense',
      amount: 5000,
      category: 'food',
      date: iso(i),
    }))
    const s = financialResilienceSignal(txs, 30000)
    expect(s.value).toBeLessThan(30)
  })
})

describe('confidenceFor', () => {
  it('returns 0 with no observations', () => {
    expect(confidenceFor(0, 10)).toBe(0)
  })

  it('reaches ~63% at the half-life', () => {
    expect(confidenceFor(12, 12)).toBeCloseTo(0.632, 2)
  })

  it('penalizes spread', () => {
    expect(confidenceFor(12, 12, 1)).toBeLessThan(confidenceFor(12, 12, 0))
  })

  it('tiers map correctly', () => {
    expect(confidenceTier(0.1)).toBe('exploring')
    expect(confidenceTier(0.35)).toBe('learning')
    expect(confidenceTier(0.65)).toBe('confident')
    expect(confidenceTier(0.9)).toBe('mature')
  })
})

describe('overallConfidence', () => {
  it('averages only active signals', () => {
    const signals = {
      a: { value: 0, confidence: 0.8, sampleSize: 5 },
      b: { value: 0, confidence: 0, sampleSize: 0 },
    }
    expect(overallConfidence(signals)).toBe(0.8)
  })

  it('is 0 when nothing is active', () => {
    expect(overallConfidence({ a: { value: 0, confidence: 0, sampleSize: 0 } })).toBe(0)
  })
})

describe('classifyState', () => {
  it('classifies emergency at zero balance', () => {
    expect(classifyState({ balance: 0, dailyEssentialCost: 5000, upcomingTotal: 10000 }).state).toBe('EMERGENCY')
  })

  it('classifies survival under 3 days of runway', () => {
    expect(classifyState({ balance: 10000, dailyEssentialCost: 5000, upcomingTotal: 5000 }).state).toBe('SURVIVAL')
  })

  it('classifies recovery when commitments are not covered', () => {
    expect(classifyState({ balance: 30000, dailyEssentialCost: 5000, upcomingTotal: 40000 }).state).toBe('RECOVERY')
  })

  it('classifies stable with a healthy runway', () => {
    expect(classifyState({ balance: 100000, dailyEssentialCost: 5000, upcomingTotal: 20000 }).state).toBe('STABLE')
  })

  it('classifies growth with 90+ days of runway', () => {
    expect(classifyState({ balance: 500000, dailyEssentialCost: 5000, upcomingTotal: 20000 }).state).toBe('GROWTH')
  })
})

describe('buildBehaviorModel (integration)', () => {
  it('assembles signals, confidence, state, and gated insights', () => {
    const txs: BrainTransaction[] = []
    let id = 0
    for (let w = 0; w < 10; w++) {
      txs.push({ id: id++, type: 'income', amount: 100000, source: 'Freelance', date: iso(w * 7) })
      for (let d = 0; d < 7; d++) {
        const day = iso(w * 7 + d)
        txs.push({ id: id++, type: 'expense', amount: 3000, category: 'food', date: day })
        txs.push({ id: id++, type: 'expense', amount: 2000, category: 'transport', date: day })
      }
    }
    const commitments: BrainCommitment[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      label: 'Cell meeting',
      amount: 5000,
      dueDate: iso(-(i + 1) * 7),
      fulfilled: true,
    }))
    const snapshots = Array.from({ length: 10 }, (_, i) => ({ date: iso(i * 7), balance: 100000 + i * 15000 }))

    const model = buildBehaviorModel({ transactions: txs, commitments, snapshots, balance: 235000 })

    expect(model.dataPoints).toBeGreaterThan(0)
    expect(model.confidence).toBeGreaterThan(0)
    expect(model.activeSignals.length).toBeGreaterThan(5)
    expect(model.state).toBe('STABLE')
    expect(model.stateDetail.dailyEssentialCost).toBe(5000)
    expect(model.stateDetail.runwayDays).toBe(47)
    expect(model.signals.incomeRegularity.value).toBeGreaterThan(95)
    expect(model.signals.commitmentReliability.value).toBe(100)
    expect(model.insights.some((i) => i.id === 'commitments-strong')).toBe(true)
    expect(model.insights.some((i) => i.id === 'income-irregular')).toBe(false)
  })

  it('emits no insights when confidence is too low', () => {
    const model = buildBehaviorModel({
      transactions: [
        { id: 1, type: 'income', amount: 100000, source: 'Freelance', date: iso(0) },
        { id: 2, type: 'expense', amount: 5000, category: 'food', date: iso(1) },
      ],
      commitments: [],
      snapshots: [],
      balance: 95000,
    })
    expect(model.confidenceTier).toBe('exploring')
    expect(model.insights).toHaveLength(0)
  })
})

describe('adapters', () => {
  it('maps store time strings to brain dates', () => {
    const now = new Date('2026-01-10T10:00:00')
    const txs = storeTransactionsToBrain(
      [
        { id: 1, type: 'income', amount: 50000, label: 'Freelance', time: 'Today, 9:12 AM' },
        { id: 2, type: 'expense', amount: 6000, label: 'Food', category: 'food', time: 'Yesterday, 8:40 AM' },
      ],
      now,
    )
    expect(txs[0].date).toBe('2026-01-10')
    expect(txs[1].date).toBe('2026-01-09')
    expect(txs[0].source).toBe('Freelance')
  })

  it('uses recorded ISO timestamps when available', () => {
    const txs = storeTransactionsToBrain([
      { id: 1, type: 'income', amount: 50000, label: 'Freelance', time: 'Today, 9:12 AM', recordedAt: '2026-01-02T09:12:00.000Z' },
    ])
    expect(txs[0].date).toBe('2026-01-02')
  })

  it('maps commitment timing and status to brain commitments', () => {
    const now = new Date('2026-01-10T10:00:00')
    const commitments = storeCommitmentsToBrain(
      [
        { id: 1, label: 'Cell meeting', when: 'Tomorrow', amount: 5000, status: 'upcoming' },
        { id: 2, label: 'Sunday offering', when: 'In 3 days', amount: 10000, status: 'fulfilled' },
        { id: 3, label: 'Rent', when: 'In 12 days', amount: 250000, status: 'missed' },
      ],
      now,
    )
    expect(commitments[0].dueDate).toBe('2026-01-11')
    expect(commitments[1].dueDate).toBe('2026-01-13')
    expect(commitments.map((c) => c.fulfilled)).toEqual([null, true, false])
  })

  it('maps weekly snapshots to brain snapshots', () => {
    const snapshots = storeSnapshotsToBrain([
      { id: 1, date: '2026-01-05', balance: 70000 },
      { id: 2, date: '2026-01-12', balance: 75000 },
    ])
    expect(snapshots).toEqual([
      { date: '2026-01-05', balance: 70000 },
      { date: '2026-01-12', balance: 75000 },
    ])
  })
})

describe('describe helpers', () => {
  it('labels regularity bands', () => {
    expect(describeRegularity(20)).toBe('Irregular')
    expect(describeRegularity(55)).toBe('Semi-regular')
    expect(describeRegularity(85)).toBe('Regular')
  })

  it('labels tiers and confidence', () => {
    expect(tierLabel('exploring')).toBe('Exploring')
    expect(tierLabel('learning')).toBe('Developing')
    expect(tierLabel('confident')).toBe('Confident')
    expect(tierLabel('mature')).toBe('Mature')
    expect(tierCopy('learning')).toContain('developing')
    expect(confidencePct(0.632)).toBe(63)
  })

  it('phrases acceleration proportionally to evidence', () => {
    expect(accelerationCopy(150)).toContain('three days')
    expect(accelerationCopy(105)).toContain('steady')
  })
})
