'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { ChevronLeft, Utensils, Bus, Church, Landmark, Repeat, Target } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'



const categoryData = [
  { category: 'Food', amount: 142000 },
  { category: 'Transport', amount: 96000 },
  { category: 'Giving', amount: 40000 },
  { category: 'Debt', amount: 60000 },
  { category: 'Shopping', amount: 38000 },
]

const chartConfig = {
  amount: { label: 'Spent', color: 'var(--color-primary)' },
} satisfies ChartConfig

const recurring = [
  { icon: Church, label: 'Sunday offering', freq: 'Weekly', amount: 'UGX 10,000' },
  { icon: Landmark, label: 'Cell meeting', freq: 'Weekly', amount: 'UGX 5,000' },
  { icon: Bus, label: 'Boda to campus', freq: '5x / week', amount: '~UGX 4,000' },
  { icon: Utensils, label: 'Rolex & chapati', freq: 'Daily', amount: '~UGX 6,000' },
]

const fixedDays: { day: number; level: number }[] = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  level: [0, 1, 0, 2, 3, 1, 0, 2, 3, 3, 1, 0, 1, 2, 0, 3, 2, 1, 0, 1, 2, 3, 3, 2, 1, 0, 1, 2, 3, 1][i],
}))

export default function PatternDashboard() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const { goals } = useFinance()
  const [days] = useState(fixedDays)

  const goalColors = ['bg-secondary', 'bg-primary', 'bg-accent', 'bg-muted-foreground']

  const levelClasses = [
    'bg-muted',
    'bg-secondary/30',
    'bg-secondary/60',
    'bg-secondary',
  ]

  return (
    <div className="min-h-screen bg-background pb-32" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/FinancialPersonality"
            className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Layer 2 · Understand</p>
            <h1 style={{ fontFamily: display }} className="text-lg text-foreground">
              Pattern dashboard
            </h1>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Income activity, last 30 days</h2>
          </div>
          <div className="grid grid-cols-10 gap-1.5 mb-3">
            {days.map(({ day, level }) => (
              <div
                key={day}
                title={`Day ${day}`}
                className={`aspect-square rounded-sm ${levelClasses[level]}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex items-center gap-1">
              {levelClasses.map((c, i) => (
                <span key={i} className={`w-3 h-3 rounded-sm ${c}`} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={15} className="text-secondary" />
            <h2 className="text-sm font-semibold text-foreground">Savings goals</h2>
          </div>
          <div className="space-y-5">
            {goals.map(({ label, current, target }, i) => {
              const pct = Math.min(100, Math.round((current / target) * 100))
              const color = goalColors[i % goalColors.length]
              return (
                <div key={i}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      UGX {current.toLocaleString()} / {target.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{pct}% of the way there</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Spending by category</h2>
          <p className="text-xs text-muted-foreground mb-4">Last 30 days</p>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ left: -20 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Repeat size={15} className="text-secondary" />
            <h2 className="text-sm font-semibold text-foreground">Recurring expenses detected</h2>
          </div>
          <div className="space-y-2.5">
            {recurring.map(({ icon: Icon, label, freq, amount }, i) => (
              <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
                <span className="w-9 h-9 rounded-full bg-accent/60 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-foreground" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{freq}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="patterns" />
    </div>
  )
}
