'use client'

import React from 'react'
import { Sparkles, Lock, Loader2 } from 'lucide-react'

export default function LearningState({
  confidence,
  dataPoints,
  onAdd,
}: {
  confidence: number
  dataPoints: number
  onAdd?: () => void
}) {
  const greeting =
    confidence < 30
      ? 'Getting to know your financial rhythm'
      : 'Learning the shape of your money'
  const learningNote =
    confidence < 30
      ? 'Record income and expenses as they happen. Nafaka builds your behavior model from real activity, one transaction at a time.'
      : 'Patterns are emerging. Keep logging and Nafaka will confirm them as confidence grows.'

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-ink-900 via-ink-900 to-brand-950 p-5 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-brand-500/15 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-white/70">
            <Loader2 size={14} className="animate-spin-slow" />
            <p className="text-xs font-semibold uppercase tracking-wide">Learning you</p>
          </div>
          <p className="mt-3 font-display text-xl font-semibold leading-snug">{greeting}</p>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">{learningNote}</p>

          <div className="mt-5 rounded-xl bg-white/10 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/60">Confidence</span>
              <span className="text-xs font-bold text-brand-300">{confidence}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full bg-brand-400" style={{ width: `${confidence}%`, transition: 'width 0.8s ease' }} />
            </div>
            <p className="text-[11px] text-white/50 mt-2">{dataPoints} transactions logged</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-base font-semibold text-ink-900 mb-3">What unlocks as I learn</h2>
        <div className="space-y-2.5">
          <UnlockRow label="Pattern detection" detail="Spending rhythms, income timing, weekend habits" unlocked={confidence >= 40} atConfidence={40} />
          <UnlockRow label="Financial Health Score" detail="Resilience, commitments, spending control, savings" unlocked={confidence >= 70} atConfidence={70} />
          <UnlockRow label="Full personalized coaching" detail="Weekly review with context, AI chat, personality" unlocked={confidence >= 90} atConfidence={90} />
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={15} className="text-ink-400" />
          <p className="text-sm font-semibold text-ink-600">Your trends will appear here</p>
        </div>
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-ink-100 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink-200/60 to-transparent animate-shimmer" />
          </div>
          <div className="h-3 w-4/5 rounded-full bg-ink-100 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink-200/60 to-transparent animate-shimmer" />
          </div>
          <div className="h-3 w-2/3 rounded-full bg-ink-100 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink-200/60 to-transparent animate-shimmer" />
          </div>
        </div>
        <p className="text-[11px] text-ink-400 mt-3">Charts unlock once I have enough data to be accurate.</p>
      </div>

      {onAdd && (
        <button onClick={onAdd} className="btn-primary w-full">
          <Sparkles size={16} /> Log your first transaction
        </button>
      )}

      <p className="text-center text-[11px] text-ink-400 px-4">
        No bank account needed. No credit check. Nafaka works from the money activity you log.
      </p>
    </div>
  )
}

function UnlockRow({
  label,
  detail,
  unlocked,
  atConfidence,
}: {
  label: string
  detail: string
  unlocked: boolean
  atConfidence: number
}) {
  return (
    <div className={`card p-3.5 flex items-center gap-3 ${unlocked ? 'border-brand-100' : 'opacity-80'}`}>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          unlocked ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-400'
        }`}
      >
        {unlocked ? <Sparkles size={16} /> : <Lock size={15} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        <p className="text-xs text-ink-500 mt-0.5">{detail}</p>
      </div>
      <span className={`pill whitespace-nowrap ${unlocked ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-500'}`}>
        {unlocked ? 'Unlocked' : `${atConfidence}%`}
      </span>
    </div>
  )
}