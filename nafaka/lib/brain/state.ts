import type { FinancialState } from './types'

export type StateInput = {
  balance: number
  dailyEssentialCost: number
  upcomingTotal: number
}

export function classifyState(input: StateInput): {
  state: FinancialState
  runwayDays: number
} {
  const { balance, dailyEssentialCost, upcomingTotal } = input
  if (balance <= 0) return { state: 'EMERGENCY', runwayDays: 0 }

  const runwayDays = dailyEssentialCost > 0 ? balance / dailyEssentialCost : Number.POSITIVE_INFINITY

  if (runwayDays >= 90) return { state: 'GROWTH', runwayDays }
  if (runwayDays >= 14) return { state: 'STABLE', runwayDays }
  if (runwayDays >= 3) return { state: balance >= upcomingTotal ? 'STABLE' : 'RECOVERY', runwayDays }
  return { state: 'SURVIVAL', runwayDays }
}
