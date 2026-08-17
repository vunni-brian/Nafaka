import { daysBetween } from './stats'
import type { BehaviorModel, SignalValue, Situation } from './types'

export type SituationRead = {
  situation: Situation
  /** how much evidence sits behind this read, 0..1 */
  confidence: number
  /** machine-readable facts that drove the read */
  evidence: string[]
  /** observations behind the read */
  sampleSize: number
  /** span of the observation window in days, when known */
  windowDays: number | null
  /** plain-English one-liner for the read */
  reason: string
}

const CALM: Situation[] = ['STABLE', 'CASH_RICH', 'BUILDING_BUFFER']

export function isCalm(situation: Situation): boolean {
  return CALM.includes(situation)
}

/** severity ordering for transition stability — lower is worse */
export function situationSeverity(situation: Situation): number {
  switch (situation) {
    case 'EMERGENCY':
      return 0
    case 'UNDER_PRESSURE':
      return 1
    case 'INCOME_UNCERTAIN':
      return 2
    case 'COMMITMENT_HEAVY':
      return 3
    case 'RECOVERING':
      return 4
    case 'BUILDING_BUFFER':
      return 5
    case 'STABLE':
      return 6
    case 'CASH_RICH':
      return 7
    case 'UNKNOWN':
      return 8
  }
}

type Branch = {
  situation: Situation
  confidence: number
  evidence: string[]
  sampleSize: number
}

function branchConfidence(signals: SignalValue[]): number {
  const present = signals.filter((s) => s.confidence > 0)
  if (present.length === 0) return 0.5
  return present.reduce((acc, s) => acc + s.confidence, 0) / present.length
}

/**
 * Deterministic classification: situation + the evidence that drove it.
 * No LLM guesses here — every branch is a rule over confident signals,
 * and the read carries its confidence, evidence, sample size and reason.
 */
export function readSituation(model: BehaviorModel): SituationRead {
  const s = model.signals
  const { balance, runwayDays, upcomingTotal } = model.stateDetail

  const windowDays =
    model.sampleWindow !== null ? daysBetween(model.sampleWindow.from, model.sampleWindow.to) : null

  const evidenceOf = (items: string[]) => items.filter(Boolean)

  const finish = (branch: Branch): SituationRead => ({
    ...branch,
    situation: branch.situation,
    evidence: evidenceOf(branch.evidence),
    windowDays,
    reason: reasonFor(branch.situation, branch.evidence),
  })

  if (model.state === 'EMERGENCY' || (model.state === 'SURVIVAL' && runwayDays < 2)) {
    return finish({
      situation: 'EMERGENCY',
      confidence: 0.95,
      evidence: [
        balance <= 0 ? `balance ${fmt(balance)}` : '',
        runwayDays < 2 ? `buffer covers under 2 days of essentials` : '',
      ],
      sampleSize: Math.max(model.dataPoints, 1),
    })
  }

  const debt = s.debtPressure
  if (debt.confidence >= 0.5 && debt.value >= 50) {
    return finish({
      situation: 'UNDER_PRESSURE',
      confidence: debt.confidence,
      evidence: [
        `debt absorbs ${Math.round(debt.value)}% of income (${debt.sampleSize} repayments)`,
        `balance ${fmt(balance)}`,
      ],
      sampleSize: debt.sampleSize,
    })
  }

  if (runwayDays < 7) {
    return finish({
      situation: 'UNDER_PRESSURE',
      confidence: Math.max(0.5, branchConfidence([s.financialResilience, s.spendingStability])),
      evidence: [`buffer covers ${Math.round(runwayDays)} days of essentials`, `daily essentials ${fmt(Math.round(model.stateDetail.dailyEssentialCost))}`],
      sampleSize: Math.max(s.spendingStability.sampleSize, s.financialResilience.sampleSize, 1),
    })
  }

  const hasEvidence =
    model.dataPoints >= 4 && Object.values(s).some((sig) => sig.confidence >= 0.3)

  if (!hasEvidence) {
    return finish({
      situation: 'UNKNOWN',
      confidence: 1,
      evidence: [
        model.dataPoints < 4 ? `${model.dataPoints} data points recorded` : 'no signal confident yet',
      ],
      sampleSize: model.dataPoints,
    })
  }

  const reg = s.incomeRegularity
  if (reg.sampleSize >= 2 && (reg.confidence < 0.5 || reg.value <= 30)) {
    return finish({
      situation: 'INCOME_UNCERTAIN',
      confidence: reg.confidence > 0 ? Math.max(reg.confidence, 0.5) : 0.5,
      evidence: [
        `income regularity ${Math.round(reg.value)}% (${reg.sampleSize} events)`,
        `income confidence ${Math.round(reg.confidence * 100)}%`,
      ],
      sampleSize: reg.sampleSize,
    })
  }

  if (model.state === 'RECOVERY') {
    return finish({
      situation: 'RECOVERING',
      confidence: Math.max(0.5, branchConfidence([s.spendingStability, s.savingsConsistency])),
      evidence: [
        `buffer covers ${Math.round(runwayDays)} days of essentials`,
        `${fmt(Math.round(upcomingTotal))} commitments due against ${fmt(balance)} on hand`,
      ],
      sampleSize: Math.max(s.spendingStability.sampleSize, s.savingsConsistency.sampleSize, 1),
    })
  }

  if (upcomingTotal > 0 && upcomingTotal >= balance * 0.5) {
    return finish({
      situation: 'COMMITMENT_HEAVY',
      confidence: Math.max(0.5, branchConfidence([s.commitmentReliability])),
      evidence: [
        `upcoming commitments ${fmt(Math.round(upcomingTotal))}`,
        `balance ${fmt(balance)}`,
      ],
      sampleSize: Math.max(s.commitmentReliability.sampleSize, 1),
    })
  }

  if (runwayDays >= 60) {
    return finish({
      situation: 'CASH_RICH',
      confidence: Math.max(0.5, branchConfidence([s.financialResilience, s.spendingStability])),
      evidence: [`buffer covers ${Math.round(runwayDays)} days of essentials`],
      sampleSize: Math.max(s.spendingStability.sampleSize, s.financialResilience.sampleSize, 1),
    })
  }

  const savings = s.savingsConsistency
  if (runwayDays >= 14 && savings.confidence >= 0.5 && savings.value >= 70) {
    return finish({
      situation: 'BUILDING_BUFFER',
      confidence: savings.confidence,
      evidence: [
        `savings consistency ${Math.round(savings.value)}% (${savings.sampleSize} weekly snapshots)`,
        `buffer covers ${Math.round(runwayDays)} days of essentials`,
      ],
      sampleSize: savings.sampleSize,
    })
  }

  return finish({
    situation: 'STABLE',
    confidence: Math.max(0.5, branchConfidence([s.spendingStability, s.incomeRegularity])),
    evidence: [
      `buffer covers ${Math.round(runwayDays)} days of essentials`,
      s.incomeRegularity.sampleSize >= 2 ? `income arrives ${s.incomeRegularity.value >= 70 ? 'regularly' : 'with some variance'} (${s.incomeRegularity.sampleSize} events)` : '',
    ],
    sampleSize: Math.max(s.spendingStability.sampleSize, s.incomeRegularity.sampleSize, 1),
  })
}

/**
 * A higher-level, multi-signal read of the user's financial situation.
 * Complements the runway-based financial state with debt pressure,
 * income predictability, commitment load, and savings trajectory.
 */
export function classifySituation(model: BehaviorModel): Situation {
  return readSituation(model).situation
}

function fmt(n: number): string {
  return `UGX ${Math.round(n).toLocaleString()}`
}

function reasonFor(situation: Situation, evidence: string[]): string {
  const ev = evidence.join('; ')
  switch (situation) {
    case 'EMERGENCY':
      return `Balance is critical — ${ev}.`
    case 'UNDER_PRESSURE':
      return `Cash is tight right now — ${ev}.`
    case 'INCOME_UNCERTAIN':
      return `Income timing is the weak point — ${ev}.`
    case 'COMMITMENT_HEAVY':
      return `Commitments loom large relative to cash — ${ev}.`
    case 'RECOVERING':
      return `Cash is thin but stabilizing — ${ev}.`
    case 'CASH_RICH':
      return `The buffer stretches far ahead — ${ev}.`
    case 'BUILDING_BUFFER':
      return `A real buffer is forming — ${ev}.`
    case 'STABLE':
      return `Nothing pressing — ${ev}.`
    case 'UNKNOWN':
      return `Nafaka is still learning your financial rhythm — ${ev}.`
  }
}

export function situationLabel(situation: Situation): string {
  switch (situation) {
    case 'EMERGENCY':
      return 'emergency'
    case 'UNDER_PRESSURE':
      return 'under pressure'
    case 'INCOME_UNCERTAIN':
      return 'income uncertain'
    case 'COMMITMENT_HEAVY':
      return 'commitment heavy'
    case 'RECOVERING':
      return 'recovering'
    case 'CASH_RICH':
      return 'cash rich'
    case 'BUILDING_BUFFER':
      return 'building a buffer'
    case 'STABLE':
      return 'stable'
    case 'UNKNOWN':
      return 'still learning'
  }
}

export function situationCopy(situation: Situation): string {
  switch (situation) {
    case 'EMERGENCY':
      return 'Essentials come first — nothing else should move until the balance is positive.'
    case 'UNDER_PRESSURE':
      return 'Cash is tight. Nafaka is being conservative today: protect essentials and commitments, hold off on the rest.'
    case 'INCOME_UNCERTAIN':
      return 'Income timing is the weak point right now — safe-to-spend stays conservative until the rhythm is clearer.'
    case 'COMMITMENT_HEAVY':
      return 'Commitments loom large relative to cash. The horizon is manageable, but protect it first.'
    case 'RECOVERING':
      return 'Cash is thin but stabilizing — keep protecting essentials and the buffer rebuilds.'
    case 'CASH_RICH':
      return 'Your buffer stretches far ahead. There is room to move — and no need to spend just because there is.'
    case 'BUILDING_BUFFER':
      return 'You are building a real buffer. Consistency matters more than amount — keep the pattern going.'
    case 'STABLE':
      return 'Nothing pressing. Keep today\u2019s safe-to-spend as your ceiling and let the week unfold.'
    case 'UNKNOWN':
      return 'Nafaka is still learning your financial rhythm — verdicts sharpen as you record more.'
  }
}
