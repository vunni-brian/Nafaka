'use client'

import React, { useMemo, useSyncExternalStore } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Sparkles, Check, ArrowUpRight, ArrowDownRight, Minus, ChevronRight, Target } from 'lucide-react'
import { useFinance } from '@/lib/store'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import { dailyTotals, formatWeekRange, percentDelta, weeklyTotals } from '@/lib/brain/weekly'
import { confidencePct, regularityCopy, stateCopy, stateLabel } from '@/lib/brain/describe'
import { daysBetween, toISODate } from '@/lib/brain/stats'
import { situationCopy, situationLabel } from '@/lib/brain/situation'
import { SectionTitle, StatPill } from '@/components/proto/ui'
import type { BehaviorInsight } from '@/lib/brain/types'

function fmt(n: number) {
  return `UGX ${Math.round(n).toLocaleString()}`
}

export default function WeeklyReview() {
  const body = useGoogleFont('Manrope')
  const { transactions, behaviorModel, focus, lastCoachingOutcome, coachingStats } = useFinance()

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const now = useMemo(() => new Date(), [])
  const brainTx = useMemo(() => storeTransactionsToBrain(transactions), [transactions])
  const chartData = useMemo(() => dailyTotals(brainTx, now), [brainTx, now])
  const thisWeek = useMemo(() => weeklyTotals(brainTx, now, 0), [brainTx, now])
  const lastWeek = useMemo(() => weeklyTotals(brainTx, now, 1), [brainTx, now])

  const incomeDelta = percentDelta(thisWeek.income, lastWeek.income)
  const spendingDelta = percentDelta(thisWeek.spending, lastWeek.spending)

  const incomeDeltaText = incomeDelta === null
    ? lastWeek.events === 0
      ? 'First week of data'
      : 'No income this week'
    : `${incomeDelta > 0 ? '+' : ''}${incomeDelta}% vs last week`
  const spendingDeltaText = spendingDelta === null
    ? lastWeek.events === 0
      ? 'First week of data'
      : 'No spending this week'
    : `${spendingDelta > 0 ? '+' : ''}${spendingDelta}% vs last week`

  const insight: BehaviorInsight | null = behaviorModel.insights[0] ?? null
  const insightSignal =
    insight !== null && insight.signal in behaviorModel.signals
      ? behaviorModel.signals[insight.signal as keyof typeof behaviorModel.signals]
      : null

  const outcome = lastCoachingOutcome
  const outcomeForThisFocus = outcome !== null && outcome.focusKey === focus.key
  const measuredStats = coachingStats.filter((s) => s.recommended > 0)

  const heldDays =
    behaviorModel.situationMemory !== undefined
      ? daysBetween(behaviorModel.situationMemory.holdingSince, toISODate(now))
      : 0

  const confidencePctValue = Math.round(behaviorModel.confidence * 100)

  const highlights = [
    {
      label: 'Income',
      value: mounted ? fmt(thisWeek.income) : '—',
      tone: (incomeDelta ?? 0) < 0 ? 'neutral' : 'positive',
    },
    {
      label: 'Spending',
      value: mounted ? fmt(thisWeek.spending) : '—',
      tone: (spendingDelta ?? 0) > 0 ? 'neutral' : 'positive',
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-28" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto max-w-md px-5 pt-4 space-y-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Weekly Review</h1>
            <p className="text-sm text-ink-500 mt-1">{mounted ? formatWeekRange(now) : '\u00A0'}</p>
          </div>
          <StatPill tone="positive">
            <Sparkles size={12} /> {confidencePctValue}% confidence
          </StatPill>
        </div>

        {/* Judgment-filtered headline */}
        <div className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-card">
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-white/70">
              <Sparkles size={16} />
              <p className="text-xs font-semibold uppercase tracking-wide">This week, with context</p>
            </div>
            <p className="mt-3 font-display text-xl font-semibold leading-snug">
              {insight ? insight.text : 'Nafaka is still learning your patterns this week.'}
            </p>
            {insightSignal && insightSignal.confidence >= 0.5 && (
              <p className="mt-2 text-xs text-white/70">
                {confidencePct(insightSignal.confidence)}% confident — based on {insightSignal.sampleSize} observed
                event{insightSignal.sampleSize === 1 ? '' : 's'}.
              </p>
            )}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5">
              <Check size={14} />
              <span className="text-xs font-medium">Nothing to correct here</span>
            </div>
          </div>
        </div>

        {/* Delta comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="flex items-center gap-1.5">
              {!mounted || spendingDelta === null ? <Minus size={14} className="text-ink-400" /> : spendingDelta > 0 ? <ArrowUpRight size={14} className="text-accent-600" /> : <ArrowDownRight size={14} className="text-brand-600" />}
              <p className="text-xs font-medium text-ink-500">Total spending</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-accent-700">
              {mounted ? (spendingDelta === null ? '—' : `${spendingDelta > 0 ? '+' : ''}${spendingDelta}%`) : '—'}
            </p>
            <p className="text-[11px] text-ink-400 mt-1">{mounted ? spendingDeltaText : '\u00A0'}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-1.5">
              {!mounted || incomeDelta === null ? <Minus size={14} className="text-ink-400" /> : incomeDelta > 0 ? <ArrowUpRight size={14} className="text-brand-600" /> : <ArrowDownRight size={14} className="text-ink-500" />}
              <p className="text-xs font-medium text-ink-500">Income</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-brand-700">
              {mounted ? (incomeDelta === null ? '—' : `${incomeDelta > 0 ? '+' : ''}${incomeDelta}%`) : '—'}
            </p>
            <p className="text-[11px] text-ink-400 mt-1">{mounted ? incomeDeltaText : '\u00A0'}</p>
          </div>
        </div>

        {/* Week highlights */}
        <div>
          <SectionTitle title="Week highlights" hint="Income vs spending, day by day" />
          <div className="grid grid-cols-2 gap-3">
            {highlights.map((h) => (
              <div key={h.label} className="card p-3.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      h.tone === 'positive' ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {h.label === 'Income' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                  </span>
                  <p className="text-[11px] font-medium text-ink-500">{h.label}</p>
                </div>
                <p className="mt-2 text-sm font-bold text-ink-900">{h.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Income vs spending chart */}
        <div className="card p-4">
          <SectionTitle title="Income vs spending" hint="Last 7 days" />
          {mounted ? (
            <ChartContainer
              config={{
                income: { label: 'Income', color: '#19bd80' },
                spending: { label: 'Spending', color: '#f27d14' },
              }}
              className="h-44 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid vertical={false} stroke="#eceef2" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                  <Bar dataKey="spending" fill="var(--color-spending)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-44" />
          )}
        </div>

        {/* What it means */}
        <div className="card p-4">
          <SectionTitle title="What it means" hint="State and situation read" />
          <p className="text-sm text-ink-700 leading-relaxed">
            You are currently in {stateLabel(behaviorModel.state)} —{' '}
            {behaviorModel.stateDetail.runwayDays < 999
              ? `your buffer covers roughly ${behaviorModel.stateDetail.runwayDays} days of essentials.`
              : stateCopy(behaviorModel.state)}
          </p>
          <p className="text-xs text-ink-500 mt-2 leading-relaxed">
            Nafaka reads your situation as {situationLabel(behaviorModel.situation)} — {situationCopy(behaviorModel.situation)}
            {heldDays >= 3 ? ` This read has held steady for ${heldDays} days.` : ''}
          </p>
          <div className="mt-4 pt-4 border-t border-ink-100">
            <p className="text-xs text-ink-500 leading-relaxed">
              {behaviorModel.signals.incomeRegularity.sampleSize >= 2
                ? regularityCopy(behaviorModel.signals.incomeRegularity.value)
                : 'Nafaka is still learning your income rhythm. For now, base tomorrow on today\u2019s safe-to-spend.'}{' '}
              {behaviorModel.stateDetail.upcomingTotal > 0 &&
                `${fmt(behaviorModel.stateDetail.upcomingTotal)} in commitments sits on the horizon.`}
            </p>
          </div>
        </div>

        {/* Looking ahead — adaptive coaching */}
        <div>
          <SectionTitle title="Looking ahead" hint="Adaptive coaching for next week" />
          <div className="space-y-3">
            <div className="card p-4 flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <Target size={14} />
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide">{focus.title}</p>
                <p className="text-sm text-ink-700 leading-relaxed mt-1">{focus.body}</p>
                {measuredStats.length > 0 && (
                  <p className="text-[11px] text-ink-500 mt-2 leading-relaxed">
                    Coaching track record: {measuredStats.map((s) => `${s.key} ${Math.round((s.successRate ?? 0) * 100)}%`).join(' · ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Did it work? */}
        <div>
          <SectionTitle title="Did it work?" hint="Measured, not guessed" />
          {outcome !== null && outcome.measured && outcomeForThisFocus ? (
            <div className={`card p-5 border ${outcome.improved ? 'border-brand-200 bg-brand-50/60' : 'border-accent-200 bg-accent-50/60'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Target size={15} className="text-brand-700" />
                <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide">
                  {outcome.improved ? 'You changed the pattern' : 'Still building the habit'}
                </p>
              </div>
              <p className="font-display text-lg font-semibold text-ink-900 leading-snug">{outcome.text}</p>
              <p className="text-[11px] text-ink-500 mt-3">
                {outcome.metric} — compared against {outcome.sampleSize} earlier week{outcome.sampleSize === 1 ? '' : 's'} of your own history.
              </p>
            </div>
          ) : (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target size={15} className="text-ink-400" />
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Measured, not guessed</p>
              </div>
              <p className="text-sm text-ink-600 leading-relaxed">
                {outcome !== null && outcome.focusKey !== focus.key && outcome.measured
                  ? 'Nafaka closed the previous focus with a measurement — a new window for this focus is open.'
                  : 'Nafaka evaluates each focus against a full week of your own behavior, then reports whether the pattern actually changed.'}
              </p>
            </div>
          )}
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