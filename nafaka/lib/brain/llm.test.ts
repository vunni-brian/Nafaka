import { describe, it, expect } from 'vitest'
import { buildBehaviorModel } from './index'
import { buildLlmContext, sanitizeLabel } from './llm'
import type { ChatContext } from './chat'
import { buildDecisionLog } from './decisions'
import { weeklyFocus } from './focus'
import { computeHealthScore } from './health'
import { predict } from './predict'
import { explainSafeToSpend } from './safetospend'
import type { BrainCommitment, BrainTransaction } from './types'
import type { Commitment } from '../store'

function iso(dayOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ctx(overrides: { transactions?: BrainTransaction[]; commitments?: BrainCommitment[] } = {}): ChatContext {
  const transactions = overrides.transactions ?? []
  const commitments = overrides.commitments ?? []
  const balance = 75000
  const safeToSpend = 60000
  const model = buildBehaviorModel({ transactions, commitments, snapshots: [], balance })
  const explanation = explainSafeToSpend({ transactions, commitments, safeToSpend })
  return {
    name: 'joseph',
    balance,
    safeToSpend,
    upcomingTotal: 15000,
    shortfall: 0,
    model,
    transactions,
    decisionLog: buildDecisionLog({
      model,
      balance,
      safeToSpend,
      health: computeHealthScore(model),
      focus: weeklyFocus(model),
      explanation,
    }),
    predictions: predict({ model, balance, explanation }),
    latestOutcome: null,
  }
}

function storeCommitments(): Commitment[] {
  return [
    { id: 1, label: 'Cell meeting', when: 'Tomorrow', amount: 5000, status: 'upcoming' },
    { id: 2, label: 'Sunday offering', when: 'In 3 days', amount: 10000, status: 'upcoming' },
    { id: 3, label: 'Old debt', when: '1 week ago', amount: 15000, status: 'missed' },
    { id: 4, label: 'Paid cell', when: '2 weeks ago', amount: 5000, status: 'fulfilled' },
  ]
}

describe('buildLlmContext', () => {
  it('omits signals without data', () => {
    const digest = buildLlmContext(ctx(), [])
    expect(Object.keys(digest.signals).length).toBe(0)
  })

  it('rounds all money fields to whole shillings', () => {
    const transactions: BrainTransaction[] = [
      { id: 1, type: 'income', amount: 85000.5, source: 'Freelance', date: iso(-2) },
      { id: 2, type: 'expense', amount: 6000.4, category: 'food', date: iso(-1) },
    ]
    const digest = buildLlmContext(ctx({ transactions }), [])
    expect(digest.balance).toBe(75000)
    expect(digest.dailyEssentialCost).toBe(Math.round(digest.dailyEssentialCost))
    expect(digest.recentTransactions.every((t) => Number.isInteger(t.amount))).toBe(true)
  })

  it('includes only the last 8 transactions, newest last', () => {
    const txs: BrainTransaction[] = []
    for (let i = 0; i < 12; i++) txs.push({ id: i, type: 'expense', amount: 1000 + i, category: 'food', date: iso(-i) })
    const digest = buildLlmContext(ctx({ transactions: txs }), [])
    expect(digest.recentTransactions).toHaveLength(8)
    expect(digest.recentTransactions[0].date).toBe(iso(-7))
    expect(digest.recentTransactions[7].amount).toBe(1000)
  })

  it('lists only upcoming commitments, capped at five', () => {
    const digest = buildLlmContext(ctx(), storeCommitments())
    expect(digest.upcomingCommitments.map((c) => c.label)).toEqual(['Cell meeting', 'Sunday offering'])
  })

  it('caps insights at six, action-severity first', () => {
    const transactions: BrainTransaction[] = []
    for (let i = 0; i < 6; i++) {
      transactions.push({ id: i, type: 'expense', amount: 15000, category: 'airtime', date: iso(-(i + 1) * 7) })
    }
    const digest = buildLlmContext(ctx({ transactions }), [])
    expect(digest.insights.length).toBeLessThanOrEqual(6)
  })

  it('reports zero shortfall instead of negative values', () => {
    const digest = buildLlmContext(ctx(), [])
    expect(digest.shortfall).toBe(0)
  })

  it('includes the decision log with machine-readable evidence', () => {
    const digest = buildLlmContext(ctx(), [])
    expect(digest.decisions.map((d) => d.decision)).toEqual(['SAFE_TO_SPEND', 'HEALTH_SCORE', 'WEEKLY_FOCUS'])
    const safe = digest.decisions.find((d) => d.decision === 'SAFE_TO_SPEND')
    expect(safe?.value).toBe(60000)
    expect(safe?.reason.length).toBeGreaterThan(10)
  })

  it('exposes the situation and any predictions', () => {
    const digest = buildLlmContext(ctx(), [])
    expect(['STABLE', 'EMERGENCY', 'UNDER_PRESSURE', 'INCOME_UNCERTAIN', 'COMMITMENT_HEAVY', 'CASH_RICH', 'BUILDING_BUFFER', 'RECOVERING', 'UNKNOWN']).toContain(digest.situation)
    expect(Array.isArray(digest.predictions)).toBe(true)
  })

  it('never includes the user name', () => {
    const digest = buildLlmContext(ctx(), [])
    expect('name' in digest).toBe(false)
    expect(JSON.stringify(digest)).not.toContain('joseph')
  })
})

describe('sanitizeLabel', () => {
  it('keeps plain labels intact', () => {
    expect(sanitizeLabel('Cell meeting')).toBe('Cell meeting')
  })

  it('strips detail after "for"', () => {
    expect(sanitizeLabel("Rent for Sarah's apartment")).toBe('Rent')
  })

  it('strips detail after "via"', () => {
    expect(sanitizeLabel('Money via Mobile Money')).toBe('Money')
  })

  it('cuts labels that start with "for" or "via"', () => {
    expect(sanitizeLabel('For Sarah Jones')).toBe('')
    expect(sanitizeLabel('via Mobile Money')).toBe('')
  })

  it('removes phone numbers', () => {
    expect(sanitizeLabel('Loan +256700123456 payback')).toBe('Loan payback')
  })

  it('removes email addresses', () => {
    expect(sanitizeLabel('School fees for Sarah.Jones@mail.com')).toBe('School fees')
  })

  it('truncates long labels', () => {
    expect(sanitizeLabel('abcdefghijklmnopqrstuvwxyz0123456789')).toHaveLength(24)
  })

  it('trims whitespace', () => {
    expect(sanitizeLabel('  School fees  ')).toBe('School fees')
  })
})

describe('privacy boundary: the LLM payload never contains personal identifiers', () => {
  const EMAIL = 'sarah.jones@mail.com'
  const PHONE = '+256700123456'
  const NETWORK_PERSON = 'Sarah Jones'
  const ID_NUMBER = '12345678901234567890'
  const USER_NAME = 'joseph'

  function piiCtx(): ChatContext {
    const transactions: BrainTransaction[] = [
      { id: 1, type: 'income', amount: 85000, source: `Freelance for ${NETWORK_PERSON}`, date: iso(-2) },
      { id: 2, type: 'expense', amount: 6000, category: 'food', date: iso(-1) },
      { id: 3, type: 'expense', amount: 20000, category: `School fees for ${EMAIL}`, date: iso(-3) },
      { id: 4, type: 'expense', amount: 15000, category: `Loan ${PHONE} payback`, date: iso(-4) },
      { id: 5, type: 'expense', amount: 9000, category: `Airtime for ${NETWORK_PERSON}`, date: iso(-5) },
      { id: 6, type: 'expense', amount: 12000, category: `Receipt no. ${ID_NUMBER}`, date: iso(-6) },
    ]
    return ctx({ transactions })
  }

  const identifiers = [EMAIL, PHONE, NETWORK_PERSON, ID_NUMBER, USER_NAME]

  it('keeps every identifier out of the serialized digest', () => {
    const commitments: Commitment[] = [
      { id: 1, label: `Cell for ${NETWORK_PERSON}`, when: 'Tomorrow', amount: 5000, status: 'upcoming' },
      { id: 2, label: `Payment via ${PHONE}`, when: 'In 3 days', amount: 10000, status: 'upcoming' },
    ]
    const digest = buildLlmContext(piiCtx(), commitments)
    const json = JSON.stringify(digest)
    for (const id of identifiers) {
      expect(json).not.toContain(id)
    }
  })

  it('contains no keys that could carry identity', () => {
    const digest = buildLlmContext(piiCtx(), []) as Record<string, unknown>
    expect('name' in digest).toBe(false)
    expect('email' in digest).toBe(false)
    expect('notes' in digest).toBe(false)
    expect('network' in digest).toBe(false)
    expect('profile' in digest).toBe(false)
  })

  it('keeps sanitized labels out even with a single transaction', () => {
    const transactions: BrainTransaction[] = [
      { id: 1, type: 'expense', amount: 5000, category: `For ${NETWORK_PERSON}`, date: iso(-1) },
    ]
    const digest = buildLlmContext(ctx({ transactions }), [])
    expect(JSON.stringify(digest)).not.toContain(NETWORK_PERSON)
  })
})