'use client'

import React from 'react'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { TrendingUp, ShieldCheck, PiggyBank, HandCoins, LifeBuoy, Sparkles, Crosshair } from 'lucide-react'
import { useFinance } from '@/lib/store'
import { computeHealthScore, type HealthComponent, type HealthComponentKey } from '@/lib/brain/health'
import { componentSuggestion, weakestReadyComponent } from '@/lib/brain/focus'
import { confidencePct, stateLabel } from '@/lib/brain/describe'
import type { FinancialState } from '@/lib/brain/types'

const iconFor: Record<HealthComponentKey, typeof TrendingUp> = {
  consistency: TrendingUp,
  commitment: ShieldCheck,
  savings: PiggyBank,
  debt: HandCoins,
  resilience: LifeBuoy,
}

export default function HealthScore() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const { behaviorModel } = useFinance()

  const health = computeHealthScore(behaviorModel)
  const score = health.score
  const weakest = weakestReadyComponent(health.components)
  const data = [{ name: 'score', value: score ?? 0, fill: 'var(--color-score)' }]

  return (
    <div className="min-h-screen bg-background pb-32" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-10">
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Layer 3 · Analyze</p>
        <h1 style={{ fontFamily: display }} className="text-3xl text-foreground mb-2">
          Financial health score
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Not about wealth — about consistency</p>

        <div className="bg-card border border-border rounded-3xl p-6 mb-6 flex flex-col items-center">
          <ChartContainer
            config={{ score: { label: 'Score', color: 'oklch(0.56 0.15 38)' } }}
            className="w-48 h-48"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={data}
                startAngle={90}
                endAngle={-270}
                innerRadius={70}
                outerRadius={95}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar dataKey="value" cornerRadius={20} background={{ fill: 'var(--muted)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="-mt-32 flex flex-col items-center">
            <p style={{ fontFamily: display }} className="text-5xl text-foreground">
              {score ?? '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {score !== null ? 'out of 100' : 'score still developing'}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 bg-secondary/15 text-secondary text-xs font-semibold px-3 py-1.5 rounded-full">
            <Sparkles size={13} />
            {health.readyCount} of {health.totalCount} components confident
          </div>
        </div>

        <div className="bg-accent/50 border border-border rounded-2xl p-5 mb-8">
          <p className="text-sm text-foreground leading-relaxed">
            A student with UGX 20,000 can score higher than someone with millions — this score rewards consistent
            decisions, not account balances.
          </p>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            A component below 50% confidence counts as “still learning” and doesn&rsquo;t drag your score yet.{' '}
            {score !== null && `Your score today is built on ${health.readyCount} confident component${health.readyCount === 1 ? '' : 's'}.`}
          </p>
        </div>

        <h2 className="text-sm font-semibold text-foreground mb-3">What makes up your score</h2>
        <div className="space-y-3 mb-8">
          {health.components.map((c) => (
            <ComponentRow key={c.key} component={c} state={behaviorModel.state} />
          ))}
        </div>

        {weakest && (
          <div className="rounded-3xl bg-accent/50 border border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <Crosshair size={16} className="text-secondary" />
              <p className="text-xs uppercase tracking-wide font-semibold text-secondary">
                One focus — {weakest.label.toLowerCase()}
              </p>
            </div>
            <p style={{ fontFamily: display }} className="text-lg text-foreground leading-snug">
              {componentSuggestion(weakest.key)}
            </p>
          </div>
        )}
      </div>

      <BottomNav active="score" />
    </div>
  )
}

function ComponentRow({ component, state }: { component: HealthComponent; state: FinancialState }) {
  const Icon = iconFor[component.key]
  const pct = confidencePct(component.confidence)

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Icon size={15} className="text-secondary" />
          </span>
          <p className="text-sm font-medium text-foreground">{component.label}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              component.ready
                ? 'bg-secondary/15 text-secondary'
                : component.active
                  ? 'bg-muted text-foreground/80'
                  : 'bg-muted/60 text-foreground/70'
            }`}
          >
            {component.ready ? `${pct}% confident` : 'still learning'}
          </span>
          <p className="text-sm font-semibold text-foreground w-8 text-right">
            {component.ready ? Math.round(component.value) : '—'}
          </p>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${component.ready ? 'bg-primary' : 'bg-muted-foreground/25'}`}
          style={{ width: `${component.ready ? Math.round(component.value) : 8}%` }}
        />
      </div>
      {component.active && !component.ready && (
        <p className="text-[11px] text-muted-foreground mt-2">
          Seeing real signals from {component.sampleSize} observed point{component.sampleSize === 1 ? '' : 's'} — needs more data to count toward your score.
        </p>
      )}
      {!component.active && (
        <p className="text-[11px] text-muted-foreground mt-2">
          No data yet — record {component.key === 'consistency' ? 'income and expenses' : component.key === 'commitment' ? 'commitment outcomes in Life Events' : component.key === 'savings' ? 'weekly snapshots' : component.key === 'debt' ? 'income and debt payments' : 'expenses'} to start.
        </p>
      )}
      {component.ready && (
        <p className="text-[11px] text-muted-foreground mt-2">
          State: {stateLabel(state)} — this component reflects {component.sampleSize} observed point{component.sampleSize === 1 ? '' : 's'}.
        </p>
      )}
    </div>
  )
}