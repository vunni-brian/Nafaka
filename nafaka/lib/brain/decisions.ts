import type { WeekFocus } from './focus'
import type { HealthScoreResult } from './health'
import { fmt, type SafeToSpendExplanation } from './safetospend'
import type { BehaviorModel, SignalValue } from './types'

export type DecisionId = 'SAFE_TO_SPEND' | 'WEEKLY_FOCUS' | 'HEALTH_SCORE'

export type DecisionSignal = {
  value: number
  confidence: number
  sampleSize: number
}

export type NafakaDecision = {
  id: DecisionId
  value: string | number | null
  inputs: Record<string, string | number | null>
  signals: Record<string, DecisionSignal>
  confidence: number
  reason: string
  generatedAt: string
}

function signalFor(key: string, s: SignalValue | undefined): DecisionSignal | null {
  if (s === undefined || s.sampleSize === 0) return null
  return { value: Math.round(s.value), confidence: Math.round(s.confidence * 100), sampleSize: s.sampleSize }
}

export function safeToSpendDecision(opts: {
  model: BehaviorModel
  balance: number
  safeToSpend: number
  explanation: SafeToSpendExplanation
  now?: Date
}): NafakaDecision {
  const { model, balance, safeToSpend, explanation } = opts
  const reasonParts: string[] = []
  if (explanation.daysToNextIncome !== null) {
    reasonParts.push(`${explanation.daysToNextIncome} days to next expected income`)
  } else {
    reasonParts.push('income timing still unclear')
  }
  if (explanation.commitmentsBeforeNext > 0) {
    reasonParts.push(`${fmt(explanation.commitmentsBeforeNext)} of commitments due before then`)
  }
  if (explanation.pacePerDay !== null) {
    reasonParts.push(`${fmt(explanation.pacePerDay)}/day keeps the user on track`)
  }
  reasonParts.push(`available cash ${fmt(balance)}`)

  const signals: Record<string, DecisionSignal> = {}
  const add = (key: string, s: SignalValue | undefined) => {
    const sig = signalFor(key, s)
    if (sig) signals[key] = sig
  }
  add('incomeRegularity', model.signals.incomeRegularity)
  add('commitmentReliability', model.signals.commitmentReliability)
  add('postIncomeAcceleration', model.signals.postIncomeAcceleration)

  return {
    id: 'SAFE_TO_SPEND',
    value: Math.round(safeToSpend),
    inputs: {
      nextIncomeDays: explanation.daysToNextIncome,
      commitmentsBeforeIncome: Math.round(explanation.commitmentsBeforeNext),
      availableCash: Math.round(balance),
      dailyPace: explanation.pacePerDay,
      pendingCommitments: Math.round(model.stateDetail.upcomingTotal),
    },
    signals,
    confidence: model.confidence,
    reason: reasonParts.join('; ') + '.',
    generatedAt: (opts.now ?? new Date()).toISOString(),
  }
}

export function weeklyFocusDecision(opts: {
  model: BehaviorModel
  focus: WeekFocus
  now?: Date
}): NafakaDecision {
  const { model, focus } = opts
  const signals: Record<string, DecisionSignal> = {}
  if (focus.key !== 'state' && focus.key !== 'record') {
    const sig = signalFor(focus.key, model.signals[focus.key])
    if (sig) signals[focus.key] = sig
  }

  return {
    id: 'WEEKLY_FOCUS',
    value: focus.key,
    inputs: {
      state: model.state,
      runwayDays: model.stateDetail.runwayDays < 999 ? Math.round(model.stateDetail.runwayDays) : 'long',
      upcomingTotal: Math.round(model.stateDetail.upcomingTotal),
    },
    signals,
    confidence: model.confidence,
    reason: `${focus.title} — ${focus.body}`,
    generatedAt: (opts.now ?? new Date()).toISOString(),
  }
}

export function healthScoreDecision(opts: {
  model: BehaviorModel
  health: HealthScoreResult
  now?: Date
}): NafakaDecision {
  const { model, health } = opts
  const signals: Record<string, DecisionSignal> = {}
  for (const c of health.components) {
    if (c.active) signals[c.key] = { value: Math.round(c.value), confidence: Math.round(c.confidence * 100), sampleSize: c.sampleSize }
  }
  const weakest = [...health.components].filter((c) => c.ready).sort((a, b) => a.value - b.value)[0]

  return {
    id: 'HEALTH_SCORE',
    value: health.score,
    inputs: {
      readyComponents: health.readyCount,
      totalComponents: health.totalCount,
      weakestComponent: weakest?.label ?? null,
      weakestValue: weakest ? Math.round(weakest.value) : null,
    },
    signals,
    confidence: model.confidence,
    reason:
      health.score === null
        ? 'No component is confident enough to score yet — still learning.'
        : `Score of ${health.score} from ${health.readyCount} confident component${
            health.readyCount === 1 ? '' : 's'
          }${weakest ? `; weakest is ${weakest.label.toLowerCase()} (${Math.round(weakest.value)}).` : ''}`,
    generatedAt: (opts.now ?? new Date()).toISOString(),
  }
}

export function buildDecisionLog(opts: {
  model: BehaviorModel
  balance: number
  safeToSpend: number
  health: HealthScoreResult
  focus: WeekFocus
  explanation: SafeToSpendExplanation
  now?: Date
}): NafakaDecision[] {
  return [
    safeToSpendDecision(opts),
    healthScoreDecision(opts),
    weeklyFocusDecision(opts),
  ]
}