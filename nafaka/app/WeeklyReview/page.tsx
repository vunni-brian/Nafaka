'use client'

import React, { useMemo } from 'react'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Sparkles, ArrowUpRight, ArrowDownRight, CalendarClock } from 'lucide-react'
import { useFinance } from '@/lib/store'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import { dailyTotals, formatWeekRange, percentDelta, weeklyTotals } from '@/lib/brain/weekly'
import { regularityCopy, stateCopy, stateLabel } from '@/lib/brain/describe'
import type { BehaviorInsight } from '@/lib/brain/types'

function fmt(n: number) {
  return `UGX ${Math.round(n).toLocaleString()}`
}

export default function WeeklyReview() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const { transactions, behaviorModel } = useFinance()

  const now = useMemo(() => new Date(), [])
  const brainTx = useMemo(() => storeTransactionsToBrain(transactions), [transactions])
  const chartData = useMemo(() => dailyTotals(brainTx, now), [brainTx, now])
  const thisWeek = useMemo(() => weeklyTotals(brainTx, now, 0), [brainTx, now])
  const lastWeek = useMemo(() => weeklyTotals(brainTx, now, 1), [brainTx, now])

  const incomeDelta = percentDelta(thisWeek.income, lastWeek.income)
  const spendingDelta = percentDelta(thisWeek.spending, lastWeek.spending)

  const insight: BehaviorInsight | null = behaviorModel.insights[0] ?? null

  return (
    <div className="min-h-screen bg-background pb-32" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-10">
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Layer 4 · Coach</p>
        <h1 style={{ fontFamily: display }} className="text-3xl text-foreground mb-2">
          Your week, in review
        </h1>
        <p className="text-sm text-muted-foreground mb-8">{formatWeekRange(now)}</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold mb-2">
              <ArrowUpRight size={13} /> Income
            </div>
            <p style={{ fontFamily: display }} className="text-xl text-foreground">
              {fmt(thisWeek.income)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {incomeDelta === null
                ? lastWeek.events === 0
                  ? 'First week of data'
                  : 'No income this week'
                : `${incomeDelta > 0 ? '+' : ''}${incomeDelta}% vs last week`}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold mb-2">
              <ArrowDownRight size={13} /> Spending
            </div>
            <p style={{ fontFamily: display }} className="text-xl text-foreground">
              {fmt(thisWeek.spending)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {spendingDelta === null
                ? thisWeek.events === 0
                  ? 'Nothing recorded yet'
                  : 'First week of data'
                : `${spendingDelta > 0 ? '+' : ''}${spendingDelta}% vs last week`}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-foreground mb-4">Income vs spending</p>
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
        </div>

        <div className="rounded-3xl bg-primary text-primary-foreground p-6 mb-6 relative overflow-hidden">
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
              <p className="text-sm text-primary-foreground/80 mt-3 leading-relaxed">
                Currently {stateLabel(behaviorModel.state)} —{' '}
                {behaviorModel.stateDetail.runwayDays < 999
                  ? `your buffer covers roughly ${behaviorModel.stateDetail.runwayDays} days of essentials.`
                  : stateCopy(behaviorModel.state)}
              </p>
            </>
          ) : (
            <p style={{ fontFamily: display }} className="text-lg leading-snug">
              Nafaka is still learning your patterns this week.
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-3">
          <span className="w-9 h-9 rounded-full bg-accent/60 flex items-center justify-center shrink-0">
            <CalendarClock size={16} className="text-foreground" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Looking ahead to next week</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {behaviorModel.signals.incomeRegularity.sampleSize >= 2
                ? regularityCopy(behaviorModel.signals.incomeRegularity.value)
                : 'Nafaka is still learning your income rhythm. For now, base tomorrow on today\u2019s safe-to-spend.'}{' '}
              {behaviorModel.stateDetail.upcomingTotal > 0 &&
                `${fmt(behaviorModel.stateDetail.upcomingTotal)} in commitments sits on the horizon.`}
            </p>
          </div>
        </div>
      </div>

      <BottomNav active="coach" />
    </div>
  )
}