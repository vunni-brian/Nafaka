import { describe, it, expect } from 'vitest'
import { storeCommitmentsToBrain, storeTransactionsToBrain } from './adapters'
import type { Commitment, Transaction } from '../store'

const now = new Date('2026-08-12T12:00:00')

describe('storeTransactionsToBrain', () => {
  it('parses today and yesterday', () => {
    const txs: Transaction[] = [
      { id: 1, type: 'income', amount: 85000, label: 'Freelance payment', time: 'Today, 9:12 AM' },
      { id: 2, type: 'expense', amount: 6000, label: 'Rolex & chapati', time: 'Yesterday, 7:15 AM' },
    ]
    const brain = storeTransactionsToBrain(txs, now)
    expect(brain[0].date).toBe('2026-08-12')
    expect(brain[1].date).toBe('2026-08-11')
  })

  it('parses N days ago and N weeks ago', () => {
    const txs: Transaction[] = [
      { id: 1, type: 'expense', amount: 4000, label: 'Boda', time: '3 days ago' },
      { id: 2, type: 'expense', amount: 8000, label: 'Groceries', time: '2 weeks ago' },
    ]
    const brain = storeTransactionsToBrain(txs, now)
    expect(brain[0].date).toBe('2026-08-09')
    expect(brain[1].date).toBe('2026-07-29')
  })

  it('prefers recordedAt over the display string', () => {
    const txs: Transaction[] = [
      { id: 1, type: 'income', amount: 10000, label: 'Top-up', time: 'Yesterday, 5:00 PM', recordedAt: '2026-07-01T08:00:00.000Z' },
    ]
    const brain = storeTransactionsToBrain(txs, now)
    expect(brain[0].date).toBe('2026-07-01')
  })
})

describe('storeCommitmentsToBrain', () => {
  it('parses relative when strings in both directions', () => {
    const commitments: Commitment[] = [
      { id: 1, label: 'Cell meeting', when: 'Tomorrow', amount: 5000, status: 'upcoming' },
      { id: 2, label: 'Sunday offering', when: 'In 3 days', amount: 10000, status: 'upcoming' },
      { id: 3, label: 'Cell meeting', when: '1 week ago', amount: 5000, status: 'fulfilled' },
      { id: 4, label: 'Debt repayment', when: '4 weeks ago', amount: 15000, status: 'missed' },
    ]
    const brain = storeCommitmentsToBrain(commitments, now)
    expect(brain[0].dueDate).toBe('2026-08-13')
    expect(brain[1].dueDate).toBe('2026-08-15')
    expect(brain[2].dueDate).toBe('2026-08-05')
    expect(brain[3].dueDate).toBe('2026-07-15')
  })

  it('maps status to fulfilled state', () => {
    const commitments: Commitment[] = [
      { id: 1, label: 'Cell meeting', when: '1 week ago', amount: 5000, status: 'fulfilled' },
      { id: 2, label: 'Offering', when: '2 weeks ago', amount: 10000, status: 'missed' },
      { id: 3, label: 'Rent', when: 'In 2 days', amount: 50000, status: 'upcoming' },
    ]
    const brain = storeCommitmentsToBrain(commitments, now)
    expect(brain[0].fulfilled).toBe(true)
    expect(brain[1].fulfilled).toBe(false)
    expect(brain[2].fulfilled).toBeNull()
  })
})
