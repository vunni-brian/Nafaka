import type { ChatContext } from './chat'
import type { BehaviorSignalKey } from './types'
import type { Commitment } from '../store'

const SIGNALS = [
  'incomeRegularity',
  'incomeSourceDependence',
  'spendingStability',
  'discretionaryShare',
  'postIncomeAcceleration',
  'savingsConsistency',
  'commitmentReliability',
  'debtPressure',
  'financialResilience',
] as const satisfies readonly BehaviorSignalKey[]

const SEVERITY_RANK = { action: 2, watch: 1, info: 0 } as const
const PERSONAL_PATTERNS = [/\+?[0-9]{7,}\b/g, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi] as const

/** Strip personal identifiers and person-specific prefixes from user labels before LLM serialization. */
export function sanitizeLabel(label: string, maxLength = 24): string {
  let out = label.trim()
  for (const pattern of PERSONAL_PATTERNS) out = out.replace(pattern, '')
  out = out.replace(/\s{2,}/g, ' ').trim()
  out = out.split(/(?:^|\s+)(?:for|via)\b/i)[0].trim()
  if (out.length > maxLength) out = `${out.slice(0, maxLength - 1)}…`
  return out
}

export function buildLlmContext(ctx: ChatContext, commitments: Commitment[]) {
  const signals: Record<string, { value: number; confidence: number; sampleSize: number }> = {}
  for (const key of SIGNALS) {
    const s = ctx.model.signals[key]
    if (s && s.sampleSize > 0) signals[key] = { value: Math.round(s.value), confidence: Math.round(s.confidence * 100), sampleSize: s.sampleSize }
  }
  const recentTransactions = [...ctx.transactions].sort((a, b) => a.date.localeCompare(b.date)).slice(-8).map((t) => ({ kind: t.type, amount: Math.round(t.amount), label: sanitizeLabel(t.source ?? t.category ?? ''), date: t.date }))
  const upcomingCommitments = commitments.filter((c) => c.status === 'upcoming').slice(0, 5).map((c) => ({ label: sanitizeLabel(c.label), amount: Math.round(c.amount), when: c.when }))
  const insights = [...ctx.model.insights].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]).slice(0, 6).map((i) => i.text)
  const decisions = ctx.decisionLog.map((d) => ({ decision: d.id, value: d.value, inputs: d.inputs, signals: d.signals, confidence: Math.round(d.confidence * 100), reason: d.reason }))
  const predictions = ctx.predictions.map((p) => ({ id: p.id, severity: p.severity, windowDays: p.windowDays, confidence: Math.round(p.confidence * 100), evidence: p.evidence, reason: p.reason }))
  const coaching = ctx.latestOutcome !== null && ctx.latestOutcome.measured ? { focusKey: ctx.latestOutcome.focusKey, metric: ctx.latestOutcome.metric, before: ctx.latestOutcome.before, after: ctx.latestOutcome.after, improved: ctx.latestOutcome.improved, statement: ctx.latestOutcome.text } : null
  return {
    balance: Math.round(ctx.balance), safeToSpend: Math.round(ctx.safeToSpend), upcomingTotal: Math.round(ctx.upcomingTotal), shortfall: ctx.shortfall > 0 ? Math.round(ctx.shortfall) : 0,
    state: ctx.model.state, situation: ctx.model.situation, runwayDays: ctx.model.stateDetail.runwayDays, dailyEssentialCost: Math.round(ctx.model.stateDetail.dailyEssentialCost),
    confidenceTier: ctx.model.confidenceTier, dataPoints: ctx.model.dataPoints, signals, insights, decisions, predictions, coaching, recentTransactions, upcomingCommitments,
  }
}
