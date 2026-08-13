import { describe, it, expect } from 'vitest'
import { buildBehaviorModel } from './index'
import { buildLlmContext } from './llm'
import type { ChatContext } from './chat'
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
  const model = buildBehaviorModel({ transactions, commitments, snapshots: [], balance })
  return {
    name: 'joseph',
    balance,
    safeToSpend: 60000,
    upcomingTotal: 15000,
    shortfall: 0,
    model,
    transactions,
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
})