import type { ConfidenceTier, FinancialState } from './types'

export function stateLabel(state: FinancialState): string {
  switch (state) {
    case 'EMERGENCY':
      return 'emergency'
    case 'SURVIVAL':
      return 'survival mode'
    case 'RECOVERY':
      return 'recovery'
    case 'STABLE':
      return 'stable'
    case 'GROWTH':
      return 'growth'
  }
}

export function stateCopy(state: FinancialState): string {
  switch (state) {
    case 'EMERGENCY':
      return 'Balance is at or below zero. Essentials come first.'
    case 'SURVIVAL':
      return 'The buffer covers only a few days of essentials. Protect food and shelter.'
    case 'RECOVERY':
      return 'Running a thin buffer while building back toward safety.'
    case 'STABLE':
      return 'A comfortable buffer of essentials sits behind you.'
    case 'GROWTH':
      return 'The buffer stretches months ahead.'
  }
}

export function tierLabel(tier: ConfidenceTier): string {
  switch (tier) {
    case 'exploring':
      return 'Exploring'
    case 'learning':
      return 'Developing'
    case 'confident':
      return 'Confident'
    case 'mature':
      return 'Mature'
  }
}

export function tierCopy(tier: ConfidenceTier): string {
  switch (tier) {
    case 'exploring':
      return "Nafaka is getting to know your money. The more you record, the sharper this gets."
    case 'learning':
      return 'Nafaka is developing a picture of how your money moves. Patterns may still shift.'
    case 'confident':
      return 'Nafaka has a stable picture of your behavior and can coach from it.'
    case 'mature':
      return 'Nafaka knows your financial behavior well — insights are high-confidence.'
  }
}

export function confidencePhrase(tier: ConfidenceTier): string {
  switch (tier) {
    case 'exploring':
    case 'learning':
      return "We're still learning your pattern"
    case 'confident':
      return 'Your pattern is fairly clear'
    case 'mature':
      return 'This is a strong, well-observed pattern'
  }
}

export function describeRegularity(value: number): string {
  if (value >= 70) return 'Regular'
  if (value >= 40) return 'Semi-regular'
  return 'Irregular'
}

export function regularityCopy(value: number): string {
  if (value >= 70) return 'Your income arrives on a fairly consistent rhythm.'
  if (value >= 40) return 'Your income has a rough rhythm, but arrival varies from week to week.'
  return 'Your income varies considerably from week to week. Fixed budgets would not fit your life.'
}

export function accelerationCopy(value: number): string {
  if (value >= 130) return 'When income arrives, spending tends to rise in the following three days — the post-deposit window.'
  if (value >= 110) return 'Spending rises slightly in the days after income arrives.'
  return 'Spending stays steady after income arrives — no post-deposit surge.'
}

export function stabilityCopy(value: number): string {
  if (value >= 70) return 'Your daily spending is steady from day to day.'
  if (value >= 40) return 'Your daily spending varies, but has a recognizable middle ground.'
  return 'Your daily spending swings widely between days.'
}

export function savingsCopy(value: number): string {
  if (value >= 70) return 'You have been saving consistently week over week.'
  if (value >= 40) return 'Savings have been positive some weeks, but not every week.'
  return 'Saving has been inconsistent week over week so far.'
}

export function confidencePct(confidence: number): number {
  return Math.round(confidence * 100)
}
