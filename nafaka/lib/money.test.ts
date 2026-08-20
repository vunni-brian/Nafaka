import { describe, it, expect } from 'vitest'
import { computeBalance, computeUpcomingTotal, computeSafeToSpend, type Transaction, type Commitment } from './store'

describe('computeBalance', () => {
  it('returns 0 for no transactions', () => {
    expect(computeBalance([])).toBe(0)
  })

  it('sums income and subtracts expenses', () => {
    const txs: Transaction[] = [
      { id: 1, type: 'income', amount: 100000, label: 'Freelance', time: 'Today' },
      { id: 2, type: 'expense', amount: 15000, label: 'Food', time: 'Today' },
      { id: 3, type: 'income', amount: 50000, label: 'Gift', time: 'Today' },
      { id: 4, type: 'expense', amount: 5000, label: 'Transport', time: 'Today' },
    ]
    expect(computeBalance(txs)).toBe(100000 - 15000 + 50000 - 5000) // 130000
  })

  it('handles only expenses (negative balance)', () => {
    const txs: Transaction[] = [
      { id: 1, type: 'expense', amount: 5000, label: 'Boda', time: 'Today' },
      { id: 2, type: 'expense', amount: 10000, label: 'Food', time: 'Today' },
    ]
    expect(computeBalance(txs)).toBe(-15000)
  })
})

describe('computeUpcomingTotal', () => {
  it('returns 0 for no commitments', () => {
    expect(computeUpcomingTotal([])).toBe(0)
  })

  it('sums only upcoming commitment amounts', () => {
    const commitments: Commitment[] = [
      { id: 1, label: 'Cell meeting', when: 'Tomorrow', amount: 5000, status: 'upcoming' },
      { id: 2, label: 'Sunday offering', when: 'In 3 days', amount: 10000, status: 'upcoming' },
      { id: 3, label: 'Rent', when: 'In 12 days', amount: 250000, status: 'upcoming' },
    ]
    expect(computeUpcomingTotal(commitments)).toBe(265000)
  })

  it('does not reserve fulfilled or missed commitments', () => {
    const commitments: Commitment[] = [
      { id: 1, label: 'Rent', when: 'Today', amount: 250000, status: 'fulfilled' },
      { id: 2, label: 'Offering', when: 'Yesterday', amount: 10000, status: 'missed' },
      { id: 3, label: 'Cell', when: 'Tomorrow', amount: 5000, status: 'upcoming' },
    ]
    expect(computeUpcomingTotal(commitments)).toBe(5000)
  })
})

describe('computeSafeToSpend', () => {
  it('returns balance minus commitments', () => {
    expect(computeSafeToSpend(100000, 25000)).toBe(75000)
  })

  it('returns 0 when commitments exceed balance', () => {
    expect(computeSafeToSpend(10000, 50000)).toBe(0)
  })

  it('returns balance when no commitments', () => {
    expect(computeSafeToSpend(50000, 0)).toBe(50000)
  })

  it('never returns negative', () => {
    expect(computeSafeToSpend(0, 100)).toBe(0)
  })
})

describe('integration: balance + commitments + safe-to-spend', () => {
  it('computes a full scenario correctly', () => {
    // Freelancer scenario: earned 200k, spent 45k, has 30k in upcoming commitments
    const txs: Transaction[] = [
      { id: 1, type: 'income', amount: 200000, label: 'Freelance payment', time: 'Today' },
      { id: 2, type: 'expense', amount: 20000, label: 'Groceries', time: 'Today' },
      { id: 3, type: 'expense', amount: 15000, label: 'Transport', time: 'Today' },
      { id: 4, type: 'expense', amount: 10000, label: 'Airtime', time: 'Today' },
    ]
    const commitments: Commitment[] = [
      { id: 1, label: 'Cell meeting', when: 'Tomorrow', amount: 5000, status: 'upcoming' },
      { id: 2, label: 'Sunday offering', when: 'In 3 days', amount: 10000, status: 'upcoming' },
      { id: 3, label: 'Debt repayment', when: 'In 5 days', amount: 15000, status: 'upcoming' },
    ]

    const balance = computeBalance(txs) // 200000 - 45000 = 155000
    const upcoming = computeUpcomingTotal(commitments) // 30000
    const safe = computeSafeToSpend(balance, upcoming) // 155000 - 30000 = 125000

    expect(balance).toBe(155000)
    expect(upcoming).toBe(30000)
    expect(safe).toBe(125000)
  })

  it('shows 0 safe-to-spend when balance is fully covered by commitments', () => {
    const txs: Transaction[] = [
      { id: 1, type: 'income', amount: 50000, label: 'Payment', time: 'Today' },
    ]
    const commitments: Commitment[] = [
      { id: 1, label: 'Rent', when: 'Due', amount: 60000, status: 'upcoming' },
    ]

    expect(computeSafeToSpend(computeBalance(txs), computeUpcomingTotal(commitments))).toBe(0)
  })
})
