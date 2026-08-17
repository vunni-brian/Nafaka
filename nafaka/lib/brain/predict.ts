import { fmt, type SafeToSpendExplanation } from './safetospend'
import type { BehaviorModel } from './types'

export type PredictionId = 'RUN_SHORT' | 'POST_INCOME_SPIKE' | 'INCOME_BEFORE_BUFFER' | 'COMMITMENTS_COVERED'

export type NafakaPrediction = {
  id: PredictionId
  severity: 'watch' | 'info' | 'all-clear'
  windowDays: number | null
  confidence: number
  evidence: string[]
  reason: string
  generatedAt: string
}

/**
 * Forward-looking statements about what is likely to happen next, each
 * gated by evidence: a prediction is only emitted when the signal it is
 * built from is confident. No evidence → no claim.
 */
export function predict(opts: {
  model: BehaviorModel
  balance: number
  explanation: SafeToSpendExplanation
  now?: Date
}): NafakaPrediction[] {
  const { model, balance, explanation } = opts
  const now = opts.now ?? new Date()
  const generatedAt = now.toISOString()
  const predictions: NafakaPrediction[] = []

  const essential = model.stateDetail.dailyEssentialCost
  const daysToIncome = explanation.daysToNextIncome
  const reg = model.signals.incomeRegularity
  const post = model.signals.postIncomeAcceleration
  const rel = model.signals.commitmentReliability
  const upcoming = model.stateDetail.upcomingTotal

  if (reg.confidence >= 0.5 && essential > 0 && daysToIncome !== null) {
    const coveredDays = balance / essential
    const reason = `Your balance covers roughly ${Math.round(coveredDays)} days of essentials, but your next expected income is about ${daysToIncome} days out.`
    const evidence = [
      `balance ${fmt(balance)}`,
      `daily essentials ${fmt(Math.round(essential))}`,
      `next income ~${daysToIncome} days`,
      `income regularity ${Math.round(reg.value)}% (${reg.sampleSize} events)`,
    ]
    if (coveredDays < daysToIncome) {
      predictions.push({
        id: 'RUN_SHORT',
        severity: 'watch',
        windowDays: daysToIncome,
        confidence: reg.confidence,
        evidence,
        reason: `${reason} Cash may run short before then.`,
        generatedAt,
      })
    } else {
      predictions.push({
        id: 'INCOME_BEFORE_BUFFER',
        severity: 'all-clear',
        windowDays: daysToIncome,
        confidence: reg.confidence,
        evidence,
        reason: `${reason} You are likely to stay covered until income arrives.`,
        generatedAt,
      })
    }
  }

  if (post.confidence >= 0.5 && post.value >= 130 && daysToIncome !== null) {
    predictions.push({
      id: 'POST_INCOME_SPIKE',
      severity: 'watch',
      windowDays: 3,
      confidence: post.confidence,
      evidence: [
        `post-income acceleration ${Math.round(post.value)}% (${post.sampleSize} windows)`,
      ],
      reason: `In the 3 days after a deposit, spending typically runs about ${Math.round(
        post.value,
      )}% of your daily average — watch the window when the next income lands.`,
      generatedAt,
    })
  }

  if (upcoming > 0 && balance >= upcoming) {
    predictions.push({
      id: 'COMMITMENTS_COVERED',
      severity: 'info',
      windowDays: null,
      confidence: rel.confidence > 0 ? rel.confidence : model.confidence,
      evidence: [
        `upcoming commitments ${fmt(upcoming)}`,
        `balance ${fmt(balance)}`,
        rel.sampleSize > 0 ? `commitment reliability ${Math.round(rel.value)}% (${rel.sampleSize} outcomes)` : 'no commitment history yet',
      ],
      reason: `Your balance covers the ${fmt(upcoming)} of commitments on the horizon${
        rel.confidence >= 0.5 && rel.value >= 80 ? ', and your follow-through has been reliable lately' : ''
      }.`,
      generatedAt,
    })
  }

  return predictions
}