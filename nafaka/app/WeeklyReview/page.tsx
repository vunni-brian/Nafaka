'use client'

import React, { useMemo, useSyncExternalStore } from 'react'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Sparkles, ArrowUpRight, ArrowDownRight, Minus, CalendarClock, Crosshair, Target } from 'lucide-react'
import { useFinance } from '@/lib/store'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import { dailyTotals, formatWeekRange, percentDelta, weeklyTotals } from '@/lib/brain/weekly'
import { confidencePct, regularityCopy, stateCopy, stateLabel } from '@/lib/brain/describe'
import { daysBetween, toISODate } from '@/lib/brain/stats'
import { situationCopy, situationLabel } from '@/lib/brain/situation'
import type { BehaviorInsight } from '@/lib/brain/types'

function fmt(n: number) {
  return `UGX ${Math.round(n).toLocaleString()}`
}

export default function WeeklyReview() {
  const display = useGoogleFont('Fraunces')
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

  return (
    <div className="min-h-screen bg-background pb-32" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-10">
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Layer 4 · Coach</p>
        <h1 style={{ fontFamily: display }} className="text-3xl text-foreground mb-2">
          Your week, in review
        </h1>
        <p className="text-sm text-muted-foreground mb-8">{mounted ? formatWeekRange(now) : '\u00A0'}</p>

        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-[11px] font-bold text-secondary-foreground">1</span>
          </span>
          <h2 className="text-sm font-semibold text-foreground">What changed</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold mb-2">
              {!mounted || incomeDelta === null ? <Minus size={13} /> : incomeDelta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} Income
            </div>
            <p style={{ fontFamily: display }} className="text-xl text-foreground">
              {mounted ? fmt(thisWeek.income) : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mounted ? incomeDeltaText : '\u00A0'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold mb-2">
              {!mounted || spendingDelta === null ? <Minus size={13} /> : spendingDelta <= 0 ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />} Spending
            </div>
            <p style={{ fontFamily: display }} className="text-xl text-foreground">
              {mounted ? fmt(thisWeek.spending) : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mounted ? spendingDeltaText : '\u00A0'}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-8">
          <p className="text-sm font-semibold text-foreground mb-4">Income vs spending</p>
          {mounted ? (
            <ChartContainer
              config={{
                income: { label: 'Income', color: 'oklch(0.33 0.055 155)' },
                spending: { label: 'Spending', color: 'oklch(0.56 0.15 38)' },
              }}
              className="h-44 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={11}
                  />
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

        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-[11px] font-bold text-secondary-foreground">2</span>
          </span>
          <h2 className="text-sm font-semibold text-foreground">What Nafaka noticed</h2>
        </div>

        <div className="rounded-3xl bg-primary text-primary-foreground p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-primary-foreground/10" />
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} />
            <p className="text-xs uppercase tracking-wide font-semibold">Coaching insight</p>
          </div>
          {insight ? (
            <>
              <p style={{ fontFamily: display }} className="text-lg leading-snug">
                {insight.text}
              </p>
              {insightSignal && insightSignal.confidence >= 0.5 && (
                <p className="text-[11px] text-primary-foreground/70 mt-3">
                  {confidencePct(insightSignal.confidence)}% confident — based on {insightSignal.sampleSize}{' '}
                  observed event{insightSignal.sampleSize === 1 ? '' : 's'}.
                </p>
              )}
            </>
          ) : (
            <p style={{ fontFamily: display }} className="text-lg leading-snug">
              Nafaka is still learning your patterns this week.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-[11px] font-bold text-secondary-foreground">3</span>
          </span>
          <h2 className="text-sm font-semibold text-foreground">What it means</h2>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-8">
          <p className="text-sm text-foreground leading-relaxed">
            You are currently in {stateLabel(behaviorModel.state)} —{' '}
            {behaviorModel.stateDetail.runwayDays < 999
              ? `your buffer covers roughly ${behaviorModel.stateDetail.runwayDays} days of essentials.`
              : stateCopy(behaviorModel.state)}
          </p>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Nafaka reads your situation as {situationLabel(behaviorModel.situation)} — {situationCopy(behaviorModel.situation)}
            {heldDays >= 3 ? ` This read has held steady for ${heldDays} days.` : ''}
          </p>
          <div className="flex items-start gap-3 mt-4 pt-4 border-t border-border">
            <CalendarClock size={16} className="text-secondary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {behaviorModel.signals.incomeRegularity.sampleSize >= 2
                ? regularityCopy(behaviorModel.signals.incomeRegularity.value)
                : 'Nafaka is still learning your income rhythm. For now, base tomorrow on today\u2019s safe-to-spend.'}{' '}
              {behaviorModel.stateDetail.upcomingTotal > 0 &&
                `${fmt(behaviorModel.stateDetail.upcomingTotal)} in commitments sits on the horizon.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-[11px] font-bold text-secondary-foreground">4</span>
          </span>
          <h2 className="text-sm font-semibold text-foreground">One focus this week</h2>
        </div>

        <div className="rounded-3xl bg-accent/50 border border-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Crosshair size={16} className="text-secondary" />
            <p className="text-xs uppercase tracking-wide font-semibold text-secondary">{focus.title}</p>
          </div>
          <p style={{ fontFamily: display }} className="text-lg text-foreground leading-snug">
            {focus.body}
          </p>
          {measuredStats.length > 0 && (
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              Coaching track record: {measuredStats.map((s) => `${s.key} ${Math.round((s.successRate ?? 0) * 100)}%`).join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-[11px] font-bold text-secondary-foreground">5</span>
          </span>
          <h2 className="text-sm font-semibold text-foreground">Did it work?</h2>
        </div>

        {outcome !== null && outcome.measured && outcomeForThisFocus ? (
          <div className={`rounded-3xl border p-6 mb-8 ${outcome.improved ? 'bg-green-900/20 border-green-800/40' : 'bg-amber-900/20 border-amber-800/40'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-secondary" />
              <p className="text-xs uppercase tracking-wide font-semibold text-secondary">
                {outcome.improved ? 'You changed the pattern' : 'Still building the habit'}
              </p>
            </div>
            <p style={{ fontFamily: display }} className="text-lg text-foreground leading-snug">
              {outcome.text}
            </p>
            <p className="text-[11px] text-muted-foreground mt-3">
              {outcome.metric} — compared against {outcome.sampleSize} earlier week{outcome.sampleSize === 1 ? '' : 's'} of your own history.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-card border border-border p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-secondary" />
              <p className="text-xs uppercase tracking-wide font-semibold text-secondary">Measured, not guessed</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {outcome !== null && outcome.focusKey !== focus.key && outcome.measured
                ? 'Nafaka closed the previous focus with a measurement — a new window for this focus is open.'
                : 'Nafaka evaluates each focus against a full week of your own behavior, then reports whether the pattern actually changed.'}
            </p>
          </div>
        )}
      </div>

      <BottomNav active="coach" />
    </div>
  )
}