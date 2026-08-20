import { toISODate } from './stats'
import type { BrainTransaction } from './types'

export type DayPoint = { day: string; label: string; income: number; spending: number }

export type WeekTotals = { income: number; spending: number; events: number }

export function isoDay(now: Date, offsetDays: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() + offsetDays)
  return toISODate(d)
}

export function weekdayLabel(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
}

export function weeklyTotals(transactions: BrainTransaction[], now: Date, weeksAgo = 0): WeekTotals {
  const start = isoDay(now, -weeksAgo * 7 - 6)
  const end = isoDay(now, -weeksAgo * 7)
  let income = 0
  let spending = 0
  let events = 0
  for (const t of transactions) {
    if (t.date < start || t.date > end) continue
    events++
    if (t.type === 'income') income += t.amount
    else spending += t.amount
  }
  return { income, spending, events }
}

export function dailyTotals(transactions: BrainTransaction[], now: Date): DayPoint[] {
  const points: DayPoint[] = []
  for (let offset = -6; offset <= 0; offset++) {
    const day = isoDay(now, offset)
    let income = 0
    let spending = 0
    for (const t of transactions) {
      if (t.date !== day) continue
      if (t.type === 'income') income += t.amount
      else spending += t.amount
    }
    points.push({ day, label: weekdayLabel(day), income, spending })
  }
  return points
}

export function formatWeekRange(now: Date): string {
  const start = new Date(`${isoDay(now, -6)}T12:00:00`)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} \u2013 ${fmt(now)}`
}

export function percentDelta(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return Math.round(((current - previous) / previous) * 100)
}