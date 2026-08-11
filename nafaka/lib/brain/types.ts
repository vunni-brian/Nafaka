export type BrainTransaction = {
  id: number
  type: 'income' | 'expense'
  amount: number
  category?: string
  source?: string
  date: string
}

export type BrainCommitment = {
  id: number
  label: string
  amount: number
  dueDate: string
  fulfilled: boolean | null
}

export type BrainSnapshot = {
  date: string
  balance: number
}

export type BrainInput = {
  transactions: BrainTransaction[]
  commitments: BrainCommitment[]
  snapshots: BrainSnapshot[]
  balance: number
}

export const SIGNAL_KEYS = [
  'incomeRegularity',
  'incomeSourceDependence',
  'spendingStability',
  'discretionaryShare',
  'postIncomeAcceleration',
  'savingsConsistency',
  'commitmentReliability',
  'debtPressure',
  'financialResilience',
] as const

export type BehaviorSignalKey = (typeof SIGNAL_KEYS)[number]

export type SignalValue = {
  value: number
  confidence: number
  sampleSize: number
}

export type FinancialState = 'EMERGENCY' | 'SURVIVAL' | 'RECOVERY' | 'STABLE' | 'GROWTH'

export type ConfidenceTier = 'exploring' | 'learning' | 'confident' | 'mature'

export type InsightSeverity = 'info' | 'watch' | 'action'

export type BehaviorInsight = {
  id: string
  severity: InsightSeverity
  text: string
  signal: BehaviorSignalKey | 'state'
}

export type BehaviorModel = {
  generatedAt: string
  dataPoints: number
  confidence: number
  confidenceTier: ConfidenceTier
  state: FinancialState
  stateDetail: {
    runwayDays: number
    dailyEssentialCost: number
    upcomingTotal: number
  }
  signals: Record<BehaviorSignalKey, SignalValue>
  activeSignals: BehaviorSignalKey[]
  insights: BehaviorInsight[]
}
