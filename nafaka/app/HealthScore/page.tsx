'use client'

import React from 'react'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { TrendingUp, ShieldCheck, PiggyBank, HandCoins, ArrowUpRight } from 'lucide-react'

export default function HealthScore() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')

  const score = 71
  const data = [{ name: 'score', value: score, fill: 'var(--color-score)' }]

  const components = [
    { key: 'consistency', label: 'Consistency', value: 78, icon: TrendingUp },
    { key: 'commitment', label: 'Commitment reliability', value: 84, icon: ShieldCheck },
    { key: 'savings', label: 'Savings rate', value: 52, icon: PiggyBank },
    { key: 'debt', label: 'Debt management', value: 66, icon: HandCoins },
  ]

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
              {score}
            </p>
            <p className="text-xs text-muted-foreground mt-1">out of 100</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 bg-secondary/15 text-secondary text-xs font-semibold px-3 py-1.5 rounded-full">
            <ArrowUpRight size={13} />
            Up 4 points this week
          </div>
        </div>

        <div className="bg-accent/50 border border-border rounded-2xl p-5 mb-8">
          <p className="text-sm text-foreground leading-relaxed">
            A student with UGX 20,000 can score higher than someone with millions — this score rewards consistent
            decisions, not account balances.
          </p>
        </div>

        <h2 className="text-sm font-semibold text-foreground mb-3">What makes up your score</h2>
        <div className="space-y-3">
          {components.map(({ key, label, value, icon: Icon }) => (
            <div key={key} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Icon size={15} className="text-secondary" />
                  </span>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="score" />
    </div>
  )
}
