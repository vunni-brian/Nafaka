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

export type Situation =
  | 'EMERGENCY'
  | 'UNDER_PRESSURE'
  | 'INCOME_UNCERTAIN'
  | 'COMMITMENT_HEAVY'
  | 'RECOVERING'
  | 'CASH_RICH'
  | 'BUILDING_BUFFER'
  | 'STABLE'
  | 'UNKNOWN'

export type ConfidenceTier = 'exploring' | 'learning' | 'confident' | 'mature'

/** hysteresis memory for state reads — see lib/brain/stabilize.ts */
export type Memory<T extends string> = {
  held: T
  /** first day the currently-held read was applied */
  holdingSince: string
  /** the read currently coming out of the engine */
  candidate: T
  /** first day of the current candidate streak, or null when not streaking */
  candidateFirstSeen: string | null
  /** last day the candidate was observed */
  candidateLastSeen: string | null
}

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
  situation: Situation
  stateDetail: {
    balance: number
    runwayDays: number
    dailyEssentialCost: number
    upcomingTotal: number
  }
  /** date span of the observations behind this model */
  sampleWindow: { from: string; to: string } | null
  signals: Record<BehaviorSignalKey, SignalValue>
  activeSignals: BehaviorSignalKey[]
  insights: BehaviorInsight[]
  /** hysteresis memory + change flags, present when buildBehaviorModel got memory options */
  stateMemory?: Memory<FinancialState>
  situationMemory?: Memory<Situation>
  stateChanged?: boolean
  situationChanged?: boolean
}
