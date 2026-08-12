import { describe, it, expect } from 'vitest'
import { buildBehaviorModel } from './index'
import { answerQuestion, buildGreeting, formatMoney } from './chat'
import type { ChatContext } from './chat'
import type { BrainCommitment, BrainTransaction } from './types'

function iso(dayOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ctx(overrides: { transactions?: BrainTransaction[]; commitments?: BrainCommitment[]; balance?: number; shortfall?: number } = {}): ChatContext {
  const transactions = overrides.transactions ?? []
  const commitments = overrides.commitments ?? []
  const balance = overrides.balance ?? 75000
  const model = buildBehaviorModel({ transactions, commitments, snapshots: [], balance })
  return {
    name: 'joseph',
    balance,
    safeToSpend: 60000,
    upcomingTotal: 15000,
    shortfall: overrides.shortfall ?? Math.max(0, 15000 - balance),
    model,
    transactions,
  }
}

function history(n: number, fulfilled: number): BrainCommitment[] {
  const commitments: BrainCommitment[] = []
  for (let i = 0; i < n; i++) {
    commitments.push({ id: i, label: 'Cell meeting', amount: 5000, dueDate: iso(-(i + 1) * 7), fulfilled: i < fulfilled })
  }
  return commitments
}

describe('formatMoney', () => {
  it('formats with a UGX prefix and thousands separators', () => {
    expect(formatMoney(10000)).toBe('UGX 10,000')
    expect(formatMoney(0)).toBe('UGX 0')
  })
})

describe('buildGreeting', () => {
  it('mentions the number of records seen and the confidence tier', () => {
    const g = buildGreeting(ctx())
    expect(g).toContain('Joseph')
    expect(g).toContain('records')
  })
})

describe('answerQuestion — affordability', () => {
  it('confirms when the amount fits safe-to-spend', () => {
    const reply = answerQuestion('Can I afford to buy data worth 10,000 today?', ctx())
    expect(reply.text).toContain('fits')
    expect(reply.text).toContain('UGX 60,000')
  })

  it('flags when the amount exceeds safe-to-spend', () => {
    const reply = answerQuestion('Can I buy a phone worth 250,000 today?', ctx())
    expect(reply.text).toContain('above today')
  })

  it('answers with safe-to-spend when no amount is mentioned', () => {
    const reply = answerQuestion('Can I afford lunch today?', ctx())
    expect(reply.text).toContain('UGX 60,000')
  })

  it('does not count the earned amount against itself when asked generically', () => {
    const reply = answerQuestion('Can I afford this today?', ctx())
    expect(reply.text).not.toContain('exceed')
  })

  it('says no when commitments already exceed the balance', () => {
    const reply = answerQuestion('Can I buy data worth 10,000 today?', ctx({ balance: 10000, shortfall: 5000 }))
    expect(reply.text).toContain("not possible right now")
    expect(reply.text).toContain('UGX 5,000')
  })
})

describe('answerQuestion — weekday patterns', () => {
  it('stays honest with sparse data', () => {
    const transactions = [ctx().transactions[0] ?? { id: 1, type: 'expense', amount: 6000, date: iso(0) }]
    const reply = answerQuestion('Why did I overspend on Sunday?', ctx({ transactions }))
    expect(reply.text).toContain('can')
    expect(reply.chart).toBeDefined()
  })

  it('flags a standout day when data is rich', () => {
    const transactions: BrainTransaction[] = []
    for (let d = 0; d < 7; d++) {
      transactions.push({ id: d, type: 'expense', amount: d === 6 ? 24000 : 6000, date: iso(-d) })
    }
    const reply = answerQuestion('Why did I overspend on Sunday?', ctx({ transactions }))
    expect(reply.text).toContain('x')
    expect(reply.text).toContain('UGX 24,000')
    expect(reply.chart).toHaveLength(7)
  })
})

describe('answerQuestion — income timing', () => {
  it('refuses to guess with no income events', () => {
    const reply = answerQuestion('When will I likely get paid next?', ctx())
    expect(reply.text).toContain("won't guess")
  })

  it('references the last recorded income', () => {
    const transactions: BrainTransaction[] = [{ id: 1, type: 'income', amount: 85000, source: 'Freelance', date: iso(-2) }]
    const reply = answerQuestion('When will I get paid next?', ctx({ transactions }))
    expect(reply.text).toContain('2 days ago')
  })

  it('coaches from a confident income regularity', () => {
    const transactions: BrainTransaction[] = []
    for (let i = 0; i < 12; i++) {
      transactions.push({ id: i, type: 'income', amount: 50000, source: 'Freelance', date: iso(-i * 7) })
    }
    const reply = answerQuestion('When will I likely get paid next?', ctx({ transactions }))
    expect(reply.text).toContain('rhythm')
  })
})

describe('answerQuestion — commitments', () => {
  it('asks for outcomes when none recorded', () => {
    const reply = answerQuestion('How is my Cell reliability doing?', ctx())
    expect(reply.text).toContain('Life Events')
  })

  it('reports reliability from evaluated history', () => {
    const reply = answerQuestion('How is my Cell reliability doing?', ctx({ commitments: history(5, 4) }))
    expect(reply.text).toContain('80%')
  })
})

describe('answerQuestion — overview fallback', () => {
  it('summarizes balance, safe-to-spend and state', () => {
    const transactions: BrainTransaction[] = [{ id: 1, type: 'expense', amount: 6000, category: 'food', date: iso(0) }]
    const reply = answerQuestion('How is my money doing?', ctx({ transactions }))
    expect(reply.text).toContain('UGX 75,000')
    expect(reply.text).toContain('UGX 60,000')
    expect(reply.text.toLowerCase()).toContain('stable')
  })
})