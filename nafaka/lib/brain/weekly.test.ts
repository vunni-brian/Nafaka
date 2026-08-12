import { describe, it, expect } from 'vitest'
import { dailyTotals, formatWeekRange, isoDay, percentDelta, weeklyTotals } from './weekly'
import type { BrainTransaction } from './types'

const now = new Date('2026-08-12T12:00:00')

let nextId = 1
function tx(type: 'income' | 'expense', amount: number, dayOffset: number): BrainTransaction {
  return { id: nextId++, type, amount, date: isoDay(now, dayOffset) }
}

describe('isoDay', () => {
  it('returns today for offset 0', () => {
    expect(isoDay(now, 0)).toBe('2026-08-12')
  })

  it('returns yesterday for offset -1', () => {
    expect(isoDay(now, -1)).toBe('2026-08-11')
  })
})

describe('weeklyTotals', () => {
  it('sums only transactions inside the trailing 7-day window', () => {
    const txs = [
      tx('income', 85000, 0),
      tx('expense', 6000, -1),
      tx('expense', 4000, -5),
      tx('income', 90000, -7),
      tx('expense', 12000, -14),
    ]
    const totals = weeklyTotals(txs, now, 0)
    expect(totals.income).toBe(85000)
    expect(totals.spending).toBe(10000)
    expect(totals.events).toBe(3)
  })

  it('moves the window back for the previous week', () => {
    const txs = [
      tx('income', 85000, 0),
      tx('income', 90000, -7),
      tx('expense', 4000, -12),
      tx('expense', 12000, -14),
    ]
    const totals = weeklyTotals(txs, now, 1)
    expect(totals.income).toBe(90000)
    expect(totals.spending).toBe(4000)
  })

  it('returns zeros for an empty week', () => {
    const totals = weeklyTotals([], now, 0)
    expect(totals).toEqual({ income: 0, spending: 0, events: 0 })
  })
})

describe('dailyTotals', () => {
  it('returns 7 points ending today, oldest first', () => {
    const points = dailyTotals([], now)
    expect(points).toHaveLength(7)
    expect(points[0].day).toBe('2026-08-06')
    expect(points[6].day).toBe('2026-08-12')
    expect(points[6].label).toBeTruthy()
  })

  it('groups multiple transactions on the same day', () => {
    const points = dailyTotals(
      [
        tx('income', 50000, 0),
        tx('income', 35000, 0),
        tx('expense', 8000, 0),
        tx('expense', 2000, -3),
      ],
      now,
    )
    const today = points[6]
    expect(today.income).toBe(85000)
    expect(today.spending).toBe(8000)
    expect(points[3].spending).toBe(2000)
  })
})

describe('formatWeekRange', () => {
  it('renders a human range', () => {
    expect(formatWeekRange(now)).toBe('Aug 6 – Aug 12')
  })
})

describe('percentDelta', () => {
  it('computes a rounded percentage change', () => {
    expect(percentDelta(120, 100)).toBe(20)
    expect(percentDelta(82, 100)).toBe(-18)
  })

  it('returns null when the baseline is zero', () => {
    expect(percentDelta(100, 0)).toBeNull()
  })
})