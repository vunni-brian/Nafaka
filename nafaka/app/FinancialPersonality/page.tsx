'use client'

import React from 'react'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import {
  Zap,
  Calendar,
  TrendingDown,
  Wallet,
  ArrowRight,
  HeartHandshake,
  Sparkles,
  BrainCircuit,
} from 'lucide-react'
import Link from 'next/link'
import {
  accelerationCopy,
  confidencePct,
  confidencePhrase,
  describeRegularity,
  regularityCopy,
  savingsCopy,
  stabilityCopy,
  tierCopy,
  tierLabel,
} from '@/lib/brain/describe'

export default function FinancialPersonality() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const { transactions, behaviorModel } = useFinance()

  const { signals, confidenceTier, confidence, dataPoints, activeSignals, state } = behaviorModel
  const regularity = signals.incomeRegularity
  const acceleration = signals.postIncomeAcceleration
  const stability = signals.spendingStability
  const savings = signals.savingsConsistency

  const incomeEvents = transactions.filter((t) => t.type === 'income')
  const incomeAmounts = incomeEvents.map((t) => t.amount)
  const totalIncome = incomeAmounts.reduce((a, b) => a + b, 0)
  const largestIncome = incomeAmounts.length > 0 ? Math.max(...incomeAmounts) : 0
  const smallestIncome = incomeAmounts.length > 0 ? Math.min(...incomeAmounts) : 0

  const patternLabel = regularity.sampleSize > 0 ? describeRegularity(regularity.value) : 'Still learning'
  const patternCopy = regularity.sampleSize > 0 ? regularityCopy(regularity.value) : null

  const behaviorCards = [
    {
      icon: Zap,
      title: 'After income arrives',
      ready: acceleration.sampleSize > 0,
      sampleSize: acceleration.sampleSize,
      confidence: acceleration.confidence,
      copy: acceleration.sampleSize > 0 ? accelerationCopy(acceleration.value) : null,
    },
    {
      icon: TrendingDown,
      title: 'Daily spending rhythm',
      ready: stability.sampleSize > 0,
      sampleSize: stability.sampleSize,
      confidence: stability.confidence,
      copy: stability.sampleSize > 0 ? stabilityCopy(stability.value) : null,
    },
    {
      icon: Wallet,
      title: 'Savings habit',
      ready: savings.sampleSize > 0,
      sampleSize: savings.sampleSize,
      confidence: savings.confidence,
      copy: savings.sampleSize > 0 ? savingsCopy(savings.value) : null,
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-32" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-10">
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Layer 2 · Understand</p>
        <h1 style={{ fontFamily: display }} className="text-3xl text-foreground mb-2">
          Your financial personality
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Based on {dataPoints} records &middot; Nafaka is {tierLabel(confidenceTier).toLowerCase()} your money
        </p>

        <div className="bg-accent/50 border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <BrainCircuit size={16} className="text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Model confidence</p>
              <p className="text-xs text-muted-foreground">
                {activeSignals.length} signals active &middot; overall {confidencePct(confidence)}%
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed mt-2">{tierCopy(confidenceTier)}</p>
        </div>

        <div className="rounded-3xl bg-secondary text-secondary-foreground p-6 mb-6 relative overflow-hidden">
          <div className="absolute -bottom-12 -right-8 w-40 h-40 rounded-full bg-secondary-foreground/10" />
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wide text-secondary-foreground/70">Income pattern</p>
            <span className="text-[10px] bg-secondary-foreground/15 rounded-full px-2.5 py-1">
              {patternLabel}
            </span>
          </div>
          <p style={{ fontFamily: display }} className="text-3xl mb-1">
            {patternLabel}
          </p>
          {patternCopy ? (
            <p className="text-sm text-secondary-foreground/80 mb-4">{patternCopy}</p>
          ) : (
            <p className="text-sm text-secondary-foreground/80 mb-4">
              Not enough income records yet — we&rsquo;re still learning how predictable your income is.
            </p>
          )}
          {regularity.sampleSize > 0 && (
            <p className="text-xs text-secondary-foreground/60 mb-4">
              From {regularity.sampleSize} income events &middot; {confidencePhrase(confidenceTier)} &middot;{' '}
              {confidencePct(regularity.confidence)}% confidence
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-secondary-foreground/70">Total recorded</p>
              <p className="text-lg font-semibold mt-0.5">UGX {totalIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-foreground/70">Income events</p>
              <p className="text-lg font-semibold mt-0.5">{incomeEvents.length}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-foreground/70">Largest received</p>
              <p className="text-lg font-semibold mt-0.5">UGX {largestIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-foreground/70">Smallest received</p>
              <p className="text-lg font-semibold mt-0.5">UGX {smallestIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-8 flex items-start gap-3">
          <span className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Calendar size={16} className="text-primary" />
          </span>
          <p className="text-sm text-foreground leading-relaxed">
            Because income arrives unevenly, fixed monthly budgets won&rsquo;t fit your life. We adjust your
            safe-to-spend every day instead.
          </p>
        </div>

        <h2 className="text-sm font-semibold text-foreground mb-3">Spending behaviors we&rsquo;ve noticed</h2>
        <div className="space-y-3 mb-8">
          {behaviorCards.map(({ icon: Icon, title, ready, sampleSize, confidence: conf, copy }, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-full bg-accent/60 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-foreground" />
                </span>
                <p className="text-sm font-semibold text-foreground">{title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-11">
                {ready
                  ? copy
                  : "We're still learning this pattern — record more activity and it will sharpen."}
              </p>
              <p className="text-[11px] text-muted-foreground/70 pl-11 mt-2">
                {ready
                  ? `${confidencePct(conf)}% confidence · ${sampleSize} observations · ${confidencePhrase(confidenceTier)}`
                  : 'Not enough data yet'}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-accent/50 border border-border rounded-2xl p-5 mb-8 flex items-start gap-3">
          <span className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-secondary" />
          </span>
          <p className="text-sm text-foreground leading-relaxed">
            Current situation: <span className="font-semibold text-secondary">{state}</span>. Nafaka
            distinguishes what it knows, what it suspects, and what it doesn&rsquo;t know yet — every claim above
            carries its own confidence.
          </p>
        </div>

        <Link
          href="/PatternDashboard"
          className="cursor-pointer rounded-2xl border border-dashed border-border p-5 flex items-center justify-between hover:bg-muted transition-colors mb-3"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">See the full pattern dashboard</p>
            <p className="text-xs text-muted-foreground mt-0.5">Income days, regular expenses, and more</p>
          </div>
          <ArrowRight size={18} className="text-primary shrink-0" />
        </Link>

        <Link
          href="/SupportNetwork"
          className="cursor-pointer flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 hover:bg-muted transition-colors"
        >
          <span className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
            <HeartHandshake size={16} className="text-secondary" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Support network</p>
            <p className="text-xs text-muted-foreground">See who you&rsquo;ve lent to or borrowed from</p>
          </div>
          <ArrowRight size={16} className="text-muted-foreground shrink-0" />
        </Link>
      </div>

      <BottomNav active="patterns" />
    </div>
  )
}
