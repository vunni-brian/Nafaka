import type { BehaviorInsight, BehaviorModel, BehaviorSignalKey, FinancialState } from './types'

const MIN_CONFIDENCE = 0.5

function sig(model: BehaviorModel, key: BehaviorSignalKey) {
  return model.signals[key]
}

export function generateInsights(model: BehaviorModel): BehaviorInsight[] {
  const insights: BehaviorInsight[] = []
  const push = (id: string, severity: BehaviorInsight['severity'], text: string, signal: BehaviorInsight['signal']) =>
    insights.push({ id, severity, text, signal })

  const post = sig(model, 'postIncomeAcceleration')
  if (post.confidence >= MIN_CONFIDENCE && post.value >= 130) {
    push(
      'post-income-acceleration',
      'watch',
      'When you receive a larger payment, discretionary spending tends to rise in the first 3 days. Your commitments stay protected — this window is where spending accelerates.',
      'postIncomeAcceleration',
    )
  }

  const rel = sig(model, 'commitmentReliability')
  if (rel.confidence >= MIN_CONFIDENCE) {
    if (rel.value >= 80) {
      push(
        'commitments-strong',
        'info',
        'Your commitment payments are highly reliable — they have rarely been missed.',
        'commitmentReliability',
      )
    } else if (rel.value <= 50) {
      push(
        'commitments-weak',
        'action',
        'Commitment payments have been missed recently. Protect the most important one first.',
        'commitmentReliability',
      )
    }
  }

  const savings = sig(model, 'savingsConsistency')
  if (savings.confidence >= MIN_CONFIDENCE && savings.value >= 70) {
    push(
      'savings-habit',
      'info',
      'You save consistently. That consistency matters more than the amount.',
      'savingsConsistency',
    )
  }

  const reg = sig(model, 'incomeRegularity')
  if (reg.confidence >= MIN_CONFIDENCE && reg.value <= 30) {
    push(
      'income-irregular',
      'info',
      "Your income arrives irregularly. Fixed budgets won't fit — safe-to-spend adapts daily instead.",
      'incomeRegularity',
    )
  }

  const debt = sig(model, 'debtPressure')
  if (debt.confidence >= MIN_CONFIDENCE && debt.value >= 50) {
    push(
      'debt-pressure',
      'watch',
      'Debt repayments absorb a significant share of your income.',
      'debtPressure',
    )
  }

  const res = sig(model, 'financialResilience')
  if (res.confidence >= MIN_CONFIDENCE && res.value <= 20) {
    push(
      'thin-buffer',
      'action',
      'Your buffer is thin — under 3 days of essential costs. Protecting food and shelter comes first.',
      'financialResilience',
    )
  }

  const risky: FinancialState[] = ['RECOVERY', 'SURVIVAL', 'EMERGENCY']
  if (risky.includes(model.state)) {
    push(
      'cash-tight',
      'action',
      'Cash is tight. Priorities: essentials, then commitments, then everything else.',
      'state',
    )
  }

  return insights
}
