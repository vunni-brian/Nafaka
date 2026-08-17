import { describe, it, expect } from 'vitest'
import { coachingStats, latestClosedOutcome, successRatesByKey, syncCoaching, type CoachingRecord } from './coaching'
import type { WeekFocus } from './focus'
import type { CoachingOutcome } from './outcomes'

const DAY = (d: number) => new Date(`2026-01-${String(d).padStart(2, '0')}T12:00:00`)

function outcome(focusKey: WeekFocus['key'], measuredAt: string, improved: boolean): CoachingOutcome {
  return {
    focusKey,
    measured: true,
    metric: 'post-income 72h spending',
    before: 85000,
    after: 51000,
    deltaPct: -40,
    improved,
    text: 'You spent UGX 51,000 in the 72 hours after your last deposit, vs your usual UGX 85,000.',
    measuredAt,
    sampleSize: 7,
  }
}

function focus(key: WeekFocus['key']): WeekFocus {
  return { key, title: key, body: 'Focus body' }
}

describe('syncCoaching', () => {
  it('opens an instance for the current focus when none exists', () => {
    const { records } = syncCoaching({ records: [], focus: focus('postIncomeAcceleration'), outcomes: [], now: DAY(1) })
    expect(records).toHaveLength(1)
    expect(records[0].focusKey).toBe('postIncomeAcceleration')
    expect(records[0].recommendedAt).toBe('2026-01-01')
    expect(records[0].endedAt).toBeNull()
  })

  it('is idempotent — repeated passes do not duplicate the open instance', () => {
    const once = syncCoaching({ records: [], focus: focus('postIncomeAcceleration'), outcomes: [], now: DAY(1) })
    const twice = syncCoaching({ records: once.records, focus: focus('postIncomeAcceleration'), outcomes: [], now: DAY(1) })
    expect(twice.records).toHaveLength(1)
    expect(twice.records[0].id).toBe(once.records[0].id)
  })

  it('holds the open instance until a week passes with an attributable outcome', () => {
    const first = syncCoaching({ records: [], focus: focus('postIncomeAcceleration'), outcomes: [], now: DAY(1) })
    const mid = syncCoaching({
      records: first.records,
      focus: focus('postIncomeAcceleration'),
      outcomes: [outcome('postIncomeAcceleration', '2026-01-05', true)],
      now: DAY(3),
    })
    expect(mid.records[0].endedAt).toBeNull()
    expect(mid.records[0].outcome).toBeNull()

    const week = syncCoaching({
      records: mid.records,
      focus: focus('postIncomeAcceleration'),
      outcomes: [outcome('postIncomeAcceleration', '2026-01-05', true)],
      now: DAY(8),
    })
    expect(week.records[0].endedAt).toBe('2026-01-08')
    expect(week.records[0].outcome?.improved).toBe(true)
    expect(week.closed).toHaveLength(1)
  })

  it('ignores outcomes that predate the recommendation (not attributable)', () => {
    const first = syncCoaching({ records: [], focus: focus('postIncomeAcceleration'), outcomes: [], now: DAY(8) })
    // outcome window ended before the instance started
    const result = syncCoaching({
      records: first.records,
      focus: focus('postIncomeAcceleration'),
      outcomes: [outcome('postIncomeAcceleration', '2026-01-01', true)],
      now: DAY(15),
    })
    expect(result.records[0].endedAt).toBeNull()
  })

  it('opens a fresh instance once the previous one closes', () => {
    const first = syncCoaching({ records: [], focus: focus('postIncomeAcceleration'), outcomes: [], now: DAY(1) })
    const week = syncCoaching({
      records: first.records,
      focus: focus('postIncomeAcceleration'),
      outcomes: [outcome('postIncomeAcceleration', '2026-01-05', true)],
      now: DAY(8),
    })
    const fresh = syncCoaching({
      records: week.records,
      focus: focus('postIncomeAcceleration'),
      outcomes: [outcome('postIncomeAcceleration', '2026-01-12', false)],
      now: DAY(8),
    })
    expect(fresh.records).toHaveLength(2)
    expect(fresh.records[1].outcome).toBeNull()
    expect(fresh.records[1].id).toBe('postIncomeAcceleration-2026-01-08')
  })

  it('measures the old focus when the focus moves on, then opens the new one', () => {
    const first = syncCoaching({ records: [], focus: focus('postIncomeAcceleration'), outcomes: [], now: DAY(1) })
    const moved = syncCoaching({
      records: first.records,
      focus: focus('savingsConsistency'),
      outcomes: [outcome('postIncomeAcceleration', '2026-01-05', true)],
      now: DAY(8),
    })
    expect(moved.records[0].endedAt).toBe('2026-01-08')
    expect(moved.records[0].outcome?.improved).toBe(true)
    expect(moved.records[1].focusKey).toBe('savingsConsistency')
    expect(moved.records[1].endedAt).toBeNull()
  })

  it('closes the old focus unmeasured when it moves on without a result', () => {
    const first = syncCoaching({ records: [], focus: focus('record'), outcomes: [], now: DAY(1) })
    const moved = syncCoaching({ records: first.records, focus: focus('savingsConsistency'), outcomes: [], now: DAY(8) })
    expect(moved.records[0].endedAt).toBe('2026-01-08')
    expect(moved.records[0].outcome).toBeNull()
    expect(moved.records[1].focusKey).toBe('savingsConsistency')
  })
})

describe('coachingStats', () => {
  const record = (key: string, improved: boolean | null, ended: boolean): CoachingRecord => ({
    id: `${key}-${Math.random()}`,
    focusKey: key as WeekFocus['key'],
    title: key,
    recommendedAt: '2026-01-01',
    outcome: improved === null ? null : outcome(key as WeekFocus['key'], '2026-01-08', improved),
    endedAt: ended ? '2026-01-08' : null,
  })

  it('counts recommendations, improvements and success rates per focus', () => {
    const records: CoachingRecord[] = [
      record('postIncomeAcceleration', true, true),
      record('postIncomeAcceleration', false, true),
      record('postIncomeAcceleration', null, false),
      record('savingsConsistency', true, true),
    ]
    const stats = coachingStats(records)
    const post = stats.find((s) => s.key === 'postIncomeAcceleration')
    const savings = stats.find((s) => s.key === 'savingsConsistency')

    expect(post?.recommended).toBe(2)
    expect(post?.improved).toBe(1)
    expect(post?.pending).toBe(1)
    expect(post?.successRate).toBe(0.5)
    expect(savings?.recommended).toBe(1)
    expect(savings?.improved).toBe(1)
    expect(savings?.successRate).toBe(1)
  })

  it('reports no success rate until an instance closes', () => {
    const stats = coachingStats([record('postIncomeAcceleration', null, false)])
    expect(stats[0].successRate).toBeNull()
    expect(stats[0].pending).toBe(1)
  })

  it('maps measured success rates by key for adaptive ranking', () => {
    const records: CoachingRecord[] = [
      record('postIncomeAcceleration', true, true),
      record('savingsConsistency', false, true),
    ]
    const rates = successRatesByKey(coachingStats(records))
    expect(rates.postIncomeAcceleration).toBe(1)
    expect(rates.savingsConsistency).toBe(0)
    expect(rates.commitmentReliability).toBeUndefined()
  })

  it('finds the most recently closed outcome', () => {
    const records: CoachingRecord[] = [
      record('postIncomeAcceleration', true, true),
      record('savingsConsistency', null, false),
    ]
    expect(latestClosedOutcome(records)?.focusKey).toBe('postIncomeAcceleration')
    expect(latestClosedOutcome([record('savingsConsistency', null, false)])).toBeNull()
  })
})