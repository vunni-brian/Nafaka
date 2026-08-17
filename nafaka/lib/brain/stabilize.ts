import { daysBetween, toISODate } from './stats'
import type { Memory } from './types'

export type { Memory }

/**
 * Hysteresis for state reads: worsening moves apply immediately (safety
 * first), but improvements only stick after the better read has been
 * observed on `minHoldingDays` distinct days. This stops the whiplash of
 * "stable Monday, under pressure Tuesday, recovering Wednesday".
 */

export type StabilizeResult<T extends string> = {
  held: T
  changed: boolean
  memory: Memory<T>
}

export type StabilizeOptions<T extends string> = {
  candidate: T
  memory: Memory<T> | null
  /** ordering, lower = worse; used only to detect worsening vs improving */
  severity: (value: T) => number
  now?: Date
  minHoldingDays?: number
  /** candidates that never take over a real held read (e.g. UNKNOWN) */
  neutral?: (value: T) => boolean
}

export function stabilize<T extends string>(opts: StabilizeOptions<T>): StabilizeResult<T> {
  const { candidate, severity, now = new Date(), minHoldingDays = 3, neutral } = opts
  const day = toISODate(now)

  if (opts.memory === null) {
    const memory: Memory<T> = {
      held: candidate,
      holdingSince: day,
      candidate,
      candidateFirstSeen: day,
      candidateLastSeen: day,
    }
    return { held: candidate, changed: true, memory }
  }

  const m = opts.memory

  if (candidate === m.held) {
    const memory: Memory<T> = {
      ...m,
      candidate,
      candidateLastSeen: day,
      candidateFirstSeen: m.candidateFirstSeen ?? day,
    }
    return { held: m.held, changed: false, memory }
  }

  const neutralCandidate = neutral !== undefined && neutral(candidate)
  if (neutralCandidate) {
    const memory: Memory<T> = { ...m, candidate, candidateLastSeen: day, candidateFirstSeen: null }
    return { held: m.held, changed: false, memory }
  }

  const worsening = severity(candidate) < severity(m.held)
  const sameSeverity = severity(candidate) === severity(m.held)

  if (worsening || sameSeverity) {
    const memory: Memory<T> = {
      held: candidate,
      holdingSince: day,
      candidate,
      candidateFirstSeen: day,
      candidateLastSeen: day,
    }
    return { held: candidate, changed: true, memory }
  }

  // improvement: only sticks after the candidate has been observed on
  // minHoldingDays distinct days. A fresh candidate starts a fresh streak.
  const continuing = m.candidate === candidate
  const firstSeen = continuing ? m.candidateFirstSeen ?? day : day
  const streakDays = daysBetween(firstSeen, day) + 1

  if (streakDays >= minHoldingDays) {
    const memory: Memory<T> = {
      held: candidate,
      holdingSince: day,
      candidate,
      candidateFirstSeen: day,
      candidateLastSeen: day,
    }
    return { held: candidate, changed: true, memory }
  }

  const memory: Memory<T> = { ...m, candidate, candidateFirstSeen: firstSeen, candidateLastSeen: day }
  return { held: m.held, changed: false, memory }
}
