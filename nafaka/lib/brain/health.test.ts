import { describe, it, expect } from 'vitest'
import { buildBehaviorModel } from './index'
import { computeHealthScore, HEALTH_READY_CONFIDENCE } from './health'
import type { BrainCommitment, BrainSnapshot, BrainTransaction } from './types'

function iso(dayOffset: number): string {
  const d = new Date('2026-01-01T12:00:00')
  d.setDate(d.getDate() + dayOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function snapshots(n: number): BrainSnapshot[] {
  return Array.from({ length: n }, (_, i) => ({
    date: iso(-(n - i) * 7 + 7),
    balance: 60000 + i * 3000,
  }))
}

function commitmentHistory(n: number, fulfilled: number): BrainCommitment[] {
  const commitments: BrainCommitment[] = []
  for (let i = 0; i < n; i++) {
    commitments.push({
      id: i,
      label: 'Cell meeting',
      amount: 5000,
      dueDate: iso(-(i + 1) * 7),
      fulfilled: i < fulfilled ? true : false,
    })
  }
  return commitments
}

function fullyConfidentModel() {
  const transactions: BrainTransaction[] = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    type: 'income',
    amount: 100000,
    source: 'Freelance',
    date: iso(-i * 2),
  }))
  return buildBehaviorModel({
    transactions,
    commitments: [],
    snapshots: [],
    balance: 100000,
  })
}

describe('computeHealthScore', () => {
  it('returns null score when no component is confident', () => {
    const model = buildBehaviorModel({
      transactions: [{ id: 1, type: 'income', amount: 85000, source: 'Freelance', date: iso(0) }],
      commitments: [],
      snapshots: [],
      balance: 85000,
    })
    const health = computeHealthScore(model)
    expect(health.score).toBeNull()
    expect(health.readyCount).toBe(0)
  })

  it('weighs confident components and rounds', () => {
    const model = buildBehaviorModel({
      transactions: [],
      commitments: commitmentHistory(5, 4),
      snapshots: snapshots(7),
      balance: 80000,
    })
    const health = computeHealthScore(model)
    expect(health.score).not.toBeNull()
    expect(health.readyCount).toBe(2)

    const commitment = health.components.find((c) => c.key === 'commitment')
    const savings = health.components.find((c) => c.key === 'savings')
    expect(commitment?.ready).toBe(true)
    expect(commitment?.value).toBe(80)
    expect(savings?.ready).toBe(true)
    expect(savings?.value).toBe(100)

    const expected = Math.round((80 * 0.25 + 100 * 0.2) / (0.25 + 0.2))
    expect(health.score).toBe(expected)
  })

  it('marks active-but-unconfident components as learning', () => {
    const health = computeHealthScore(fullyConfidentModel())
    const consistency = health.components.find((c) => c.key === 'consistency')
    expect(consistency?.active).toBe(true)
    expect(consistency?.ready).toBe(false)
    expect(consistency?.sampleSize).toBeGreaterThan(0)
  })

  it('exposes the ready threshold', () => {
    expect(HEALTH_READY_CONFIDENCE).toBe(0.5)
  })

  it('derives debt management from debt pressure', () => {
    const model = buildBehaviorModel({
      transactions: [
        { id: 1, type: 'income', amount: 100000, source: 'Freelance', date: iso(0) },
        { id: 2, type: 'expense', amount: 20000, category: 'debt', date: iso(1) },
      ],
      commitments: [],
      snapshots: [],
      balance: 80000,
    })
    const health = computeHealthScore(model)
    const debt = health.components.find((c) => c.key === 'debt')
    expect(debt?.value).toBe(80)
  })

  it('keeps weights summing to 1', () => {
    const health = computeHealthScore(fullyConfidentModel())
    const total = health.components.reduce((acc, c) => acc + c.weight, 0)
    expect(Math.abs(total - 1)).toBeLessThan(0.001)
  })
})