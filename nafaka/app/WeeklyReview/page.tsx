'use client'

import React from 'react'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Sparkles, ArrowUpRight, ArrowDownRight, CalendarClock } from 'lucide-react'

const chartData = [
  { day: 'Mon', income: 12000, spending: 9000 },
  { day: 'Tue', income: 0, spending: 6500 },
  { day: 'Wed', income: 45000, spending: 14000 },
  { day: 'Thu', income: 8000, spending: 7200 },
  { day: 'Fri', income: 0, spending: 11000 },
  { day: 'Sat', income: 20000, spending: 15800 },
  { day: 'Sun', income: 0, spending: 21000 },
]

export default function WeeklyReview() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')

  return (
    <div className="min-h-screen bg-background pb-32" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-10">
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Layer 4 · Coach</p>
        <h1 style={{ fontFamily: display }} className="text-3xl text-foreground mb-2">
          Your week, in review
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Nov 3 – Nov 9</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold mb-2">
              <ArrowUpRight size={13} /> Income
            </div>
            <p style={{ fontFamily: display }} className="text-xl text-foreground">
              UGX 85,000
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">18% below last week</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold mb-2">
              <ArrowDownRight size={13} /> Spending
            </div>
            <p style={{ fontFamily: display }} className="text-xl text-foreground">
              UGX 84,500
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Steady vs last week</p>
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
                  dataKey="day"
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
          <p style={{ fontFamily: display }} className="text-lg leading-snug">
            You stayed within your food budget despite earning less this week.
          </p>
          <p className="text-sm text-primary-foreground/80 mt-3 leading-relaxed">
            That consistency is quietly reducing your reliance on borrowing. Keep protecting your Wednesday Cell
            contribution &mdash; it&rsquo;s been your most reliable habit for two months straight.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-3">
          <span className="w-9 h-9 rounded-full bg-accent/60 flex items-center justify-center shrink-0">
            <CalendarClock size={16} className="text-foreground" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Looking ahead to next week</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on your pattern, there&rsquo;s a good chance you&rsquo;ll receive a freelance payment around Thursday. Worth
              holding off on non-essential spending until then.
            </p>
          </div>
        </div>
      </div>

      <BottomNav active="coach" />
    </div>
  )
}
