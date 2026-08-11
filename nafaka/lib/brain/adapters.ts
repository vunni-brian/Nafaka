import { addDays, toISODate } from './stats'
import type { BrainCommitment, BrainSnapshot, BrainTransaction } from './types'
import type { Commitment, Transaction, WeeklySnapshot } from '../store'

function dateFromTime(time: string, now: Date): string {
  const lower = time.toLowerCase()
  if (lower.startsWith('today')) return toISODate(now)
  if (lower.startsWith('yesterday')) {
    const d = new Date(now)
    d.setDate(d.getDate() - 1)
    return toISODate(d)
  }
  const d = new Date(now)
  d.setDate(d.getDate() - 2)
  return toISODate(d)
}

function dateFromWhen(when: string, now: Date): string {
  const lower = when.toLowerCase()
  if (lower.startsWith('today')) return toISODate(now)
  if (lower.startsWith('tomorrow')) return addDays(toISODate(now), 1)
  const match = lower.match(/in\s+(\d+)\s+day/)
  if (match) return addDays(toISODate(now), Number(match[1]))
  return addDays(toISODate(now), 7)
}

export function storeTransactionsToBrain(txs: Transaction[], now: Date = new Date()): BrainTransaction[] {
  return txs.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    category: t.category,
    source: t.type === 'income' ? t.label : undefined,
    date: t.recordedAt ? toISODate(new Date(t.recordedAt)) : dateFromTime(t.time, now),
  }))
}

export function storeCommitmentsToBrain(commitments: Commitment[], now: Date = new Date()): BrainCommitment[] {
  return commitments.map((c) => ({
    id: c.id,
    label: c.label,
    amount: c.amount,
    dueDate: dateFromWhen(c.when, now),
    fulfilled: c.status === 'fulfilled' ? true : c.status === 'missed' ? false : null,
  }))
}

export function storeSnapshotsToBrain(snapshots: WeeklySnapshot[]): BrainSnapshot[] {
  return snapshots.map((s) => ({ date: s.date, balance: s.balance }))
}
