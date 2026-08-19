'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { track } from '@/lib/analytics'
import { generateInsights } from '@/lib/brain/insights'
import { isCalm } from '@/lib/brain/situation'
import { weeklyTotals } from '@/lib/brain/weekly'
import { essentialCostPerDay } from '@/lib/brain/signals'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import { tierLabel } from '@/lib/brain/describe'
import { Ring, SectionTitle, StatPill, ConfidenceBar } from '@/components/proto/ui'
import { AreaChart, DonutSegments } from '@/components/proto/charts'
import LearningState from '@/components/proto/LearningState'
import { AddTransactionModal, QuickAdd, type TxnType } from '@/components/proto/AddTransaction'
import { fmt, fmtFull } from '@/components/proto/format'
import {
  Bell,
  Sparkles,
  Wallet,
  ShieldCheck,
  CalendarDays,
  Users,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CalendarClock,
  Gauge,
} from 'lucide-react'

function monthlyIncome(brainTxs: { type: string; amount: number; date: string }[], now: Date) {
  return [5, 4, 3, 2, 1, 0]
    .map((i) => {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const s = start.toISOString().slice(0, 10)
      const e = end.toISOString().slice(0, 10)
      return brainTxs.filter((t) => t.type === 'income' && t.date >= s && t.date < e).reduce((sum, t) => sum + t.amount, 0)
    })
    .reverse()
}

export default function DailySnapshot() {
  const body = useGoogleFont('Manrope')
  const { profile, balance, safeToSpend, transactions, behaviorModel, safeToSpendWhy, predictions } = useFinance()

  const [addOpen, setAddOpen] = useState(false)
  const [addType, setAddType] = useState<TxnType>('expense')
  const [showWhy, setShowWhy] = useState(false)
  const tracked = useRef(false)

  const confidencePct = Math.round(behaviorModel.confidence * 100)
  const brainTxs = storeTransactionsToBrain(transactions)

  const topInsight = generateInsights(behaviorModel)[0]
  const todayInsight = topInsight
    ? topInsight.severity === 'action' || topInsight.severity === 'watch'
      ? topInsight.text
      : `You're on track. ${topInsight.text}`
    : behaviorModel.confidenceTier === 'exploring'
      ? 'Nafaka is still learning your patterns this week — recording income and expenses sharpens your insights.'
      : isCalm(behaviorModel.situation)
        ? "Nothing important changed today. You're on track — keep today's safe-to-spend as your ceiling."
        : 'Nothing needs action right now — Nafaka is watching your situation closely.'

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    track('snapshot_viewed')
    track('safe_to_spend_viewed')
    track('insight_viewed', { text: todayInsight.replace(/UGX\s?[\d,]+/gi, '[amount]') })
  }, [safeToSpend, todayInsight])

  const openAdd = (t: TxnType) => {
    setAddType(t)
    setAddOpen(true)
  }

  const now = new Date()
  const weekTotals = weeklyTotals(brainTxs, now)
  const weeksAgo = [5, 4, 3, 2, 1, 0].map((w) => weeklyTotals(brainTxs, now, w))
  const weekLabels = ['5w', '4w', '3w', '2w', '1w', 'Now']
  const weeklySpend = weeksAgo.map((w) => w.spending)

  const monthTrend = monthlyIncome(brainTxs, now)
  const monthLabels = [5, 4, 3, 2, 1, 0]
    .map((i) => new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleDateString('en-US', { month: 'short' }))
    .reverse()
  const growth = monthTrend[0] > 0 && monthTrend[5] > 0 ? Math.round(((monthTrend[5] - monthTrend[0]) / monthTrend[0]) * 100) : null

  const signals = behaviorModel.signals
  const bufferDays = essentialCostPerDay(brainTxs) > 0 ? Math.floor(balance / essentialCostPerDay(brainTxs)) : 0

  const signalChips: Array<{ icon: React.ReactNode; label: string; value: string; tone: 'good' | 'ok' | 'watch' }> = [
    {
      icon: <Wallet size={16} />,
      label: 'Post-income spending',
      value: signals.postIncomeAcceleration.sampleSize > 0 ? `${Math.round(signals.postIncomeAcceleration.value - 100)}% within 72h` : '—',
      tone: signals.postIncomeAcceleration.value <= 115 ? 'good' : signals.postIncomeAcceleration.value <= 130 ? 'ok' : 'watch',
    },
    {
      icon: <ShieldCheck size={16} />,
      label: 'Commitment reliability',
      value: signals.commitmentReliability.sampleSize > 0 ? `${Math.round(signals.commitmentReliability.value)}% on time` : '—',
      tone: signals.commitmentReliability.value >= 90 ? 'good' : 'ok',
    },
    {
      icon: <CalendarDays size={16} />,
      label: 'Financial slack',
      value: `${bufferDays} days buffer`,
      tone: bufferDays >= 14 ? 'good' : bufferDays >= 7 ? 'ok' : 'watch',
    },
    {
      icon: <Users size={16} />,
      label: 'Social obligation load',
      value: signals.debtPressure.sampleSize > 0 ? `${Math.round(signals.debtPressure.value)}% of income` : '—',
      tone: signals.debtPressure.value > 30 ? 'watch' : 'ok',
    },
  ]

  const spendThisWeek = brainTxs.filter((t) => t.type === 'expense' && t.date >= new Date(now.getTime() - 7 * 864e5).toISOString().slice(0, 10))
  const byLabel = new Map<string, number>()
  for (const t of spendThisWeek.length > 0 ? spendThisWeek : brainTxs.filter((t) => t.type === 'expense')) {
    byLabel.set(t.category ?? 'Other', (byLabel.get(t.category ?? 'Other') ?? 0) + t.amount)
  }
  const spendBreakdown = [...byLabel.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value], i) => ({
      label,
      value,
      color: ['#19bd80', '#f27d14', '#d4a82a', '#3fd69b', '#65718a'][i],
    }))

  const isWeek4 = confidencePct < 70

  if (confidencePct < 40) {
    return (
      <div className="min-h-screen bg-ink-50 pb-28 md:pb-10 md:pl-64" style={{ fontFamily: body }}>
        <AppHeader />
        <main className="mx-auto w-full max-w-md px-5 pt-4 md:max-w-3xl md:px-8">
          <LearningState confidence={confidencePct} dataPoints={behaviorModel.dataPoints} onAdd={() => openAdd('expense')} />
        </main>
        <BottomNav active="home" />
        <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} type={addType} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50 pb-28 md:pb-10 md:pl-64" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto w-full max-w-md px-5 pt-4 md:max-w-4xl md:px-8 space-y-6 animate-fade-up">
        {/* Hero balance card */}
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-ink-900 via-ink-900 to-brand-950 p-5 text-white shadow-card">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/20 blur-2xl" />
          <div className="absolute -right-4 top-10 h-24 w-24 rounded-full bg-accent-500/10 blur-xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/60">
                  {now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'}, {profile.name || 'there'}
                </p>
                <p className="text-xs text-white/40 mt-0.5">{tierLabel(behaviorModel.confidenceTier)}</p>
              </div>
              <Link
                href="/Notifications"
                className="relative rounded-full p-2 bg-white/10 hover:bg-white/15 transition"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-400 ring-2 ring-ink-900" />
              </Link>
            </div>

            <p className="mt-5 text-xs font-medium text-white/60">Current balance</p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-tight">{fmtFull(balance)}</p>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
                  <ArrowUpRight size={15} />
                </span>
                <div>
                  <p className="text-[10px] text-white/50">Income this week</p>
                  <p className="text-sm font-semibold">{fmt(weekTotals.income)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-500/20 text-accent-300">
                  <ArrowDownRight size={15} />
                </span>
                <div>
                  <p className="text-[10px] text-white/50">Spent this week</p>
                  <p className="text-sm font-semibold">{fmt(weekTotals.spending)}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
              <div>
                <p className="text-[10px] text-white/50">Safe to spend today</p>
                <p className="text-lg font-semibold mt-0.5">{fmtFull(safeToSpend)}</p>
              </div>
              <button
                onClick={() => setShowWhy((v) => !v)}
                className="text-[11px] bg-white/15 rounded-full px-3 py-1.5 hover:bg-white/25 transition"
                aria-expanded={showWhy}
              >
                {showWhy ? 'Hide why' : 'Why this amount?'}
              </button>
            </div>
            {showWhy && (
              <div className="mt-3 space-y-2.5 border-t border-white/10 pt-3">
                {safeToSpendWhy.lines.length > 0 ? (
                  safeToSpendWhy.lines.map((line, i) => (
                    <p key={i} className="text-[13px] text-white/85 leading-relaxed flex items-start gap-2">
                      {i % 2 === 0 ? (
                        <CalendarClock size={14} className="shrink-0 mt-0.5 opacity-70" />
                      ) : (
                        <Gauge size={14} className="shrink-0 mt-0.5 opacity-70" />
                      )}
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-[13px] text-white/85 leading-relaxed">
                    Nafaka is still learning your situation — record income and expenses to sharpen this.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop: two-column dashboard below the hero */}
        <div className="md:grid md:grid-cols-2 md:gap-6 md:items-start">
          <div className="space-y-6">
            {/* Learning status + buffer */}
            <div className="card p-4">
              <div className="flex items-center gap-4">
                <Ring value={confidencePct} size={72} stroke={7} label={`${confidencePct}%`} sublabel="conf." />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-brand-600" />
                    <p className="text-sm font-semibold text-ink-900">{tierLabel(behaviorModel.confidenceTier)}</p>
                  </div>
                  <p className="text-xs text-ink-500 mt-1">
                    {behaviorModel.dataPoints} days of behavior observed. Full intelligence unlocks at 90%.
                  </p>
                  <div className="mt-2.5">
                    <ConfidenceBar value={confidencePct} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick add */}
            <div>
              <SectionTitle title="Quick add" hint="Log income or expense to teach Nafaka" />
              <QuickAdd onPick={openAdd} />
            </div>

            {/* Recent transactions */}
            <div>
              <SectionTitle title="Recent activity" hint="Last 7 days" />
              <div className="card divide-y divide-ink-100">
                {transactions.slice(0, 6).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        t.type === 'income' ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-600'
                      }`}
                    >
                      {t.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{t.label}</p>
                      <p className="text-xs text-ink-500 truncate">
                        {t.note || '—'}
                        {t.category === 'commitment' && <span className="ml-1.5 text-ink-400">· commitment</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-brand-700' : 'text-ink-900'}`}>
                        {t.type === 'income' ? '+' : '−'}
                        {fmtFull(t.amount)}
                      </p>
                      <p className="text-[10px] text-ink-400 mt-0.5">{t.time}</p>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-ink-500">No transactions yet — add your first one above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Weekly insight teaser */}
            {predictions.length > 0 && (
              <div className="card overflow-hidden">
                <Link href="/WeeklyReview" className="w-full block p-4 hover:bg-ink-50 transition">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                      <Sparkles size={18} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink-900">Weekly insight</p>
                        <StatPill tone="positive">New</StatPill>
                      </div>
                      <p className="text-sm text-ink-600 mt-1 leading-relaxed">{todayInsight}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                        Read full review <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Income trend chart */}
            <div className="card p-4">
              <SectionTitle
                title="Income trend"
                hint="Last 6 months"
                action={
                  growth !== null ? (
                    <span className="pill bg-brand-100 text-brand-700">
                      <TrendingUp size={12} /> {growth >= 0 ? '+' : ''}
                      {growth}%
                    </span>
                  ) : undefined
                }
              />
              <AreaChart data={monthTrend} labels={monthLabels} tone="brand" valuePrefix="UGX " />
            </div>

            {/* Spending chart - week12 only */}
            {!isWeek4 && (
              <div className="card p-4">
                <SectionTitle title="Weekly spending" hint="Last 6 weeks" />
                <AreaChart data={weeklySpend} labels={weekLabels} tone="accent" valuePrefix="UGX " />
              </div>
            )}

            {/* Behavioral signals glance */}
            <div>
              <SectionTitle
                title="Your financial behavior"
                hint={isWeek4 ? 'Emerging signals - still learning' : 'Learned signals, updated daily'}
                action={
                  <Link href="/FinancialPersonality" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                    View patterns
                  </Link>
                }
              />
              <div className="grid grid-cols-2 gap-3">
                {signalChips.map((c) => (
                  <SignalChip key={c.label} icon={c.icon} label={c.label} value={c.value} tone={c.tone} />
                ))}
              </div>
            </div>

            {/* Spend breakdown donut - week12 only */}
            {!isWeek4 && spendBreakdown.length > 0 && (
              <div className="card p-4">
                <SectionTitle title="Where your money went" hint="This week" />
                <div className="flex items-center gap-5">
                  <DonutSegments
                    segments={spendBreakdown}
                    size={130}
                    stroke={18}
                    centerLabel={fmt(weekTotals.spending)}
                    centerSub="total"
                  />
                  <div className="flex-1 space-y-2">
                    {spendBreakdown.map((s) => (
                      <div key={s.label} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                        <span className="text-xs text-ink-600 flex-1">{s.label}</span>
                        <span className="text-xs font-semibold text-ink-900">{fmt(s.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav active="home" />
      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} type={addType} />
    </div>
  )
}

function SignalChip({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'good' | 'ok' | 'watch' }) {
  const tones = {
    good: 'text-brand-700 bg-brand-50 border-brand-100',
    ok: 'text-ink-700 bg-ink-50 border-ink-100',
    watch: 'text-accent-700 bg-accent-50 border-accent-100',
  }
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] font-medium text-ink-500">{label}</p>
      </div>
      <p className="mt-2 text-sm font-bold text-ink-900">{value}</p>
    </div>
  )
}