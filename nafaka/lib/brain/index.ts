import { overallConfidence, confidenceTier } from './confidence'
import { generateInsights } from './insights'
import {
  commitmentReliabilitySignal,
  debtPressureSignal,
  discretionaryShareSignal,
  essentialCostPerDay,
  financialResilienceSignal,
  incomeRegularitySignal,
  incomeSourceDependenceSignal,
  postIncomeAccelerationSignal,
  savingsConsistencySignal,
  spendingStabilitySignal,
} from './signals'
import { classifyState } from './state'
import { round, sum } from './stats'
import type { BehaviorModel, BrainInput, SignalValue } from './types'

export function buildBehaviorModel(input: BrainInput): BehaviorModel {
  const { transactions, commitments, snapshots, balance } = input

  const signals: Record<string, SignalValue> = {
    incomeRegularity: incomeRegularitySignal(transactions),
    incomeSourceDependence: incomeSourceDependenceSignal(transactions),
    spendingStability: spendingStabilitySignal(transactions),
    discretionaryShare: discretionaryShareSignal(transactions),
    postIncomeAcceleration: postIncomeAccelerationSignal(transactions),
    savingsConsistency: savingsConsistencySignal(snapshots),
    commitmentReliability: commitmentReliabilitySignal(commitments),
    debtPressure: debtPressureSignal(transactions),
    financialResilience: financialResilienceSignal(transactions, balance),
  }

  const dailyEssentialCost = round(essentialCostPerDay(transactions))
  const upcomingTotal = round(sum(commitments.filter((c) => c.fulfilled === null).map((c) => c.amount)))
  const { state, runwayDays } = classifyState({
    balance,
    dailyEssentialCost,
    upcomingTotal,
  })

  const dataPoints = transactions.length + commitments.length + snapshots.length
  const confidence = overallConfidence(signals)

  const model: BehaviorModel = {
    generatedAt: new Date().toISOString(),
    dataPoints,
    confidence: round(confidence, 3),
    confidenceTier: confidenceTier(confidence),
    state,
    stateDetail: {
      runwayDays: Number.isFinite(runwayDays) ? round(runwayDays, 1) : 999,
      dailyEssentialCost,
      upcomingTotal,
    },
    signals: signals as BehaviorModel['signals'],
    activeSignals: Object.entries(signals)
      .filter(([, s]) => s.sampleSize > 0)
      .map(([k]) => k) as BehaviorModel['activeSignals'],
    insights: [],
  }
  model.insights = generateInsights(model)
  return model
}
