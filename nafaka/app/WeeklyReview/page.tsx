'use client'

import React from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { Sparkles, Check, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react'
import { useFinance } from '@/lib/store'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import { weeklyTotals, formatWeekRange, percentDelta } from '@/lib/brain/weekly'
import { essentialCostPerDay } from '@/lib/brain/signals'
import { SectionTitle, StatPill } from '@/components/proto/ui'
import { fmt } from '@/components/proto/format'
import type { NafakaPrediction } from '@/lib/brain/predict'

export default function WeeklyReview() {
  const body = useGoogleFont('Manrope')
  const { transactions, commitments, balance, behaviorModel, predictions, focus } = useFinance()

  const now = new Date()
  const weekLabel = formatWeekRange(now)
  const brainTxs = storeTransactionsToBrain(transactions)
  const thisWeek = weeklyTotals(brainTxs, now)
  const lastWeek = weeklyTotals(brainTxs, now, 1)
  const confidencePctValue = Math.round(behaviorModel.confidence * 100)

  const totalDelta = percentDelta(thisWeek.spending, lastWeek.spending)
  const discretionary = behaviorModel.signals.discretionaryShare
  const bufferDays = essentialCostPerDay(brainTxs) > 0 ? Math.floor(balance / essentialCostPerDay(brainTxs)) : 0

  const fulfilled = commitments.filter((c) => c.status === 'fulfilled').length

  const highlights = [
    { label: 'Income received', value: fmt(thisWeek.income), tone: 'positive' as const },
    { label: 'Commitments paid', value: `${fulfilled} of ${commitments.length}`, tone: 'positive' as const },
    { label: 'Saved to buffer', value: `${bufferDays} days`, tone: 'positive' as const },
    {
      label: 'Discretionary change',
      value: discretionary.sampleSize > 0 ? `${Math.round(discretionary.value)}% of spending` : '—',
      tone: 'positive' as const,
    },
  ]

  const headline = focus.title
  const bodyText = focus.body

  return (
    <div className="min-h-screen bg-ink-50 pb-28" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto max-w-md px-5 pt-4 space-y-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Weekly Review</h1>
            <p className="text-sm text-ink-500 mt-1">{weekLabel}</p>
          </div>
          <StatPill tone="positive">
            <Sparkles size={12} /> {confidencePctValue}% confidence
          </StatPill>
        </div>

        {/* Judgment-filtered headline */}
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-card">
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-white/70">
              <Sparkles size={16} />
              <p className="text-xs font-semibold uppercase tracking-wide">This week, with context</p>
            </div>
            <p className="mt-3 font-display text-xl font-semibold leading-snug">{headline}</p>
            <p className="mt-2 text-sm text-white/85 leading-relaxed">{bodyText}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5">
              <Check size={14} />
              <span className="text-xs font-medium">Nothing to correct here</span>
            </div>
          </div>
        </div>

        {/* Delta comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <p className="text-xs font-medium text-ink-500">Total spending</p>
            <p className="mt-1 text-2xl font-bold text-accent-700">
              {totalDelta === null ? '—' : `${totalDelta > 0 ? '+' : ''}${totalDelta}%`}
            </p>
            <p className="text-[11px] text-ink-400 mt-1">vs last week</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-ink-500">Discretionary spending</p>
            <p className="mt-1 text-2xl font-bold text-brand-700">
              {discretionary.sampleSize > 0 ? `${Math.round(discretionary.value)}%` : '—'}
            </p>
            <p className="text-[11px] text-ink-400 mt-1">the part you control</p>
          </div>
        </div>

        {/* Highlights */}
        <div>
          <SectionTitle title="Week highlights" />
          <div className="grid grid-cols-2 gap-3">
            {highlights.map((h) => (
              <div key={h.label} className="card p-3.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      h.tone === 'positive' ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {h.tone === 'positive' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                  </span>
                  <p className="text-[11px] font-medium text-ink-500">{h.label}</p>
                </div>
                <p className="mt-2 text-sm font-bold text-ink-900">{h.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next week coaching */}
        <div>
          <SectionTitle title="Looking ahead" hint="Adaptive coaching for next week" />
          <div className="space-y-3">
            {predictions.length > 0 ? (
              predictions.slice(0, 3).map((p: NafakaPrediction, i) => (
                <div key={p.id} className="card p-4 flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-700 text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-ink-700 leading-relaxed">{p.reason}</p>
                </div>
              ))
            ) : (
              <div className="card p-4 flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-700 text-xs font-bold">
                  1
                </span>
                <p className="text-sm text-ink-700 leading-relaxed">
                  More data sharpens next week&rsquo;s outlook — keep recording income and expenses as they happen.
                </p>
              </div>
            )}
          </div>
        </div>

        <Link href="/AIChat" className="btn-primary w-full">
          <Sparkles size={16} /> Ask Nafaka about this week
          <ChevronRight size={16} />
        </Link>
      </main>

      <BottomNav active="coach" />
    </div>
  )
}