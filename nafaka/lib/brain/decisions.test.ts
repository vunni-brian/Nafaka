import { describe, it, expect } from 'vitest'
import { buildBehaviorModel } from './index'
import { buildDecisionLog, healthScoreDecision, weeklyFocusDecision } from './decisions'
import { weeklyFocus } from './focus'
import { computeHealthScore } from './health'
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

function income(daysAgo: number, amount = 100000): BrainTransaction {
  return { id: daysAgo, type: 'income', amount, source: 'Freelance', date: iso(-daysAgo) }
}

const COMMITMENTS: BrainCommitment[] = [
  { id: 1, label: 'Rent', amount: 50000, dueDate: iso(2), fulfilled: null },
  { id: 2, label: 'Tithe', amount: 10000, dueDate: iso(7), fulfilled: null },
]

function richModel() {
  return buildBehaviorModel({
    transactions: [income(0), income(4), income(10)],
    commitments: COMMITMENTS,
    snapshots: [],
    balance: 150000,
  })
}

function confidentModel() {
  const transactions: BrainTransaction[] = []
  for (let i = 0; i < 8; i++) {
    transactions.push({ id: i, type: 'income', amount: 100000, source: 'Freelance', date: iso(-i * 7) })
    transactions.push({ id: 100 + i, type: 'expense', amount: 60000, category: 'debt', date: iso(-(i * 7 + 1)) })
    transactions.push({ id: 200 + i, type: 'expense', amount: 20000, category: 'food', date: iso(-(i * 7 + 2)) })
  }
  const commitments: BrainCommitment[] = []
  for (let i = 0; i < 6; i++) {
    commitments.push({ id: i, label: 'Cell meeting', amount: 5000, dueDate: iso(-(i + 1) * 7), fulfilled: i < 4 })
  }
  const snapshots = Array.from({ length: 8 }, (_, i) => ({
    date: iso(-(8 - i) * 7 + 7),
    balance: 100000 + i * 5000,
  }))
  return buildBehaviorModel({ transactions, commitments, snapshots, balance: 500000 })
}

describe('buildDecisionLog', () => {
  it('produces one decision per coaching surface with evidence', () => {
    const model = richModel()
    const balance = 150000
    const safeToSpend = 85000
    const explanation = explainSafeToSpend({
      transactions: [income(0), income(4), income(10)],
      commitments: COMMITMENTS,
      safeToSpend,
      postIncomeAcceleration: model.signals.postIncomeAcceleration,
      now: new Date('2026-01-10T12:00:00'),
    })
    const health = computeHealthScore(model)
    const focus = weeklyFocus(model)
    const log = buildDecisionLog({ model, balance, safeToSpend, health, focus, explanation, now: new Date('2026-01-10T12:00:00') })

    expect(log.map((d) => d.id)).toEqual(['SAFE_TO_SPEND', 'HEALTH_SCORE', 'WEEKLY_FOCUS'])

    const safe = log[0]
    expect(safe.value).toBe(85000)
    expect(safe.inputs.nextIncomeDays).toBe(5)
    expect(safe.inputs.commitmentsBeforeIncome).toBe(50000)
    expect(safe.inputs.dailyPace).toBe(17000)
    expect(safe.inputs.availableCash).toBe(150000)
    expect(safe.signals.incomeRegularity).toBeDefined()
    expect(safe.signals.incomeRegularity.sampleSize).toBe(3)
    expect(safe.confidence).toBe(model.confidence)
    expect(safe.reason).toContain('5 days to next expected income')
    expect(safe.reason).toContain('UGX 50,000 of commitments')
    expect(safe.reason).toContain('UGX 17,000/day keeps the user on track')
    expect(new Date(safe.generatedAt).getTime()).toBe(new Date('2026-01-10T12:00:00').getTime())

    const healthDecision = log[1]
    expect(healthDecision.value).toBe(health.score)
    expect(healthDecision.inputs.readyComponents).toBe(health.readyCount)

    const focusDecision = log[2]
    expect(focusDecision.value).toBe(focus.key)
    expect(focusDecision.reason).toContain(focus.title)
  })

  it('stays honest when nothing is known yet', () => {
    const model = buildBehaviorModel({
      transactions: [income(0)],
      commitments: [],
      snapshots: [],
      balance: 10000,
    })
    const balance = 10000
    const safeToSpend = 10000
    const explanation = explainSafeToSpend({
      transactions: [income(0)],
      commitments: [],
      safeToSpend,
      now: new Date('2026-01-10T12:00:00'),
    })
    const log = buildDecisionLog({
      model,
      balance,
      safeToSpend,
      health: computeHealthScore(model),
      focus: weeklyFocus(model),
      explanation,
    })

    const safe = log[0]
    expect(safe.inputs.nextIncomeDays).toBeNull()
    expect(safe.reason).toContain('income timing still unclear')

    const health = log[1]
    expect(health.value).toBeNull()
    expect(health.reason).toContain('still learning')
  })
})

describe('decision constructors', () => {
  it('healthScoreDecision names the weakest confident component', () => {
    const model = confidentModel()
    const health = computeHealthScore(model)
    const d = healthScoreDecision({ model, health })
    expect(d.inputs.weakestComponent).toBe('Debt management')
    expect(d.reason).toContain('weakest is debt management')
  })

  it('weeklyFocusDecision carries the chosen focus and its reasoning', () => {
    const model = richModel()
    const focus = weeklyFocus(model)
    const d = weeklyFocusDecision({ model, focus })
    expect(d.value).toBe(focus.key)
    expect(d.reason).toContain(focus.body)
  })
})