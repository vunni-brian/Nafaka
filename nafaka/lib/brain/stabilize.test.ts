import { describe, it, expect } from 'vitest'
import { stabilize, type StabilizeResult } from './stabilize'
import { situationSeverity } from './situation'
import { stateSeverity } from './index'
import type { Memory, Situation } from './types'

const SEVERITY = situationSeverity
const DAY = (d: number) => new Date(`2026-01-${String(d).padStart(2, '0')}T12:00:00`)

function held(memory: Memory<Situation>): Situation {
  return memory.held
}

describe('stabilize', () => {
  it('applies the first read immediately', () => {
    const r = stabilize({ candidate: 'STABLE', memory: null, severity: SEVERITY, now: DAY(1) })
    expect(r.held).toBe('STABLE')
    expect(r.changed).toBe(true)
    expect(r.memory.holdingSince).toBe('2026-01-01')
  })

  it('applies worsening moves immediately', () => {
    const first = stabilize({ candidate: 'STABLE', memory: null, severity: SEVERITY, now: DAY(1) })
    const r = stabilize({ candidate: 'INCOME_UNCERTAIN', memory: first.memory, severity: SEVERITY, now: DAY(1) })
    expect(r.held).toBe('INCOME_UNCERTAIN')
    expect(r.changed).toBe(true)
  })

  it('applies a second worsening move immediately the next day', () => {
    const first = stabilize({ candidate: 'INCOME_UNCERTAIN', memory: null, severity: SEVERITY, now: DAY(1) })
    const r = stabilize({ candidate: 'UNDER_PRESSURE', memory: first.memory, severity: SEVERITY, now: DAY(2) })
    expect(r.held).toBe('UNDER_PRESSURE')
    expect(r.changed).toBe(true)
  })

  it('holds improvements until the better read persists across days', () => {
    const first = stabilize({ candidate: 'UNDER_PRESSURE', memory: null, severity: SEVERITY, now: DAY(1) })

    const day2 = stabilize({ candidate: 'RECOVERING', memory: first.memory, severity: SEVERITY, now: DAY(2) })
    expect(held(day2.memory)).toBe('UNDER_PRESSURE')
    expect(day2.changed).toBe(false)

    const day3 = stabilize({ candidate: 'RECOVERING', memory: day2.memory, severity: SEVERITY, now: DAY(3) })
    expect(held(day3.memory)).toBe('UNDER_PRESSURE')

    const day4 = stabilize({ candidate: 'RECOVERING', memory: day3.memory, severity: SEVERITY, now: DAY(4) })
    expect(held(day4.memory)).toBe('RECOVERING')
    expect(day4.changed).toBe(true)
  })

  it('resets the improvement streak when the read falls back', () => {
    const first = stabilize({ candidate: 'UNDER_PRESSURE', memory: null, severity: SEVERITY, now: DAY(1) })
    const day2 = stabilize({ candidate: 'RECOVERING', memory: first.memory, severity: SEVERITY, now: DAY(2) })
    const day3 = stabilize({ candidate: 'UNDER_PRESSURE', memory: day2.memory, severity: SEVERITY, now: DAY(3) })
    expect(held(day3.memory)).toBe('UNDER_PRESSURE')

    const day4 = stabilize({ candidate: 'RECOVERING', memory: day3.memory, severity: SEVERITY, now: DAY(4) })
    const day5 = stabilize({ candidate: 'RECOVERING', memory: day4.memory, severity: SEVERITY, now: DAY(5) })
    // streak restarted on day 4, so day 5 is only the second observation
    expect(held(day5.memory)).toBe('UNDER_PRESSURE')

    const day6 = stabilize({ candidate: 'RECOVERING', memory: day5.memory, severity: SEVERITY, now: DAY(6) })
    expect(held(day6.memory)).toBe('RECOVERING')
  })

  it('never flips on daily flicker between calm and pressure', () => {
    let state: StabilizeResult<Situation> = stabilize({ candidate: 'STABLE', memory: null, severity: SEVERITY, now: DAY(1) })
    for (const day of [2, 3, 4, 5, 6, 7]) {
      const candidate: Situation = day % 2 === 0 ? 'UNDER_PRESSURE' : 'STABLE'
      state = stabilize({ candidate, memory: state.memory, severity: SEVERITY, now: DAY(day) })
    }
    expect(held(state.memory)).toBe('UNDER_PRESSURE')
  })

  it('ignores neutral reads and keeps the held situation', () => {
    const first = stabilize({ candidate: 'STABLE', memory: null, severity: SEVERITY, now: DAY(1) })
    const r = stabilize({
      candidate: 'UNKNOWN',
      memory: first.memory,
      severity: SEVERITY,
      now: DAY(2),
      neutral: (s) => s === 'UNKNOWN',
    })
    expect(held(r.memory)).toBe('STABLE')
    expect(r.changed).toBe(false)
  })

  it('does not downgrade to unknown when evidence vanishes', () => {
    const first = stabilize({ candidate: 'BUILDING_BUFFER', memory: null, severity: SEVERITY, now: DAY(1) })
    const r = stabilize({
      candidate: 'UNKNOWN',
      memory: first.memory,
      severity: SEVERITY,
      now: DAY(2),
      neutral: (s) => s === 'UNKNOWN',
    })
    expect(held(r.memory)).toBe('BUILDING_BUFFER')
  })

  it('treats lateral moves (same severity) as immediate', () => {
    const sev = () => 1
    const first = stabilize({ candidate: 'A', memory: null, severity: sev, now: DAY(1) })
    const r = stabilize({ candidate: 'B', memory: first.memory, severity: sev, now: DAY(1) })
    expect(r.held).toBe('B')
    expect(r.changed).toBe(true)
  })

  it('honors a custom holding period', () => {
    const first = stabilize({ candidate: 'UNDER_PRESSURE', memory: null, severity: SEVERITY, now: DAY(1) })
    const day2 = stabilize({ candidate: 'RECOVERING', memory: first.memory, severity: SEVERITY, now: DAY(2), minHoldingDays: 5 })
    const day3 = stabilize({ candidate: 'RECOVERING', memory: day2.memory, severity: SEVERITY, now: DAY(3), minHoldingDays: 5 })
    const day4 = stabilize({ candidate: 'RECOVERING', memory: day3.memory, severity: SEVERITY, now: DAY(4), minHoldingDays: 5 })
    const day5 = stabilize({ candidate: 'RECOVERING', memory: day4.memory, severity: SEVERITY, now: DAY(5), minHoldingDays: 5 })
    const day6 = stabilize({ candidate: 'RECOVERING', memory: day5.memory, severity: SEVERITY, now: DAY(6), minHoldingDays: 5 })
    expect(held(day6.memory)).toBe('RECOVERING')
  })
})

describe('severity orderings', () => {
  it('orders financial states worst to best', () => {
    expect(stateSeverity('EMERGENCY')).toBeLessThan(stateSeverity('SURVIVAL'))
    expect(stateSeverity('SURVIVAL')).toBeLessThan(stateSeverity('RECOVERY'))
    expect(stateSeverity('RECOVERY')).toBeLessThan(stateSeverity('STABLE'))
    expect(stateSeverity('STABLE')).toBeLessThan(stateSeverity('GROWTH'))
  })

  it('orders situations worst to best', () => {
    expect(SEVERITY('EMERGENCY')).toBeLessThan(SEVERITY('UNDER_PRESSURE'))
    expect(SEVERITY('UNDER_PRESSURE')).toBeLessThan(SEVERITY('INCOME_UNCERTAIN'))
    expect(SEVERITY('INCOME_UNCERTAIN')).toBeLessThan(SEVERITY('COMMITMENT_HEAVY'))
    expect(SEVERITY('COMMITMENT_HEAVY')).toBeLessThan(SEVERITY('RECOVERING'))
    expect(SEVERITY('RECOVERING')).toBeLessThan(SEVERITY('STABLE'))
    expect(SEVERITY('STABLE')).toBeLessThan(SEVERITY('CASH_RICH'))
  })
})
