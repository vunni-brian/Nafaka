import type { BehaviorModel, SignalValue } from './types'

export const HEALTH_READY_CONFIDENCE = 0.5

export type HealthComponentKey = 'consistency' | 'commitment' | 'savings' | 'debt' | 'resilience'

export type HealthComponent = {
  key: HealthComponentKey
  label: string
  weight: number
  icon: string
  value: number
  confidence: number
  sampleSize: number
  active: boolean
  ready: boolean
}

export type HealthScoreResult = {
  score: number | null
  components: HealthComponent[]
  readyCount: number
  totalCount: number
}

function hasData(s: SignalValue): boolean {
  return s.sampleSize > 0
}

function combine(sources: SignalValue[]): { value: number; confidence: number; sampleSize: number } {
  const present = sources.filter(hasData)
  if (present.length === 0) return { value: 0, confidence: 0, sampleSize: 0 }
  const totalWeight = present.reduce((acc, s) => acc + s.confidence, 0)
  const value = present.reduce((acc, s) => acc + s.value * s.confidence, 0) / totalWeight
  return {
    value,
    confidence: totalWeight / present.length,
    sampleSize: Math.max(...present.map((s) => s.sampleSize)),
  }
}

export function computeHealthScore(model: BehaviorModel): HealthScoreResult {
  const s = model.signals

const consistency = combine([s.incomeRegularity, s.spendingStability])

  const components: HealthComponent[] = [
    {
      key: 'consistency',
      label: 'Consistency',
      weight: 0.25,
      icon: 'TrendingUp',
      value: consistency.value,
      confidence: consistency.confidence,
      sampleSize: consistency.sampleSize,
      active: hasData(consistency as unknown as SignalValue),
      ready: consistency.confidence >= HEALTH_READY_CONFIDENCE,
    },
    {
      key: 'commitment',
      label: 'Commitment reliability',
      weight: 0.25,
      icon: 'ShieldCheck',
      value: s.commitmentReliability.value,
      confidence: s.commitmentReliability.confidence,
      sampleSize: s.commitmentReliability.sampleSize,
      active: hasData(s.commitmentReliability),
      ready: s.commitmentReliability.confidence >= HEALTH_READY_CONFIDENCE,
    },
    {
      key: 'savings',
      label: 'Savings rate',
      weight: 0.2,
      icon: 'PiggyBank',
      value: s.savingsConsistency.value,
      confidence: s.savingsConsistency.confidence,
      sampleSize: s.savingsConsistency.sampleSize,
      active: hasData(s.savingsConsistency),
      ready: s.savingsConsistency.confidence >= HEALTH_READY_CONFIDENCE,
    },
    {
      key: 'debt',
      label: 'Debt management',
      weight: 0.2,
      icon: 'HandCoins',
      value: 100 - s.debtPressure.value,
      confidence: s.debtPressure.confidence,
      sampleSize: s.debtPressure.sampleSize,
      active: hasData(s.debtPressure),
      ready: s.debtPressure.confidence >= HEALTH_READY_CONFIDENCE,
    },
    {
      key: 'resilience',
      label: 'Resilience',
      weight: 0.1,
      icon: 'LifeBuoy',
      value: s.financialResilience.value,
      confidence: s.financialResilience.confidence,
      sampleSize: s.financialResilience.sampleSize,
      active: hasData(s.financialResilience),
      ready: s.financialResilience.confidence >= HEALTH_READY_CONFIDENCE,
    },
  ]

  const ready = components.filter((c) => c.ready)
  const score =
    ready.length === 0
      ? null
      : Math.round(
          ready.reduce((acc, c) => acc + c.value * c.weight, 0) /
            ready.reduce((acc, c) => acc + c.weight, 0),
        )

  return { score, components, readyCount: ready.length, totalCount: components.length }
}