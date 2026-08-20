import { daysBetween, round, toISODate } from './stats'
import type { WeekFocus } from './focus'
import type { CoachingOutcome } from './outcomes'

/**
 * Coaching effectiveness: every recommended focus becomes a record; when an
 * attributable outcome becomes measurable the record closes, and per-focus
 * stats (times recommended, times behavior improved, success rate) tell
 * Nafaka which interventions actually change this person's behavior.
 */

export type CoachingRecord = {
  /** `${focusKey}-${recommendedAt}` — stable across re-renders */
  id: string
  focusKey: WeekFocus['key']
  title: string
  /** ISO date the instance started */
  recommendedAt: string
  /** closed instances carry the measured outcome; null = never measurable */
  outcome: CoachingOutcome | null
  /** ISO date the instance closed (measured or abandoned) */
  endedAt: string | null
}

export type CoachingStats = {
  key: WeekFocus['key']
  /** closed instances of this focus */
  recommended: number
  /** closed instances where behavior moved the right way */
  improved: number
  /** instances still open */
  pending: number
  /** improved / recommended, when at least one instance has closed */
  successRate: number | null
}

export const INSTANCE_DAYS = 7

/**
 * One pass that keeps the coaching log consistent with reality:
 * - ends the open instance when the focus moved on (measuring its outcome
 *   if one is attributable, otherwise closing it unmeasured)
 * - closes the open instance once it is at least a week old and an
 *   attributable outcome exists for its focus
 * - opens a new instance for the current focus when none is open
 */
export function syncCoaching(opts: {
  records: CoachingRecord[]
  focus: WeekFocus
  outcomes: CoachingOutcome[]
  now?: Date
  instanceDays?: number
}): { records: CoachingRecord[]; closed: CoachingOutcome[] } {
  const now = opts.now ?? new Date()
  const day = toISODate(now)
  const instanceDays = opts.instanceDays ?? INSTANCE_DAYS
  const records: CoachingRecord[] = opts.records.map((r) => ({ ...r }))
  const closed: CoachingOutcome[] = []

  const last = records[records.length - 1]
  if (last !== undefined && last.outcome === null && last.endedAt === null) {
    const attributable = (key: WeekFocus['key']): CoachingOutcome | null => {
      const o = opts.outcomes.find((c) => c.focusKey === key && c.measured)
      if (o === undefined || o.measuredAt === '') return null
      return o.measuredAt > last.recommendedAt ? o : null
    }

    if (last.focusKey !== opts.focus.key) {
      const outcome = attributable(last.focusKey)
      if (outcome !== null) {
        last.outcome = outcome
        closed.push(outcome)
      }
      last.endedAt = day
    } else {
      const outcome = attributable(last.focusKey)
      const age = daysBetween(last.recommendedAt, day)
      if (outcome !== null && age >= instanceDays) {
        last.outcome = outcome
        last.endedAt = day
        closed.push(outcome)
      }
    }
  }

  const open = records[records.length - 1]
  if (open === undefined || (open.endedAt !== null && open.endedAt !== '')) {
    const id = `${opts.focus.key}-${day}`
    if (!records.some((r) => r.id === id)) {
      records.push({
        id,
        focusKey: opts.focus.key,
        title: opts.focus.title,
        recommendedAt: day,
        outcome: null,
        endedAt: null,
      })
    }
  }

  return { records, closed }
}

export function coachingStats(records: CoachingRecord[]): CoachingStats[] {
  const byKey = new Map<WeekFocus['key'], { recommended: number; improved: number; pending: number }>()
  for (const r of records) {
    if (r.endedAt === null) continue
    const entry = byKey.get(r.focusKey) ?? { recommended: 0, improved: 0, pending: 0 }
    entry.recommended++
    if (r.outcome !== null && r.outcome.improved === true) entry.improved++
    byKey.set(r.focusKey, entry)
  }
  for (const r of records) {
    if (r.endedAt !== null) continue
    const entry = byKey.get(r.focusKey) ?? { recommended: 0, improved: 0, pending: 0 }
    entry.pending++
    byKey.set(r.focusKey, entry)
  }
  return [...byKey.entries()].map(([key, e]) => ({
    key,
    recommended: e.recommended,
    improved: e.improved,
    pending: e.pending,
    successRate: e.recommended > 0 ? round(e.improved / e.recommended, 2) : null,
  }))
}

/** success rates by focus key — feeds adaptive focus ranking */
export function successRatesByKey(stats: CoachingStats[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const s of stats) if (s.successRate !== null) out[s.key] = s.successRate
  return out
}

export function latestClosedOutcome(records: CoachingRecord[]): CoachingOutcome | null {
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].outcome !== null) return records[i].outcome
  }
  return null
}
