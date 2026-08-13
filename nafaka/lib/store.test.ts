import { describe, it, expect } from 'vitest'
import { computeBalance, computeUpcomingTotal, computeSafeToSpend, computeShortfall, isValidAmount, type Transaction, type Commitment } from './store'

const income: Transaction = { id: 1, type: 'income', amount: 50000, label: 'Freelance', time: 'Today, 9:12 AM' }
const expense: Transaction = { id: 2, type: 'expense', amount: 10000, label: 'Food', category: 'food', time: 'Today, 8:40 AM' }

const commitment = (status: Commitment['status'], amount: number): Commitment => ({
  id: status === 'upcoming' ? 1 : 2,
  label: 'Cell meeting',
  when: 'Tomorrow',
  amount,
  status,
})

describe('computeBalance', () => {
  it('starts at zero with no transactions and no starting balance', () => {
    expect(computeBalance([])).toBe(0)
  })

  it('adds income and subtracts expenses', () => {
    expect(computeBalance([income, expense])).toBe(40000)
  })

  it('includes the onboarding starting balance', () => {
    expect(computeBalance([income, expense], 150000)).toBe(190000)
  })

  it('can go negative when spending exceeds balance', () => {
    expect(computeBalance([expense], 5000)).toBe(-5000)
  })
})

describe('computeUpcomingTotal', () => {
  it('sums only upcoming commitments', () => {
    expect(computeUpcomingTotal([commitment('upcoming', 5000), commitment('fulfilled', 9000), commitment('missed', 1000)])).toBe(5000)
  })

  it('returns zero when nothing is upcoming', () => {
    expect(computeUpcomingTotal([commitment('fulfilled', 5000)])).toBe(0)
  })
})

describe('computeSafeToSpend', () => {
  it('protects upcoming commitments first', () => {
    expect(computeSafeToSpend(30000, 15000)).toBe(15000)
  })

  it('never goes negative', () => {
    expect(computeSafeToSpend(10000, 30000)).toBe(0)
  })
})

describe('computeShortfall', () => {
  it('reports how much upcoming commitments exceed balance', () => {
    expect(computeShortfall(10000, 30000)).toBe(20000)
  })

  it('is zero when balance covers commitments', () => {
    expect(computeShortfall(30000, 15000)).toBe(0)
  })
})

describe('isValidAmount', () => {
  it('accepts positive integers', () => {
    expect(isValidAmount(5000)).toBe(true)
  })

  it('rejects zero, negatives, floats, and NaN', () => {
    expect(isValidAmount(0)).toBe(false)
    expect(isValidAmount(-1)).toBe(false)
    expect(isValidAmount(1.5)).toBe(false)
    expect(isValidAmount(Number.NaN)).toBe(false)
  })
})