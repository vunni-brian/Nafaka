'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, useRef, type ReactNode } from 'react'
import { buildBehaviorModel } from './brain'
import { storeCommitmentsToBrain, storeSnapshotsToBrain, storeTransactionsToBrain } from './brain/adapters'
import { coachingStats, latestClosedOutcome, successRatesByKey, syncCoaching, type CoachingRecord, type CoachingStats } from './brain/coaching'
import { buildDecisionLog, type NafakaDecision } from './brain/decisions'
import { weeklyFocus, type WeekFocus } from './brain/focus'
import { computeHealthScore } from './brain/health'
import { measureOutcomes, type CoachingOutcome } from './brain/outcomes'
import { predict, type NafakaPrediction } from './brain/predict'
import { explainSafeToSpend, type SafeToSpendExplanation } from './brain/safetospend'
import { toISODate } from './brain/stats'
import type { BehaviorModel, FinancialState, Memory, Situation } from './brain/types'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

// ── Types ────────────────────────────────────────────────────────────────────

export type Transaction = {
  id: number
  type: 'income' | 'expense'
  amount: number
  label: string
  category?: string
  note?: string
  time: string
  /** ISO timestamp used for analysis. `time` remains the human-friendly UI label. */
  recordedAt?: string
}

export type CommitmentStatus = 'upcoming' | 'fulfilled' | 'missed'

export type Commitment = {
  id: number
  label: string
  when: string
  amount: number
  status: CommitmentStatus
  /** id of the expense transaction recorded when this commitment was settled */
  settledTxId?: number
}

export type WeeklySnapshot = {
  id: number
  date: string
  balance: number
}

export type Profile = {
  name: string
  archetype: string
  priorities: string[]
  startingBalance: number
  commitmentFlags: { cell: boolean; church: boolean; rent: boolean; debt: boolean }
  notificationsOptIn: boolean | null
  onboardingCompletedAt: string | null
  consentGivenAt: string | null
}

export type Goal = {
  id: number
  label: string
  current: number
  target: number
}

export type NetworkPerson = {
  id: number
  name: string
  relationship: string
  initials: string
  balance: number
  lastEntry: string
}

// ── Pure money math (testable) ───────────────────────────────────────────────

export function computeBalance(transactions: Transaction[], startingBalance = 0): number {
  return startingBalance + transactions.reduce((sum, t) => (t.type === 'income' ? sum + t.amount : sum - t.amount), 0)
}

export function computeUpcomingTotal(commitments: Commitment[]): number {
  return commitments
    .filter((c) => c.status === 'upcoming')
    .reduce((sum, c) => sum + c.amount, 0)
}

export function computeSafeToSpend(balance: number, upcomingTotal: number): number {
  return Math.max(0, balance - upcomingTotal)
}

export function computeShortfall(balance: number, upcomingTotal: number): number {
  return Math.max(0, upcomingTotal - balance)
}

export function isValidAmount(n: number): boolean {
  return Number.isFinite(n) && Number.isInteger(n) && n > 0
}

// ── Helpers ──────────────────────────────────────────────────────────────────

let nextTxId = 100
let nextCommitmentId = 50
let nextGoalId = 20
let nextNetworkId = 30
const STORAGE_KEY = 'nafaka-finance-v1'
const SCHEMA_VERSION = 1

type PersistedFinance = Pick<
  FinancialContextValue,
  'profile' | 'transactions' | 'commitments' | 'goals' | 'network'
> & {
  coachingLog?: CoachingRecord[]
  stateMemory?: Memory<FinancialState> | null
  situationMemory?: Memory<Situation> | null
}

function timeNow(): string {
  const d = new Date()
  const h = d.getHours() % 12 || 12
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM'
  return `Today, ${h}:${m} ${ampm}`
}

function readPersistedFinance(): Partial<PersistedFinance> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const DEFAULT_PROFILE: Profile = {
  name: 'there',
  archetype: '',
  priorities: [],
  startingBalance: 0,
  commitmentFlags: { cell: false, church: false, rent: false, debt: false },
  notificationsOptIn: null,
  onboardingCompletedAt: null,
  consentGivenAt: null,
}

// ── Default data ─────────────────────────────────────────────────────────────

const defaultTransactions: Transaction[] = [
  { id: 1, type: 'income', amount: 85000, label: 'Freelance payment', time: 'Today, 9:12 AM' },
  { id: 2, type: 'expense', amount: 6000, label: 'Rolex & chapati', category: 'food', time: 'Today, 8:40 AM' },
  { id: 3, type: 'expense', amount: 4000, label: 'Boda to campus', category: 'transport', time: 'Yesterday, 7:15 AM' },
]

const defaultCommitments: Commitment[] = [
  { id: 1, label: 'Cell meeting', when: 'Tomorrow', amount: 5000, status: 'upcoming' },
  { id: 2, label: 'Sunday offering', when: 'In 3 days', amount: 10000, status: 'upcoming' },
  { id: 50, label: 'Cell meeting', when: '1 week ago', amount: 5000, status: 'fulfilled' },
  { id: 51, label: 'Cell meeting', when: '2 weeks ago', amount: 5000, status: 'fulfilled' },
  { id: 52, label: 'Cell meeting', when: '3 weeks ago', amount: 5000, status: 'fulfilled' },
  { id: 53, label: 'Sunday offering', when: '2 weeks ago', amount: 10000, status: 'fulfilled' },
  { id: 54, label: 'Debt repayment', when: '4 weeks ago', amount: 15000, status: 'missed' },
]

const defaultGoals: Goal[] = [
  { id: 1, label: 'Emergency fund', current: 186000, target: 300000 },
  { id: 2, label: 'New phone', current: 74000, target: 450000 },
]

const defaultNetwork: NetworkPerson[] = [
  { id: 1, name: 'Aunt Grace', relationship: 'Family', initials: 'AG', balance: 15000, lastEntry: '2 days ago' },
  { id: 2, name: 'Moses (neighbor)', relationship: 'Neighbor', initials: 'M', balance: -40000, lastEntry: '5 days ago' },
  { id: 3, name: 'Cell group fund', relationship: 'Community', initials: 'CG', balance: 8000, lastEntry: '1 week ago' },
]

function mondayOfWeek(weeksAgo: number): string {
  const d = new Date()
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day - weeksAgo * 7)
  return toISODate(d)
}

const defaultSnapshots: WeeklySnapshot[] = [
  { id: 1, date: mondayOfWeek(6), balance: 60000 },
  { id: 2, date: mondayOfWeek(5), balance: 63000 },
  { id: 3, date: mondayOfWeek(4), balance: 66000 },
  { id: 4, date: mondayOfWeek(3), balance: 69000 },
  { id: 5, date: mondayOfWeek(2), balance: 72000 },
  { id: 6, date: mondayOfWeek(1), balance: 74500 },
]

// ── Context ──────────────────────────────────────────────────────────────────

type OnboardingAnswers = {
  archetype: string
  priorities: string[]
  startingBalance: number
  commitmentFlags: Profile['commitmentFlags']
  notificationsOptIn: boolean
  consentGivenAt: string
}

type FinancialContextValue = {
  profile: Profile
  setProfileName: (name: string) => void
  /** true once the user finishes onboarding; gates demo data + route guards */
  isOnboarded: boolean
  /** false until localStorage/Supabase hydration has resolved */
  isHydrated: boolean
  completeOnboarding: (answers: OnboardingAnswers) => void

  transactions: Transaction[]
  addIncome: (amount: number, source: string, note: string) => void
  addExpense: (amount: number, category: string, note: string) => void
  deleteTransaction: (id: number) => void

  balance: number
  upcomingTotal: number
  safeToSpend: number
  /** how much upcoming commitments exceed the current balance, when they do */
  shortfall: number

  commitments: Commitment[]
  addCommitment: (label: string, when: string, amount: number) => void
  setCommitmentStatus: (id: number, status: CommitmentStatus) => void

  goals: Goal[]
  addGoal: (label: string, target: number) => void

  network: NetworkPerson[]
  addNetworkEntry: (name: string, relationship: string, direction: 'lent' | 'borrowed', amount: number) => void

  behaviorModel: BehaviorModel
  /** why the current safe-to-spend amount is what it is */
  safeToSpendWhy: SafeToSpendExplanation
  /** machine-readable evidence behind every coaching statement */
  decisionLog: NafakaDecision[]
  /** evidence-gated predictions of what happens next */
  predictions: NafakaPrediction[]
  /** the one coaching focus this week (adaptive: prefers what has worked) */
  focus: WeekFocus
  /** current measurable outcomes per focus type */
  outcomes: CoachingOutcome[]
  /** coaching effectiveness per focus key */
  coachingStats: CoachingStats[]
  /** the most recently measured coaching outcome */
  lastCoachingOutcome: CoachingOutcome | null
  /** the signed-in Supabase user, or null while signed out */
  user: User | null
}

const FinancialContext = createContext<FinancialContextValue | null>(null)

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions)
  const [commitments, setCommitments] = useState<Commitment[]>(defaultCommitments)
  const [goals, setGoals] = useState<Goal[]>(defaultGoals)
  const [network, setNetwork] = useState<NetworkPerson[]>(defaultNetwork)
  const [coachingLog, setCoachingLog] = useState<CoachingRecord[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [stateMemory, setStateMemory] = useState<Memory<FinancialState> | null>(null)
  const [situationMemory, setSituationMemory] = useState<Memory<Situation> | null>(null)
  const lastSavedRef = useRef('')

  React.useEffect(() => {
    let cancelled = false
    let remoteState: PersistedFinance | null = null
    const supabase = createClient()

    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (user) {
        const { data } = await supabase.from('finance_states').select('state, schema_version').eq('user_id', user.id).maybeSingle()
        if (data?.state && (data.schema_version ?? 1) === SCHEMA_VERSION) remoteState = data.state as PersistedFinance
      }
      queueMicrotask(() => {
        if (cancelled) return
        setUser(user)
        const source = remoteState ?? readPersistedFinance()
        if (source.profile) setProfile({ ...DEFAULT_PROFILE, ...source.profile })
        if (source.transactions) setTransactions(source.transactions)
        if (source.commitments) setCommitments(source.commitments)
        if (source.goals) setGoals(source.goals)
        if (source.network) setNetwork(source.network)
        if (source.coachingLog) setCoachingLog(source.coachingLog)
        if (source.stateMemory) setStateMemory(source.stateMemory)
        if (source.situationMemory) setSituationMemory(source.situationMemory)
        setIsHydrated(true)
      })
    })()

    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (!isHydrated) return
    nextTxId = Math.max(nextTxId, ...transactions.map((t) => t.id))
    nextCommitmentId = Math.max(nextCommitmentId, ...commitments.map((c) => c.id))
    nextGoalId = Math.max(nextGoalId, ...goals.map((g) => g.id))
    nextNetworkId = Math.max(nextNetworkId, ...network.map((p) => p.id))
    const state: PersistedFinance = {
      profile,
      transactions,
      commitments,
      goals,
      network,
      coachingLog,
      stateMemory,
      situationMemory,
    }
    const serialized = JSON.stringify(state)
    if (serialized === lastSavedRef.current) return
    lastSavedRef.current = serialized
    window.localStorage.setItem(STORAGE_KEY, serialized)
    if (user) {
      createClient()
        .from('finance_states')
        .upsert({ user_id: user.id, state, schema_version: SCHEMA_VERSION, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.error('Failed to sync finance state:', error.message)
        })
    }
  }, [isHydrated, user, profile, transactions, commitments, goals, network, coachingLog, stateMemory, situationMemory])

  const balance = computeBalance(transactions, profile.startingBalance)
  const upcomingTotal = computeUpcomingTotal(commitments)
  const safeToSpend = computeSafeToSpend(balance, upcomingTotal)
  const shortfall = computeShortfall(balance, upcomingTotal)
  const isOnboarded = profile.onboardingCompletedAt !== null

  const snapshotsForBrain = useMemo(() => {
    const current: WeeklySnapshot = { id: 0, date: mondayOfWeek(0), balance }
    const healthy = user !== null && isOnboarded
    return storeSnapshotsToBrain(healthy ? [current] : [...defaultSnapshots, current])
  }, [balance, user, isOnboarded])

  const behaviorModel = useMemo(
    () =>
      buildBehaviorModel(
        {
          transactions: storeTransactionsToBrain(transactions),
          commitments: storeCommitmentsToBrain(commitments),
          snapshots: snapshotsForBrain,
          balance,
        },
        isHydrated ? { stateMemory, situationMemory } : {},
      ),
    [transactions, commitments, snapshotsForBrain, balance, isHydrated, stateMemory, situationMemory],
  )

  const safeToSpendWhy = useMemo<SafeToSpendExplanation>(
    () =>
      explainSafeToSpend({
        transactions: storeTransactionsToBrain(transactions),
        commitments: storeCommitmentsToBrain(commitments),
        safeToSpend,
        postIncomeAcceleration: behaviorModel.signals.postIncomeAcceleration,
      }),
    [transactions, commitments, safeToSpend, behaviorModel],
  )

  const outcomes = useMemo<CoachingOutcome[]>(
    () =>
      measureOutcomes({
        model: behaviorModel,
        transactions: storeTransactionsToBrain(transactions),
        commitments: storeCommitmentsToBrain(commitments),
        snapshots: snapshotsForBrain,
      }),
    [behaviorModel, transactions, commitments, snapshotsForBrain],
  )

  const focus = useMemo<WeekFocus>(
    () =>
      weeklyFocus(behaviorModel, {
        successRates: successRatesByKey(coachingStats(coachingLog)),
      }),
    [behaviorModel, coachingLog],
  )

  const coaching = useMemo(
    () => syncCoaching({ records: coachingLog, focus, outcomes }),
    [coachingLog, focus, outcomes],
  )

  const coachingStatsResult = useMemo<CoachingStats[]>(() => coachingStats(coaching.records), [coaching.records])
  const lastCoachingOutcome = useMemo<CoachingOutcome | null>(() => latestClosedOutcome(coaching.records), [coaching.records])

  const coachingJson = JSON.stringify(coaching.records)
  if (JSON.stringify(coachingLog) !== coachingJson) {
    setCoachingLog(coaching.records)
  }

  const modelStateMemory = behaviorModel.stateMemory ?? null
  if (JSON.stringify(modelStateMemory) !== JSON.stringify(stateMemory)) {
    setStateMemory(modelStateMemory)
  }
  const modelSituationMemory = behaviorModel.situationMemory ?? null
  if (JSON.stringify(modelSituationMemory) !== JSON.stringify(situationMemory)) {
    setSituationMemory(modelSituationMemory)
  }

  const decisionLog = useMemo<NafakaDecision[]>(
    () =>
      buildDecisionLog({
        model: behaviorModel,
        balance,
        safeToSpend,
        health: computeHealthScore(behaviorModel),
        focus,
        explanation: safeToSpendWhy,
      }),
    [behaviorModel, balance, safeToSpend, focus, safeToSpendWhy],
  )

  const predictions = useMemo<NafakaPrediction[]>(
    () => predict({ model: behaviorModel, balance, explanation: safeToSpendWhy }),
    [behaviorModel, balance, safeToSpendWhy],
  )

  const setProfileName = useCallback((name: string) => {
    setProfile((p) => ({ ...p, name }))
  }, [])

  const completeOnboarding = useCallback((answers: OnboardingAnswers) => {
    setProfile((p) => ({
      ...p,
      archetype: answers.archetype,
      priorities: answers.priorities,
      startingBalance: answers.startingBalance,
      commitmentFlags: answers.commitmentFlags,
      notificationsOptIn: answers.notificationsOptIn,
      consentGivenAt: answers.consentGivenAt,
      onboardingCompletedAt: new Date().toISOString(),
    }))
    setTransactions([])
    setCommitments([])
    setGoals([])
    setNetwork([])
  }, [])

  const addIncome = useCallback((amount: number, source: string, note: string) => {
    if (!isValidAmount(amount)) return
    const tx: Transaction = { id: ++nextTxId, type: 'income', amount, label: source, note, time: timeNow(), recordedAt: new Date().toISOString() }
    setTransactions((prev) => [tx, ...prev])
  }, [])

  const addExpense = useCallback((amount: number, category: string, note: string) => {
    if (!isValidAmount(amount)) return
    const tx: Transaction = { id: ++nextTxId, type: 'expense', amount, label: category, category, note, time: timeNow(), recordedAt: new Date().toISOString() }
    setTransactions((prev) => [tx, ...prev])
  }, [])

  const deleteTransaction = useCallback((id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addCommitment = useCallback((label: string, when: string, amount: number) => {
    if (!isValidAmount(amount)) return
    setCommitments((prev) => [...prev, { id: ++nextCommitmentId, label, when, amount, status: 'upcoming' }])
  }, [])

  const setCommitmentStatus = useCallback((id: number, status: CommitmentStatus) => {
    const target = commitments.find((c) => c.id === id)
    if (!target || target.status === status) return
    if (status === 'fulfilled') {
      const txId = ++nextTxId
      setTransactions((prev) => [
        {
          id: txId,
          type: 'expense',
          amount: target.amount,
          label: target.label,
          category: 'commitment',
          time: timeNow(),
          recordedAt: new Date().toISOString(),
        },
        ...prev,
      ])
      setCommitments((prev) => prev.map((c) => (c.id === id ? { ...c, status, settledTxId: txId } : c)))
    } else if (target.status === 'fulfilled') {
      if (target.settledTxId) setTransactions((prev) => prev.filter((t) => t.id !== target.settledTxId))
      setCommitments((prev) => prev.map((c) => (c.id === id ? { ...c, status, settledTxId: undefined } : c)))
    } else {
      setCommitments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
    }
  }, [commitments])

  const addGoal = useCallback((label: string, target: number) => {
    setGoals((prev) => [...prev, { id: ++nextGoalId, label, current: 0, target }])
  }, [])

  const addNetworkEntry = useCallback((name: string, relationship: string, direction: 'lent' | 'borrowed', amount: number) => {
    const signed = direction === 'lent' ? amount : -amount
    setNetwork((prev) => {
      const existing = prev.find((p) => p.name.toLowerCase() === name.trim().toLowerCase())
      if (existing) {
        return prev.map((p) =>
          p.id === existing.id ? { ...p, balance: p.balance + signed, lastEntry: 'Just now' } : p,
        )
      }
      const initials = name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
      return [
        ...prev,
        { id: ++nextNetworkId, name: name.trim(), relationship, initials, balance: signed, lastEntry: 'Just now' },
      ]
    })
  }, [])

  return (
    <FinancialContext.Provider
      value={{
        profile, setProfileName, isOnboarded, isHydrated, completeOnboarding,
        transactions, addIncome, addExpense, deleteTransaction,
        balance, upcomingTotal, safeToSpend, shortfall,
      commitments, addCommitment, setCommitmentStatus,
      goals, addGoal,
      network, addNetworkEntry,
      behaviorModel,
      safeToSpendWhy,
      decisionLog,
      predictions,
      focus,
      outcomes,
      coachingStats: coachingStatsResult,
      lastCoachingOutcome,
      user,
    }}
    >
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinancialContext)
  if (!ctx) throw new Error('useFinance must be used within a FinancialProvider')
  return ctx
}
