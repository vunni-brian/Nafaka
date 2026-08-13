'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import { toISODate } from '@/lib/brain/stats'
import { ChevronLeft, Church, Users, Landmark, Repeat, Target } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const chartConfig = {
  amount: { label: 'Spent', color: 'var(--color-primary)' },
} satisfies ChartConfig

const categoryLabels: Record<string, string> = {
  food: 'Food',
  transport: 'Transport',
  giving: 'Giving',
  debt: 'Debt',
  shopping: 'Shopping',
  other: 'Other',
}

const commitmentIcons: Record<string, typeof Church> = {
  cell: Users,
  church: Church,
  rent: Landmark,
  debt: Landmark,
}

function commitmentIcon(label: string): typeof Church {
  const lower = label.toLowerCase()
  if (lower.includes('cell')) return commitmentIcons.cell
  if (lower.includes('offering') || lower.includes('tithe') || lower.includes('church')) return commitmentIcons.church
  if (lower.includes('rent')) return commitmentIcons.rent
  return commitmentIcons.debt
}

export default function PatternDashboard() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const { goals, transactions, commitments } = useFinance()

  const goalColors = ['bg-secondary', 'bg-primary', 'bg-accent', 'bg-muted-foreground']

  const levelClasses = [
    'bg-muted',
    'bg-secondary/30',
    'bg-secondary/60',
    'bg-secondary',
  ]

  const days = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const base = new Date(today)
    base.setDate(base.getDate() - 29)
    const counts = new Map<string, number>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      counts.set(toISODate(d), 0)
    }
    for (const tx of storeTransactionsToBrain(transactions)) {
      if (tx.type !== 'income') continue
      const key = toISODate(new Date(tx.date))
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return [...counts.entries()].map(([key, count]) => ({
      key,
      label: new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      level: Math.min(3, count),
      count,
    }))
  }, [transactions])

  const incomeDays = days.filter((d) => d.count > 0).length

  const categoryData = useMemo(() => {
    const sums = new Map<string, number>()
    for (const t of transactions) {
      if (t.type !== 'expense') continue
      const key = t.category ?? 'other'
      sums.set(key, (sums.get(key) ?? 0) + t.amount)
    }
    return [...sums.entries()]
      .map(([category, amount]) => ({ category: categoryLabels[category] ?? category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }, [transactions])

  const recurring = useMemo(() => commitments.filter((c) => c.status === 'upcoming').slice(0, 4), [commitments])

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
          {days.length > 0 ? (
            <>
              <div className="grid grid-cols-10 gap-1.5 mb-3">
                {days.map(({ key, label, level, count }) => (
                  <div
                    key={key}
                    title={`${label}${count > 0 ? ` — ${count} income${count === 1 ? '' : 's'}` : ''}`}
                    className={`aspect-square rounded-sm ${levelClasses[level]}`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Less</span>
                <span>{incomeDays > 0 ? `${incomeDays} income days` : 'No income recorded this month'}</span>
                <div className="flex items-center gap-1">
                  {levelClasses.map((c, i) => (
                    <span key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No income recorded yet. Add income in the snapshot to see your rhythm.</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={15} className="text-secondary" />
            <h2 className="text-sm font-semibold text-foreground">Savings goals</h2>
          </div>
          {goals.length > 0 ? (
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
          ) : (
            <p className="text-xs text-muted-foreground">No goals yet. Add them from Life Events.</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Spending by category</h2>
          <p className="text-xs text-muted-foreground mb-4">From recorded expenses</p>
          {categoryData.length > 0 ? (
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
          ) : (
            <p className="text-xs text-muted-foreground">Record expenses to see where your money goes.</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Repeat size={15} className="text-secondary" />
            <h2 className="text-sm font-semibold text-foreground">Upcoming commitments</h2>
          </div>
          {recurring.length > 0 ? (
            <div className="space-y-2.5">
              {recurring.map(({ id, label, when, amount }) => {
                const Icon = commitmentIcon(label)
                return (
                  <div key={id} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
                    <span className="w-9 h-9 rounded-full bg-accent/60 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-foreground" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{when}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">UGX {amount.toLocaleString()}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No upcoming commitments. Add them in Life Events.</p>
          )}
        </div>
      </div>

      <BottomNav active="patterns" />
    </div>
  )
}