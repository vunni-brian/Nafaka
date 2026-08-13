import { describe, it, expect } from 'vitest'
import { buildNotifications, commitmentDueLabel, formatUGX } from './notifications'
import { buildBehaviorModel } from './brain'
import type { BehaviorModel } from './brain/types'
import type { Commitment } from './store'

const emptyModel: BehaviorModel = buildBehaviorModel({
  transactions: [],
  commitments: [],
  snapshots: [],
  balance: 0,
})

const commitment = (over: Partial<Commitment>): Commitment => ({
  id: 1,
  label: 'Cell meeting',
  when: 'Tomorrow',
  amount: 5000,
  status: 'upcoming',
  ...over,
})

describe('buildNotifications', () => {
  it('never fabricates commitment or daily items without data', () => {
    const items = buildNotifications({ commitments: [], behaviorModel: emptyModel, safeToSpend: 0, notificationsOptIn: null })
    expect(items.some((n) => n.kind === 'commitment')).toBe(false)
    expect(items.some((n) => n.kind === 'daily')).toBe(false)
  })

  it('includes only upcoming commitments', () => {
    const commitments = [
      commitment({ id: 1, label: 'Cell meeting', amount: 5000 }),
      commitment({ id: 2, label: 'Sunday offering', when: 'In 3 days', amount: 10000, status: 'fulfilled' }),
      commitment({ id: 3, label: 'Rent', when: 'In 10 days', amount: 150000, status: 'missed' }),
    ]
    const items = buildNotifications({ commitments, behaviorModel: emptyModel, safeToSpend: 0, notificationsOptIn: false })
    const commitmentItems = items.filter((n) => n.kind === 'commitment')
    expect(commitmentItems).toHaveLength(1)
    expect(commitmentItems[0]).toMatchObject({ title: 'Due tomorrow · Cell meeting' })
  })

  it('mentions the daily safe-to-spend when opted in', () => {
    const items = buildNotifications({ commitments: [], behaviorModel: emptyModel, safeToSpend: 12000, notificationsOptIn: true })
    const daily = items.filter((n) => n.kind === 'daily')
    expect(daily).toHaveLength(1)
    expect(daily[0]).toMatchObject({ title: 'Good morning' })
    expect(daily[0].detail).toContain('12,000')
  })

  it('omits the daily message without opt-in', () => {
    const items = buildNotifications({ commitments: [], behaviorModel: emptyModel, safeToSpend: 12000, notificationsOptIn: false })
    expect(items.some((n) => n.kind === 'daily')).toBe(false)
  })
})

describe('commitmentDueLabel', () => {
  it('normalizes tomorrow and today', () => {
    expect(commitmentDueLabel('Tomorrow')).toBe('Due tomorrow')
    expect(commitmentDueLabel('Today, 6 PM')).toBe('Due today')
  })

  it('counts days from date-like strings', () => {
    expect(commitmentDueLabel('In 3 days')).toBe('Due in 3 days')
  })

  it('falls back to a capitalized original', () => {
    expect(commitmentDueLabel('1 week ago')).toBe('Recurring (1 week cycle)')
    expect(commitmentDueLabel('every Friday')).toBe('Every Friday')
  })
})

describe('formatUGX', () => {
  it('formats with thousands separators', () => {
    expect(formatUGX(150000)).toBe('UGX 150,000')
  })
})