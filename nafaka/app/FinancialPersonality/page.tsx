'use client'

import React from 'react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import {
  TrendingUp,
  Minus,
  Lock,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react'
import Link from 'next/link'
import { useFinance } from '@/lib/store'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import { weeklyTotals } from '@/lib/brain/weekly'
import { generateInsights } from '@/lib/brain/insights'
import { confidencePct, tierLabel, confidencePhrase } from '@/lib/brain/describe'
import { SectionTitle, ConfidenceBar, StatPill } from '@/components/proto/ui'
import { BarChart } from '@/components/proto/charts'
import LearningState from '@/components/proto/LearningState'
import type { BehaviorSignalKey } from '@/lib/brain/types'

const SIGNAL_META: Record<BehaviorSignalKey, { label: string; description: string; display: (v: number) => string }> = {
  incomeRegularity: { label: 'Income regularity', description: 'How predictably income arrives', display: (v) => `${Math.round(v)}% regular` },
  incomeSourceDependence: { label: 'Income source dependence', description: 'How much you rely on one source', display: (v) => `${Math.round(v)}% one source` },
  spendingStability: { label: 'Spending stability', description: 'Day-to-day spending steadiness', display: (v) => `${Math.round(v)}/100` },
  discretionaryShare: { label: 'Discretionary share', description: 'Share of spending on wants, not needs', display: (v) => `${Math.round(v)}% discretionary` },
  postIncomeAcceleration: { label: 'Post-income acceleration', description: 'Spending bump in the 72h after income', display: (v) => `+${Math.round(v - 100)}% bump` },
  savingsConsistency: { label: 'Savings consistency', description: 'Balance movement across weeks', display: (v) => `${Math.round(v)}%` },
  commitmentReliability: { label: 'Commitment reliability', description: 'Recurring payments made on time', display: (v) => `${Math.round(v)}% paid` },
  debtPressure: { label: 'Debt pressure', description: 'Repayments as a share of income', display: (v) => `${Math.round(v)}% of income` },
  financialResilience: { label: 'Financial resilience', description: 'Days of buffer for essentials', display: (v) => `${Math.round(v)} days` },
}

const lockedExamples = ['Borrowing behavior', 'Spending trigger patterns', 'Savings consistency']

export default function FinancialPersonality() {
  const body = useGoogleFont('Manrope')
  const { transactions, behaviorModel } = useFinance()

  const { signals, confidence, dataPoints } = behaviorModel
  const generated = generateInsights(behaviorModel)
  const confidencePctValue = Math.round(confidence * 100)

  const now = new Date()
  const brainTx = storeTransactionsToBrain(transactions)
  const weekLabels = ['5w', '4w', '3w', '2w', '1w', 'Now']
  const weeklySpend = [5, 4, 3, 2, 1, 0].map((w) => weeklyTotals(brainTx, now, w).spending)

  const confirmed = generated.filter((ins) => {
    const s = signals[ins.signal as BehaviorSignalKey]
    return s && s.confidence >= 0.7
  })
  const emerging = generated.filter((ins) => {
    const s = signals[ins.signal as BehaviorSignalKey]
    return s && s.confidence >= 0.5 && s.confidence < 0.7
  })

  const signalRows = Object.entries(signals)
    .filter(([, s]) => s.sampleSize > 0)
    .map(([key, s]) => {
      const meta = SIGNAL_META[key as BehaviorSignalKey]
      const status = s.confidence >= 0.7 ? 'good' : 'ok'
      return {
        key,
        label: meta.label,
        description: meta.description,
        display: meta.display(s.value),
        status,
        confidence: s.confidence,
      }
    })

  const lockedCount = 9 - signalRows.length

  if (confidencePctValue < 40) {
    return (
      <div className="min-h-screen bg-background pb-28" style={{ fontFamily: body }}>
        <AppHeader />
        <main className="mx-auto max-w-md px-5 pt-4">
          <LearningState confidence={confidencePctValue} dataPoints={dataPoints} />
        </main>
        <BottomNav active="patterns" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-28" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto max-w-md px-5 pt-4 space-y-6 animate-fade-up">
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

        {/* Spending by week */}
        <div className="card p-4">
          <SectionTitle title="Spending by week" hint="See your spending rhythm" />
          <BarChart data={weeklySpend} labels={weekLabels} tone="accent" height={130} />
        </div>

        {/* Confirmed patterns */}
        {confirmed.length > 0 && (
          <div>
            <SectionTitle title="Confirmed patterns" hint={`${confirmed.length} patterns locked in`} />
            <div className="space-y-3">
              {confirmed.map((ins) => {
                const s = signals[ins.signal as BehaviorSignalKey]
                return (
                  <div key={ins.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                        <TrendingUp size={18} />
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
        )}

        {/* Emerging patterns */}
        {emerging.length > 0 && (
          <div>
            <SectionTitle title="Emerging patterns" hint="Needs more data to confirm" />
            <div className="space-y-3">
              {emerging.map((ins) => {
                const s = signals[ins.signal as BehaviorSignalKey]
                return (
                  <div key={ins.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                        <TrendingUp size={18} />
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
        )}

        {/* All signals */}
        {signalRows.length > 0 && (
          <div>
            <SectionTitle
              title="All behavioral signals"
              hint={confidence >= 0.7 ? 'Calculated daily from your activity' : 'Emerging — still calculating'}
            />
            <div className="card divide-y divide-ink-100">
              {signalRows.map((s) => (
                <div key={s.key} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      s.status === 'good' ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {s.confidence >= 0.7 ? <TrendingUp size={15} /> : <Minus size={15} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900">{s.label}</p>
                    <p className="text-xs text-ink-500 leading-snug mt-0.5">{s.description}</p>
                  </div>
                  <span className="text-right">
                    <p className="text-sm font-bold text-ink-900 whitespace-nowrap">{s.display}</p>
                    <p className="text-[10px] text-ink-400">{confidencePct(s.confidence)}% conf</p>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked / future signals */}
        <div>
          <SectionTitle title="Still learning" hint="Unlocks with more data" />
          <div className="card divide-y divide-ink-100">
            {(lockedCount > 0 ? lockedExamples.slice(0, lockedCount) : []).map((label) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 opacity-60">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400">
                  <Lock size={14} />
                </span>
                <p className="text-sm font-medium text-ink-600 flex-1">{label}</p>
                <span className="text-xs text-ink-400">Locked</span>
              </div>
            ))}
            <div className="flex items-center gap-3 px-4 py-3">
              <p className="text-[11px] text-ink-400 flex-1 leading-relaxed">
                {confidencePhrase(behaviorModel.confidenceTier)} — more records unlock the signals above.
              </p>
            </div>
          </div>
        </div>

        {/* Pattern dashboard + support links */}
        <Link
          href="/PatternDashboard"
          className="card p-5 flex items-center justify-between hover:bg-ink-50 transition"
        >
          <div>
            <p className="text-sm font-semibold text-ink-900">See the full pattern dashboard</p>
            <p className="text-xs text-ink-500 mt-0.5">Income days, regular expenses, and more</p>
          </div>
          <ArrowRight size={18} className="text-brand-600 shrink-0" />
        </Link>

        <Link href="/SupportNetwork" className="card p-4 flex items-center gap-3 hover:bg-ink-50 transition">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-white">
            <HeartHandshake size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-900">Support network</p>
            <p className="text-xs text-ink-500">See who you&rsquo;ve lent to or borrowed from</p>
          </div>
          <ArrowRight size={16} className="text-ink-300 shrink-0" />
        </Link>
      </main>

      <BottomNav active="patterns" />
    </div>
  )
}