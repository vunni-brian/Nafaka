'use client'

import React from 'react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import {
  Calendar,
  Home,
  Wallet,
  Users,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  type LucideIcon,
} from 'lucide-react'
import { useFinance } from '@/lib/store'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import { weeklyTotals } from '@/lib/brain/weekly'
import { generateInsights } from '@/lib/brain/insights'
import { confidencePct, tierLabel } from '@/lib/brain/describe'
import { SectionTitle, ConfidenceBar, StatPill } from '@/components/proto/ui'
import { BarChart } from '@/components/proto/charts'
import LearningState from '@/components/proto/LearningState'
import type { BehaviorSignalKey } from '@/lib/brain/types'

const iconMap: Record<string, LucideIcon> = {
  calendar: Calendar,
  home: Home,
  wallet: Wallet,
  users: Users,
  piggy: PiggyBank,
}

const lockedExamples = ['Borrowing behavior', 'Spending trigger patterns', 'Savings consistency']

const SIGNAL_META: Record<BehaviorSignalKey, { label: string; description: string; display: (v: number) => string; icon: string }> = {
  incomeRegularity: { label: 'Income Regularity', description: 'How predictably income arrives — not bad, just worth planning for.', display: (v) => `${Math.round(v)}% regular`, icon: 'wallet' },
  incomeSourceDependence: { label: 'Income Source Dependence', description: 'How much you rely on a single source of income.', display: (v) => `${Math.round(v)}% one source`, icon: 'wallet' },
  spendingStability: { label: 'Spending Stability', description: 'Day-to-day spending steadiness across the week.', display: (v) => `${Math.round(v)}/100`, icon: 'calendar' },
  discretionaryShare: { label: 'Discretionary Share', description: 'Share of spending on wants rather than needs.', display: (v) => `${Math.round(v)}% of spending`, icon: 'calendar' },
  postIncomeAcceleration: { label: 'Post-Income Spending', description: 'How much of income moves in the 72 hours after it arrives.', display: (v) => `${Math.round(v - 100)}% within 72h`, icon: 'calendar' },
  savingsConsistency: { label: 'Savings Consistency', description: 'How steadily balance builds week over week.', display: (v) => `${Math.round(v)}%`, icon: 'piggy' },
  commitmentReliability: { label: 'Commitment Reliability', description: 'Recurring payments made within the expected window.', display: (v) => `${Math.round(v)}% on time`, icon: 'home' },
  debtPressure: { label: 'Debt Pressure', description: 'Repayments and obligations as a share of income.', display: (v) => `${Math.round(v)}% of income`, icon: 'users' },
  financialResilience: { label: 'Financial Resilience', description: 'Days of buffer your balance covers for essentials.', display: (v) => `${Math.round(v)} days`, icon: 'users' },
}

function trendOf(value: number): 'up' | 'down' | 'flat' {
  return value >= 60 ? 'up' : value <= 40 ? 'down' : 'flat'
}

export default function FinancialPersonality() {
  const body = useGoogleFont('Manrope')
  const { transactions, behaviorModel } = useFinance()

  const { signals, confidence, dataPoints } = behaviorModel
  const generated = generateInsights(behaviorModel)
  const confidencePctValue = Math.round(confidence * 100)

  const now = new Date()
  const brainTx = storeTransactionsToBrain(transactions)
  const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']
  const weeklySpend = [5, 4, 3, 2, 1, 0].map((w) => weeklyTotals(brainTx, now, w).spending)

  const confirmed = generated.filter((ins) => {
    if (ins.signal === 'state') return false
    const s = signals[ins.signal as BehaviorSignalKey]
    return s && s.confidence >= 0.7
  })
  const emerging = generated.filter((ins) => {
    if (ins.signal === 'state') return false
    const s = signals[ins.signal as BehaviorSignalKey]
    return s && s.confidence >= 0.5 && s.confidence < 0.7
  })

  const signalRows = Object.entries(signals)
    .filter(([, s]) => s.sampleSize > 0)
    .map(([key, s]) => {
      const meta = SIGNAL_META[key as BehaviorSignalKey]
      const status = s.confidence >= 0.7 ? 'good' : s.confidence >= 0.5 ? 'ok' : 'watch'
      return {
        key,
        label: meta.label,
        description: meta.description,
        display: meta.display(s.value),
        status,
        trend: trendOf(s.value),
      }
    })

  if (confidencePctValue < 40) {
    return (
      <div className="min-h-screen bg-ink-50 pb-28 md:pb-10 md:pl-64" style={{ fontFamily: body }}>
        <AppHeader />
        <main id="main" className="mx-auto w-full max-w-md px-5 pt-4 md:max-w-3xl md:px-8">
          <LearningState confidence={confidencePctValue} dataPoints={dataPoints} />
        </main>
        <BottomNav active="patterns" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50 pb-28 md:pb-10 md:pl-64" style={{ fontFamily: body }}>
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-md px-5 pt-4 md:max-w-6xl md:px-10 space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Patterns</h1>
          <p className="text-sm text-ink-500 mt-1">
            How Nafaka sees your money behavior. Patterns become confirmed as confidence grows.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <ConfidenceBar value={confidencePctValue} />
            <span className="text-xs text-ink-500">{tierLabel(behaviorModel.confidenceTier)}</span>
          </div>
        </div>

        <div className="md:grid md:grid-cols-2 md:gap-6 md:items-start">
        {/* Spending by week */}
        <div className="card p-4 md:row-start-1 md:col-start-1">
          <SectionTitle title="Spending by week" hint="See your spending rhythm" />
          <BarChart data={weeklySpend} labels={weekLabels} tone="accent" height={130} />
        </div>

        {/* Confirmed patterns */}
        {confirmed.length > 0 ? (
          <div className="md:row-start-1 md:col-start-2">
            <SectionTitle title="Confirmed patterns" hint={`${confirmed.length} patterns locked in`} />
            <div className="space-y-3">
              {confirmed.map((ins) => {
                const s = signals[ins.signal as BehaviorSignalKey]
                const Icon = iconMap[SIGNAL_META[ins.signal as BehaviorSignalKey].icon] ?? TrendingUp
                return (
                  <div key={ins.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                        <Icon size={18} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-ink-900">{SIGNAL_META[ins.signal as BehaviorSignalKey].label}</p>
                          <StatPill tone="positive">Confirmed · {confidencePct(s.confidence)}%</StatPill>
                        </div>
                        <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">{ins.text}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="card p-6 text-center md:row-start-1 md:col-start-2">
            <p className="text-sm text-ink-600">No confirmed patterns yet</p>
            <p className="text-xs text-ink-400 mt-1 leading-relaxed">
              Keep recording and Nafaka will lock in patterns as your confidence grows.
            </p>
          </div>
        )}

        {/* Emerging patterns */}
        {emerging.length > 0 ? (
          <div className="md:row-start-2 md:col-start-1">
            <SectionTitle title="Emerging patterns" hint="Needs more data to confirm" />
            <div className="space-y-3">
              {emerging.map((ins) => {
                const s = signals[ins.signal as BehaviorSignalKey]
                const Icon = iconMap[SIGNAL_META[ins.signal as BehaviorSignalKey].icon] ?? TrendingUp
                return (
                  <div key={ins.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                        <Icon size={18} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-ink-900">{SIGNAL_META[ins.signal as BehaviorSignalKey].label}</p>
                          <StatPill tone="watch">Emerging · {confidencePct(s.confidence)}%</StatPill>
                        </div>
                        <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">{ins.text}</p>
                        <div className="mt-2.5">
                          <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-accent-500"
                              style={{ width: `${confidencePct(s.confidence)}%`, transition: 'width 0.8s ease' }}
                            />
                          </div>
                          <p className="text-[10px] text-ink-400 mt-1">Will confirm at ~70% confidence</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="card p-6 text-center md:row-start-2 md:col-start-1">
            <p className="text-sm text-ink-600">No emerging patterns yet</p>
            <p className="text-xs text-ink-400 mt-1 leading-relaxed">
              They appear as patterns start to form from your recorded activity.
            </p>
          </div>
        )}

        {/* All signals */}
        {signalRows.length > 0 ? (
          <div className="md:row-start-2 md:col-start-2">
            <SectionTitle title="All behavioral signals" hint={confidence >= 0.7 ? 'Calculated daily from your activity' : 'Emerging - still calculating'} />
            <div className="card divide-y divide-ink-100">
              {signalRows.map((s) => (
                <div key={s.key} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      s.status === 'good'
                        ? 'bg-brand-100 text-brand-700'
                        : s.status === 'ok'
                        ? 'bg-ink-100 text-ink-600'
                        : 'bg-accent-100 text-accent-700'
                    }`}
                  >
                    {s.trend === 'up' ? <TrendingUp size={15} /> : s.trend === 'down' ? <TrendingDown size={15} /> : <Minus size={15} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900">{s.label}</p>
                    <p className="text-xs text-ink-500 leading-snug mt-0.5">{s.description}</p>
                  </div>
                  <span className="text-right">
                    <p className="text-sm font-bold text-ink-900 whitespace-nowrap tabular-nums">{s.display}</p>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-6 text-center md:row-start-2 md:col-start-2">
            <p className="text-sm text-ink-600">No behavioral signals yet</p>
            <p className="text-xs text-ink-400 mt-1 leading-relaxed">
              Add a few transactions to see how Nafaka reads your money behavior.
            </p>
          </div>
        )}

        {/* Locked / future signals */}
        <div className="md:row-start-3 md:col-start-1 md:col-span-2">
          <SectionTitle title="Still learning" hint="Unlocks with more data" />
          <div className="card divide-y divide-ink-100">
            {lockedExamples.map((label) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 opacity-60">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400">
                  <Lock size={14} />
                </span>
                <p className="text-sm font-medium text-ink-600 flex-1">{label}</p>
                <span className="text-xs text-ink-400">Locked</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </main>

      <BottomNav active="patterns" />
    </div>
  )
}