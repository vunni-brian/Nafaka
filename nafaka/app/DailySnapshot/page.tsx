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
import { weeklyTotals, formatWeekRange } from '@/lib/brain/weekly'
import { essentialCostPerDay } from '@/lib/brain/signals'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import type { NafakaPrediction } from '@/lib/brain/predict'
import { Ring, SectionTitle, StatPill, ConfidenceBar } from '@/components/proto/ui'
import { AreaChart, DonutSegments } from '@/components/proto/charts'
import LearningState from '@/components/proto/LearningState'
import {
  Plus,
  Minus,
  Sparkles,
  Church,
  Users,
  Landmark,
  Home as HomeIcon,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Trash2,
  HeartHandshake,
  Bell,
  CalendarClock,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Wallet,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

const iconMap: Record<string, typeof Church> = {
  cell: Users,
  church: Church,
  rent: HomeIcon,
  debt: Landmark,
}

export default function DailySnapshot() {
  const body = useGoogleFont('Manrope')
  const { profile, balance, safeToSpend, transactions, commitments, deleteTransaction, behaviorModel, safeToSpendWhy, predictions } = useFinance()

  const [openRow, setOpenRow] = useState<number | null>(null)
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
    track('safe_to_spend_viewed', { amount: safeToSpend })
    track('insight_viewed', { text: todayInsight })
  }, [safeToSpend, todayInsight])

  const handleDelete = (id: number) => {
    deleteTransaction(id)
    setOpenRow(null)
  }

  function fmt(n: number) {
    return `UGX ${n.toLocaleString()}`
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })

  const weekTotals = weeklyTotals(brainTxs, now)
  const weeksAgo = [5, 4, 3, 2, 1, 0].map((w) => weeklyTotals(brainTxs, now, w))
  const incomeTrend = weeksAgo.map((w) => w.income)
  const spendTrend = weeksAgo.map((w) => w.spending)
  const weekLabels = ['5w', '4w', '3w', '2w', '1w', 'Now']

  const signals = behaviorModel.signals
  const bufferDays = essentialCostPerDay(brainTxs) > 0 ? Math.floor(balance / essentialCostPerDay(brainTxs)) : 0

  const signalChips: { icon: React.ReactNode; label: string; value: string; tone: 'good' | 'ok' | 'watch' }[] = [
    {
      icon: <Wallet size={16} />,
      label: 'Post-income spending',
      value: signals.postIncomeAcceleration.sampleSize > 0 ? `+${Math.round(signals.postIncomeAcceleration.value)}% bump` : '—',
      tone: signals.postIncomeAcceleration.value > 25 ? 'watch' : 'ok',
    },
    {
      icon: <ShieldCheck size={16} />,
      label: 'Commitment reliability',
      value: signals.commitmentReliability.sampleSize > 0 ? `${Math.round(signals.commitmentReliability.value)}% paid` : '—',
      tone: signals.commitmentReliability.value >= 90 ? 'good' : 'ok',
    },
    {
      icon: <CalendarClock size={16} />,
      label: 'Financial slack',
      value: `${bufferDays} days buffer`,
      tone: bufferDays >= 14 ? 'good' : bufferDays >= 7 ? 'ok' : 'watch',
    },
    {
      icon: <Landmark size={16} />,
      label: 'Debt pressure',
      value: signals.debtPressure.sampleSize > 0 ? `${Math.round(signals.debtPressure.value)}% of income` : '—',
      tone: signals.debtPressure.value > 30 ? 'watch' : 'ok',
    },
  ]

  const spendThisWeek = brainTxs.filter((t) => t.type === 'expense' && t.date >= isoDaysAgo(now, 7))
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
  const weekSpendTotal = spendBreakdown.reduce((s, x) => s + x.value, 0)

  function commitmentIcon(label: string) {
    const lower = label.toLowerCase()
    if (lower.includes('cell')) return iconMap.cell
    if (lower.includes('tithe') || lower.includes('offering') || lower.includes('church')) return iconMap.church
    if (lower.includes('rent')) return iconMap.rent
    if (lower.includes('debt') || lower.includes('repayment')) return iconMap.debt
    return Landmark
  }

  if (confidencePct < 40) {
    return (
      <div className="min-h-screen bg-background pb-28" style={{ fontFamily: body }}>
        <AppHeader />
        <main className="mx-auto max-w-md px-5 pt-4">
          <LearningState confidence={confidencePct} dataPoints={behaviorModel.dataPoints} onAdd={() => window.location.assign('/AddExpense')} />
        </main>
        <BottomNav active="home" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-28" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto max-w-md px-5 pt-4 space-y-6 animate-fade-up">
        {/* Hero balance card */}
        <div className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-ink-900 via-ink-900 to-brand-950 p-5 text-white shadow-card">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/20 blur-2xl" />
          <div className="absolute -right-4 top-10 h-24 w-24 rounded-full bg-accent-500/10 blur-xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/60">{dateStr}</p>
                <p className="text-xs text-white/40 mt-0.5">Hey {profile.name === 'there' ? '' : profile.name}</p>
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
            <p className="mt-1 font-display text-3xl font-semibold tracking-tight">{fmt(balance)}</p>

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
                <p className="text-lg font-semibold mt-0.5">{fmt(safeToSpend)}</p>
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

        {/* Learning status + buffer */}
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <Ring value={confidencePct} size={72} stroke={7} label={`${confidencePct}%`} sublabel="conf." />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-brand-600" />
                <p className="text-sm font-semibold text-ink-900">
                  {behaviorModel.confidenceTier === 'mature' ? 'Mature intelligence' : behaviorModel.confidenceTier === 'confident' ? 'Learning your rhythm' : 'Getting to know you'}
                </p>
              </div>
              <p className="text-xs text-ink-500 mt-1">
                {behaviorModel.dataPoints} records observed. Full intelligence unlocks at 90%.
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
          <div className="grid grid-cols-2 gap-3">
            <Link href="/AddIncome" className="btn-ghost">
              <Plus size={16} className="text-brand-600" /> Add income
            </Link>
            <Link href="/AddExpense" className="btn-ghost">
              <Minus size={16} className="text-accent-600" /> Add expense
            </Link>
          </div>
        </div>

        {/* Income trend */}
        <div className="card p-4">
          <SectionTitle
            title="Income trend"
            hint="Last 6 weeks"
            action={
              <span className="pill bg-brand-100 text-brand-700">
                <TrendingUp size={12} /> {fmt(weekTotals.income)}
              </span>
            }
          />
          <AreaChart data={incomeTrend} labels={weekLabels} tone="brand" valuePrefix="UGX " />
        </div>

        {/* Weekly spending */}
        <div className="card p-4">
          <SectionTitle title="Weekly spending" hint={formatWeekRange(now)} />
          <AreaChart data={spendTrend} labels={weekLabels} tone="accent" valuePrefix="UGX " />
        </div>

        {/* Behavioral signals glance */}
        <div>
          <SectionTitle
            title="Your financial behavior"
            hint="Learned signals, updated daily"
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

        {/* Looking ahead */}
        {predictions.length > 0 && (
          <div>
            <SectionTitle title="Looking ahead" hint="Confidence-gated outlook" />
            <div className="space-y-2.5">
              {predictions.slice(0, 2).map((p) => (
                <PredictionRow key={p.id} prediction={p} />
              ))}
            </div>
          </div>
        )}

        {/* Weekly insight teaser */}
        <div className="card overflow-hidden">
          <Link href="/WeeklyReview" className="w-full block text-left p-4 hover:bg-ink-50 transition">
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

        {/* Where your money went */}
        {spendBreakdown.length > 0 && (
          <div className="card p-4">
            <SectionTitle title="Where your money went" hint="Recent expenses" />
            <div className="flex items-center gap-5">
              <DonutSegments
                segments={spendBreakdown}
                size={130}
                stroke={18}
                centerLabel={fmt(weekSpendTotal).replace('UGX ', '')}
                centerSub="spent"
              />
              <div className="flex-1 space-y-2">
                {spendBreakdown.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs text-ink-600 flex-1 truncate">{s.label}</span>
                    <span className="text-xs font-semibold text-ink-900">{fmt(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Coming up */}
        <div>
          <SectionTitle
            title="Coming up"
            hint="Protected commitments"
            action={
              <Link href="/LifeEvents" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                See all
              </Link>
            }
          />
          {commitments.filter((c) => c.status !== 'fulfilled').length > 0 ? (
            <div className="space-y-2.5">
              {commitments
                .filter((c) => c.status !== 'fulfilled')
                .map(({ id, label, when, amount }) => {
                  const Icon = commitmentIcon(label)
                  return (
                    <div key={id} className="card p-4 flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
                        <Icon size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">{label}</p>
                        <p className="text-xs text-ink-500">{when}</p>
                      </div>
                      <p className="text-sm font-semibold text-ink-900">{fmt(amount)}</p>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="card p-4 text-center">
              <p className="text-xs text-ink-500">No upcoming commitments</p>
              <p className="text-xs text-ink-400 mt-1">Add one in Life Events</p>
            </div>
          )}
        </div>

        {/* Support network */}
        <Link href="/SupportNetwork" className="card p-4 flex items-center gap-3 hover:bg-ink-50 transition">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-white">
            <HeartHandshake size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-900">Support network</p>
            <p className="text-xs text-ink-500">Track what you&rsquo;ve lent or borrowed</p>
          </div>
          <ChevronRight size={16} className="text-ink-300" />
        </Link>

        {/* Recent activity */}
        <div>
          <SectionTitle title="Recent activity" hint="Last 7 days" />
          {transactions.length > 0 ? (
            <div className="card divide-y divide-ink-100">
              {transactions.slice(0, 6).map(({ id, type, label, amount, time }) => {
                const isOpen = openRow === id
                return (
                  <div key={id}>
                    <button
                      onClick={() => setOpenRow(isOpen ? null : id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-ink-50 transition"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          type === 'income' ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-600'
                        }`}
                      >
                        {type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">{label}</p>
                        <p className="text-xs text-ink-500 truncate">{time}</p>
                      </div>
                      <p className={`text-sm font-semibold ${type === 'income' ? 'text-brand-700' : 'text-ink-900'}`}>
                        {type === 'income' ? '+' : '−'}
                        {fmt(amount)}
                      </p>
                    </button>
                    {isOpen && (
                      <div className="flex items-center gap-2 px-4 pb-3.5 pt-1">
                        <button
                          onClick={() => handleDelete(id)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-accent-200 py-2.5 text-xs font-semibold text-accent-700 hover:bg-accent-50 transition"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-sm text-ink-500">No transactions yet</p>
              <p className="text-xs text-ink-400 mt-1">Add income or an expense above</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  )
}

function SignalChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: 'good' | 'ok' | 'watch'
}) {
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

function PredictionRow({ prediction }: { prediction: NafakaPrediction }) {
  const watch = prediction.severity === 'watch'
  const Icon = watch ? AlertTriangle : prediction.severity === 'all-clear' ? CheckCircle2 : Eye
  return (
    <div className={`card p-4 flex items-start gap-3 ${watch ? 'border-accent-200 bg-accent-50/50' : ''}`}>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          watch ? 'bg-accent-100 text-accent-700' : 'bg-brand-100 text-brand-700'
        }`}
      >
        <Icon size={15} />
      </span>
      <div>
        <p className={`text-sm font-medium leading-snug ${watch ? 'text-accent-800' : 'text-ink-900'}`}>{prediction.reason}</p>
        <p className="text-[11px] text-ink-500 mt-1">
          {Math.round(prediction.confidence * 100)}% confident{prediction.windowDays !== null ? ` · ${prediction.windowDays}-day window` : ''}
        </p>
      </div>
    </div>
  )
}

function isoDaysAgo(now: Date, days: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}