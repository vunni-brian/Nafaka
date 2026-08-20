import { clamp } from './stats'
import type { ConfidenceTier, SignalValue } from './types'

export const HALF_LIFES: Record<string, number> = {
  incomeRegularity: 12,
  incomeSourceDependence: 10,
  spendingStability: 14,
  discretionaryShare: 14,
  postIncomeAcceleration: 10,
  savingsConsistency: 8,
  commitmentReliability: 6,
  debtPressure: 10,
  financialResilience: 10,
}

export function confidenceFor(n: number, halfLife: number, spread = 0): number {
  if (n <= 0) return 0
  const base = 1 - Math.exp(-n / halfLife)
  const penalty = clamp(spread, 0, 1)
  return clamp(base * (1 - Math.min(0.6, penalty)), 0, 1)
}

export function confidenceTier(confidence: number): ConfidenceTier {
  if (confidence < 0.2) return 'exploring'
  if (confidence < 0.5) return 'learning'
  if (confidence < 0.8) return 'confident'
  return 'mature'
}

export function overallConfidence(signals: Record<string, SignalValue>): number {
  const active = Object.values(signals).filter((s) => s.sampleSize > 0)
  if (active.length === 0) return 0
  return active.reduce((acc, s) => acc + s.confidence, 0) / active.length
}
