import { overallConfidence, confidenceTier } from './confidence'
import { generateInsights } from './insights'
import { classifySituation, readSituation, situationSeverity } from './situation'
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
import { stabilize, type Memory } from './stabilize'
import type { BehaviorModel, BrainInput, FinancialState, SignalValue, Situation } from './types'

export type BuildModelOptions = {
  stateMemory?: Memory<FinancialState> | null
  situationMemory?: Memory<Situation> | null
  now?: Date
  minHoldingDays?: number
}

export function buildBehaviorModel(input: BrainInput, opts: BuildModelOptions = {}): BehaviorModel {
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
  const { state: rawState, runwayDays } = classifyState({
    balance,
    dailyEssentialCost,
    upcomingTotal,
  })

  const dates = [
    ...transactions.map((t) => t.date),
    ...commitments.map((c) => c.dueDate),
    ...snapshots.map((s) => s.date),
  ].sort()
  const sampleWindow = dates.length > 0 ? { from: dates[0], to: dates[dates.length - 1] } : null

  const dataPoints = transactions.length + commitments.length + snapshots.length
  const confidence = overallConfidence(signals)

  const model: BehaviorModel = {
    generatedAt: new Date().toISOString(),
    dataPoints,
    confidence: round(confidence, 3),
    confidenceTier: confidenceTier(confidence),
    state: rawState,
    situation: 'STABLE',
    stateDetail: {
      balance,
      runwayDays: Number.isFinite(runwayDays) ? round(runwayDays, 1) : 999,
      dailyEssentialCost,
      upcomingTotal,
    },
    sampleWindow,
    signals: signals as BehaviorModel['signals'],
    activeSignals: Object.entries(signals)
      .filter(([, s]) => s.sampleSize > 0)
      .map(([k]) => k) as BehaviorModel['activeSignals'],
    insights: [],
  }
  model.situation = classifySituation(model)
  model.insights = generateInsights(model)

  if (opts.stateMemory !== undefined || opts.situationMemory !== undefined) {
    const stabilizedState = stabilize({
      candidate: model.state,
      memory: opts.stateMemory ?? null,
      severity: stateSeverity,
      now: opts.now,
      minHoldingDays: opts.minHoldingDays,
    })
    const stabilizedSituation = stabilize({
      candidate: readSituation(model).situation,
      memory: opts.situationMemory ?? null,
      severity: situationSeverity,
      now: opts.now,
      minHoldingDays: opts.minHoldingDays,
      neutral: (s) => s === 'UNKNOWN',
    })
    model.state = stabilizedState.held
    model.situation = stabilizedSituation.held
    model.stateMemory = stabilizedState.memory
    model.situationMemory = stabilizedSituation.memory
    model.stateChanged = stabilizedState.changed
    model.situationChanged = stabilizedSituation.changed
  }

  return model
}

export function stateSeverity(state: FinancialState): number {
  switch (state) {
    case 'EMERGENCY':
      return 0
    case 'SURVIVAL':
      return 1
    case 'RECOVERY':
      return 2
    case 'STABLE':
      return 3
    case 'GROWTH':
      return 4
  }
}
