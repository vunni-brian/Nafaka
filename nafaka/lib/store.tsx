'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { buildBehaviorModel } from './brain'
import { storeCommitmentsToBrain, storeSnapshotsToBrain, storeTransactionsToBrain } from './brain/adapters'
import { toISODate } from './brain/stats'
import type { BehaviorModel } from './brain/types'

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

export function computeBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => (t.type === 'income' ? sum + t.amount : sum - t.amount), 0)
}

export function computeUpcomingTotal(commitments: Commitment[]): number {
  return commitments
    .filter((c) => c.status === 'upcoming')
    .reduce((sum, c) => sum + c.amount, 0)
}

export function computeSafeToSpend(balance: number, upcomingTotal: number): number {
  return Math.max(0, balance - upcomingTotal)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

let nextTxId = 100
let nextCommitmentId = 50
let nextGoalId = 20
let nextNetworkId = 30
const STORAGE_KEY = 'nafaka-finance-v1'

type PersistedFinance = Pick<FinancialContextValue, 'profile' | 'transactions' | 'commitments' | 'goals' | 'network'>

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

type FinancialContextValue = {
  profile: Profile
  setProfileName: (name: string) => void

  transactions: Transaction[]
  addIncome: (amount: number, source: string, note: string) => void
  addExpense: (amount: number, category: string, note: string) => void
  deleteTransaction: (id: number) => void

  balance: number
  upcomingTotal: number
  safeToSpend: number

  commitments: Commitment[]
  addCommitment: (label: string, when: string, amount: number) => void
  setCommitmentStatus: (id: number, status: CommitmentStatus) => void

  goals: Goal[]
  addGoal: (label: string, target: number) => void

  network: NetworkPerson[]
  addNetworkEntry: (name: string, relationship: string, direction: 'lent' | 'borrowed', amount: number) => void

  behaviorModel: BehaviorModel
}

const FinancialContext = createContext<FinancialContextValue | null>(null)

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>({ name: 'there', archetype: 'Freelancer', priorities: ['Building savings', 'Paying off debt', 'Supporting family'] })
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions)
  const [commitments, setCommitments] = useState<Commitment[]>(defaultCommitments)
  const [goals, setGoals] = useState<Goal[]>(defaultGoals)
  const [network, setNetwork] = useState<NetworkPerson[]>(defaultNetwork)
  const [isHydrated, setIsHydrated] = useState(false)

  React.useEffect(() => {
    const persisted = readPersistedFinance()
    queueMicrotask(() => {
      if (persisted.profile) setProfile(persisted.profile)
      if (persisted.transactions) setTransactions(persisted.transactions)
      if (persisted.commitments) setCommitments(persisted.commitments)
      if (persisted.goals) setGoals(persisted.goals)
      if (persisted.network) setNetwork(persisted.network)
      setIsHydrated(true)
    })
  }, [])

  React.useEffect(() => {
    if (!isHydrated) return
    nextTxId = Math.max(nextTxId, ...transactions.map((t) => t.id))
    nextCommitmentId = Math.max(nextCommitmentId, ...commitments.map((c) => c.id))
    nextGoalId = Math.max(nextGoalId, ...goals.map((g) => g.id))
    nextNetworkId = Math.max(nextNetworkId, ...network.map((p) => p.id))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, transactions, commitments, goals, network }))
  }, [isHydrated, profile, transactions, commitments, goals, network])

  const balance = computeBalance(transactions)
  const upcomingTotal = computeUpcomingTotal(commitments)
  const safeToSpend = computeSafeToSpend(balance, upcomingTotal)

  const snapshotsForBrain = useMemo(() => {
    const current: WeeklySnapshot = { id: 0, date: mondayOfWeek(0), balance }
    return storeSnapshotsToBrain([...defaultSnapshots, current])
  }, [balance])

  const behaviorModel = useMemo(
    () =>
      buildBehaviorModel({
        transactions: storeTransactionsToBrain(transactions),
        commitments: storeCommitmentsToBrain(commitments),
        snapshots: snapshotsForBrain,
        balance,
      }),
    [transactions, commitments, snapshotsForBrain, balance],
  )

  const setProfileName = useCallback((name: string) => {
    setProfile((p) => ({ ...p, name }))
  }, [])

  const addIncome = useCallback((amount: number, source: string, note: string) => {
    const tx: Transaction = { id: ++nextTxId, type: 'income', amount, label: source, note, time: timeNow(), recordedAt: new Date().toISOString() }
    setTransactions((prev) => [tx, ...prev])
  }, [])

  const addExpense = useCallback((amount: number, category: string, note: string) => {
    const tx: Transaction = { id: ++nextTxId, type: 'expense', amount, label: category, category, note, time: timeNow(), recordedAt: new Date().toISOString() }
    setTransactions((prev) => [tx, ...prev])
  }, [])

  const deleteTransaction = useCallback((id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addCommitment = useCallback((label: string, when: string, amount: number) => {
    setCommitments((prev) => [...prev, { id: ++nextCommitmentId, label, when, amount, status: 'upcoming' }])
  }, [])

  const setCommitmentStatus = useCallback((id: number, status: CommitmentStatus) => {
    setCommitments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }, [])

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
        profile, setProfileName,
        transactions, addIncome, addExpense, deleteTransaction,
        balance, upcomingTotal, safeToSpend,
      commitments, addCommitment, setCommitmentStatus,
      goals, addGoal,
      network, addNetworkEntry,
      behaviorModel,
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
